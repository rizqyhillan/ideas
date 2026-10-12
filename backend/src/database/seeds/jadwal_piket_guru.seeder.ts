import { AppDataSource } from '../datasource';
import { JadwalPiketGuru } from '../entities/entities/JadwalPiketGuru';

/**
 * Seeder Jadwal Piket → Guru (junction).
 * Tergantung:
 *  - Jadwal Piket (jadwal_piket_id)
 *  - Guru (guru_id)
 *
 * Data: setiap jadwal piket diisi 2–3 guru.
 * Idempotent: cek dengan (jadwalPiketId, guruId) — unique jadwal_piket_guru_pkey.
 */
const JADWAL_PIKET_GURU: Array<{ jadwalPiketId: number; guruId: number }> = [
  // Piket Puluhan (id=1)
  { jadwalPiketId: 1, guruId: 1 },
  { jadwalPiketId: 1, guruId: 2 },
  // Piket 1A (id=2)
  { jadwalPiketId: 2, guruId: 3 },
  { jadwalPiketId: 2, guruId: 1 },
  // Piket 1B (id=3)
  { jadwalPiketId: 3, guruId: 2 },
  { jadwalPiketId: 3, guruId: 3 },
  // Piket 2A (id=4)
  { jadwalPiketId: 4, guruId: 1 },
  { jadwalPiketId: 4, guruId: 2 },
  // Piket 2B (id=5)
  { jadwalPiketId: 5, guruId: 3 },
  { jadwalPiketId: 5, guruId: 1 },
];

export async function jadwalPiketGuruSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(JadwalPiketGuru);

  let created = 0;
  for (const data of JADWAL_PIKET_GURU) {
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

  console.log(`✔  Jadwal Piket → Guru created: ${created}`);
}
