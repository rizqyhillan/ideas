import { AppDataSource } from '../datasource';
import { Permissions } from '../entities/entities/Permissions';
import { Roles } from '../entities/entities/Roles';
import { RolePermissions } from '../entities/entities/RolePermissions';

/**
 * Pemetaan role → permission.
 * Format: [roleCode, permissionModule, permissionAction]
 */
const ROLE_PERMISSIONS: [string, string, string][] = [
  // Admin: semua permission
  ['admin', 'users', 'list'],
  ['admin', 'users', 'create'],
  ['admin', 'users', 'update'],
  ['admin', 'users', 'delete'],
  ['admin', 'users', 'assign-role'],
  ['admin', 'kelas', 'list'],
  ['admin', 'kelas', 'create'],
  ['admin', 'kelas', 'update'],
  ['admin', 'kelas', 'delete'],
  ['admin', 'kelas', 'assign-wali'],
  ['admin', 'siswa', 'list'],
  ['admin', 'siswa', 'create'],
  ['admin', 'siswa', 'update'],
  ['admin', 'siswa', 'delete'],
  ['admin', 'siswa', 'absen'],
  ['admin', 'guru', 'list'],
  ['admin', 'guru', 'create'],
  ['admin', 'guru', 'update'],
  ['admin', 'guru', 'delete'],
  ['admin', 'guru', 'jadwal'],
  ['admin', 'absensi', 'list'],
  ['admin', 'absensi', 'create'],
  ['admin', 'absensi', 'report'],
  ['admin', 'ekstrakurikuler', 'list'],
  ['admin', 'ekstrakurikuler', 'create'],
  ['admin', 'ekstrakurikuler', 'update'],
  ['admin', 'ekstrakurikuler', 'delete'],
  ['admin', 'ekstrakurikuler', 'anggota'],
  ['admin', 'ekstrakurikuler', 'jadwal'],
  ['admin', 'jadwal', 'list'],
  ['admin', 'jadwal', 'create'],
  ['admin', 'jadwal', 'update'],
  ['admin', 'konseling', 'list'],
  ['admin', 'konseling', 'create'],
  ['admin', 'laporan', 'absensi'],
  ['admin', 'laporan', 'transaksi'],
  // Guru: {}
  ['guru', 'siswa', 'list'],
  ['guru', 'siswa', 'absen'],
  ['guru', 'guru', 'list'],
  ['guru', 'guru', 'jadwal'],
  ['guru', 'absensi', 'list'],
  ['guru', 'absensi', 'create'],
  ['guru', 'ekstrakurikuler', 'list'],
  ['guru', 'jadwal', 'list'],
  ['guru', 'konseling', 'list'],
  ['guru', 'laporan', 'absensi'],
  // Staff: {}
  ['staff', 'users', 'list'],
  ['staff', 'kelas', 'list'],
  ['staff', 'siswa', 'list'],
  ['staff', 'absensi', 'report'],
  ['staff', 'ekstrakurikuler', 'list'],
  ['staff', 'ekstrakurikuler', 'jadwal'],
  ['staff', 'laporan', 'absensi'],
  // BK
  ['bk', 'siswa', 'list'],
  ['bk', 'siswa', 'create'],
  ['bk', 'konseling', 'list'],
  ['bk', 'konseling', 'create'],
  ['bk', 'laporan', 'transaksi'],
  // Siswa (hanya lihat data sendiri + absen jika ada)
  ['siswa', 'siswa', 'list'],
  ['siswa', 'siswa', 'absen'],
  // Orang Tua
  ['orang_tua', 'siswa', 'list'],
  ['orang_tua', 'siswa', 'absen'],
];

export async function rolePermissionsSeeder(): Promise<void> {
  const roleRepo = AppDataSource.getRepository(Roles);
  const permRepo = AppDataSource.getRepository(Permissions);
  const rpRepo = AppDataSource.getRepository(RolePermissions);

  let created = 0;
  for (const [roleCode, module, action] of ROLE_PERMISSIONS) {
    const role = await roleRepo.findOne({ where: { code: roleCode } });
    if (!role) continue;

    const perm = await permRepo.findOne({
      where: { module, action },
    });
    if (!perm) continue;

    const existing = await rpRepo.findOne({
      where: { roleId: role.id, permissionId: perm.id },
    });
    if (existing) continue;

    await rpRepo.save(rpRepo.create({ roleId: role.id, permissionId: perm.id }));
    created++;
  }

  console.log(`✔  Role-Permission mappings created: ${created}`);
}
