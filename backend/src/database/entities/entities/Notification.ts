import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';

@Index('idx_notifications_user_created_at', ['userId', 'createdAt'])
@Index('idx_notifications_user_read_at', ['userId', 'readAt'])
@Entity('notifications', { schema: 'public' })
export class Notification {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id' })
  userId: number;

  @Column('character varying', { name: 'title', length: 160 })
  title: string;

  @Column('text', { name: 'description' })
  description: string;

  @Column('character varying', { name: 'category', length: 30 })
  category: string;

  @Column('character varying', { name: 'link', nullable: true, length: 255 })
  link: string | null;

  @Column('timestamp with time zone', { name: 'read_at', nullable: true })
  readAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;
}
