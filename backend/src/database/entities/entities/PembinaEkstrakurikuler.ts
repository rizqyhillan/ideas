import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Ekstrakurikuler } from './Ekstrakurikuler';
import { Pegawai } from './Pegawai';

@Index('uq_pembina_ekskul_aktif', ['ekstrakurikulerId', 'pegawaiId'], {
  unique: true,
})
@Index(
  'pembina_ekstrakurikuler_pkey',
  ['ekstrakurikulerId', 'pegawaiId', 'tanggalMulai'],
  { unique: true },
)
@Index('idx_pembina_ekskul_pegawai', ['pegawaiId'], {})
@Entity('pembina_ekstrakurikuler', { schema: 'public' })
export class PembinaEkstrakurikuler {
  @Column('integer', { primary: true, name: 'ekstrakurikuler_id' })
  ekstrakurikulerId: number;

  @Column('integer', { primary: true, name: 'pegawai_id' })
  pegawaiId: number;

  @Column('date', {
    primary: true,
    name: 'tanggal_mulai',
    default: () => 'CURRENT_DATE',
  })
  tanggalMulai: string;

  @Column('date', { name: 'tanggal_selesai', nullable: true })
  tanggalSelesai: string | null;

  @Column('boolean', { name: 'is_active', default: () => 'true' })
  isActive: boolean;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.pembinaEkstrakurikulers, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'assigned_by', referencedColumnName: 'id' }])
  assignedBy: Users;

  @ManyToOne(
    () => Ekstrakurikuler,
    (ekstrakurikuler) => ekstrakurikuler.pembinaEkstrakurikulers,
    { onDelete: 'RESTRICT' },
  )
  @JoinColumn([{ name: 'ekstrakurikuler_id', referencedColumnName: 'id' }])
  ekstrakurikuler: Ekstrakurikuler;

  @ManyToOne(() => Pegawai, (pegawai) => pegawai.pembinaEkstrakurikulers, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'pegawai_id', referencedColumnName: 'id' }])
  pegawai: Pegawai;
}
