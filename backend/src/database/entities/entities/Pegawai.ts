import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Guru } from "./Guru";
import { Users } from "./Users";
import { PembinaEkstrakurikuler } from "./PembinaEkstrakurikuler";
import { SesiAbsensiEkstrakurikuler } from "./SesiAbsensiEkstrakurikuler";

@Index("pegawai_pkey", ["id"], { unique: true })
@Index("idx_pegawai_nama", ["namaLengkap"], {})
@Index("uq_pegawai_nip", ["nip"], { unique: true })
@Index("uq_pegawai_nuptk", ["nuptk"], { unique: true })
@Index("idx_pegawai_status_aktif", ["statusAktif"], {})
@Index("pegawai_user_id_key", ["userId"], { unique: true })
@Entity("pegawai", { schema: "public" })
export class Pegawai {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "user_id", nullable: true, unique: true })
  userId: number | null;

  @Column("character varying", { name: "nama_lengkap", length: 255 })
  namaLengkap: string;

  @Column("character varying", { name: "nip", nullable: true, length: 30 })
  nip: string | null;

  @Column("character varying", { name: "nuptk", nullable: true, length: 30 })
  nuptk: string | null;

  @Column("enum", { name: "jenis_kelamin", enum: ["L", "P"] })
  jenisKelamin: "L" | "P";

  @Column("character varying", {
    name: "tempat_lahir",
    nullable: true,
    length: 100,
  })
  tempatLahir: string | null;

  @Column("date", { name: "tanggal_lahir", nullable: true })
  tanggalLahir: string | null;

  @Column("character varying", { name: "email", nullable: true, length: 255 })
  email: string | null;

  @Column("character varying", {
    name: "no_telepon",
    nullable: true,
    length: 30,
  })
  noTelepon: string | null;

  @Column("text", { name: "alamat", nullable: true })
  alamat: string | null;

  @Column("character varying", { name: "jabatan", nullable: true, length: 150 })
  jabatan: string | null;

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

  @OneToOne(() => Guru, (guru) => guru.pegawai)
  guru: Guru;

  @OneToOne(() => Users, (users) => users.pegawai, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(
    () => PembinaEkstrakurikuler,
    (pembinaEkstrakurikuler) => pembinaEkstrakurikuler.pegawai
  )
  pembinaEkstrakurikulers: PembinaEkstrakurikuler[];

  @OneToMany(
    () => SesiAbsensiEkstrakurikuler,
    (sesiAbsensiEkstrakurikuler) => sesiAbsensiEkstrakurikuler.pembinaPegawai
  )
  sesiAbsensiEkstrakurikulers: SesiAbsensiEkstrakurikuler[];
}
