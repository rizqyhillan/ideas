import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { Semester } from '../database/entities/entities/Semester';

import { SemesterExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],

  controllers: [SemesterController],

  providers: [SemesterService, SemesterExportImportService],
  exports: [SemesterService, SemesterExportImportService],
})
export class SemesterModule {}
