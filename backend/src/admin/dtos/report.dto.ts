import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReportType, ReportStatus } from '@common/enums';

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsOptional()
  @IsUUID()
  contentId?: string;
}

export class ResolveReportDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsOptional()
  @IsString()
  resolution?: string;
}
