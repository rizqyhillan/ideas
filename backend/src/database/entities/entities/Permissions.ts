import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermissions } from './RolePermissions';
import { UserPermissions } from './UserPermissions';

@Index('uq_permissions_module_action', ['action', 'module'], { unique: true })
@Index('permissions_code_key', ['code'], { unique: true })
@Index('permissions_pkey', ['id'], { unique: true })
@Entity('permissions', { schema: 'public' })
export class Permissions {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'code', unique: true, length: 100 })
  code: string;

  @Column('character varying', { name: 'module', unique: true, length: 50 })
  module: string;

  @Column('character varying', { name: 'action', unique: true, length: 50 })
  action: string;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(
    () => RolePermissions,
    (rolePermissions) => rolePermissions.permission,
  )
  rolePermissions: RolePermissions[];

  @OneToMany(
    () => UserPermissions,
    (userPermissions) => userPermissions.permission,
  )
  userPermissions: UserPermissions[];
}
