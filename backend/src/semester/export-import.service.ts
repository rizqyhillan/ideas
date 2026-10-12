import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Semester } from '../database/entities/entities/Semester';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Semester master.
 */
@Injectable()
export class SemesterExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.semesterRepository.find();
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      tahunAjaranId: r.tahunAjaranId ?? null,
      jenis: r.jenis ?? null,
      tanggalMulai: r.tanggalMulai ?? null,
      tanggalSelesai: r.tanggalSelesai ?? null,
      isActive: r.isActive ?? true,
    }));
    await this.semesterRepository.save(records);
    return records.length;
  }
}
