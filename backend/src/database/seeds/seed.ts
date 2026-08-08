import { AppDataSource } from '../datasource';

import { adminSeeder } from './admin.seeder';

async function runSeed() {
  try {
    await AppDataSource.initialize();

    console.log('Database Connected');

    await adminSeeder();

    console.log('Seeder selesai');

    await AppDataSource.destroy();

    process.exit(0);
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

runSeed();