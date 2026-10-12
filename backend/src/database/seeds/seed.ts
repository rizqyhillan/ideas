import { AppDataSource } from '../datasource';

import {
  adminSeeder,
  // ── Step 1: Master Data ──
  rolesSeeder,
  permissionsSeeder,
  rolePermissionsSeeder,
  tahunAjaranSeeder,
  semesterSeeder,
  mataPelajaranSeeder,
  // ── Step 2: Users & Auth ──
  usersSeeder,
  // ── Step 3: Objects (Pegawai & Guru) ──
  guruPegawaiSeeder,
  // ── Step 4: Academic Classes ──
  kelasSeeder,
  // ── Step 5: Students & Class Assignments ──
  siswaSeeder,
  siswaKelasSeeder,
  // ── Step 6: Timetables ──
  jadwalPelajaranSeeder,
  jadwalPiketSeeder,
  jadwalPiketGuruSeeder,
  // ── Step 7: Attendance ──
  absensiSiswaSeeder,
  absensiGuruPiketSeeder,
  // ── Step 8: Other ──
  catatanKonselingSeeder,
} from './index';

async function runSeed(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Database Connected');

    console.log('\n── STEP 1: Master Data ──');
    await rolesSeeder();
    await permissionsSeeder();
    await rolePermissionsSeeder();
    await tahunAjaranSeeder();
    await semesterSeeder();
    await mataPelajaranSeeder();

    console.log('\n── STEP 2: Users & Auth ──');
    await usersSeeder();

    console.log('\n── STEP 3: Objects (Pegawai & Guru) ──');
    await guruPegawaiSeeder();

    console.log('\n── STEP 4: Academic Classes ──');
    await kelasSeeder();

    console.log('\n── STEP 5: Students & Class Assignments ──');
    await siswaSeeder();
    await siswaKelasSeeder();

    console.log('\n── STEP 6: Timetables ──');
    await jadwalPelajaranSeeder();
    await jadwalPiketSeeder();
    await jadwalPiketGuruSeeder();

    console.log('\n── STEP 7: Attendance ──');
    await absensiSiswaSeeder();
    await absensiGuruPiketSeeder();

    console.log('\n── STEP 8: Other ──');
    await catatanKonselingSeeder();

    console.log('\n========================================');
    console.log('✔  Semua seeder selesai dijalankan');
    console.log('========================================');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runSeed();
