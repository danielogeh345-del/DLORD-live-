import { Controller, Post, Body, UseGuards, Get, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto, RefreshTokenDto } from './dtos/auth.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from './interfaces/auth.interface';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() registerDto: RegisterDto) {
    const tokens = await this.authService.register(registerDto);
    return {
      statusCode: 201,
      message: 'User registered successfully. Check your email for verification.',
      data: tokens,
    };
  }

  @Post('login')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);
    return {
      statusCode: 200,
      message: 'Login successful',
      data: tokens,
    };
  }

  @Post('verify-email')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto);
    return {
      statusCode: 200,
      message: 'Email verified successfully',
    };
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return {
      statusCode: 200,
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshAccessToken(
      refreshTokenDto.refreshToken,
    );
    return {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Current user info' })
  async getCurrentUser(@CurrentUser() user: IAuthPayload) {
    return {
      statusCode: 200,
      message: 'Success',
      data: user,
    };
  }
}
