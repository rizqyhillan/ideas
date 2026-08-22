import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';
import { SesiAbsensiEkstrakurikuler } from './SesiAbsensiEkstrakurikuler';
import { Siswa } from './Siswa';

@Index('absensi_ekstrakurikuler_pkey', ['id'], { unique: true })
@Index(
  'uq_absensi_ekskul_siswa_sesi',
  ['sesiAbsensiEkstrakurikulerId', 'siswaId'],
  { unique: true },
)
@Index('idx_absensi_ekskul_siswa', ['siswaId'], {})
@Index('idx_absensi_ekskul_status', ['status'], {})
@Entity('absensi_ekstrakurikuler', { schema: 'public' })
export class AbsensiEkstrakurikuler {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'sesi_absensi_ekstrakurikuler_id', unique: true })
  sesiAbsensiEkstrakurikulerId: number;

  @Column('integer', { name: 'siswa_id', unique: true })
  siswaId: number;

  @Column('enum', { name: 'status', enum: ['hadir', 'sakit', 'izin', 'alpa'] })
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';

  @Column('text', { name: 'keterangan', nullable: true })
  keterangan: string | null;

  @Column('timestamp with time zone', {
    name: 'dicatat_pada',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dicatatPada: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.absensiEkstrakurikulers, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'dicatat_oleh', referencedColumnName: 'id' }])
  dicatatOleh: Users;

  @ManyToOne(
    () => SesiAbsensiEkstrakurikuler,
    (sesiAbsensiEkstrakurikuler) =>
      sesiAbsensiEkstrakurikuler.absensiEkstrakurikulers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn([
    { name: 'sesi_absensi_ekstrakurikuler_id', referencedColumnName: 'id' },
  ])
  sesiAbsensiEkstrakurikuler: SesiAbsensiEkstrakurikuler;

  @ManyToOne(() => Siswa, (siswa) => siswa.absensiEkstrakurikulers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'siswa_id', referencedColumnName: 'id' }])
  siswa: Siswa;
}
