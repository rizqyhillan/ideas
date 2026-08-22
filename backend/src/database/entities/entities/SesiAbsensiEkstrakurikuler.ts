import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbsensiEkstrakurikuler } from './AbsensiEkstrakurikuler';
import { JadwalEkstrakurikuler } from './JadwalEkstrakurikuler';
import { Pegawai } from './Pegawai';

@Index('sesi_absensi_ekstrakurikuler_pkey', ['id'], { unique: true })
@Index(
  'uq_sesi_absensi_ekskul_tanggal',
  ['jadwalEkstrakurikulerId', 'tanggal'],
  { unique: true },
)
@Index('idx_sesi_absensi_ekskul_tanggal', ['tanggal'], {})
@Entity('sesi_absensi_ekstrakurikuler', { schema: 'public' })
export class SesiAbsensiEkstrakurikuler {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'jadwal_ekstrakurikuler_id', unique: true })
  jadwalEkstrakurikulerId: number;

  @Column('date', { name: 'tanggal', unique: true })
  tanggal: string;

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

  @OneToMany(
    () => AbsensiEkstrakurikuler,
    (absensiEkstrakurikuler) =>
      absensiEkstrakurikuler.sesiAbsensiEkstrakurikuler,
  )
  absensiEkstrakurikulers: AbsensiEkstrakurikuler[];

  @ManyToOne(
    () => JadwalEkstrakurikuler,
    (jadwalEkstrakurikuler) =>
      jadwalEkstrakurikuler.sesiAbsensiEkstrakurikulers,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn([
    { name: 'jadwal_ekstrakurikuler_id', referencedColumnName: 'id' },
  ])
  jadwalEkstrakurikuler: JadwalEkstrakurikuler;

  @ManyToOne(() => Pegawai, (pegawai) => pegawai.sesiAbsensiEkstrakurikulers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'pembina_pegawai_id', referencedColumnName: 'id' }])
  pembinaPegawai: Pegawai;
}
