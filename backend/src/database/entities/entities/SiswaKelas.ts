import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Kelas } from "./Kelas";
import { Siswa } from "./Siswa";

@Index("siswa_kelas_pkey", ["id"], { unique: true })
@Index("uq_siswa_kelas_history", ["kelasId", "siswaId"], { unique: true })
@Index("idx_siswa_kelas_kelas", ["kelasId"], {})
@Index("uq_siswa_satu_kelas_aktif", ["siswaId"], { unique: true })
@Entity("siswa_kelas", { schema: "public" })
export class SiswaKelas {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "siswa_id", unique: true })
  siswaId: number;

  @Column("integer", { name: "kelas_id", unique: true })
  kelasId: number;

  @Column("date", { name: "tanggal_masuk" })
  tanggalMasuk: string;

  @Column("date", { name: "tanggal_keluar", nullable: true })
  tanggalKeluar: string | null;

  @Column("boolean", { name: "is_active", default: () => "true" })
  isActive: boolean;

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

  @ManyToOne(() => Users, (users) => users.siswaKelas, { onDelete: "SET NULL" })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Kelas, (kelas) => kelas.siswaKelas, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "kelas_id", referencedColumnName: "id" }])
  kelas: Kelas;

  @OneToOne(() => Siswa, (siswa) => siswa.siswaKelas, { onDelete: "RESTRICT" })
  @JoinColumn([{ name: "siswa_id", referencedColumnName: "id" }])
  siswa: Siswa;
}
