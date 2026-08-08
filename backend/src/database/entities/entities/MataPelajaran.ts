import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JadwalPelajaran } from "./JadwalPelajaran";

@Index("mata_pelajaran_pkey", ["id"], { unique: true })
@Entity("mata_pelajaran", { schema: "public" })
export class MataPelajaran {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "kode", length: 30 })
  kode: string;

  @Column("character varying", { name: "nama", length: 150 })
  nama: string;

  @Column("text", { name: "deskripsi", nullable: true })
  deskripsi: string | null;

  @Column("boolean", { name: "status_aktif", default: () => "true" })
  statusAktif: boolean;

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

  @Column("timestamp with time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @OneToMany(
    () => JadwalPelajaran,
    (jadwalPelajaran) => jadwalPelajaran.mataPelajaran
  )
  jadwalPelajarans: JadwalPelajaran[];
}
