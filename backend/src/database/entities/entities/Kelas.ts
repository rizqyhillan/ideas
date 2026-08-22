import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JadwalPelajaran } from './JadwalPelajaran';
import { Users } from './Users';
import { TahunAjaran } from './TahunAjaran';
import { Guru } from './Guru';
import { SiswaKelas } from './SiswaKelas';

@Index('kelas_pkey', ['id'], { unique: true })
@Index('uq_kelas_wali_per_tahun', ['tahunAjaranId', 'waliKelasId'], {
  unique: true,
})
@Index('idx_kelas_tahun_ajaran', ['tahunAjaranId'], {})
@Index('uq_kelas_tahun_nama', ['tahunAjaranId', 'nama'], {
  unique: true,
})
@Index('idx_kelas_wali', ['waliKelasId'], {})
@Entity('kelas', { schema: 'public' })
export class Kelas {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('smallint', { name: 'tahun_ajaran_id' })
  tahunAjaranId: number;

  @Column('character varying', { name: 'nama', length: 50 })
  nama: string;

  @Column('smallint', { name: 'tingkat' })
  tingkat: number;

  @Column('integer', { name: 'wali_kelas_id', nullable: true })
  waliKelasId: number | null;

  @Column('smallint', { name: 'kapasitas', nullable: true })
  kapasitas: number | null;

  @Column('character varying', { name: 'ruang', nullable: true, length: 100 })
  ruang: string | null;

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

  @OneToMany(() => JadwalPelajaran, (jadwalPelajaran) => jadwalPelajaran.kelas)
  jadwalPelajarans: JadwalPelajaran[];

  @ManyToOne(() => Users, (users) => users.kelas, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  createdBy: Users;

  @ManyToOne(() => TahunAjaran, (tahunAjaran) => tahunAjaran.kelas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    {
      name: 'tahun_ajaran_id',
      referencedColumnName: 'id',
    },
  ])
  tahunAjaran: TahunAjaran;

  @ManyToOne(() => Users, (users) => users.kelas2, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'updated_by', referencedColumnName: 'id' }])
  updatedBy: Users;

  @ManyToOne(() => Guru, (guru) => guru.kelas, { onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'wali_kelas_id', referencedColumnName: 'id' }])
  waliKelas: Guru;

  @OneToMany(() => SiswaKelas, (siswaKelas) => siswaKelas.kelas)
  siswaKelas: SiswaKelas[];
}
