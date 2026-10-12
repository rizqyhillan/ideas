import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Kelas } from '../database/entities/entities/Kelas';
import { SiswaKelas } from '../database/entities/entities/SiswaKelas';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';
import { Guru } from '../database/entities/entities/Guru';
import { Siswa } from '../database/entities/entities/Siswa';

import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassesExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kelas,
      SiswaKelas,
      TahunAjaran,
      Guru,
      Siswa,
    ]),
  ],
  controllers: [ClassesController, ExportImportController],

  providers: [ClassesService, ClassesExportImportService, { provide: EXPORT_IMPORT_SERVICE, useClass: ClassesExportImportService }, PdfService],
})
export class ClassesModule {}
