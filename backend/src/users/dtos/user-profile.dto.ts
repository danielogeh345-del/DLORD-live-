import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { PaginationDto } from '@common/dtos/pagination.dto';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class GetFollowersDto extends PaginationDto {}

export class GetFollowingDto extends PaginationDto {}
