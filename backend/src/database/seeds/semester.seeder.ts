import { AppDataSource } from '../datasource';
import { Semester } from '../entities/entities/Semester';

/**
 * Data master Semester.
 * Tergantung Tahun Ajaran (tahun_ajaran_id).
 * Hati-hati dengan unique: uq_semester_active (isActive) & uq_semester_tahun_jenis (jenis + tahunAjaranId).
 */
const SEMESTERS: Array<{
  tahunAjaranId: number;
  jenis: 'ganjil' | 'genap';
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive: boolean;
}> = [
  { tahunAjaranId: 1, jenis: 'genap', tanggalMulai: '2025-01-01', tanggalSelesai: '2025-06-30', isActive: false },
  { tahunAjaranId: 2, jenis: 'ganjil', tanggalMulai: '2025-07-01', tanggalSelesai: '2025-12-31', isActive: false },
  { tahunAjaranId: 2, jenis: 'genap', tanggalMulai: '2026-01-01', tanggalSelesai: '2026-06-30', isActive: false },
];

export async function semesterSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(Semester);

  let created = 0;
  for (const data of SEMESTERS) {
    // Cek apakah (tahun_ajaran_id, jenis) sudah ada
    const existing = await repo.findOne({
      where: { tahunAjaranId: data.tahunAjaranId, jenis: data.jenis },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Semester created: ${created}`);
  console.log(`   - 2024/2025: ganjil (aktif), genap`);
  console.log(`   - 2025/2026: ganjil, genap`);
}
