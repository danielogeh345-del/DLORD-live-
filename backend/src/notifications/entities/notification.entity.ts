import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { NotificationType } from '@common/enums';

@Entity('notifications')
@Index(['userId'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  fromUserId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser?: User;

  @Column({ type: 'varchar', length: 20 })
  type: NotificationType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'uuid', nullable: true })
  relatedId?: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
