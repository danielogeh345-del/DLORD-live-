import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Report } from './entities/report.entity';
import { AdminAction } from './entities/admin-action.entity';
import { User } from '@auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, AdminAction, User])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
