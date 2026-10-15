import { AppDataSource } from '../datasource';
import { Permissions } from '../entities/entities/Permissions';
import { Roles } from '../entities/entities/Roles';
import { RolePermissions } from '../entities/entities/RolePermissions';

/**
 * Pemetaan role → permission.
 * Format: [roleCode, permissionModule, permissionAction]
 */
const ROLE_PERMISSIONS: [string, string, string][] = [
  ['admin', 'dashboard', 'view'],
  // Admin: semua permission
  ['admin', 'users', 'list'],
  ['admin', 'users', 'create'],
  ['admin', 'users', 'update'],
  ['admin', 'users', 'delete'],
  ['admin', 'users', 'assign_role'],
  ['admin', 'kelas', 'list'],
  ['admin', 'kelas', 'create'],
  ['admin', 'kelas', 'update'],
  ['admin', 'kelas', 'delete'],
  ['admin', 'kelas', 'assign_wali'],
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
  ['admin', 'konseling', 'update'],
  ['admin', 'konseling', 'delete'],
  ['admin', 'laporan', 'absensi'],
  ['admin', 'laporan', 'transaksi'],
  // Guru
  ['guru', 'dashboard', 'view'],
  ['guru', 'siswa', 'list'],
  ['guru', 'siswa', 'absen'],
  ['guru', 'guru', 'list'],
  ['guru', 'guru', 'jadwal'],
  ['guru', 'absensi', 'list'],
  ['guru', 'absensi', 'create'],
  ['guru', 'ekstrakurikuler', 'list'],
  ['guru', 'jadwal', 'list'],
  ['guru', 'laporan', 'absensi'],
  // Guru BK: seluruh fitur konseling sesuai README.
  ['guru_bk', 'dashboard', 'view'],
  ['guru_bk', 'siswa', 'list'],
  ['guru_bk', 'konseling', 'list'],
  ['guru_bk', 'konseling', 'create'],
  ['guru_bk', 'konseling', 'update'],
  ['guru_bk', 'konseling', 'delete'],
  // Siswa (hanya lihat data sendiri + absen jika ada)
  ['siswa', 'dashboard', 'view'],
  ['siswa', 'siswa', 'list'],
  ['siswa', 'siswa', 'absen'],
  ['siswa', 'konseling', 'list'],
];

const LEGACY_ALIASES: Record<string, string> = {
  'users.list': 'users.view',
  'kelas.list': 'classes.view',
  'kelas.create': 'classes.create',
  'kelas.update': 'classes.update',
  'kelas.delete': 'classes.delete',
  'siswa.list': 'students.view',
  'siswa.create': 'students.create',
  'siswa.update': 'students.update',
  'siswa.delete': 'students.delete',
  'guru.list': 'teachers.view',
  'guru.create': 'teachers.create',
  'guru.update': 'teachers.update',
  'guru.delete': 'teachers.delete',
  'jadwal.list': 'schedules.view',
  'jadwal.create': 'schedules.create',
  'jadwal.update': 'schedules.update',
};

export async function rolePermissionsSeeder(): Promise<void> {
  const roleRepo = AppDataSource.getRepository(Roles);
  const permRepo = AppDataSource.getRepository(Permissions);
  const rpRepo = AppDataSource.getRepository(RolePermissions);

  let created = 0;
  for (const [roleCode, module, action] of ROLE_PERMISSIONS) {
    const role = await roleRepo.findOne({ where: { code: roleCode } });
    if (!role) continue;

    // Seeder lama memakai bentuk assign-role/assign-wali, sedangkan kolom
    // permission yang canonical memakai snake_case. Normalisasi di sini agar
    // mapping tidak diam-diam terlewat.
    const normalizedAction = action.replace(/-/g, '_');
    const code = `${module}.${normalizedAction}`;
    const legacyCode = LEGACY_ALIASES[code];
    const perm = await permRepo.findOne({
      where: legacyCode
        ? [{ code }, { code: legacyCode }]
        : { module, action: normalizedAction },
    });
    if (!perm) continue;

    const existing = await rpRepo.findOne({
      where: { roleId: role.id, permissionId: perm.id },
    });
    if (existing) continue;

    await rpRepo.save(rpRepo.create({ roleId: role.id, permissionId: perm.id }));
    created++;
  }

  const admin = await roleRepo.findOne({ where: { code: 'admin' } });
  if (admin) {
    const permissions = await permRepo.find();
    for (const permission of permissions) {
      const exists = await rpRepo.findOne({ where: { roleId: admin.id, permissionId: permission.id } });
      if (!exists) {
        await rpRepo.save(rpRepo.create({ roleId: admin.id, permissionId: permission.id }));
      }
    }
  }

  console.log(`✔  Role-Permission mappings created: ${created}`);
}
