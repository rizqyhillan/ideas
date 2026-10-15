import { AppDataSource } from '../datasource';
import { Permissions } from '../entities/entities/Permissions';

/**
 * Daftar permission (module + action) untuk autorisasi.
 * Format: { code, module, action, description }
 * _ code   : kode unik, format {module}_{action}, e.g. 'users_list'
 * _ module : nama module (users, auth, kelas, siswa, ...)
 * _ action : aksi (list, create, update, delete, ...)
 * _ description : deskripsi singkat
 */
const PERMISSIONS: Array<{
  code: string;
  module: string;
  action: string;
  description: string;
}> = [
  { code: 'dashboard.view', module: 'dashboard', action: 'view', description: 'Lihat dashboard sesuai role' },
  { code: 'users.list', module: 'users', action: 'list', description: 'Lihat daftar user' },
  { code: 'users.create', module: 'users', action: 'create', description: 'Tambah user' },
  { code: 'users.update', module: 'users', action: 'update', description: 'Perbarui user' },
  { code: 'users.delete', module: 'users', action: 'delete', description: 'Hapus/user nonaktifkan user' },
  { code: 'users_assign.role', module: 'users', action: 'assign_role', description: 'Berikan peran (role) ke user' },
  { code: 'auth.login', module: 'auth', action: 'login', description: 'Login' },
  { code: 'auth_refresh.token', module: 'auth', action: 'refresh_token', description: 'Refresh token' },
  { code: 'kelas.list', module: 'kelas', action: 'list', description: 'Lihat daftar kelas' },
  { code: 'kelas.create', module: 'kelas', action: 'create', description: 'Tambah kelas' },
  { code: 'kelas.update', module: 'kelas', action: 'update', description: 'Perbarui kelas' },
  { code: 'kelas.delete', module: 'kelas', action: 'delete', description: 'Hapus kelas' },
  { code: 'kelas_assign.wali', module: 'kelas', action: 'assign_wali', description: 'Tetapkan wali kelas' },
  { code: 'siswa.list', module: 'siswa', action: 'list', description: 'Lihat daftar siswa' },
  { code: 'siswa.create', module: 'siswa', action: 'create', description: 'Tambah siswa' },
  { code: 'siswa.update', module: 'siswa', action: 'update', description: 'Perbarui siswa' },
  { code: 'siswa.delete', module: 'siswa', action: 'delete', description: 'Hapus siswa' },
  { code: 'siswa.absen', module: 'siswa', action: 'absen', description: 'Catat kehadiran siswa' },
  { code: 'guru.list', module: 'guru', action: 'list', description: 'Lihat daftar guru' },
  { code: 'guru.create', module: 'guru', action: 'create', description: 'Tambah guru' },
  { code: 'guru.update', module: 'guru', action: 'update', description: 'Perbarui guru' },
  { code: 'guru.delete', module: 'guru', action: 'delete', description: 'Hapus guru' },
  { code: 'guru.jadwal', module: 'guru', action: 'jadwal', description: 'Lihat daftar jadwal mengajar' },
  { code: 'absensi.list', module: 'absensi', action: 'list', description: 'Lihat daftar absensi' },
  { code: 'absensi.create', module: 'absensi', action: 'create', description: 'Catat/absen absensi' },
  { code: 'absensi.report', module: 'absensi', action: 'report', description: 'Lihat laporan absensi' },
  { code: 'ekstrakurikuler.list', module: 'ekstrakurikuler', action: 'list', description: 'Lihat daftar ekstrakurikuler' },
  { code: 'ekstrakurikuler.create', module: 'ekstrakurikuler', action: 'create', description: 'Tambah ekstrakurikuler' },
  { code: 'ekstrakurikuler.update', module: 'ekstrakurikuler', action: 'update', description: 'Perbarui ekstrakurikuler' },
  { code: 'ekstrakurikuler.delete', module: 'ekstrakurikuler', action: 'delete', description: 'Hapus ekstrakurikuler' },
  { code: 'ekstrakurikuler.anggota', module: 'ekstrakurikuler', action: 'anggota', description: 'Kelola anggota ekstrakurikuler' },
  { code: 'ekstrakurikuler.jadwal', module: 'ekstrakurikuler', action: 'jadwal', description: 'Lihat jadwal ekstrakurikuler' },
  { code: 'jadwal.list', module: 'jadwal', action: 'list', description: 'Lihat jadwal pelajaran' },
  { code: 'jadwal.create', module: 'jadwal', action: 'create', description: 'Tambah jadwal pelajaran' },
  { code: 'jadwal.update', module: 'jadwal', action: 'update', description: 'Perbarui jadwal pelajaran' },
  { code: 'konseling.list', module: 'konseling', action: 'list', description: 'Lihat daftar konseling' },
  { code: 'konseling.create', module: 'konseling', action: 'create', description: 'Tambah catatan konseling' },
  { code: 'konseling.update', module: 'konseling', action: 'update', description: 'Perbarui catatan konseling' },
  { code: 'konseling.delete', module: 'konseling', action: 'delete', description: 'Hapus catatan konseling' },
  { code: 'laporan.absensi', module: 'laporan', action: 'absensi', description: 'Lihat laporan kehadiran' },
  { code: 'laporan.transaksi', module: 'laporan', action: 'transaksi', description: 'Lihat laporan keuangan/transaksi' },
];

export async function permissionsSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(Permissions);

  let created = 0;
  for (const data of PERMISSIONS) {
    const existing = await repo.findOne({
      where: { module: data.module, action: data.action },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Permissions created: ${created}`);
  console.log(`   (total ${PERMISSIONS.length} permission yang diizin)`);
}
