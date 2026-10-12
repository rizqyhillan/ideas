import * as bcrypt from 'bcryptjs';

import { AppDataSource } from '../datasource';
import { Users } from '../entities/entities/Users';
import { Roles } from '../entities/entities/Roles';
import { UserRoles } from '../entities/entities/UserRoles';

/**
 * Seeder Users.
 * - Password di-hash dengan bcrypt (same as app: bcrypt.hash(password, 10))
 * - Menghubungkan user ↔ role via table user_roles (userId + roleId)
 * - Idempotent: skip jika username/email sudah ada
 *
 * Catatan: admin.seed.ts membuat user 'admin' (role admin).
 * Seeder ini membuat user tambahan: guru, staff, dan satu siswa (demo).
 */
const USERS = [
  {
    username: 'guru_utama',
    email: 'guruutama@sekolah.sch.id',
    password: 'guru123',
    status: 'aktif' as const,
    roleCode: 'guru',
  },
  {
    username: 'guru_bk',
    email: 'gurabk@sekolah.sch.id',
    password: 'guru123',
    status: 'aktif' as const,
    roleCode: 'bk',
  },
  {
    username: 'staf_jurusan',
    email: 'stafjurusan@sekolah.sch.id',
    password: 'staf123',
    status: 'aktif' as const,
    roleCode: 'staff',
  },
  {
    username: 'siswa_demo',
    email: 'siswademo@sekolah.sch.id',
    password: 'siswa123',
    status: 'aktif' as const,
    roleCode: 'siswa',
  },
];

export async function usersSeeder(): Promise<void> {
  const userRepo = AppDataSource.getRepository(Users);
  const roleRepo = AppDataSource.getRepository(Roles);
  const userRoleRepo = AppDataSource.getRepository(UserRoles);

  let created = 0;

  for (const data of USERS) {
    // Skip jika sudah ada (username atau email)
    const existing = await userRepo.findOne({
      where: [
        { username: data.username },
        { email: data.email },
      ],
      withDeleted: true,
    });
    if (existing) {
      console.log(`⏭  User '${data.username}' sudah ada, skip`);
      continue;
    }

    const role = await roleRepo.findOne({ where: { code: data.roleCode } });
    if (!role) {
      console.log(`⚠  Role '${data.roleCode}' untuk user '${data.username}' tidak ditemukan, skip`);
      continue;
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = userRepo.create({
      username: data.username,
      email: data.email,
      passwordHash: hash,
      status: data.status,
    });
    const savedUser = await userRepo.save(user);

    // user_roles (userId + roleId)
    const existingRole = await userRoleRepo.findOne({
      where: {
        userId: savedUser.id,
        roleId: role.id,
      },
    });
    if (!existingRole) {
      await userRoleRepo.save(
        userRoleRepo.create({
          userId: savedUser.id,
          roleId: role.id,
        })
      );
    }

    created++;
    console.log(`✔  User dibuat: ${data.username} (role: ${data.roleCode})`);
  }

  console.log(`\n✔  Users created: ${created}`);
  console.log(`   (admin sudah dibuat oleh admin.seeder.ts)`);
  console.log(`   default password: silakan ubah di UI/App setelah login pertama kali`);
}
