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
import { Guru } from "./Guru";
import { Kelas } from "./Kelas";
import { MataPelajaran } from "./MataPelajaran";
import { Semester } from "./Semester";
import { SesiAbsensiSiswa } from "./SesiAbsensiSiswa";

@Index("idx_jadwal_guru", ["guruId"], {})
@Index("uq_jadwal_guru_start", ["guruId", "hari", "jamMulai", "semesterId"], {
  unique: true,
})
@Index("idx_jadwal_hari", ["hari"], {})
@Index("uq_jadwal_kelas_start", ["hari", "jamMulai", "kelasId", "semesterId"], {
  unique: true,
})
@Index("jadwal_pelajaran_pkey", ["id"], { unique: true })
@Index("idx_jadwal_kelas", ["kelasId"], {})
@Index("idx_jadwal_mapel", ["mataPelajaranId"], {})
@Index("idx_jadwal_semester", ["semesterId"], {})
@Entity("jadwal_pelajaran", { schema: "public" })
export class JadwalPelajaran {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("smallint", { name: "semester_id" })
  semesterId: number;

  @Column("integer", { name: "kelas_id" })
  kelasId: number;

  @Column("integer", { name: "mata_pelajaran_id" })
  mataPelajaranId: number;

  @Column("integer", { name: "guru_id" })
  guruId: number;

  @Column("enum", {
    name: "hari",
    enum: ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"],
  })
  hari: "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

  @Column("time without time zone", { name: "jam_mulai" })
  jamMulai: string;

  @Column("time without time zone", { name: "jam_selesai" })
  jamSelesai: string;

  @Column("character varying", { name: "ruang", nullable: true, length: 100 })
  ruang: string | null;

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

  @ManyToOne(() => Users, (users) => users.jadwalPelajarans, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Users;

  @ManyToOne(() => Guru, (guru) => guru.jadwalPelajarans, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "guru_id", referencedColumnName: "id" }])
  guru: Guru;

  @ManyToOne(() => Kelas, (kelas) => kelas.jadwalPelajarans, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "kelas_id", referencedColumnName: "id" }])
  kelas: Kelas;

  @ManyToOne(
    () => MataPelajaran,
    (mataPelajaran) => mataPelajaran.jadwalPelajarans,
    { onDelete: "RESTRICT" }
  )
  @JoinColumn([{ name: "mata_pelajaran_id", referencedColumnName: "id" }])
  mataPelajaran: MataPelajaran;

  @ManyToOne(() => Semester, (semester) => semester.jadwalPelajarans, {
    onDelete: "RESTRICT",
  })
  @JoinColumn([{ name: "semester_id", referencedColumnName: "id" }])
  semester: Semester;

  @ManyToOne(() => Users, (users) => users.jadwalPelajarans2, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "updated_by", referencedColumnName: "id" }])
  updatedBy: Users;

  @OneToMany(
    () => SesiAbsensiSiswa,
    (sesiAbsensiSiswa) => sesiAbsensiSiswa.jadwalPelajaran
  )
  sesiAbsensiSiswas: SesiAbsensiSiswa[];
}
