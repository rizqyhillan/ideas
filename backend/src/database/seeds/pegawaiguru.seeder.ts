import { AppDataSource } from '../datasource';
import { Pegawai } from '../entities/entities/Pegawai';
import { Guru } from '../entities/entities/Guru';
import { Users } from '../entities/entities/Users';

export async function guruPegawaiSeeder() {
  const pegawaiRepository = AppDataSource.getRepository(Pegawai);
  const guruRepository = AppDataSource.getRepository(Guru);
  const userRepository = AppDataSource.getRepository(Users);

  // Sampel Data Pegawai & Guru (Ganti / Tambahkan sesuai data sekolah)
  const dataGuruPegawai = [
    {
      namaLengkap: 'Budi Santoso, S.Pd.',
      nip: '198501152010011001',
      nuptk: '1234567890123456',
      jenisKelamin: 'L' as const,
      tempatLahir: 'Magetan',
      tanggalLahir: '1985-01-15',
      email: 'guruutama@sekolah.sch.id',
      noTelepon: '081234567890',
      alamat: 'Jl. Raya Plaosan No. 12, Magetan',
      jabatan: 'Guru Mata Pelajaran',
      statusAktif: true,
      kodeGuru: 'GR002',
    },
    {
      namaLengkap: 'Siti Rahmawati, S.Si.',
      nip: '199003202015022002',
      nuptk: '2345678901234567',
      jenisKelamin: 'P' as const,
      tempatLahir: 'Madiun',
      tanggalLahir: '1990-03-20',
      email: 'siti.rahmawati@sekolah.sch.id',
      noTelepon: '082345678901',
      alamat: 'Kel. Sarangan, Plaosan, Magetan',
      jabatan: 'Guru Mata Pelajaran / Wali Kelas',
      statusAktif: true,
      kodeGuru: 'GRR003',
    },
    {
      namaLengkap: 'Ahmad Fauzi, M.Pd.',
      nip: '198208102008011003',
      nuptk: '3456789012345678',
      jenisKelamin: 'L' as const,
      tempatLahir: 'Surakarta',
      tanggalLahir: '1982-08-10',
      email: 'gurubk@sekolah.sch.id',
      noTelepon: '083456789012',
      alamat: 'Dsn. Bogoarum, Plaosan, Magetan',
      jabatan: 'Guru Bimbingan Konseling (BK)',
      statusAktif: true,
      kodeGuru: 'GRR004',
    },
  ];

  let totalPegawaiDibuat = 0;
  let totalGuruDibuat = 0;

  for (const item of dataGuruPegawai) {
    const { kodeGuru, ...pegawaiData } = item;

    // 1. Cek apakah Pegawai sudah ada (Berdasarkan NIP atau Nama)
    let pegawai = await pegawaiRepository.findOne({
      where: pegawaiData.nip
        ? { nip: pegawaiData.nip }
        : { namaLengkap: pegawaiData.namaLengkap },
    });

    // Jika pegawai belum ada, buat baru
    if (!pegawai) {
      pegawai = pegawaiRepository.create(pegawaiData);
      pegawai = await pegawaiRepository.save(pegawai);
      totalPegawaiDibuat++;
    }

    // 2. Cek apakah record Guru untuk Pegawai ini sudah ada
    const existingGuru = await guruRepository.findOne({
      where: { pegawaiId: pegawai.id },
    });

    // Jika record Guru belum ada, buat record Guru yang mengacu ke pegawaiId
    if (!existingGuru) {
      const guru = guruRepository.create({
        pegawaiId: pegawai.id,
        kodeGuru: kodeGuru,
      });
      await guruRepository.save(guru);
      totalGuruDibuat++;
    }

    // Kaitkan pegawai dengan akun login berdasarkan email canonical.
    // Ini penting karena pembatasan data guru memakai pegawai.userId.
    const user = await userRepository.findOne({ where: { email: item.email } });
    if (user && pegawai.userId !== user.id) {
      const linkedPegawai = await pegawaiRepository.findOne({ where: { userId: user.id } });
      if (!linkedPegawai || linkedPegawai.id === pegawai.id) {
        pegawai.userId = user.id;
        await pegawaiRepository.save(pegawai);
      }
    }
  }

  console.log('======================================');
  console.log('✔ Seeder Pegawai & Guru selesai dijalankan');
  console.log(`Total Pegawai Baru : ${totalPegawaiDibuat}`);
  console.log(`Total Guru Baru    : ${totalGuruDibuat}`);
  console.log('======================================');
}
