import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Siswa } from '../database/entities/entities/Siswa';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Siswa master.
 */
@Injectable()
export class SiswaExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    const rows = await this.siswaRepository.find({ where: { deletedAt: IsNull() } });

    return rows.map((siswa) => ({
      id: siswa.id,
      nisn: siswa.nisn,
      nis: siswa.nis,
      namaLengkap: siswa.namaLengkap,
      jenisKelamin: siswa.jenisKelamin,
      tempatLahir: siswa.tempatLahir,
      tanggalLahir: siswa.tanggalLahir,
      email: siswa.email,
      noTelepon: siswa.noTelepon,
      alamat: siswa.alamat,
      namaWali: siswa.namaWali,
      noTeleponWali: siswa.noTeleponWali,
      statusAktif: siswa.statusAktif,
      userId: siswa.userId,
    }));
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      nisn: r.nisn ?? null,
      nis: r.nis ?? null,
      namaLengkap: r.namaLengkap ?? null,
      jenisKelamin: r.jenisKelamin ?? null,
      tempatLahir: r.tempatLahir ?? null,
      tanggalLahir: r.tanggalLahir ?? null,
      email: r.email ?? null,
      noTelepon: r.noTelepon ?? null,
      alamat: r.alamat ?? null,
      namaWali: r.namaWali ?? null,
      noTeleponWali: r.noTeleponWali ?? null,
      statusAktif: r.statusAktif ?? true,
    }));
    await this.siswaRepository.save(records);
    return records.length;
  }
}
