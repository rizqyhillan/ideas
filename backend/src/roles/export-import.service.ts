import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Roles } from '../database/entities/entities/Roles';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Roles master.
 */
@Injectable()
export class RolesExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    return this.rolesRepository.find();
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      code: r.code ?? null,
      name: r.name ?? null,
      description: r.description ?? null,
      isSystem: r.isSystem ?? false,
    }));
    await this.rolesRepository.save(records);
    return records.length;
  }
}
