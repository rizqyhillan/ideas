import { AppDataSource } from '../datasource';
import { JadwalPiket } from '../entities/entities/JadwalPiket';

/**
 * Seeder Jadwal Piket.
 * Tergantung: semester (semester_id).
 * Data piket bersih (puluhan, 1A, 1B, dll).
 * Idempotent: cek dengan (hari, jam_mulai, semester_id) — unique uq_jadwal_piket_identitas.
 */
type JadwalPiketData = {
  semesterId: number;
  nama: string;
  hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  statusAktif: boolean;
};

const JADWAL_PIKET: JadwalPiketData[] = [
  { semesterId: 1, nama: 'Piket Puluhan', hari: 'senin', jamMulai: '06:00', jamSelesai: '08:00', lokasi: 'Gerbang Utama', statusAktif: true },
  { semesterId: 1, nama: 'Piket 1A', hari: 'selasa', jamMulai: '06:00', jamSelesai: '08:00', lokasi: 'Lab Komputer', statusAktif: true },
  { semesterId: 1, nama: 'Piket 1B', hari: 'rabu', jamMulai: '06:00', jamSelesai: '08:00', lokasi: 'Lapangan Utama', statusAktif: true },
  { semesterId: 1, nama: 'Piket 2A', hari: 'kamis', jamMulai: '06:00', jamSelesai: '08:00', lokasi: 'Dapur Sekolah', statusAktif: true },
  { semesterId: 1, nama: 'Piket 2B', hari: 'jumat', jamMulai: '06:00', jamSelesai: '08:00', lokasi: 'Klasifikasi', statusAktif: true },
];

export async function jadwalPiketSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(JadwalPiket);

  let created = 0;
  for (const data of JADWAL_PIKET) {
    const existing = await repo.findOne({
      where: {
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

  console.log(`✔  Jadwal Piket created: ${created}`);
  console.log(`   (5 jadwal piket untuk semester 2024/2025 ganjil)`);
}
