import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Semester } from "./Semester";
import { JadwalPiketGuru } from "./JadwalPiketGuru";

@Index("uq_jadwal_piket_identitas", ["hari", "jamMulai", "semesterId"], {
  unique: true,
})
@Index("jadwal_piket_pkey", ["id"], { unique: true })
@Index("idx_jadwal_piket_semester", ["semesterId"], {})
@Entity("jadwal_piket", { schema: "public" })
export class JadwalPiket {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("smallint", { name: "semester_id" })
  semesterId: number;

  @Column("character varying", { name: "nama", length: 100 })
  nama: string;

  @Column("enum", {
    name: "hari",
    enum: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"],
  })
  hari: "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

  @Column("time without time zone", { name: "jam_mulai" })
  jamMulai: string;

  @Column("time without time zone", { name: "jam_selesai" })
  jamSelesai: string;

  @Column("character varying", { name: "lokasi", nullable: true, length: 100 })
  lokasi: string | null;

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

  @ManyToOne(() => Users, (users) => users.jadwalPikets, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Semester, (semester) => semester.jadwalPikets, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "semester_id", referencedColumnName: "id" }])
  semester: Semester;

  @OneToMany(
    () => JadwalPiketGuru,
    (jadwalPiketGuru) => jadwalPiketGuru.jadwalPiket
  )
  jadwalPiketGurus: JadwalPiketGuru[];
}
