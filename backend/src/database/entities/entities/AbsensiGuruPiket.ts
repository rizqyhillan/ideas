import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JadwalPiketGuru } from "./JadwalPiketGuru";

@Index("idx_absensi_piket_guru", ["guruId"], {})
@Index(
  "uq_absensi_piket_guru_tanggal",
  ["guruId", "jadwalPiketId", "tanggal"],
  { unique: true }
)
@Index("absensi_guru_piket_pkey", ["id"], { unique: true })
@Index("idx_absensi_piket_tanggal", ["tanggal"], {})
@Entity("absensi_guru_piket", { schema: "public" })
export class AbsensiGuruPiket {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "jadwal_piket_id", unique: true })
  jadwalPiketId: number;

  @Column("integer", { name: "guru_id", unique: true })
  guruId: number;

  @Column("date", { name: "tanggal", unique: true })
  tanggal: string;

  @Column("enum", { name: "status", enum: ["hadir", "sakit", "izin", "alpa"] })
  status: "hadir" | "sakit" | "izin" | "alpa";

  @Column("timestamp with time zone", { name: "waktu_absen", nullable: true })
  waktuAbsen: Date | null;

  @Column("numeric", {
    name: "latitude",
    nullable: true,
    precision: 10,
    scale: 7,
  })
  latitude: string | null;

  @Column("numeric", {
    name: "longitude",
    nullable: true,
    precision: 10,
    scale: 7,
  })
  longitude: string | null;

  @Column("text", { name: "keterangan", nullable: true })
  keterangan: string | null;

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

  @ManyToOne(
    () => JadwalPiketGuru,
    (jadwalPiketGuru) => jadwalPiketGuru.absensiGuruPikets,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([
    { name: "jadwal_piket_id", referencedColumnName: "jadwalPiketId" },
    { name: "guru_id", referencedColumnName: "guruId" },
  ])
  jadwalPiketGuru: JadwalPiketGuru;
}
