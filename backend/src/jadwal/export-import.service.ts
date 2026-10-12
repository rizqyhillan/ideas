import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for JadwalPelajaran master.
 */
@Injectable()
export class JadwalExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(JadwalPelajaran)
    private readonly jadwalRepository: Repository<JadwalPelajaran>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.jadwalRepository.find({ where: { deletedAt: IsNull() } });
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      kodeMapel: r.kodeMapel ?? null,
      nip: r.nip ?? null,
      hari: r.hari ?? null,
      jamAwal: r.jamAwal ?? null,
      jamAkhir: r.jamAkhir ?? null,
      ruang: r.ruang ?? null,
      statusAktif: r.statusAktif ?? true,
    }));
    await this.jadwalRepository.save(records);
    return records.length;
  }
}
