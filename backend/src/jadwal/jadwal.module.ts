import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JadwalController } from './jadwal.controller';
import { JadwalService } from './jadwal.service';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';

import { JadwalExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([JadwalPelajaran])],

  controllers: [JadwalController],

  providers: [JadwalService, JadwalExportImportService],
  exports: [JadwalService, JadwalExportImportService],
})
export class JadwalModule {}
