import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';
import { Ekstrakurikuler } from './Ekstrakurikuler';

@Index('idx_permintaan_ekskul_pengaju', ['diajukanOleh'], {})
@Index('permintaan_perubahan_ekstrakurikuler_pkey', ['id'], { unique: true })
@Index('idx_permintaan_ekskul_status', ['status'], {})
@Index('idx_permintaan_ekskul_target', ['targetEkstrakurikulerId'], {})
@Entity('permintaan_perubahan_ekstrakurikuler', { schema: 'public' })
export class PermintaanPerubahanEkstrakurikuler {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('enum', { name: 'aksi', enum: ['create', 'update', 'delete'] })
  aksi: 'create' | 'update' | 'delete';

  @Column('integer', { name: 'target_ekstrakurikuler_id', nullable: true })
  targetEkstrakurikulerId: number | null;

  @Column('jsonb', { name: 'data_sebelum', nullable: true })
  dataSebelum: object | null;

  @Column('jsonb', { name: 'data_sesudah', nullable: true })
  dataSesudah: object | null;

  @Column('enum', {
    name: 'status',
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
    default: () => "'draft'",
  })
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

  @Column('integer', { name: 'diajukan_oleh' })
  diajukanOleh: number;

  @Column('timestamp with time zone', { name: 'diajukan_pada', nullable: true })
  diajukanPada: Date | null;

  @Column('timestamp with time zone', {
    name: 'diperiksa_pada',
    nullable: true,
  })
  diperiksaPada: Date | null;

  @Column('text', { name: 'catatan_pengajuan', nullable: true })
  catatanPengajuan: string | null;

  @Column('text', { name: 'catatan_pemeriksaan', nullable: true })
  catatanPemeriksaan: string | null;

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

  @ManyToOne(
    () => Users,
    (users) => users.permintaanPerubahanEkstrakurikulers,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'diajukan_oleh', referencedColumnName: 'id' }])
  diajukanOleh2: Users;

  @ManyToOne(
    () => Users,
    (users) => users.permintaanPerubahanEkstrakurikulers2,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn([{ name: 'diperiksa_oleh', referencedColumnName: 'id' }])
  diperiksaOleh: Users;

  @ManyToOne(
    () => Ekstrakurikuler,
    (ekstrakurikuler) => ekstrakurikuler.permintaanPerubahanEkstrakurikulers,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn([
    { name: 'target_ekstrakurikuler_id', referencedColumnName: 'id' },
  ])
  targetEkstrakurikuler: Ekstrakurikuler;
}
