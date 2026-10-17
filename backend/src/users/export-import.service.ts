import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Users } from '../database/entities/entities/Users';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Users master.
 */
@Injectable()
export class UsersExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    const users = await this.usersRepository.find({ where: { deletedAt: IsNull() } });
    return users.map(({ passwordHash, deletedAt, ...user }) => user);
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      username: r.username ?? null,
      email: r.email ?? null,
      password: r.password ?? null,
      role: r.role ?? null,
      status: r.status ?? null,
    }));
    await this.usersRepository.save(records);
    return records.length;
  }
}
