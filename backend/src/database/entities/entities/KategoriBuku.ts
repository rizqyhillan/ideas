import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Buku } from "./Buku";

@Index("kategori_buku_pkey", ["id"], { unique: true })
@Index("uq_kategori_buku_nama", ["nama"], { unique: true })
@Entity("kategori_buku", { schema: "public" })
export class KategoriBuku {
  @PrimaryGeneratedColumn({ type: "smallint", name: "id" })
  id: number;

  @Column("character varying", { name: "nama", unique: true, length: 100 })
  nama: string;

  @Column("text", { name: "deskripsi", nullable: true })
  deskripsi: string | null;

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

  @OneToMany(() => Buku, (buku) => buku.kategori)
  bukus: Buku[];
}
