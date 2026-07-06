import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { StreamStatus } from '@common/enums';

@Entity('streams')
@Index(['userId'])
@Index(['status'])
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: StreamStatus.UPCOMING })
  status: StreamStatus;

  @Column({ type: 'varchar', nullable: true })
  streamUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'bigint', default: 0 })
  viewers: number;

  @Column({ type: 'bigint', default: 0 })
  peakViewers: number;

  @Column({ type: 'bigint', default: 0 })
  totalViews: number;

  @Column({ type: 'bigint', default: 0 })
  gifts: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  duration: number;

  @Column({ type: 'simple-array', nullable: true })
  coHosts?: string[];

  @Column({ type: 'boolean', default: true })
  allowComments: boolean;

  @Column({ type: 'boolean', default: true })
  allowGifts: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
