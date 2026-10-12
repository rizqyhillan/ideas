import { AppDataSource } from '../datasource';
import { JadwalPelajaran } from '../entities/entities/JadwalPelajaran';

/**
 * Seeder Jadwal Pelajaran.
 * Tergantung:
 *  - Tahun Ajaran (semester_id → semester.id)
 *  - Kelas (kelas_id → kelas.id)
 *  - Mata Pelajaran (mata_pelajaran_id → mata_pelajaran.id)
 *  - Guru (guru_id → guru.id)
 *
 * Data dibuat berdasarkan seeder sebelumnya (semester 2024/2025 ganjil = id 1).
 * Idempotent: cek dengan (guruId, hari, jamMulai, semesterId) — unique constraint uq_jadwal_guru_start.
 */
type JadwalPelajaranData = {
  semesterId: number;
  kelasId: number;
  mataPelajaranId: number;
  guruId: number;
  hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
  jamMulai: string;
  jamSelesai: string;
  ruang: string;
  statusAktif: boolean;
};

const JADWAL_PELAJARAN: JadwalPelajaranData[] = [
  // Guru 1 (Budi Santoso) → Matematika, X IPA 1
  { semesterId: 1, kelasId: 1, mataPelajaranId: 4, guruId: 1, hari: 'senin', jamMulai: '07:00', jamSelesai: '08:00', ruang: 'R-101', statusAktif: true },
  { semesterId: 1, kelasId: 1, mataPelajaranId: 4, guruId: 1, hari: 'rabu', jamMulai: '07:00', jamSelesai: '08:00', ruang: 'R-102', statusAktif: true },
  // Guru 1 → X IPA 2
  { semesterId: 1, kelasId: 2, mataPelajaranId: 4, guruId: 1, hari: 'kamis', jamMulai: '07:00', jamSelesai: '08:00', ruang: 'R-103', statusAktif: true },
  // Guru 2 (Siti Rahmawati) → Bahasa Indonesia, X IPS 1
  { semesterId: 1, kelasId: 4, mataPelajaranId: 5, guruId: 2, hari: 'selasa', jamMulai: '08:00', jamSelesai: '09:00', ruang: 'R-201', statusAktif: true },
  { semesterId: 1, kelasId: 4, mataPelajaranId: 5, guruId: 2, hari: 'jumat', jamMulai: '08:00', jamSelesai: '09:00', ruang: 'R-201', statusAktif: true },
  // Guru 2 → X IPS 2
  { semesterId: 1, kelasId: 5, mataPelajaranId: 5, guruId: 2, hari: 'rabu', jamMulai: '08:00', jamSelesai: '09:00', ruang: 'R-202', statusAktif: true },
  // Guru 3 (Ahmad Fauzi, BK) → Bimbingan Konseling
  { semesterId: 1, kelasId: 3, mataPelajaranId: 12, guruId: 3, hari: 'rabu', jamMulai: '08:00', jamSelesai: '09:00', ruang: 'BK-01', statusAktif: true },
  { semesterId: 1, kelasId: 6, mataPelajaranId: 12, guruId: 3, hari: 'jumat', jamMulai: '08:00', jamSelesai: '09:00', ruang: 'BK-01', statusAktif: true },
  // Guru 2 → XI IPS 1
  { semesterId: 1, kelasId: 6, mataPelajaranId: 5, guruId: 2, hari: 'senin', jamMulai: '09:00', jamSelesai: '10:00', ruang: 'R-201', statusAktif: true },
];

export async function jadwalPelajaranSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(JadwalPelajaran);

  let created = 0;
  for (const data of JADWAL_PELAJARAN) {
    // Unique constraint: (guru_id, hari, jam_mulai, semester_id)
    const existing = await repo.findOne({
      where: {
        guruId: data.guruId,
        hari: data.hari,
        jamMulai: data.jamMulai,
        semesterId: data.semesterId,
      },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Jadwal Pelajaran created: ${created}`);
  console.log(`   (guru 1: Math; guru 2: Bahasa Indonesia; guru 3: BK)`);
}
