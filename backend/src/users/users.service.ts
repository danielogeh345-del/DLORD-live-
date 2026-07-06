import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { Follower } from './entities/follower.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UpdateProfileDto } from './dtos/user-profile.dto';
import { IPaginatedResponse } from '@common/dtos/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Follower)
    private followersRepository: Repository<Follower>,
    @InjectRepository(BlockedUser)
    private blockedUsersRepository: Repository<BlockedUser>,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't expose password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update only provided fields
    Object.assign(user, updateProfileDto);
    const updated = await this.usersRepository.save(user);

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword as any;
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.followersRepository.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    // Check if blocked
    const isBlocked = await this.blockedUsersRepository.findOne({
      where: {
        userId: followingId,
        blockedUserId: followerId,
      },
    });

    if (isBlocked) {
      throw new BadRequestException('Cannot follow blocked user');
    }

    // Create follow relationship
    const follow = this.followersRepository.create({
      followerId,
      followingId,
    });

    await this.followersRepository.save(follow);

    // Update follower/following counts
    const follower = await this.usersRepository.findOne({
      where: { id: followerId },
    });
    follower.following += 1;
    await this.usersRepository.save(follower);

    targetUser.followers += 1;
    await this.usersRepository.save(targetUser);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followersRepository.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (!follow) {
      throw new NotFoundException('Not following this user');
    }

    await this.followersRepository.remove(follow);

    // Update counts
    const follower = await this.usersRepository.findOne({
      where: { id: followerId },
    });
    follower.following = Math.max(0, follower.following - 1);
    await this.usersRepository.save(follower);

    const targetUser = await this.usersRepository.findOne({
      where: { id: followingId },
    });
    targetUser.followers = Math.max(0, targetUser.followers - 1);
    await this.usersRepository.save(targetUser);
  }

  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<IPaginatedResponse<User>> {
    const skip = (page - 1) * limit;

    const [followers, total] = await this.followersRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = followers.map((f) => {
      const { password, ...userWithoutPassword } = f.follower;
      return userWithoutPassword as any;
    });

    return {
      data: users,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<IPaginatedResponse<User>> {
    const skip = (page - 1) * limit;

    const [following, total] = await this.followersRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = following.map((f) => {
      const { password, ...userWithoutPassword } = f.following;
      return userWithoutPassword as any;
    });

    return {
      data: users,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const follow = await this.followersRepository.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    return !!follow;
  }

  async blockUser(
    userId: string,
    blockedUserId: string,
    reason?: string,
  ): Promise<void> {
    if (userId === blockedUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const targetUser = await this.usersRepository.findOne({
      where: { id: blockedUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existingBlock = await this.blockedUsersRepository.findOne({
      where: {
        userId,
        blockedUserId,
      },
    });

    if (existingBlock) {
      throw new BadRequestException('User already blocked');
    }

    const block = this.blockedUsersRepository.create({
      userId,
      blockedUserId,
      reason,
    });

    await this.blockedUsersRepository.save(block);

    // Remove follow relationship if exists
    await this.followersRepository.delete({
      followerId: userId,
      followingId: blockedUserId,
    });
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    const block = await this.blockedUsersRepository.findOne({
      where: {
        userId,
        blockedUserId,
      },
    });

    if (!block) {
      throw new NotFoundException('User not blocked');
    }

    await this.blockedUsersRepository.remove(block);
  }

  async searchUsers(
    query: string,
    limit: number = 20,
  ): Promise<User[]> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.username ILIKE :query', { query: `%${query}%` })
      .orWhere('CONCAT(user.firstName, \' \', user.lastName) ILIKE :query', {
        query: `%${query}%`,
      })
      .take(limit)
      .getMany();

    return users.map((u) => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword as any;
    });
  }
}
