import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AnggotaEkstrakurikuler } from "./AnggotaEkstrakurikuler";
import { Users } from "./Users";
import { JadwalEkstrakurikuler } from "./JadwalEkstrakurikuler";
import { PembinaEkstrakurikuler } from "./PembinaEkstrakurikuler";
import { PermintaanPerubahanEkstrakurikuler } from "./PermintaanPerubahanEkstrakurikuler";

@Index("ekstrakurikuler_pkey", ["id"], { unique: true })
@Entity("ekstrakurikuler", { schema: "public" })
export class Ekstrakurikuler {
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
    () => AnggotaEkstrakurikuler,
    (anggotaEkstrakurikuler) => anggotaEkstrakurikuler.ekstrakurikuler
  )
  anggotaEkstrakurikulers: AnggotaEkstrakurikuler[];

  @ManyToOne(() => Users, (users) => users.ekstrakurikulers, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Users, (users) => users.ekstrakurikulers2, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(
    () => JadwalEkstrakurikuler,
    (jadwalEkstrakurikuler) => jadwalEkstrakurikuler.ekstrakurikuler
  )
  jadwalEkstrakurikulers: JadwalEkstrakurikuler[];

  @OneToMany(
    () => PembinaEkstrakurikuler,
    (pembinaEkstrakurikuler) => pembinaEkstrakurikuler.ekstrakurikuler
  )
  pembinaEkstrakurikulers: PembinaEkstrakurikuler[];

  @OneToMany(
    () => PermintaanPerubahanEkstrakurikuler,
    (permintaanPerubahanEkstrakurikuler) =>
      permintaanPerubahanEkstrakurikuler.targetEkstrakurikuler
  )
  permintaanPerubahanEkstrakurikulers: PermintaanPerubahanEkstrakurikuler[];
}
