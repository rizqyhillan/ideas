import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Ekstrakurikuler } from "./Ekstrakurikuler";
import { Siswa } from "./Siswa";
import { TahunAjaran } from "./TahunAjaran";

@Index(
  "uq_anggota_ekskul_tahun",
  ["ekstrakurikulerId", "siswaId", "tahunAjaranId"],
  { unique: true }
)
@Index("anggota_ekstrakurikuler_pkey", ["id"], { unique: true })
@Index("idx_anggota_ekskul_siswa", ["siswaId"], {})
@Index("idx_anggota_ekskul_tahun", ["tahunAjaranId"], {})
@Entity("anggota_ekstrakurikuler", { schema: "public" })
export class AnggotaEkstrakurikuler {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "ekstrakurikuler_id", unique: true })
  ekstrakurikulerId: number;

  @Column("integer", { name: "siswa_id", unique: true })
  siswaId: number;

  @Column("smallint", { name: "tahun_ajaran_id", unique: true })
  tahunAjaranId: number;

  @Column("date", { name: "tanggal_masuk", default: () => "CURRENT_DATE" })
  tanggalMasuk: string;

  @Column("date", { name: "tanggal_keluar", nullable: true })
  tanggalKeluar: string | null;

  @Column("enum", {
    name: "status",
    enum: ["aktif", "nonaktif", "lulus", "keluar"],
    default: () => "'aktif'",
  })
  status: "aktif" | "nonaktif" | "lulus" | "keluar";

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

  @ManyToOne(() => Users, (users) => users.anggotaEkstrakurikulers, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(
    () => Ekstrakurikuler,
    (ekstrakurikuler) => ekstrakurikuler.anggotaEkstrakurikulers,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "ekstrakurikuler_id", referencedColumnName: "id" }])
  ekstrakurikuler: Ekstrakurikuler;

  @ManyToOne(() => Siswa, (siswa) => siswa.anggotaEkstrakurikulers, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "siswa_id", referencedColumnName: "id" }])
  siswa: Siswa;

  @ManyToOne(
    () => TahunAjaran,
    (tahunAjaran) => tahunAjaran.anggotaEkstrakurikulers,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "tahun_ajaran_id", referencedColumnName: "id" }])
  tahunAjaran: TahunAjaran;
}
