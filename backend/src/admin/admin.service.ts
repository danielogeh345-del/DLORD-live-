import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { AdminAction } from './entities/admin-action.entity';
import { CreateReportDto, ResolveReportDto } from './dtos/report.dto';
import { IPaginatedResponse, PaginationDto } from '@common/dtos/pagination.dto';
import { ReportStatus, ActionType } from '@common/enums';
import { User } from '@auth/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(AdminAction)
    private adminActionsRepository: Repository<AdminAction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createReport(
    reportedById: string,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    const report = this.reportsRepository.create({
      ...createReportDto,
      reportedById,
      status: ReportStatus.PENDING,
    });

    return this.reportsRepository.save(report);
  }

  async getReports(
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Report>> {
    const [reports, total] = await this.reportsRepository.findAndCount({
      relations: ['reportedBy', 'reportedUser'],
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: reports,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async resolveReport(
    reportId: string,
    adminId: string,
    resolveReportDto: ResolveReportDto,
  ): Promise<Report> {
    const admin = await this.usersRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }

    const report = await this.reportsRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = resolveReportDto.status;
    report.resolution = resolveReportDto.resolution;

    await this.reportsRepository.save(report);

    // Log admin action
    const action = this.adminActionsRepository.create({
      adminId,
      action: ActionType.RESOLVE_REPORT,
      targetId: reportId,
      details: `Report resolved with status: ${resolveReportDto.status}`,
    });

    await this.adminActionsRepository.save(action);

    return report;
  }

  async suspendUser(
    adminId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    const admin = await this.usersRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isSuspended = true;
    await this.usersRepository.save(user);

    const action = this.adminActionsRepository.create({
      adminId,
      action: ActionType.SUSPEND_USER,
      targetId: userId,
      reason,
    });

    await this.adminActionsRepository.save(action);
  }

  async unsuspendUser(adminId: string, userId: string): Promise<void> {
    const admin = await this.usersRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.isAdmin) {
      throw new ForbiddenException('Not authorized');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isSuspended = false;
    await this.usersRepository.save(user);

    const action = this.adminActionsRepository.create({
      adminId,
      action: ActionType.UNSUSPEND_USER,
      targetId: userId,
    });

    await this.adminActionsRepository.save(action);
  }

  async getAdminActions(
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<AdminAction>> {
    const [actions, total] = await this.adminActionsRepository.findAndCount({
      relations: ['admin'],
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: actions,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }
}
