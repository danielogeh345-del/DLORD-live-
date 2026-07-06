import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { VideoStatus } from '@common/enums';

@Entity('videos')
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class Video {
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

  @Column({ type: 'varchar' })
  videoUrl: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'varchar', length: 20, default: VideoStatus.DRAFT })
  status: VideoStatus;

  @Column({ type: 'integer', default: 0 })
  duration: number;

  @Column({ type: 'bigint', default: 0 })
  views: number;

  @Column({ type: 'bigint', default: 0 })
  likes: number;

  @Column({ type: 'bigint', default: 0 })
  comments: number;

  @Column({ type: 'bigint', default: 0 })
  shares: number;

  @Column({ type: 'simple-array', nullable: true })
  hashtags?: string[];

  @Column({ type: 'simple-array', nullable: true })
  mentions?: string[];

  @Column({ type: 'varchar', nullable: true })
  musicId?: string;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'boolean', default: false })
  allowComments: boolean;

  @Column({ type: 'boolean', default: false })
  allowSharing: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
