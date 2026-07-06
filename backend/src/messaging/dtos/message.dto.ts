import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from '@common/enums';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
