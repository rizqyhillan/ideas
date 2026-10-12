import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';

import { TahunAjaranController } from './tahun-ajaran.controller';
import { TahunAjaranService } from './tahun-ajaran.service';
import { TahunAjaranExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([TahunAjaran])],

  controllers: [TahunAjaranController, ExportImportController],

  providers: [TahunAjaranService, TahunAjaranExportImportService, { provide: EXPORT_IMPORT_SERVICE, useClass: TahunAjaranExportImportService }, PdfService],
})
export class TahunAjaranModule {}
