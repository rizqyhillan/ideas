import { AppDataSource } from '../datasource';
import { CatatanKonseling } from '../entities/entities/CatatanKonseling';

/**
 * Seeder Catatan Konseling.
 * Tergantung: Siswa (siswa_id), Guru BK (guru_bk_id).
 * Data realistis topik konseling: teman, nilai, keadaan rumah, motivasi, dll.
 * Idempotent: cek dengan (siswaId, guruBkId, tanggal, topik).
 */
type KonselingData = {
  siswaId: number;
  guruBkId: number;
  tanggal: string; // 'YYYY-MM-DD' (dikonversi ke Date di save)
  topik: string;
  isi: string;
  tindakLanjut: string | null;
  visibilitas: 'rahasia' | 'internal_bk' | 'siswa';
};

const KONSELING: KonselingData[] = [
  { siswaId: 1,  guruBkId: 3, tanggal: '2025-02-10', topik: 'Menyesulkan hasil ulangan', isi: 'Siswa terlihat kurang fokus di pelajaran Matematika. Setelah diinterview, ternyata kurang tidur.', tindakLanjut: 'Follow-up minggu depan, koordinasi dengan wali kelas.', visibilitas: 'internal_bk' as const },
  { siswaId: 2,  guruBkId: 3, tanggal: '2025-02-12', topik: 'Ketertinggalan pelajaran', isi: 'Siswa kesulitan memahami pelajaran IPA. Dibahas cara belajar dan media belajar tambahan.', tindakLanjut: 'Bimbingan belajar tambahan 1x seminggu.', visibilitas: 'internal_bk' as const },
  { siswaId: 3,  guruBkId: 3, tanggal: '2025-02-14', topik: 'Konflik dengan teman', isi: 'Siswa dilaporkan sepinggan saat istirahat. Diberi sanksi sosial dan dibimbing perdamaian.', tindakLanjut: 'Observasi perkembangan hubungan sosial.', visibilitas: 'rahasia' as const },
  { siswaId: 5,  guruBkId: 3, tanggal: '2025-02-18', topik: 'Kondisi rumah tangga', isi: 'Siswa mengungkapkan orang tua bercerai. Diberi dukungan psikologis.', tindakLanjut: 'Koordinasi dengan pihak keluarga, monitoring rutin.', visibilitas: 'rahasia' as const },
  { siswaId: 7,  guruBkId: 3, tanggal: '2025-02-20', topik: 'Motivasi belajar', isi: 'Siswa kurang percaya diri. Dibimbing menyusun rencana belajar dan target.', tindakLanjut: 'Motivasi rutin setiap 2 minggu.', visibilitas: 'internal_bk' as const },
  { siswaId: 9,  guruBkId: 3, tanggal: '2025-02-25', topik: 'Kesehatan', isi: 'Siswa berminat konsultasi soal gangguan tidur. Direkomendasikan check-up.', tindakLanjut: 'Referensi ke tenaga kesehatan.', visibilitas: 'rahasia' as const },
  { siswaId: 11, guruBkId: 3, tanggal: '2025-03-01', topik: 'Peremajan dan hubungan sosial', isi: 'Siswa bertanya tentang cara menjaga jarak dalam pertemanan.', tindakLanjut: 'Bimbingan sosial.', visibilitas: 'siswa' as const },
];

export async function catatanKonselingSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(CatatanKonseling);

  let created = 0;
  for (const data of KONSELING) {
    const existing = await repo.findOne({
      where: {
        siswaId: data.siswaId,
        guruBkId: data.guruBkId,
        tanggal: new Date(data.tanggal),
        topik: data.topik,
      },
    });
    if (!existing) {
      await repo.save(
        repo.create({
          ...data,
          tanggal: new Date(data.tanggal),
        })
      );
      created++;
    }
  }

  console.log(`✔  Catatan Konseling created: ${created}`);
  console.log(`   (topik: belajar, hubungan, keluarga, kesehatan, motivasi)`);
}
