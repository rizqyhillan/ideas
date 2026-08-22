import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Buku } from './Buku';
import { Users } from './Users';

@Index('uq_inventaris_barcode', ['barcode'], { unique: true })
@Index('idx_inventaris_buku', ['bukuId'], {})
@Index('inventaris_buku_pkey', ['id'], { unique: true })
@Index('uq_inventaris_kode', ['kodeInventaris'], { unique: true })
@Index('idx_inventaris_status', ['status'], {})
@Entity('inventaris_buku', { schema: 'public' })
export class InventarisBuku {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'buku_id' })
  bukuId: number;

  @Column('character varying', { name: 'kode_inventaris', length: 100 })
  kodeInventaris: string;

  @Column('character varying', { name: 'barcode', nullable: true, length: 100 })
  barcode: string | null;

  @Column('character varying', {
    name: 'lokasi_rak',
    nullable: true,
    length: 100,
  })
  lokasiRak: string | null;

  @Column('date', { name: 'tanggal_perolehan', nullable: true })
  tanggalPerolehan: string | null;

  @Column('character varying', {
    name: 'sumber_perolehan',
    nullable: true,
    length: 150,
  })
  sumberPerolehan: string | null;

  @Column('numeric', {
    name: 'harga_perolehan',
    nullable: true,
    precision: 14,
    scale: 2,
  })
  hargaPerolehan: string | null;

  @Column('enum', {
    name: 'kondisi',
    enum: ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'],
    default: () => "'baik'",
  })
  kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang';

  @Column('enum', {
    name: 'status',
    enum: ['tersedia', 'dipinjam', 'perbaikan', 'hilang', 'nonaktif'],
    default: () => "'tersedia'",
  })
  status: 'tersedia' | 'dipinjam' | 'perbaikan' | 'hilang' | 'nonaktif';

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

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Buku, (buku) => buku.inventarisBukus, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn([{ name: 'buku_id', referencedColumnName: 'id' }])
  buku: Buku;

  @ManyToOne(() => Users, (users) => users.inventarisBukus, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.inventarisBukus2, {
    onDelete: 'SET NULL',
  })
  @JoinColumn([{ name: 'updated_by', referencedColumnName: 'id' }])
  updatedBy: Users;
}
