import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { CryptoService } from '@common/services/crypto.service';
import { EmailService } from '@common/services/email.service';
import { RegisterDto, LoginDto, VerifyEmailDto, ResetPasswordDto } from './dtos/auth.dto';
import { IAuthTokens } from './interfaces/auth.interface';
import { UserRole, VerificationStatus } from '@common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    @InjectRepository(VerificationCode)
    private verificationCodesRepository: Repository<VerificationCode>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<IAuthTokens> {
    const { username, email, password, confirmPassword, firstName, lastName } = registerDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already in use');
    }

    // Hash password
    const hashedPassword = await CryptoService.hashPassword(password);

    // Create user
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.USER,
      verificationStatus: VerificationStatus.UNVERIFIED,
    });

    await this.usersRepository.save(user);

    // Send verification email
    const otp = CryptoService.generateOTP();
    await this.createVerificationCode(user.id, otp, 'email');
    await this.emailService.sendVerificationEmail(email, otp);

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<IAuthTokens> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await CryptoService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    return this.generateTokens(user);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const { email, code } = verifyEmailDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const verificationCode = await this.verificationCodesRepository.findOne({
      where: {
        userId: user.id,
        code,
        type: 'email',
        isUsed: false,
      },
    });

    if (!verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    if (verificationCode.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    await this.usersRepository.save(user);

    // Mark code as used
    verificationCode.isUsed = true;
    await this.verificationCodesRepository.save(verificationCode);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return;
    }

    const resetToken = CryptoService.generateRandomToken();
    const hashedToken = CryptoService.sha256(resetToken);

    // Store hashed token (in production, use a separate table)
    const resetCode = CryptoService.generateOTP();
    await this.createVerificationCode(user.id, resetCode, 'otp');

    const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password/${resetToken}`;
    await this.emailService.sendPasswordResetEmail(email, resetLink);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const hashedToken = CryptoService.sha256(token);

    // In production, verify the token from database
    // For now, we'll use the OTP system

    const hashedPassword = await CryptoService.hashPassword(newPassword);

    // This would need proper token validation in production
    throw new BadRequestException('Token validation not implemented');
  }

  async refreshAccessToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify refresh token in database
      const tokenRecord = await this.refreshTokensRepository.findOne({
        where: {
          userId: user.id,
          token: refreshToken,
        },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User): Promise<IAuthTokens> {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '24h',
    });

    const refreshTokenValue = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.refreshTokensRepository.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt,
    });

    await this.refreshTokensRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: '24h',
    };
  }

  private async createVerificationCode(
    userId: string,
    code: string,
    type: 'email' | 'phone' | 'otp',
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const verificationCode = this.verificationCodesRepository.create({
      userId,
      code,
      type,
      expiresAt,
    });

    await this.verificationCodesRepository.save(verificationCode);
  }
}
