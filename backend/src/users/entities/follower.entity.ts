import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@auth/entities/user.entity';

@Entity('followers')
@Index(['followerId', 'followingId'], { unique: true })
export class Follower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  followerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column({ type: 'uuid' })
  followingId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}
