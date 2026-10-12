import { AppDataSource } from '../datasource';
import { AbsensiGuruPiket } from '../entities/entities/AbsensiGuruPiket';

/**
 * Seeder Absensi Guru Piket (kehadiran dinas piket).
 * Tergantung:
 *  - Jadwal Piket (jadwal_piket_id)
 *  - Guru (guru_id)
 *
 * Status: 'hadir', 'sakit', 'izin', 'alpa'.
 * Idempotent: cek berdasarkan (jadwal_piket_id, guru_id).
 */
type PiketAttendanceData = {
  jadwalPiketId: number;
  guruId: number;
  tanggal: string;  // 'YYYY-MM-DD'
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  keterangan: string | null;
};

const PIKET_ATTENDANCE: PiketAttendanceData[] = [
  // Piket Puluhan (id=1)
  { jadwalPiketId: 1, guruId: 1, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  { jadwalPiketId: 1, guruId: 2, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  // Piket 1A (id=2)
  { jadwalPiketId: 2, guruId: 3, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  { jadwalPiketId: 2, guruId: 1, tanggal: '2025-03-01', status: 'sakit', keterangan: 'Sakit kepala' },
  // Piket 1B (id=3)
  { jadwalPiketId: 3, guruId: 2, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  { jadwalPiketId: 3, guruId: 3, tanggal: '2025-03-01', status: 'izin', keterangan: 'Izin medis' },
  // Piket 2A (id=4)
  { jadwalPiketId: 4, guruId: 1, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  { jadwalPiketId: 4, guruId: 2, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  // Piket 2B (id=5)
  { jadwalPiketId: 5, guruId: 3, tanggal: '2025-03-01', status: 'hadir', keterangan: null },
  { jadwalPiketId: 5, guruId: 1, tanggal: '2025-03-01', status: 'alpa', keterangan: 'Tidak jadwal' },
];

export async function absensiGuruPiketSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(AbsensiGuruPiket);

  let created = 0;
  for (const data of PIKET_ATTENDANCE) {
    const existing = await repo.findOne({
      where: {
        jadwalPiketId: data.jadwalPiketId,
        guruId: data.guruId,
      },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Absensi Guru Piket created: ${created}`);
  console.log(`   (hadir:7, sakit:1, izin:1, alpa:1)`);
}
