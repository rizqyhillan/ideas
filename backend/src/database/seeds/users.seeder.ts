import * as bcrypt from 'bcryptjs';

import { AppDataSource } from '../datasource';
import { Users } from '../entities/entities/Users';
import { Roles } from '../entities/entities/Roles';
import { UserRoles } from '../entities/entities/UserRoles';
import { Pegawai } from '../entities/entities/Pegawai';
import { Siswa } from '../entities/entities/Siswa';

/**
 * Seeder Users.
 * - Password di-hash dengan bcrypt (same as app: bcrypt.hash(password, 10))
 * - Menghubungkan user ↔ role via table user_roles (userId + roleId)
 * - Idempotent: user yang sudah ada akan diselaraskan role-nya
 *
 * Catatan: admin.seed.ts membuat user 'admin' (role admin).
 * Seeder ini membuat user demo sesuai role yang didefinisikan README:
 * guru, guru BK, dan siswa.
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
    email: 'gurubk@sekolah.sch.id',
    password: 'guru123',
    status: 'aktif' as const,
    roleCode: 'guru_bk',
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
  const pegawaiRepo = AppDataSource.getRepository(Pegawai);
  const siswaRepo = AppDataSource.getRepository(Siswa);

  let created = 0;

  for (const data of USERS) {
    // Cari berdasarkan username atau email agar seeder dapat memperbaiki
    // role akun demo yang pernah berubah secara manual.
    const matches = await userRepo.find({
      where: [
        { username: data.username },
        { email: data.email },
      ],
      withDeleted: true,
    });

    // Jangan pernah menggabungkan dua identitas hanya karena email/username
    // salah satu data lama kebetulan sama. Pilih satu record canonical dan
    // laporkan duplikat agar dapat dibersihkan tanpa memindahkan data diam-diam.
    const existing = matches.sort((a, b) => Number(Boolean(a.deletedAt)) - Number(Boolean(b.deletedAt)))[0];
    if (matches.length > 1) {
      console.warn(
        `! Duplikat identitas untuk '${data.username}': ${matches.map((item) => `${item.id}:${item.username}/${item.email}`).join(', ')}`,
      );
    }

    const role = await roleRepo.findOne({ where: { code: data.roleCode } });
    if (!role) {
      console.log(`Role '${data.roleCode}' untuk user '${data.username}' tidak ditemukan, skip`);
      continue;
    }

    let savedUser = existing;
    if (!savedUser) {
      const hash = await bcrypt.hash(data.password, 10);
      savedUser = await userRepo.save(
        userRepo.create({
          username: data.username,
          email: data.email,
          passwordHash: hash,
          status: data.status,
        }),
      );
      created++;
      console.log(`✔  User dibuat: ${data.username} (role: ${data.roleCode})`);
    } else {
      console.log(`↻  User '${data.username}' ditemukan, sinkronisasi role`);
      if (savedUser.deletedAt) {
        savedUser.deletedAt = null;
        savedUser.status = data.status;
        await userRepo.save(savedUser);
      }
    }

    // Satu akun demo hanya boleh memiliki role yang didefinisikan di USERS.
    // Ini menghapus role nyasar (mis. guruutama ikut memiliki admin).
    const assignedRoles = await userRoleRepo.find({
      where: { userId: savedUser.id },
    });
    const staleRoles = assignedRoles.filter(
      (userRole) => userRole.roleId !== role.id,
    );
    if (staleRoles.length > 0) {
      await userRoleRepo.remove(staleRoles);
    }

    const expectedRole = assignedRoles.find(
      (userRole) => userRole.roleId === role.id,
    );
    if (!expectedRole) {
      await userRoleRepo.save(
        userRoleRepo.create({ userId: savedUser.id, roleId: role.id }),
      );
    }

    // Hubungkan akun demo ke profil domain yang menjadi sumber otorisasi data.
    if (data.roleCode === 'guru' || data.roleCode === 'guru_bk') {
      const pegawai = await pegawaiRepo.findOne({
        where: [
          { userId: savedUser.id },
          { email: data.email },
        ],
      });
      if (pegawai && pegawai.userId !== savedUser.id) {
        const owner = await pegawaiRepo.findOne({ where: { userId: savedUser.id } });
        if (!owner) {
          pegawai.userId = savedUser.id;
          await pegawaiRepo.save(pegawai);
        }
      }
    }

    if (data.roleCode === 'siswa') {
      const siswa = await siswaRepo.findOne({
        where: [
          { userId: savedUser.id },
          { email: data.email },
        ],
      });
      if (siswa && siswa.userId !== savedUser.id) {
        const owner = await siswaRepo.findOne({ where: { userId: savedUser.id } });
        if (!owner) {
          siswa.userId = savedUser.id;
          await siswaRepo.save(siswa);
        }
      }
    }
  }

  console.log(`\n✔  Users created: ${created}`);
  console.log(`   (admin sudah dibuat oleh admin.seeder.ts)`);
  console.log(`   default password: silakan ubah di UI/App setelah login pertama kali`);
}
