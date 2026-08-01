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

@Index("uq_absensi_guru_tanggal", ["guruId", "tanggal"], { unique: true })
@Index("absensi_guru_pkey", ["id"], { unique: true })
@Index("idx_absensi_guru_status", ["status"], {})
@Index("idx_absensi_guru_tanggal", ["tanggal"], {})
@Entity("absensi_guru", { schema: "public" })
export class AbsensiGuru {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "guru_id", unique: true })
  guruId: number;

  @Column("date", { name: "tanggal", unique: true })
  tanggal: string;

  @Column("enum", { name: "status", enum: ["hadir", "sakit", "izin", "alpa"] })
  status: "hadir" | "sakit" | "izin" | "alpa";

  @Column("timestamp with time zone", { name: "waktu_masuk", nullable: true })
  waktuMasuk: Date | null;

  @Column("timestamp with time zone", { name: "waktu_pulang", nullable: true })
  waktuPulang: Date | null;

  @Column("numeric", {
    name: "latitude_masuk",
    nullable: true,
    precision: 10,
    scale: 7,
  })
  latitudeMasuk: string | null;

  @Column("numeric", {
    name: "longitude_masuk",
    nullable: true,
    precision: 10,
    scale: 7,
  })
  longitudeMasuk: string | null;

  @Column("numeric", {
    name: "latitude_pulang",
    nullable: true,
    precision: 10,
    scale: 7,
  })
  latitudePulang: string | null;

  @Column("numeric", {
    name: "longitude_pulang",
    nullable: true,
    precision: 10,
    scale: 7,
  })
  longitudePulang: string | null;

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

  @ManyToOne(() => Users, (users) => users.absensiGurus, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "diverifikasi_oleh", referencedColumnName: "id" }])
  diverifikasiOleh: Users;

  @ManyToOne(() => Guru, (guru) => guru.absensiGurus, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "guru_id", referencedColumnName: "id" }])
  guru: Guru;
}
