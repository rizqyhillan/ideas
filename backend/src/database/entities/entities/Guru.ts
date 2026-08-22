import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbsensiGuru } from './AbsensiGuru';
import { CatatanKonseling } from './CatatanKonseling';
import { Pegawai } from './Pegawai';
import { JadwalPelajaran } from './JadwalPelajaran';
import { JadwalPiketGuru } from './JadwalPiketGuru';
import { Kelas } from './Kelas';
import { SesiAbsensiSiswa } from './SesiAbsensiSiswa';

@Index('guru_pkey', ['id'], { unique: true })
@Index('uq_guru_kode', ['kodeGuru'], { unique: true })
@Index('guru_pegawai_id_key', ['pegawaiId'], { unique: true })
@Entity('guru', { schema: 'public' })
export class Guru {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'pegawai_id', unique: true })
  pegawaiId: number;

  @Column('character varying', {
    name: 'kode_guru',
    nullable: true,
    length: 30,
  })
  kodeGuru: string | null;

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

  @OneToMany(() => AbsensiGuru, (absensiGuru) => absensiGuru.guru)
  absensiGurus: AbsensiGuru[];

  @OneToMany(
    () => CatatanKonseling,
    (catatanKonseling) => catatanKonseling.guruBk,
  )
  catatanKonselings: CatatanKonseling[];

  @OneToOne(() => Pegawai, (pegawai) => pegawai.guru, { onDelete: 'RESTRICT' })
  @JoinColumn([{ name: 'pegawai_id', referencedColumnName: 'id' }])
  pegawai: Pegawai;

  @OneToMany(() => JadwalPelajaran, (jadwalPelajaran) => jadwalPelajaran.guru)
  jadwalPelajarans: JadwalPelajaran[];

  @OneToMany(() => JadwalPiketGuru, (jadwalPiketGuru) => jadwalPiketGuru.guru)
  jadwalPiketGurus: JadwalPiketGuru[];

  @OneToMany(() => Kelas, (kelas) => kelas.waliKelas)
  kelas: Kelas[];

  @OneToMany(
    () => SesiAbsensiSiswa,
    (sesiAbsensiSiswa) => sesiAbsensiSiswa.dibukaOlehGuru,
  )
  sesiAbsensiSiswas: SesiAbsensiSiswa[];
}
