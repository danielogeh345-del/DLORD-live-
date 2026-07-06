import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, GetFollowersDto } from './dtos/user-profile.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':userId')
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getUserProfile(@Param('userId') userId: string) {
    const user = await this.usersService.getUserProfile(userId);
    return {
      statusCode: 200,
      message: 'User profile retrieved',
      data: user,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(
    @CurrentUser() user: IAuthPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
    );
    return {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  @Post(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'User followed' })
  async followUser(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
  ) {
    await this.usersService.followUser(user.id, userId);
    return {
      statusCode: 200,
      message: 'User followed successfully',
    };
  }

  @Post(':userId/unfollow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'User unfollowed' })
  async unfollowUser(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
  ) {
    await this.usersService.unfollowUser(user.id, userId);
    return {
      statusCode: 200,
      message: 'User unfollowed successfully',
    };
  }

  @Get(':userId/followers')
  @ApiResponse({ status: 200, description: 'Followers list' })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.usersService.getFollowers(userId, page, limit);
    return {
      statusCode: 200,
      message: 'Followers retrieved',
      data: result,
    };
  }

  @Get(':userId/following')
  @ApiResponse({ status: 200, description: 'Following list' })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.usersService.getFollowing(userId, page, limit);
    return {
      statusCode: 200,
      message: 'Following retrieved',
      data: result,
    };
  }

  @Get('search')
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: number = 20,
  ) {
    const users = await this.usersService.searchUsers(query, limit);
    return {
      statusCode: 200,
      message: 'Search results',
      data: users,
    };
  }

  @Post(':userId/block')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'User blocked' })
  async blockUser(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
    @Body('reason') reason?: string,
  ) {
    await this.usersService.blockUser(user.id, userId, reason);
    return {
      statusCode: 200,
      message: 'User blocked successfully',
    };
  }

  @Post(':userId/unblock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'User unblocked' })
  async unblockUser(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
  ) {
    await this.usersService.unblockUser(user.id, userId);
    return {
      statusCode: 200,
      message: 'User unblocked successfully',
    };
  }
}
