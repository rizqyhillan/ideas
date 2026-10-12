import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Siswa } from '../database/entities/entities/Siswa';
import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa.service';
import { SiswaExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { ExportImportService, EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Siswa])],
  controllers: [SiswaController, ExportImportController],
  providers: [
    SiswaService,
    SiswaExportImportService,
    {
      provide: EXPORT_IMPORT_SERVICE,
      useClass: SiswaExportImportService,
    },
    PdfService,
  ],
})
export class SiswaModule {}
