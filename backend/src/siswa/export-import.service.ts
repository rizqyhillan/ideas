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
    return this.siswaRepository.find({ where: { deletedAt: IsNull() } });
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
