import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guru } from '../database/entities/entities/Guru';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Guru master.
 */
@Injectable()
export class GuruExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.guruRepository.find();
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      kodeGuru: r.kodeGuru ?? null,
      pegawaiId: r.pegawaiId ?? null,
    }));
    const saved = await this.guruRepository.save(records);
    return saved.length;
  }
}
