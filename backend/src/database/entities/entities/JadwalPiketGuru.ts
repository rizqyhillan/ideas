import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { AbsensiGuruPiket } from "./AbsensiGuruPiket";
import { Users } from "./Users";
import { Guru } from "./Guru";
import { JadwalPiket } from "./JadwalPiket";

@Index("idx_jadwal_piket_guru_guru", ["guruId"], {})
@Index("jadwal_piket_guru_pkey", ["guruId", "jadwalPiketId"], { unique: true })
@Entity("jadwal_piket_guru", { schema: "public" })
export class JadwalPiketGuru {
  @Column("integer", { primary: true, name: "jadwal_piket_id" })
  jadwalPiketId: number;

  @Column("integer", { primary: true, name: "guru_id" })
  guruId: number;

  @Column("timestamp with time zone", {
    name: "assigned_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  assignedAt: Date;

  @OneToMany(
    () => AbsensiGuruPiket,
    (absensiGuruPiket) => absensiGuruPiket.jadwalPiketGuru
  )
  absensiGuruPikets: AbsensiGuruPiket[];

  @ManyToOne(() => Users, (users) => users.jadwalPiketGurus, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "assigned_by", referencedColumnName: "id" }])
  assignedBy: Users;

  @ManyToOne(() => Guru, (guru) => guru.jadwalPiketGurus, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "guru_id", referencedColumnName: "id" }])
  guru: Guru;

  @ManyToOne(() => JadwalPiket, (jadwalPiket) => jadwalPiket.jadwalPiketGurus, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "jadwal_piket_id", referencedColumnName: "id" }])
  jadwalPiket: JadwalPiket;
}
