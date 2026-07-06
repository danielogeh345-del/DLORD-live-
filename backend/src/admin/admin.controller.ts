import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateReportDto, ResolveReportDto } from './dtos/report.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@ApiTags('admin')
@Controller('api/admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  async createReport(
    @CurrentUser() user: IAuthPayload,
    @Body() createReportDto: CreateReportDto,
  ) {
    const report = await this.adminService.createReport(
      user.id,
      createReportDto,
    );
    return {
      statusCode: 201,
      message: 'Report created',
      data: report,
    };
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  async getReports(@Query() pagination: PaginationDto) {
    const result = await this.adminService.getReports(pagination);
    return {
      statusCode: 200,
      message: 'Reports retrieved',
      data: result,
    };
  }

  @Post('reports/:reportId/resolve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async resolveReport(
    @CurrentUser() user: IAuthPayload,
    @Param('reportId') reportId: string,
    @Body() resolveReportDto: ResolveReportDto,
  ) {
    const report = await this.adminService.resolveReport(
      reportId,
      user.id,
      resolveReportDto,
    );
    return {
      statusCode: 200,
      message: 'Report resolved',
      data: report,
    };
  }

  @Post('users/:userId/suspend')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async suspendUser(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    await this.adminService.suspendUser(user.id, userId, reason);
    return {
      statusCode: 200,
      message: 'User suspended',
    };
  }

  @Post('users/:userId/unsuspend')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async unsuspendUser(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
  ) {
    await this.adminService.unsuspendUser(user.id, userId);
    return {
      statusCode: 200,
      message: 'User unsuspended',
    };
  }

  @Get('actions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  async getAdminActions(@Query() pagination: PaginationDto) {
    const result = await this.adminService.getAdminActions(pagination);
    return {
      statusCode: 200,
      message: 'Admin actions retrieved',
      data: result,
    };
  }
}
