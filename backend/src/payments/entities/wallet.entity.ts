import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '@auth/entities/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpent: number;

  @CreateDateColumn()
  createdAt: Date;
}
