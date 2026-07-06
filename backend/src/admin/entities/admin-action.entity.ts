import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '@auth/entities/user.entity';
import { ActionType } from '@common/enums';

@Entity('admin_actions')
@Index(['adminId'])
@Index(['createdAt'])
export class AdminAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  adminId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @Column({ type: 'varchar', length: 50 })
  action: ActionType;

  @Column({ type: 'uuid', nullable: true })
  targetId?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @CreateDateColumn()
  createdAt: Date;
}
