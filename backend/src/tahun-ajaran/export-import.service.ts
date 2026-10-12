import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for TahunAjaran master.
 */
@Injectable()
export class TahunAjaranExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(TahunAjaran)
    private readonly taRepository: Repository<TahunAjaran>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.taRepository.find();
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      nama: r.nama ?? null,
      tanggalMulai: r.tanggalMulai ?? null,
      tanggalSelesai: r.tanggalSelesai ?? null,
      isActive: r.isActive ?? true,
    }));
    await this.taRepository.save(records);
    return records.length;
  }
}
