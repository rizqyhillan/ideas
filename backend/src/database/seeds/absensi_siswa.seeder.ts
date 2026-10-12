import { AppDataSource } from '../datasource';
import { AbsensiSiswa } from '../entities/entities/AbsensiSiswa';
import { SesiAbsensiSiswa } from '../entities/entities/SesiAbsensiSiswa';

/**
 * Seeder Absensi Siswa (kehadiran per sesi).
 * Tergantung:
 *  - Sesi Absensi Siswa (sesi_absensi_id)
 *  - Siswa (siswa_id)
 *
 * Flow:
 *  1. Buat sesi_absensi_siswa (sudah ada jika jadwal pelajaran sudah ada)
 *  2. Isi absensi_siswa untuk beberapa siswa
 *
 * Catatan: seeder ini dapat dijalankan berulang tanpa duplikasi
 * (cek berdasarkan (sesi_absensi_id, siswa_id)).
 */
const SISWA_PER_SESI = {
  1: [
    { siswaId: 1,  status: 'hadir' as const, keterangan: null },
    { siswaId: 2,  status: 'hadir' as const, keterangan: null },
    { siswaId: 3,  status: 'sakit' as const, keterangan: 'Sakit perut' },
    { siswaId: 4,  status: 'izin' as const, keterangan: 'Izin keluarga' },
    { siswaId: 5,  status: 'alpa' as const, keterangan: null },
  ],
  3: [
    { siswaId: 6,  status: 'hadir' as const, keterangan: null },
    { siswaId: 7,  status: 'hadir' as const, keterangan: null },
    { siswaId: 8,  status: 'izin' as const, keterangan: 'Kuliah' },
    { siswaId: 9,  status: 'hadir' as const, keterangan: null },
  ],
  5: [
    { siswaId: 10, status: 'hadir' as const, keterangan: null },
    { siswaId: 11, status: 'sakit' as const, keterangan: 'Pilek' },
    { siswaId: 12, status: 'hadir' as const, keterangan: null },
    { siswaId: 13, status: 'hadir' as const, keterangan: null },
  ],
  9: [
    { siswaId: 14, status: 'hadir' as const, keterangan: null },
    { siswaId: 15, status: 'hadir' as const, keterangan: null },
    { siswaId: 16, status: 'izin' as const, keterangan: 'Pertemuan orang tua' },
    { siswaId: 17, status: 'alpa' as const, keterangan: null },
  ],
};

export async function absensiSiswaSeeder(): Promise<void> {
  const sesiRepo = AppDataSource.getRepository(SesiAbsensiSiswa);
  const absensiRepo = AppDataSource.getRepository(AbsensiSiswa);

  let createdSesi = 0;
  let createdAbsensi = 0;

  // Buat sesi absensi (jika belum ada)
  for (const [jadwalId, sesiData] of Object.entries(SISWA_PER_SESI)) {
    const existingSesi = await sesiRepo.findOne({
      where: { jadwalPelajaranId: Number(jadwalId) },
    });

    if (!existingSesi) {
      const sesi = sesiRepo.create({
        jadwalPelajaranId: Number(jadwalId),
        tanggal: '2025-03-01',
        dibukaOlehGuruId: 1,
        catatan: 'Sesi absensi awal semester',
      });
      await sesiRepo.save(sesi);
      createdSesi++;
    }
  }

  // Buat absensi siswa
  for (const [jadwalId, siswaList] of Object.entries(SISWA_PER_SESI)) {
    const sesi = await sesiRepo.findOne({
      where: { jadwalPelajaranId: Number(jadwalId) },
    });
    if (!sesi) continue;

    for (const item of siswaList) {
      const existing = await absensiRepo.findOne({
        where: {
          sesiAbsensiId: sesi.id,
          siswaId: item.siswaId,
        },
      });
      if (!existing) {
        await absensiRepo.save(
          absensiRepo.create({
            sesiAbsensiId: sesi.id,
            siswaId: item.siswaId,
            status: item.status,
            keterangan: item.keterangan,
          })
        );
        createdAbsensi++;
      }
    }
  }

  console.log(`✔  Absensi Siswa created:`);
  console.log(`   - Sesi baru: ${createdSesi}`);
  console.log(`   - Baris absensi: ${createdAbsensi}`);
}
