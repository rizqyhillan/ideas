import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbsensiSiswa } from './AbsensiSiswa';
import { Guru } from './Guru';
import { JadwalPelajaran } from './JadwalPelajaran';

@Index('idx_sesi_absensi_guru', ['dibukaOlehGuruId'], {})
@Index('sesi_absensi_siswa_pkey', ['id'], { unique: true })
@Index('uq_sesi_absensi_jadwal_tanggal', ['jadwalPelajaranId', 'tanggal'], {
  unique: true,
})
@Index('idx_sesi_absensi_tanggal', ['tanggal'], {})
@Entity('sesi_absensi_siswa', { schema: 'public' })
export class SesiAbsensiSiswa {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'jadwal_pelajaran_id', unique: true })
  jadwalPelajaranId: number;

  @Column('date', { name: 'tanggal', unique: true })
  tanggal: string;

  @Column('integer', { name: 'dibuka_oleh_guru_id' })
  dibukaOlehGuruId: number;

  @Column('timestamp with time zone', {
    name: 'dibuka_pada',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dibukaPada: Date;

  @Column('timestamp with time zone', { name: 'ditutup_pada', nullable: true })
  ditutupPada: Date | null;

  @Column('text', { name: 'catatan', nullable: true })
  catatan: string | null;

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

  @OneToMany(() => AbsensiSiswa, (absensiSiswa) => absensiSiswa.sesiAbsensi)
  absensiSiswas: AbsensiSiswa[];

  @ManyToOne(() => Guru, (guru) => guru.sesiAbsensiSiswas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'dibuka_oleh_guru_id', referencedColumnName: 'id' }])
  dibukaOlehGuru: Guru;

  @ManyToOne(
    () => JadwalPelajaran,
    (jadwalPelajaran) => jadwalPelajaran.sesiAbsensiSiswas,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'jadwal_pelajaran_id', referencedColumnName: 'id' }])
  jadwalPelajaran: JadwalPelajaran;
}
