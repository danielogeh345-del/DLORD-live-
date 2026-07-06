import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '@auth/entities/user.entity';
import { Follower } from './entities/follower.entity';
import { BlockedUser } from './entities/blocked-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follower, BlockedUser])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
