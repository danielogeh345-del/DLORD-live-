import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
