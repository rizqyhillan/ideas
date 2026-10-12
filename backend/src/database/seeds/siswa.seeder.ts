import { AppDataSource } from '../datasource';
import { Siswa } from '../entities/entities/Siswa';

/**
 * Seeder Siswa.
 * Data realistis & variatif (~30 siswa) dari daerah Magetan/Plaosan.
 * Tergantung: users? Tidak wajib (userId nullable), tapi kita referensi User jika ada.
 * Idempotent: cek dengan nisn.
 */

type SiswaData = {
  nisn: string;
  nis: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  namaWali: string;
  noTeleponWali: string;
  statusAktif: boolean;
};

const SISWA: SiswaData[] = [
  { nisn: '0135344834', nis: '13681', namaLengkap: 'Adji Shobri Wa Shola', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2013-04-02', alamat: 'Lingk. Sale RT 33 RW 6, Kel Plaosan, Plaosan, Magetan', namaWali: 'Budi Santoso', noTeleponWali: '081234567890', statusAktif: true },
  { nisn: '3121808342', nis: '13682', namaLengkap: 'Afang Fertindo Junianta', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-06-21', alamat: 'Bogosari RT 3 Rw 1 Ds Bogoarum, Plaosan, Magetan', namaWali: 'Rahmawati', noTeleponWali: '082345678901', statusAktif: true },
  { nisn: '3128594676', nis: '13683', namaLengkap: 'Afifa Pradila Maharani', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-10-19', alamat: 'Gupakan RT 15 RW 8 Ds. Dadi - Kec. Plaosan - Kab. Magetan', namaWali: 'Asep Prasetyo', noTeleponWali: '085345678901', statusAktif: true },
  { nisn: '3128661873', nis: '13684', namaLengkap: 'Alif Riansi Saputra', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-12-30', alamat: 'RT 003 RW 001, Sarangan, Plaosan, Magetan', namaWali: 'Rina Suwarno', noTeleponWali: '081234567098', statusAktif: true },
  { nisn: '0129477955', nis: '13685', namaLengkap: 'Aprilya Maharani', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-04-12', alamat: 'Dele RT 3 RW 1 Ds. Buluharjo - Kec. Plaosan - Kab. Magetan', namaWali: 'M. Yusuf', noTeleponWali: '082234567890', statusAktif: true },
  { nisn: '3147461482', nis: '13686', namaLengkap: 'Aqilah Salsabila', jenisKelamin: 'P', tempatLahir: 'Semarang', tanggalLahir: '2014-01-06', alamat: 'Gunakan RT 019 RW 010, Ds. Dadi, - Kec. Plaosan - Kab. Magetan', namaWali: 'Cahyadi', noTeleponWali: '081345678901', statusAktif: true },
  { nisn: '3129334094', nis: '13687', namaLengkap: 'Arya Shuta Kalindra', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-09-10', alamat: 'RT.022 RW.003 Ds. Pacalan - Kec. Plaosan - Kab. Magetan', namaWali: 'Lestari', noTeleponWali: '082345678902', statusAktif: true },
  { nisn: '0126348852', nis: '13688', namaLengkap: 'Asifa Yessa Bella', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-11-01', alamat: 'RT 17 RW 4 Ds. Puntukdoro - Kec. Plaosan - Kab. Magetan', namaWali: 'Dwi Koro', noTeleponWali: '085345678903', statusAktif: true },
  { nisn: '0126576251', nis: '13689', namaLengkap: 'Brian Prabaswara Budianto', jenisKelamin: 'L', tempatLahir: 'Purworejo', tanggalLahir: '2012-09-19', alamat: 'JLN KALIURANG, CONDONGCATUR-DEPOK', namaWali: 'Sugiharto', noTeleponWali: '081234567809', statusAktif: true },
  { nisn: '0136715473', nis: '13690', namaLengkap: 'Caroline Syabila Alvaro Janitra', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2013-01-24', alamat: 'Klaten RT 22 RW 5 Ds. Puntukdoro - Kec. Plaosan - Kab. Magetan', namaWali: 'Benyamin', noTeleponWali: '082234567891', statusAktif: true },
  { nisn: '3124563994', nis: '13713', namaLengkap: 'Afika Ardina Maharani', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-08-05', alamat: 'Gulun, RT 003 RW 004, Kel Plaosan - Kec. Plaosan, Magetan', namaWali: 'Hariyadi', noTeleponWali: '085345678904', statusAktif: true },
  { nisn: '0122169515', nis: '13714', namaLengkap: 'Afnan Junio Alfiansah', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-06-18', alamat: 'Compok RT 2 RW 1, Dadi - Kec. Plaosan, Magetan', namaWali: 'Hani', noTeleponWali: '081345678905', statusAktif: true },
  { nisn: '0128693037', nis: '13715', namaLengkap: 'Afriska Mega Tania', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-08-08', alamat: 'Gulun, RT 29 RW 5, Kel Plaosan - Kec. Plaosan, Magetan', namaWali: 'Andi Prasetyo', noTeleponWali: '082234567892', statusAktif: true },
  { nisn: '3121181459', nis: '13716', namaLengkap: 'Alim Fahrudin Naafi', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-06-20', alamat: 'RT 28 RW 14 Ds Dadi, - Kec. Plaosan, Magetan', namaWali: 'Maya', noTeleponWali: '085345678906', statusAktif: true },
  { nisn: '3123768290', nis: '13717', namaLengkap: 'Ardita Putri Natasyila', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-05-14', alamat: 'Rt 13 Rw 07 Dsn Ngerong, Dadi - Kec. Plaosan, Magetan', namaWali: 'Suharno', noTeleponWali: '081234567810', statusAktif: true },
  { nisn: '0135206837', nis: '13718', namaLengkap: 'Arga Setyo Pambudi', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2013-05-19', alamat: 'Kauman RT 29 RW 5, Plaosan - Kec. Plaosan, Magetan', namaWali: 'Lina', noTeleponWali: '082345678907', statusAktif: true },
  { nisn: '3136408972', nis: '13719', namaLengkap: 'Arsyafin Nuril Wafi Razaki', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2013-01-06', alamat: 'Karanglo RT 6 RW 2, Bogoarum - Kec. Plaosan, Magetan', namaWali: 'Rohman', noTeleponWali: '085345678908', statusAktif: true },
  { nisn: '3129013066', nis: '13720', namaLengkap: 'Azwar Maulana', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-12-20', alamat: 'Sarangan RT 2 RW 1, Sarangan - Kec. Plaosan, Magetan', namaWali: 'Siti', noTeleponWali: '081345678909', statusAktif: true },
  { nisn: '3120995590', nis: '13721', namaLengkap: 'Cherizca Karunia Ragil Widhuri', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-02-01', alamat: 'Dsn Tawang RT 006 RW 001, Bulugunung - Kec. Plaosan, Magetan', namaWali: 'Agus', noTeleponWali: '082234567811', statusAktif: true },
  { nisn: '3128308461', nis: '13722', namaLengkap: 'Damar Pambudi', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-10-23', alamat: 'RT 23 RW 12 Ds Dadi - Kec. Plaosan, Magetan', namaWali: 'Dewi', noTeleponWali: '085345678910', statusAktif: true },
  { nisn: '0115237829', nis: '13402', namaLengkap: 'Adelia Qhalitza Ramadhani', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2011-08-28', alamat: 'Compok RT 2 RW 1 Ds Dadi - Kec. Plaosan - Kab. Magetan', namaWali: 'Bambang', noTeleponWali: '081345678911', statusAktif: true },
  { nisn: '0116134287', nis: '13403', namaLengkap: 'Aditya Rifki Fauzi', jenisKelamin: 'L', tempatLahir: 'Kota Bekasi', tanggalLahir: '2011-03-21', alamat: 'Dele RT 2 RW 1 Ds Buluharjo - Kec. Plaosan - Kab. Magetan', namaWali: 'Sulistyo', noTeleponWali: '082234567812', statusAktif: true },
  { nisn: '0111700226', nis: '13404', namaLengkap: 'Aisyah Siti Nuraini', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2011-07-26', alamat: 'Klaten RT 25 RW 5 Ds Puntukdoro - Kec. Plaosan - Kab. Magetan', namaWali: 'Tono', noTeleponWali: '085345678912', statusAktif: true },
  { nisn: '0116053970', nis: '13405', namaLengkap: 'Aldina Yasmin Naya Azzahra', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2011-09-24', alamat: 'Singolangu RT 14 RW 3 Kel. Sarungan - Kec. Plaosan - Kab. Magetan', namaWali: 'Untung', noTeleponWali: '081234567813', statusAktif: true },
  { nisn: '0112552708', nis: '13406', namaLengkap: 'Aleesya Zahraa Anggraeni', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2011-10-25', alamat: 'RT 17 RW 3 Ds. Plumpung - Kec. Plaosan - Kab. Magetan', namaWali: 'Indra', noTeleponWali: '082345678913', statusAktif: true },
  { nisn: '0122197554', nis: '13407', namaLengkap: 'Alvian Khafkha Pratama', jenisKelamin: 'L', tempatLahir: 'Magetan', tanggalLahir: '2012-03-14', alamat: 'Ds. Plaosan, RT. 16/ 02, Kec. Plaosan, Kab. Magetan', namaWali: 'Sri Rahayu', noTeleponWali: '085345678914', statusAktif: true },
  { nisn: '0113751614', nis: '13408', namaLengkap: 'Anis Nova Ariyanti', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2011-11-13', alamat: 'Link Plaosan RT 4 RW 2 Kel Plaosan - Kec. Plaosan - Kab. Magetan', namaWali: 'Widi', noTeleponWali: '081345678915', statusAktif: true },
  { nisn: '0121222473', nis: '13409', namaLengkap: 'Avika Azalia Surya Putri', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2012-05-06', alamat: 'Buket RT 1 RW 1 Ds Bulugunung - Kec. Plaosan - Kab. Magetan', namaWali: 'Kusumo', noTeleponWali: '082234567816', statusAktif: true },
  { nisn: '0117423123', nis: '13410', namaLengkap: 'Azzahra Roudhotul Jannah', jenisKelamin: 'P', tempatLahir: 'Magetan', tanggalLahir: '2011-09-06', alamat: 'Klaten RT 25 RW 5 Ds. Puntukdoro - Kec. Plaosan - Kab. Magetan', namaWali: 'Dinarto', noTeleponWali: '085345678917', statusAktif: true },
];

export async function siswaSeeder(): Promise<void> {
  const repo = AppDataSource.getRepository(Siswa);

  let created = 0;
  for (const data of SISWA) {
    const existing = await repo.findOne({
      where: { nisn: data.nisn },
    });
    if (!existing) {
      await repo.save(repo.create(data));
      created++;
    }
  }

  console.log(`✔  Siswa created: ${created}`);
  console.log(`   (total ${SISWA.length} data, duplikat di-skip)`);
}
