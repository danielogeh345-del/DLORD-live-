import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { ReportStatus, ReportType } from '@common/enums';

@Entity('reports')
@Index(['userId'])
@Index(['status'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reportedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportedById' })
  reportedBy: User;

  @Column({ type: 'uuid', nullable: true })
  reportedUserId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser?: User;

  @Column({ type: 'uuid', nullable: true })
  contentId?: string;

  @Column({ type: 'varchar', length: 50 })
  type: ReportType;

  @Column({ type: 'varchar', length: 20, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
