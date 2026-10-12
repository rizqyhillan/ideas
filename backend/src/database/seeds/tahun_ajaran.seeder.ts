import { AppDataSource } from '../datasource';
import { TahunAjaran } from '../entities/entities/TahunAjaran';

/**
 * Data master Tahun Ajaran.
 * Nama harus unik (constraints: uq_tahun_ajaran_active, tahun_ajaran_nama_key)
 * Pastikan data tidak bentrok saat run ulang (check existing by nama).
 */
const TAHUN_AJARAN = [
  { nama: '2024/2025', tanggalMulai: '2024-07-01', tanggalSelesai: '2025-06-30', isActive: true },
  { nama: '2025/2026', tanggalMulai: '2025-07-01', tanggalSelesai: '2026-06-30', isActive: false },
];

export async function tahunAjaranSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(TahunAjaran);

  let created = 0;
  for (const data of TAHUN_AJARAN) {
    const existing = await repo.findOne({
      where: { nama: data.nama },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Tahun Ajaran created: ${created}`);
  console.log(`   - 2024/2025 (active), 2025/2026 (inactive)`);
}
