import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbsensiEkstrakurikuler } from './AbsensiEkstrakurikuler';
import { AbsensiSiswa } from './AbsensiSiswa';
import { AnggotaEkstrakurikuler } from './AnggotaEkstrakurikuler';
import { CatatanKonseling } from './CatatanKonseling';
import { Users } from './Users';
import { SiswaKelas } from './SiswaKelas';

@Index('siswa_pkey', ['id'], { unique: true })
@Index('idx_siswa_nama', ['namaLengkap'], {})
@Index('uq_siswa_nis', ['nis'], { unique: true })
@Index('uq_siswa_nisn', ['nisn'], { unique: true })
@Index('idx_siswa_status_aktif', ['statusAktif'], {})
@Index('siswa_user_id_key', ['userId'], { unique: true })
@Entity('siswa', { schema: 'public' })
export class Siswa {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'user_id', nullable: true, unique: true })
  userId: number | null;

  @Column('character varying', { name: 'nisn', length: 20 })
  nisn: string;

  @Column('character varying', { name: 'nis', nullable: true, length: 30 })
  nis: string | null;

  @Column('character varying', { name: 'nama_lengkap', length: 255 })
  namaLengkap: string;

  @Column('enum', { name: 'jenis_kelamin', enum: ['L', 'P'] })
  jenisKelamin: 'L' | 'P';

  @Column('character varying', {
    name: 'tempat_lahir',
    nullable: true,
    length: 100,
  })
  tempatLahir: string | null;

  @Column('date', { name: 'tanggal_lahir', nullable: true })
  tanggalLahir: string | null;

  @Column('character varying', { name: 'email', nullable: true, length: 255 })
  email: string | null;

  @Column('character varying', {
    name: 'no_telepon',
    nullable: true,
    length: 30,
  })
  noTelepon: string | null;

  @Column('text', { name: 'alamat', nullable: true })
  alamat: string | null;

  @Column('character varying', {
    name: 'nama_wali',
    nullable: true,
    length: 255,
  })
  namaWali: string | null;

  @Column('character varying', {
    name: 'no_telepon_wali',
    nullable: true,
    length: 30,
  })
  noTeleponWali: string | null;

  @Column('boolean', { name: 'status_aktif', default: () => 'true' })
  statusAktif: boolean;

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
    (absensiEkstrakurikuler) => absensiEkstrakurikuler.siswa,
  )
  absensiEkstrakurikulers: AbsensiEkstrakurikuler[];

  @OneToMany(() => AbsensiSiswa, (absensiSiswa) => absensiSiswa.siswa)
  absensiSiswas: AbsensiSiswa[];

  @OneToMany(
    () => AnggotaEkstrakurikuler,
    (anggotaEkstrakurikuler) => anggotaEkstrakurikuler.siswa,
  )
  anggotaEkstrakurikulers: AnggotaEkstrakurikuler[];

  @OneToMany(
    () => CatatanKonseling,
    (catatanKonseling) => catatanKonseling.siswa,
  )
  catatanKonselings: CatatanKonseling[];

  @OneToOne(() => Users, (users) => users.siswa, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;

  @OneToOne(() => SiswaKelas, (siswaKelas) => siswaKelas.siswa)
  siswaKelas: SiswaKelas;
}
