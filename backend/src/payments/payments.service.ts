import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { ProcessPaymentDto, WithdrawDto } from './dtos/payment.dto';
import { IPaginatedResponse, PaginationDto } from '@common/dtos/pagination.dto';
import { TransactionStatus, PaymentMethod } from '@common/enums';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async getWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletsRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletsRepository.create({ userId });
      wallet = await this.walletsRepository.save(wallet);
    }

    return wallet;
  }

  async processPayment(
    userId: string,
    processPaymentDto: ProcessPaymentDto,
  ): Promise<Transaction> {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < processPaymentDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionsRepository.create({
      userId,
      type: 'PAYMENT',
      amount: processPaymentDto.amount,
      currency: processPaymentDto.currency,
      method: processPaymentDto.method,
      description: processPaymentDto.description,
      status: TransactionStatus.PENDING,
    });

    await this.transactionsRepository.save(transaction);

    // Process payment with external service
    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED;
    await this.transactionsRepository.save(transaction);

    wallet.balance -= processPaymentDto.amount;
    wallet.totalSpent += processPaymentDto.amount;
    await this.walletsRepository.save(wallet);

    return transaction;
  }

  async withdraw(
    userId: string,
    withdrawDto: WithdrawDto,
  ): Promise<Transaction> {
    const wallet = await this.getWallet(userId);

    if (wallet.balance < withdrawDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionsRepository.create({
      userId,
      type: 'WITHDRAWAL',
      amount: withdrawDto.amount,
      currency: 'USD',
      method: withdrawDto.method,
      status: TransactionStatus.PENDING,
    });

    await this.transactionsRepository.save(transaction);

    wallet.balance -= withdrawDto.amount;
    await this.walletsRepository.save(wallet);

    return transaction;
  }

  async addFunds(
    userId: string,
    amount: number,
    method: PaymentMethod,
  ): Promise<Transaction> {
    const wallet = await this.getWallet(userId);

    const transaction = this.transactionsRepository.create({
      userId,
      type: 'DEPOSIT',
      amount,
      currency: 'USD',
      method,
      status: TransactionStatus.COMPLETED,
    });

    await this.transactionsRepository.save(transaction);

    wallet.balance += amount;
    wallet.totalEarnings += amount;
    await this.walletsRepository.save(wallet);

    return transaction;
  }

  async addGiftFunds(
    userId: string,
    amount: number,
    fromUserId: string,
  ): Promise<Transaction> {
    const wallet = await this.getWallet(userId);
    const fromWallet = await this.getWallet(fromUserId);

    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionsRepository.create({
      userId,
      type: 'GIFT',
      amount,
      currency: 'USD',
      method: PaymentMethod.WALLET,
      status: TransactionStatus.COMPLETED,
    });

    await this.transactionsRepository.save(transaction);

    fromWallet.balance -= amount;
    await this.walletsRepository.save(fromWallet);

    wallet.balance += amount;
    wallet.totalEarnings += amount;
    await this.walletsRepository.save(wallet);

    return transaction;
  }

  async getTransactions(
    userId: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Transaction>> {
    const [transactions, total] = await this.transactionsRepository.findAndCount({
      where: { userId },
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: transactions,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }
}
