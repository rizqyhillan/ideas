import * as bcrypt from 'bcryptjs';

import { AppDataSource } from '../datasource';
import { Roles } from '../entities/entities/Roles';

export async function rolesSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(Roles);

  const roles = [
    { code: 'admin', name: 'Administrator', description: 'Akses penuh ke sistem', isSystem: true },
    { code: 'guru', name: 'Guru', description: 'Guru / PNS', isSystem: true },
    { code: 'staff', name: 'Staf', description: 'Pegawai / staf sekolah', isSystem: true },
    { code: 'bk', name: 'Bimbingan Konseling', description: 'Guru BK', isSystem: true },
    { code: 'siswa', name: 'Siswa', description: 'Siswa aktif', isSystem: true },
    { code: 'orang_tua', name: 'Orang Tua/Wali', description: 'Orang tua siswa', isSystem: false },
  ];

  let created = 0;
  for (const data of roles) {
    const existing = await repo.findOne({ where: { code: data.code } });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Roles created: ${created}`);
  console.log(`   - admin, guru, staff, bk, siswa, orang_tua`);
}
