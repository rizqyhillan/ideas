import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Kelas } from '../database/entities/entities/Kelas';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Kelas (Classes) master.
 */
@Injectable()
export class ClassesExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.kelasRepository.find({ where: { deletedAt: IsNull() } });
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      nama: r.nama ?? null,
      tingkat: r.tingkat ?? null,
      kapasitas: r.kapasitas ?? null,
      ruang: r.ruang ?? null,
      waliKelasId: r.waliKelasId ?? null,
      statusAktif: r.statusAktif ?? true,
    }));
    await this.kelasRepository.save(records);
    return records.length;
  }
}
