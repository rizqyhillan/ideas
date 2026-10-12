import { AppDataSource } from '../datasource';
import { MataPelajaran } from '../entities/entities/MataPelajaran';

/**
 * Data master Mata Pelajaran.
 * Kode & nama unik (uq_kelas_tahun_nama-like untuk mata_pelajaran via uq_kelas_tahun_nama?).
 * Cek existing dengan kode.
 */
const MATA_PELAJARAN = [
  { kode: 'PPPK', nama: 'Pendidikan Pancasila dan Kewarganegaraan', deskripsi: 'PPPK' },
  { kode: 'IPA', nama: 'Ilmu Pengetahuan Alam', deskripsi: 'IPA' },
  { kode: 'IPS', nama: 'Ilmu Pengetahuan Sosial', deskripsi: 'IPS' },
  { kode: 'Matematika', nama: 'Matematika', deskripsi: 'Matematika' },
  { kode: 'BahasaIndonesia', nama: 'Bahasa Indonesia', deskripsi: 'Bahasa Indonesia' },
  { kode: 'BahasaInggris', nama: 'Bahasa Inggris', deskripsi: 'Bahasa Inggris' },
  { kode: 'Sejarah', nama: 'Sejarah', deskripsi: 'Sejarah' },
  { kode: 'Geografi', nama: 'Geografi', deskripsi: 'Geografi' },
  { kode: 'SeniBudaya', nama: 'Seni dan Budaya', deskripsi: 'Seni Budaya' },
  { kode: 'PTKI', nama: 'Pendidikan Agama Kristen', deskripsi: 'Pendidikan Agama Kristen' },
  { kode: 'PJOK', nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', deskripsi: 'PJOK' },
  { kode: 'BimbinganKonseling', nama: 'Bimbingan Konseling', deskripsi: 'BK' },
];

export async function mataPelajaranSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(MataPelajaran);

  let created = 0;
  for (const data of MATA_PELAJARAN) {
    const existing = await repo.findOne({
      where: { kode: data.kode },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Mata Pelajaran created: ${created}`);
  console.log(`   (daftar: PPPK, PPKn, IPA, IPS, Matematika, Bahasa Indonesia, Bahasa Inggris, Sejarah, Geografi, SeniBudaya, PKN, PTKI, PJOK, SMP, BK)`);
}
