import { Module } from '@nestjs/common';
import { ExportImportController } from './export-imports.controller';
import { PdfService } from './pdf.service';

@Module({
  controllers: [ExportImportController],
  providers: [PdfService],
  exports: [PdfService],
})
export class ExportModule {}
