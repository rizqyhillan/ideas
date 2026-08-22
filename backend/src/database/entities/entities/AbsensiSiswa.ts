import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';
import { SesiAbsensiSiswa } from './SesiAbsensiSiswa';
import { Siswa } from './Siswa';

@Index('absensi_siswa_pkey', ['id'], { unique: true })
@Index('uq_absensi_siswa_per_sesi', ['sesiAbsensiId', 'siswaId'], {
  unique: true,
})
@Index('idx_absensi_siswa_siswa', ['siswaId'], {})
@Index('idx_absensi_siswa_status', ['status'], {})
@Entity('absensi_siswa', { schema: 'public' })
export class AbsensiSiswa {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'sesi_absensi_id', unique: true })
  sesiAbsensiId: number;

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

  @ManyToOne(() => Users, (users) => users.absensiSiswas, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'dicatat_oleh', referencedColumnName: 'id' }])
  dicatatOleh: Users;

  @ManyToOne(
    () => SesiAbsensiSiswa,
    (sesiAbsensiSiswa) => sesiAbsensiSiswa.absensiSiswas,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn([{ name: 'sesi_absensi_id', referencedColumnName: 'id' }])
  sesiAbsensi: SesiAbsensiSiswa;

  @ManyToOne(() => Siswa, (siswa) => siswa.absensiSiswas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'siswa_id', referencedColumnName: 'id' }])
  siswa: Siswa;
}
