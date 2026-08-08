import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Guru } from "./Guru";
import { Siswa } from "./Siswa";

@Index("idx_konseling_guru_bk", ["guruBkId"], {})
@Index("catatan_konseling_pkey", ["id"], { unique: true })
@Index("idx_konseling_siswa", ["siswaId"], {})
@Index("idx_konseling_tanggal", ["tanggal"], {})
@Index("idx_konseling_visibilitas", ["visibilitas"], {})
@Entity("catatan_konseling", { schema: "public" })
export class CatatanKonseling {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "siswa_id" })
  siswaId: number;

  @Column("integer", { name: "guru_bk_id" })
  guruBkId: number;

  @Column("timestamp with time zone", {
    name: "tanggal",
    default: () => "CURRENT_TIMESTAMP",
  })
  tanggal: Date;

  @Column("character varying", { name: "topik", length: 255 })
  topik: string;

  @Column("text", { name: "isi" })
  isi: string;

  @Column("text", { name: "tindak_lanjut", nullable: true })
  tindakLanjut: string | null;

  @Column("enum", {
    name: "visibilitas",
    enum: ["rahasia", "internal_bk", "siswa"],
    default: () => "'rahasia'",
  })
  visibilitas: "rahasia" | "internal_bk" | "siswa";

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

  @ManyToOne(() => Users, (users) => users.catatanKonselings, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Guru, (guru) => guru.catatanKonselings, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "guru_bk_id", referencedColumnName: "id" }])
  guruBk: Guru;

  @ManyToOne(() => Siswa, (siswa) => siswa.catatanKonselings, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "siswa_id", referencedColumnName: "id" }])
  siswa: Siswa;

  @ManyToOne(() => Users, (users) => users.catatanKonselings2, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;
}
