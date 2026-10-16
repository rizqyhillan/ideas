import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

export function getMigrationNames(files: string[]): string[] {
  return files.filter((file) => file.endsWith('.sql')).sort();
}

function createMigrationDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'ideas',
  });
}

export async function runMigrations(): Promise<string[]> {
  const dataSource = createMigrationDataSource();
  const migrationDirectory = join(__dirname, 'migrations');

  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name varchar(255) PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationFiles = getMigrationNames(await readdir(migrationDirectory));
    const appliedRows: Array<{ name: string }> = await queryRunner.query(
      'SELECT name FROM schema_migrations',
    );
    const appliedNames = new Set(appliedRows.map((row) => row.name));
    const appliedNow: string[] = [];

    for (const migrationName of migrationFiles) {
      if (appliedNames.has(migrationName)) continue;

      const sql = await readFile(join(migrationDirectory, migrationName), 'utf8');
      await queryRunner.startTransaction();
      try {
        await queryRunner.query(sql);
        await queryRunner.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [migrationName],
        );
        await queryRunner.commitTransaction();
        appliedNow.push(migrationName);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new Error(`Migrasi ${migrationName} gagal diterapkan.`, {
          cause: error,
        });
      }
    }

    return appliedNow;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}
