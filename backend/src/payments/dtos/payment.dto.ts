import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@common/enums';

export class ProcessPaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;
}

export class WithdrawDto {
  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
