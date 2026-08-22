import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JadwalEkstrakurikuler } from './JadwalEkstrakurikuler';
import { JadwalPelajaran } from './JadwalPelajaran';
import { JadwalPiket } from './JadwalPiket';
import { TahunAjaran } from './TahunAjaran';

@Index('semester_pkey', ['id'], { unique: true })
@Index('uq_semester_active', ['isActive'], { unique: true })
@Index('uq_semester_tahun_jenis', ['jenis', 'tahunAjaranId'], { unique: true })
@Index('idx_semester_tahun_ajaran', ['tahunAjaranId'], {})
@Entity('semester', { schema: 'public' })
export class Semester {
  @PrimaryGeneratedColumn({ type: 'smallint', name: 'id' })
  id: number;

  @Column('smallint', { name: 'tahun_ajaran_id' })
  tahunAjaranId: number;

  @Column('enum', { name: 'jenis', enum: ['ganjil', 'genap'] })
  jenis: 'ganjil' | 'genap';

  @Column('date', { name: 'tanggal_mulai' })
  tanggalMulai: string;

  @Column('date', { name: 'tanggal_selesai' })
  tanggalSelesai: string;

  @Column('boolean', { name: 'is_active', default: () => 'false' })
  isActive: boolean;

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
    () => JadwalEkstrakurikuler,
    (jadwalEkstrakurikuler) => jadwalEkstrakurikuler.semester,
  )
  jadwalEkstrakurikulers: JadwalEkstrakurikuler[];

  @OneToMany(
    () => JadwalPelajaran,
    (jadwalPelajaran) => jadwalPelajaran.semester,
  )
  jadwalPelajarans: JadwalPelajaran[];

  @OneToMany(() => JadwalPiket, (jadwalPiket) => jadwalPiket.semester)
  jadwalPikets: JadwalPiket[];

  @ManyToOne(() => TahunAjaran, (tahunAjaran) => tahunAjaran.semesters, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'tahun_ajaran_id', referencedColumnName: 'id' }])
  tahunAjaran: TahunAjaran;
}
