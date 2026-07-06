import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto, WithdrawDto } from './dtos/payment.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@ApiTags('payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getWallet(@CurrentUser() user: IAuthPayload) {
    const wallet = await this.paymentsService.getWallet(user.id);
    return {
      statusCode: 200,
      message: 'Wallet retrieved',
      data: wallet,
    };
  }

  @Post('process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async processPayment(
    @CurrentUser() user: IAuthPayload,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    const transaction = await this.paymentsService.processPayment(
      user.id,
      processPaymentDto,
    );
    return {
      statusCode: 200,
      message: 'Payment processed',
      data: transaction,
    };
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async withdraw(
    @CurrentUser() user: IAuthPayload,
    @Body() withdrawDto: WithdrawDto,
  ) {
    const transaction = await this.paymentsService.withdraw(
      user.id,
      withdrawDto,
    );
    return {
      statusCode: 200,
      message: 'Withdrawal initiated',
      data: transaction,
    };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTransactions(
    @CurrentUser() user: IAuthPayload,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.paymentsService.getTransactions(
      user.id,
      pagination,
    );
    return {
      statusCode: 200,
      message: 'Transactions retrieved',
      data: result,
    };
  }
}
