import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { TransactionStatus, PaymentMethod } from '@common/enums';

@Entity('transactions')
@Index(['userId'])
@Index(['status'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 20 })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 20, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'varchar', nullable: true })
  transactionId?: string;

  @Column({ type: 'uuid', nullable: true })
  relatedId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
