const { Pool } = require('/home/aan/ideas/backend/node_modules/pg');
const pool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'ideas' });

const steps = [
  // 1. Create absensi_sesi
  `CREATE TABLE IF NOT EXISTS absensi_sesi (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kelas_id INTEGER NOT NULL,
    guru_id INTEGER,
    tanggal DATE NOT NULL,
    jam_ke TEXT,
    mata_pelajaran TEXT,
    catatan TEXT,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_absensi_sesi_tanggal_kelas UNIQUE (tanggal, kelas_id)
  );`,

  `CREATE INDEX IF NOT EXISTS idx_absensi_sesi_kelas_id ON absensi_sesi (kelas_id);`,

  // 2. Create absensi_sesi_item
  `CREATE TABLE IF NOT EXISTS absensi_sesi_item (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    absensi_sesi_id INTEGER NOT NULL,
    siswa_id INTEGER NOT NULL,
    status status_absensi NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_absensi_sesi_item_siswa UNIQUE (absensi_sesi_id, siswa_id)
  );`,

  `CREATE INDEX IF NOT EXISTS idx_absensi_sesi_item_absensi_sesi_id ON absensi_sesi_item (absensi_sesi_id);`,

  // 3. Add FK constraints (after both tables exist)
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_absensi_sesi_item_sesi') THEN ALTER TABLE absensi_sesi_item ADD CONSTRAINT fk_absensi_sesi_item_sesi FOREIGN KEY (absensi_sesi_id) REFERENCES absensi_sesi(id) ON DELETE CASCADE; END IF; END $$;`,

  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_absensi_sesi_item_siswa') THEN ALTER TABLE absensi_sesi_item ADD CONSTRAINT fk_absensi_sesi_item_siswa FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE RESTRICT; END IF; END $$;`,

  // 4. Ensure created_at/updated_at columns exist (backward compat)
  `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absensi_sesi' AND column_name = 'created_at') THEN
    ALTER TABLE absensi_sesi ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absensi_sesi' AND column_name = 'updated_at') THEN
    ALTER TABLE absensi_sesi ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END$$;`,

  `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absensi_sesi_item' AND column_name = 'created_at') THEN
    ALTER TABLE absensi_sesi_item ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'absensi_sesi_item' AND column_name = 'updated_at') THEN
    ALTER TABLE absensi_sesi_item ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END$$;`
];

let i = 0;
const run = () => {
  if (i >= steps.length) return;
  const step = steps[i];
  pool.query(step)
    .then(() => {
      console.log('OK  [' + i + '] ' + step.substring(0, 70).replace(/\n/g, ' '));
      i++;
      run();
    })
    .catch(e => {
      if (e.code === '42P01') {
        console.log('SKIP [' + i + '] (table missing, expected): ' + step.substring(0, 70).replace(/\n/g, ' '));
        i++;
        run();
      } else {
        console.log('ERROR [' + i + ']:', e.message);
        process.exit(1);
      }
    });
};
run();
