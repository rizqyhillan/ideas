import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Permissions } from './Permissions';
import { Roles } from './Roles';

@Index('idx_role_permissions_permission_id', ['permissionId'], {})
@Index('role_permissions_pkey', ['permissionId', 'roleId'], { unique: true })
@Entity('role_permissions', { schema: 'public' })
export class RolePermissions {
  @Column('smallint', { primary: true, name: 'role_id' })
  roleId: number;

  @Column('integer', { primary: true, name: 'permission_id' })
  permissionId: number;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Permissions, (permissions) => permissions.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'permission_id', referencedColumnName: 'id' }])
  permission: Permissions;

  @ManyToOne(() => Roles, (roles) => roles.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'id' }])
  role: Roles;
}
