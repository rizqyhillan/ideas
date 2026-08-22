import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbsensiEkstrakurikuler } from './AbsensiEkstrakurikuler';
import { AbsensiGuru } from './AbsensiGuru';
import { AbsensiSiswa } from './AbsensiSiswa';
import { AnggotaEkstrakurikuler } from './AnggotaEkstrakurikuler';
import { AuditLog } from './AuditLog';
import { Buku } from './Buku';
import { CatatanKonseling } from './CatatanKonseling';
import { Ekstrakurikuler } from './Ekstrakurikuler';
import { InventarisBuku } from './InventarisBuku';
import { JadwalEkstrakurikuler } from './JadwalEkstrakurikuler';
import { JadwalPelajaran } from './JadwalPelajaran';
import { JadwalPiket } from './JadwalPiket';
import { JadwalPiketGuru } from './JadwalPiketGuru';
import { Kelas } from './Kelas';
import { Pegawai } from './Pegawai';
import { PembinaEkstrakurikuler } from './PembinaEkstrakurikuler';
import { PermintaanPerubahanEkstrakurikuler } from './PermintaanPerubahanEkstrakurikuler';
import { Siswa } from './Siswa';
import { SiswaKelas } from './SiswaKelas';
import { UserPermissions } from './UserPermissions';
import { UserRoles } from './UserRoles';

@Index('users_pkey', ['id'], { unique: true })
@Index('idx_users_status', ['status'], {})
@Entity('users', { schema: 'public' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'username', length: 100 })
  username: string;

  @Column('character varying', { name: 'email', nullable: true, length: 255 })
  email: string | null;

  @Column('character varying', { name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column('enum', {
    name: 'status',
    enum: ['aktif', 'nonaktif', 'ditangguhkan'],
    default: () => "'aktif'",
  })
  status: 'aktif' | 'nonaktif' | 'ditangguhkan';

  @Column('timestamp with time zone', { name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'password_changed_at',
    nullable: true,
  })
  passwordChangedAt: Date | null;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(
    () => AbsensiEkstrakurikuler,
    (absensiEkstrakurikuler) => absensiEkstrakurikuler.dicatatOleh,
  )
  absensiEkstrakurikulers: AbsensiEkstrakurikuler[];

  @OneToMany(() => AbsensiGuru, (absensiGuru) => absensiGuru.diverifikasiOleh)
  absensiGurus: AbsensiGuru[];

  @OneToMany(() => AbsensiSiswa, (absensiSiswa) => absensiSiswa.dicatatOleh)
  absensiSiswas: AbsensiSiswa[];

  @OneToMany(
    () => AnggotaEkstrakurikuler,
    (anggotaEkstrakurikuler) => anggotaEkstrakurikuler.createdBy,
  )
  anggotaEkstrakurikulers: AnggotaEkstrakurikuler[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @OneToMany(() => Buku, (buku) => buku.createdBy)
  bukus: Buku[];

  @OneToMany(() => Buku, (buku) => buku.updatedBy)
  bukus2: Buku[];

  @OneToMany(
    () => CatatanKonseling,
    (catatanKonseling) => catatanKonseling.createdBy,
  )
  catatanKonselings: CatatanKonseling[];

  @OneToMany(
    () => CatatanKonseling,
    (catatanKonseling) => catatanKonseling.updatedBy,
  )
  catatanKonselings2: CatatanKonseling[];

  @OneToMany(
    () => Ekstrakurikuler,
    (ekstrakurikuler) => ekstrakurikuler.createdBy,
  )
  ekstrakurikulers: Ekstrakurikuler[];

  @OneToMany(
    () => Ekstrakurikuler,
    (ekstrakurikuler) => ekstrakurikuler.updatedBy,
  )
  ekstrakurikulers2: Ekstrakurikuler[];

  @OneToMany(() => InventarisBuku, (inventarisBuku) => inventarisBuku.createdBy)
  inventarisBukus: InventarisBuku[];

  @OneToMany(() => InventarisBuku, (inventarisBuku) => inventarisBuku.updatedBy)
  inventarisBukus2: InventarisBuku[];

  @OneToMany(
    () => JadwalEkstrakurikuler,
    (jadwalEkstrakurikuler) => jadwalEkstrakurikuler.createdBy,
  )
  jadwalEkstrakurikulers: JadwalEkstrakurikuler[];

  @OneToMany(
    () => JadwalPelajaran,
    (jadwalPelajaran) => jadwalPelajaran.createdBy,
  )
  jadwalPelajarans: JadwalPelajaran[];

  @OneToMany(
    () => JadwalPelajaran,
    (jadwalPelajaran) => jadwalPelajaran.updatedBy,
  )
  jadwalPelajarans2: JadwalPelajaran[];

  @OneToMany(() => JadwalPiket, (jadwalPiket) => jadwalPiket.createdBy)
  jadwalPikets: JadwalPiket[];

  @OneToMany(
    () => JadwalPiketGuru,
    (jadwalPiketGuru) => jadwalPiketGuru.assignedBy,
  )
  jadwalPiketGurus: JadwalPiketGuru[];

  @OneToMany(() => Kelas, (kelas) => kelas.createdBy)
  kelas: Kelas[];

  @OneToMany(() => Kelas, (kelas) => kelas.updatedBy)
  kelas2: Kelas[];

  @OneToOne(() => Pegawai, (pegawai) => pegawai.user)
  pegawai: Pegawai;

  @OneToMany(
    () => PembinaEkstrakurikuler,
    (pembinaEkstrakurikuler) => pembinaEkstrakurikuler.assignedBy,
  )
  pembinaEkstrakurikulers: PembinaEkstrakurikuler[];

  @OneToMany(
    () => PermintaanPerubahanEkstrakurikuler,
    (permintaanPerubahanEkstrakurikuler) =>
      permintaanPerubahanEkstrakurikuler.diajukanOleh2,
  )
  permintaanPerubahanEkstrakurikulers: PermintaanPerubahanEkstrakurikuler[];

  @OneToMany(
    () => PermintaanPerubahanEkstrakurikuler,
    (permintaanPerubahanEkstrakurikuler) =>
      permintaanPerubahanEkstrakurikuler.diperiksaOleh,
  )
  permintaanPerubahanEkstrakurikulers2: PermintaanPerubahanEkstrakurikuler[];

  @OneToOne(() => Siswa, (siswa) => siswa.user)
  siswa: Siswa;

  @OneToMany(() => SiswaKelas, (siswaKelas) => siswaKelas.createdBy)
  siswaKelas: SiswaKelas[];

  @OneToMany(
    () => UserPermissions,
    (userPermissions) => userPermissions.assignedBy,
  )
  userPermissions: UserPermissions[];

  @OneToMany(() => UserPermissions, (userPermissions) => userPermissions.user)
  userPermissions2: UserPermissions[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.assignedBy)
  userRoles: UserRoles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles2: UserRoles[];
}
