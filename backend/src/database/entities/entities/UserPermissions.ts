import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Permissions } from "./Permissions";

@Index("user_permissions_pkey", ["permissionId", "userId"], { unique: true })
@Index("idx_user_permissions_permission_id", ["permissionId"], {})
@Entity("user_permissions", { schema: "public" })
export class UserPermissions {
  @Column("integer", { primary: true, name: "user_id" })
  userId: number;

  @Column("integer", { primary: true, name: "permission_id" })
  permissionId: number;

  @Column("boolean", { name: "is_allowed", default: () => "true" })
  isAllowed: boolean;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  assignedAt: Date;

  @Column("timestamp with time zone", { name: "expires_at", nullable: true })
  expiresAt: Date | null;

  @Column("text", { name: "reason", nullable: true })
  reason: string | null;

  @ManyToOne(() => Users, (users) => users.userPermissions, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "assigned_by", referencedColumnName: "id" }])
  assignedBy: Users;

  @ManyToOne(() => Permissions, (permissions) => permissions.userPermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "permission_id", referencedColumnName: "id" }])
  permission: Permissions;

  @ManyToOne(() => Users, (users) => users.userPermissions2, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
