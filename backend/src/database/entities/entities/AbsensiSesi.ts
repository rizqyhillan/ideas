import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Siswa } from './Siswa';
import { Guru } from './Guru';
import { Kelas } from './Kelas';
import { AbsensiSesiItem } from './AbsensiSesiItem';

@Index('idx_absensi_sesi_tanggal_kelas', ['tanggal', 'kelasId'])
@Entity('absensi_sesi', { schema: 'public' })
export class AbsensiSesi {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @ManyToOne(() => Kelas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'kelas_id', referencedColumnName: 'id' })
  kelas: Kelas;

  @Column('integer', { name: 'kelas_id' })
  kelasId: number;

  @ManyToOne(() => Guru, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'guru_id', referencedColumnName: 'id' })
  guru: Guru;

  @Column('integer', { name: 'guru_id', nullable: true })
  guruId: number | null;

  @Column('date', { name: 'tanggal' })
  tanggal: string;

  @Column('text', { name: 'jam_ke', nullable: true })
  jamKe: string | null;

  @Column('text', { name: 'mata_pelajaran', nullable: true })
  mataPelajaran: string | null;

  @Column('text', { name: 'catatan', nullable: true })
  catatan: string | null;

  @Column('timestamp with time zone', {
    name: 'saved_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  savedAt: Date;

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

  @OneToMany(() => AbsensiSesiItem, (item) => item.absensiSesi, {
    cascade: true,
  })
  items: AbsensiSesiItem[];
}
