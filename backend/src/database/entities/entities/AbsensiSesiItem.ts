import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbsensiSesi } from './AbsensiSesi';
import { Siswa } from './Siswa';

@Index('idx_absensi_sesi_item_siswa', ['siswaId'])
@Index('uq_absensi_sesi_item_per_sesi', ['absensiSesiId', 'siswaId'], {
  unique: true,
})
@Entity('absensi_sesi_item', { schema: 'public' })
export class AbsensiSesiItem {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @ManyToOne(() => AbsensiSesi, (sesi) => sesi.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'absensi_sesi_id', referencedColumnName: 'id' })
  absensiSesi: AbsensiSesi;

  @Column('integer', { name: 'absensi_sesi_id' })
  absensiSesiId: number;

  @ManyToOne(() => Siswa, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'siswa_id', referencedColumnName: 'id' })
  siswa: Siswa;

  @Column('integer', { name: 'siswa_id' })
  siswaId: number;

  @Column('enum', {
    name: 'status',
    enum: ['hadir', 'sakit', 'izin', 'alpa'],
  })
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';

  @Column('text', { name: 'keterangan', nullable: true })
  keterangan: string | null;
}
