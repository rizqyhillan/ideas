import { AppDataSource } from '../datasource';
import { SiswaKelas } from '../entities/entities/SiswaKelas';

/**
 * Seeder SiswaKelas (absen/kehadiran + riwayat pindah kelas).
 * Tergantung:
 *  - Siswa (siswa_id)
 *  - Kelas (kelas_id)
 *
 * Data dibuat dengan asumsi:
 *  - Tahun 2024/2025 (tahun_ajaran_id=1) → siswa-ngajar di kelas yang sesuai
 *  - Siswa "keluar" dari kelas yang lama dan "masuk" ke kelas baru
 *
 * Idempotent: cek dengan (siswaId, kelasId) — unique constraint uq_siswa_kelas_history.
 *
 * Class ID mapping (setelah kelasSeeder run):
 *  1 = X IPA 1 (TA1) wali 1
 *  2 = X IPS 1 (TA1) wali 2
 *  3 = X BP 1  (TA1) wali 3
 *  4 = X IPA 1 (TA2) wali 1
 *  5 = X IPS 1 (TA2) wali 2
 *  6 = X BP 1  (TA2) wali 3
 */
const SISWA_KELAS = [
  // ── Class 1: X IPA 1 (TA1) → wali 1 ──
  { siswaId: 1,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 2,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 3,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 4,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 5,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 6,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 7,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 8,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 9,  kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 10, kelasId: 1, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  // ── Class 2: X IPS 1 (TA1) → wali 2 ──
  { siswaId: 11, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 12, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 13, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 14, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 15, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 16, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 17, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 18, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 19, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 20, kelasId: 2, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  // ── Class 3: X BP 1 (TA1) → wali 3 ──
  { siswaId: 21, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 22, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 23, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 24, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 25, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 26, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 27, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
  { siswaId: 28, kelasId: 3, tanggalMasuk: '2025-07-01', tanggalKeluar: null, isActive: true },
];

export async function siswaKelasSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(SiswaKelas);

  let created = 0;
  for (const data of SISWA_KELAS) {
    const existing = await repo.findOne({
      where: {
        siswaId: data.siswaId,
        kelasId: data.kelasId,
      },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  SiswaKelas created: ${created}`);
  console.log(`   (siswa di-aktifkan di kelas TA1: 10+10+8 = ${SISWA_KELAS.length} baris)`);
}
