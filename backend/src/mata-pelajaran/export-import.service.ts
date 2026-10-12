import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { MataPelajaran } from '../database/entities/entities/MataPelajaran';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for MataPelajaran master.
 */
@Injectable()
export class MataPelajaranExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(MataPelajaran)
    private readonly mpRepository: Repository<MataPelajaran>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.mpRepository.find({ where: { deletedAt: IsNull() } });
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      kode: r.kode ?? null,
      nama: r.nama ?? null,
      sig: r.sig ?? null,
      statusAktif: r.statusAktif ?? true,
    }));
    await this.mpRepository.save(records);
    return records.length;
  }
}
