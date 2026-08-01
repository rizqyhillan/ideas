import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AnggotaEkstrakurikuler } from "./AnggotaEkstrakurikuler";
import { Kelas } from "./Kelas";
import { Semester } from "./Semester";

@Index("tahun_ajaran_pkey", ["id"], { unique: true })
@Index("uq_tahun_ajaran_active", ["isActive"], { unique: true })
@Index("tahun_ajaran_nama_key", ["nama"], { unique: true })
@Entity("tahun_ajaran", { schema: "public" })
export class TahunAjaran {
  @PrimaryGeneratedColumn({ type: "smallint", name: "id" })
  id: number;

  @Column("character varying", { name: "nama", unique: true, length: 20 })
  nama: string;

  @Column("date", { name: "tanggal_mulai" })
  tanggalMulai: string;

  @Column("date", { name: "tanggal_selesai" })
  tanggalSelesai: string;

  @Column("boolean", { name: "is_active", default: () => "false" })
  isActive: boolean;

  @Column("timestamp with time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp with time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(
    () => AnggotaEkstrakurikuler,
    (anggotaEkstrakurikuler) => anggotaEkstrakurikuler.tahunAjaran
  )
  anggotaEkstrakurikulers: AnggotaEkstrakurikuler[];

  @OneToOne(() => Kelas, (kelas) => kelas.tahunAjaran)
  kelas: Kelas;

  @OneToMany(() => Semester, (semester) => semester.tahunAjaran)
  semesters: Semester[];
}
