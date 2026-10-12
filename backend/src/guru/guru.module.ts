import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Guru } from '../database/entities/entities/Guru';
import { Pegawai } from '../database/entities/entities/Pegawai';

import { GuruController } from './guru.controller';
import { GuruService } from './guru.service';
import { GuruExportImportService } from './export-import.service';
import { PegawaiExportImportService } from '../pegawai/export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guru, Pegawai])],

  controllers: [GuruController, ExportImportController],

  providers: [GuruService, GuruExportImportService, PegawaiExportImportService, { provide: EXPORT_IMPORT_SERVICE, useClass: GuruExportImportService }, PdfService],

  exports: [GuruService],
})
export class GuruModule {}
