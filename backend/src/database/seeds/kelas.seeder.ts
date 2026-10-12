import { AppDataSource } from '../datasource';
import { Kelas } from '../entities/entities/Kelas';

/**
 * Seeder Kelas.
 * Tergantung: Tahun Ajaran (tahun_ajaran_id), Wali Kelas (wali_kelas_id → guru.id).
 *
 * Catatan: unique constraint uq_kelas_wali_per_tahun mengharuskan
 * setiap wali hanya punya 1 kelas per tahun_ajaran_id.
 * Karena 3 guru (ids 1,2,3) → maksimal 3 kelas per tahun.
 *
 * Idempotent: cek dengan (tahun_ajaran_id, nama).
 */
const KELAS = [
  // ── Tahun Ajaran 1 (2024/2025) – aktif ──
  { tahunAjaranId: 1, nama: 'X IPA 1', tingkat: 7, waliKelasId: 1, kapasitas: 30, ruang: 'A-101', statusAktif: true },
  { tahunAjaranId: 1, nama: 'X IPS 1', tingkat: 7, waliKelasId: 2, kapasitas: 30, ruang: 'B-201', statusAktif: true },
  { tahunAjaranId: 1, nama: 'X BP 1',  tingkat: 7, waliKelasId: 3, kapasitas: 30, ruang: 'BK-01', statusAktif: true },
  // ── Tahun Ajaran 2 (2025/2026) – nonaktif ──
  { tahunAjaranId: 2, nama: 'X IPA 1', tingkat: 7, waliKelasId: 1, kapasitas: 30, ruang: 'A-101', statusAktif: false },
  { tahunAjaranId: 2, nama: 'X IPS 1', tingkat: 7, waliKelasId: 2, kapasitas: 30, ruang: 'B-201', statusAktif: false },
  { tahunAjaranId: 2, nama: 'X BP 1',  tingkat: 7, waliKelasId: 3, kapasitas: 30, ruang: 'BK-01', statusAktif: false },
];

export async function kelasSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(Kelas);

  let created = 0;
  for (const data of KELAS) {
    const existing = await repo.findOne({
      where: {
        tahunAjaranId: data.tahunAjaranId,
        nama: data.nama,
      },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Kelas created: ${created}`);
  console.log(`   - Tahun 2024/2025: 3 kelas aktif`);
  console.log(`   - Tahun 2025/2026: 3 kelas nonaktif`);
}
