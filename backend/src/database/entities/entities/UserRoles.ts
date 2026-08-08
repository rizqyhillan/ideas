import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./Users";
import { Roles } from "./Roles";

@Index("idx_user_roles_role_id", ["roleId"], {})
@Index("user_roles_pkey", ["roleId", "userId"], { unique: true })
@Entity("user_roles", { schema: "public" })
export class UserRoles {
  @Column("integer", { primary: true, name: "user_id" })
  userId: number;

  @Column("smallint", { primary: true, name: "role_id" })
  roleId: number;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  assignedAt: Date;

  @Column("timestamp with time zone", { name: "expires_at", nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => Users, (users) => users.userRoles, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "assigned_by", referencedColumnName: "id" }])
  assignedBy: Users;

  @ManyToOne(() => Roles, (roles) => roles.userRoles, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
  role: Roles;

  @ManyToOne(() => Users, (users) => users.userRoles2, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
