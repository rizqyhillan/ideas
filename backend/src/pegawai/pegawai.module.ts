import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pegawai } from '../database/entities/entities/Pegawai';

import { PegawaiController } from './pegawai.controller';
import { PegawaiService } from './pegawai.service';
import { PegawaiExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pegawai])],

  controllers: [PegawaiController],

  providers: [PegawaiService, PegawaiExportImportService],

  exports: [PegawaiService, PegawaiExportImportService],
})
export class PegawaiModule {}
