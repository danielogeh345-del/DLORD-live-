import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@auth/entities/user.entity';

@Entity('blocked_users')
@Index(['userId', 'blockedUserId'], { unique: true })
export class BlockedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  blockedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockedUserId' })
  blockedUser: User;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;
}
