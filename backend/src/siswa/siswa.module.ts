import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Siswa } from '../database/entities/entities/Siswa';
import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa.service';
import { SiswaExportImportService } from './export-import.service';

@Module({
  imports: [TypeOrmModule.forFeature([Siswa])],
  controllers: [SiswaController],
  providers: [SiswaService, SiswaExportImportService],
  exports: [SiswaService, SiswaExportImportService],
})
export class SiswaModule {}
