import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';
import { Ekstrakurikuler } from './Ekstrakurikuler';
import { Semester } from './Semester';
import { SesiAbsensiEkstrakurikuler } from './SesiAbsensiEkstrakurikuler';

@Index(
  'uq_jadwal_ekskul_start',
  ['ekstrakurikulerId', 'hari', 'jamMulai', 'semesterId'],
  { unique: true },
)
@Index('jadwal_ekstrakurikuler_pkey', ['id'], { unique: true })
@Index('idx_jadwal_ekskul_semester', ['semesterId'], {})
@Entity('jadwal_ekstrakurikuler', { schema: 'public' })
export class JadwalEkstrakurikuler {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'ekstrakurikuler_id' })
  ekstrakurikulerId: number;

  @Column('smallint', { name: 'semester_id' })
  semesterId: number;

  @Column('enum', {
    name: 'hari',
    enum: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'],
  })
  hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu';

  @Column('time without time zone', { name: 'jam_mulai' })
  jamMulai: string;

  @Column('time without time zone', { name: 'jam_selesai' })
  jamSelesai: string;

  @Column('character varying', { name: 'lokasi', nullable: true, length: 150 })
  lokasi: string | null;

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

  @ManyToOne(() => Users, (users) => users.jadwalEkstrakurikulers, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  createdBy: Users;

  @ManyToOne(
    () => Ekstrakurikuler,
    (ekstrakurikuler) => ekstrakurikuler.jadwalEkstrakurikulers,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'ekstrakurikuler_id', referencedColumnName: 'id' }])
  ekstrakurikuler: Ekstrakurikuler;

  @ManyToOne(() => Semester, (semester) => semester.jadwalEkstrakurikulers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'semester_id', referencedColumnName: 'id' }])
  semester: Semester;

  @OneToMany(
    () => SesiAbsensiEkstrakurikuler,
    (sesiAbsensiEkstrakurikuler) =>
      sesiAbsensiEkstrakurikuler.jadwalEkstrakurikuler,
  )
  sesiAbsensiEkstrakurikulers: SesiAbsensiEkstrakurikuler[];
}
