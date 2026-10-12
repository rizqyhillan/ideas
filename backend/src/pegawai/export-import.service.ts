import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Pegawai } from '../database/entities/entities/Pegawai';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Pegawai master.
 */
@Injectable()
export class PegawaiExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Pegawai)
    private readonly pegawaiRepository: Repository<Pegawai>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.pegawaiRepository.find({ where: { deletedAt: IsNull() } });
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      nip: r.nip ?? null,
      nuptk: r.nuptk ?? null,
      namaLengkap: r.namaLengkap ?? null,
      jenisKelamin: r.jenisKelamin ?? null,
      tempatLahir: r.tempatLahir ?? null,
      tanggalLahir: r.tanggalLahir ?? null,
      email: r.email ?? null,
      noTelepon: r.noTelepon ?? null,
      alamat: r.alamat ?? null,
      jabatan: r.jabatan ?? null,
      statusAktif: r.statusAktif ?? true,
    }));
    await this.pegawaiRepository.save(records);
    return records.length;
  }
}
