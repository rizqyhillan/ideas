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
import { KategoriBuku } from "./KategoriBuku";
import { InventarisBuku } from "./InventarisBuku";

@Index("buku_pkey", ["id"], { unique: true })
@Index("uq_buku_isbn", ["isbn"], { unique: true })
@Index("idx_buku_judul", ["judul"], {})
@Index("idx_buku_kategori", ["kategoriId"], {})
@Entity("buku", { schema: "public" })
export class Buku {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("smallint", { name: "kategori_id", nullable: true })
  kategoriId: number | null;

  @Column("character varying", { name: "isbn", nullable: true, length: 30 })
  isbn: string | null;

  @Column("character varying", { name: "judul", length: 255 })
  judul: string;

  @Column("character varying", { name: "penulis", nullable: true, length: 255 })
  penulis: string | null;

  @Column("character varying", {
    name: "penerbit",
    nullable: true,
    length: 255,
  })
  penerbit: string | null;

  @Column("smallint", { name: "tahun_terbit", nullable: true })
  tahunTerbit: number | null;

  @Column("text", { name: "deskripsi", nullable: true })
  deskripsi: string | null;

  @Column("text", { name: "url_sampul", nullable: true })
  urlSampul: string | null;

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

  @ManyToOne(() => Users, (users) => users.bukus, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => KategoriBuku, (kategoriBuku) => kategoriBuku.bukus, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "kategori_id", referencedColumnName: "id" }])
  kategori: KategoriBuku;

  @ManyToOne(() => Users, (users) => users.bukus2, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(() => InventarisBuku, (inventarisBuku) => inventarisBuku.buku)
  inventarisBukus: InventarisBuku[];
}
