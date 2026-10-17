import { AppDataSource } from '../datasource';

import { adminSeeder } from './admin.seeder';

async function runSeed(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database Connected');

    // Data sekolah berasal dari database produksi. Hanya akun admin yang
    // dibuat oleh seeder; akun guru/siswa diprovision dari data master.
    console.log('\n── ADMIN ACCOUNT ──');
    await adminSeeder();
    console.log('\n✔ Seeder admin selesai dijalankan');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runSeed();
