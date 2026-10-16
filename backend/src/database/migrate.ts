import 'dotenv/config';

import { runMigrations } from './migration-runner';

void runMigrations()
  .then((appliedMigrations) => {
    if (appliedMigrations.length > 0) {
      console.log(`Migrasi diterapkan: ${appliedMigrations.join(', ')}`);
    } else {
      console.log('Database sudah menggunakan migrasi terbaru.');
    }
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
