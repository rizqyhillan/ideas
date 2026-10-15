import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MataPelajaranController } from './mata-pelajaran.controller';
import { MataPelajaranService } from './mata-pelajaran.service';
import { MataPelajaran } from '../database/entities/entities/MataPelajaran';

import { MataPelajaranExportImportService } from './export-import.service';
import { ExportImportController } from '../common/export/export-imports.controller';
import { EXPORT_IMPORT_SERVICE } from '../common/export/export.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([MataPelajaran])],

  controllers: [MataPelajaranController],

  providers: [MataPelajaranService, MataPelajaranExportImportService],
  exports: [MataPelajaranService, MataPelajaranExportImportService],
})
export class MataPelajaranModule {}
