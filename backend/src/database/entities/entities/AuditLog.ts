import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';

@Index('idx_audit_log_created_at', ['createdAt'], {})
@Index('idx_audit_log_entity', ['entityId', 'entityType'], {})
@Index('audit_log_pkey', ['id'], { unique: true })
@Index('idx_audit_log_user', ['userId'], {})
@Entity('audit_log', { schema: 'public' })
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('integer', { name: 'user_id', nullable: true })
  userId: number | null;

  @Column('character varying', { name: 'action', length: 50 })
  action: string;

  @Column('character varying', { name: 'entity_type', length: 100 })
  entityType: string;

  @Column('character varying', {
    name: 'entity_id',
    nullable: true,
    length: 100,
  })
  entityId: string | null;

  @Column('jsonb', { name: 'old_data', nullable: true })
  oldData: object | null;

  @Column('jsonb', { name: 'new_data', nullable: true })
  newData: object | null;

  @Column('inet', { name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent: string | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;
}
