import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Body,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { ExportImportService, EXPORT_IMPORT_SERVICE } from './export.service';
import { PdfService } from './pdf.service';

/**
 * Unified export/import controller for all master modules.
 * Exposes:
 *   GET  /api/export/:master              → XLSX download
 *   GET  /api/export/:master/pdf          → PDF download
 *   POST /api/export/:master/import       → XLSX/JSON import
 */
@Controller('api/export')
export class ExportImportController {
  constructor(
    @Inject(EXPORT_IMPORT_SERVICE)
    private readonly service: ExportImportService,
    private readonly pdfService: PdfService,
  ) {}

  // ------------------------------------------------------------------
  // Download XLSX
  // ------------------------------------------------------------------
  @Get(':master')
  async downloadXlsx(
    @Param('master') master: string,
    @Res() res: Response,
  ) {
    const data = await this.service.getAllMasterData(master);
    if (!data) {
      throw new NotFoundException(`Master '${master}' tidak ditemukan`);
    }
    const buffer = ExportImportService.toExcelBuffer(data, master);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${master}-${Date.now()}.xlsx`,
    );
    return res.send(buffer);
  }

  // ------------------------------------------------------------------
  // Download PDF
  // ------------------------------------------------------------------
  @Get(':master/pdf')
  async downloadPdf(
    @Param('master') master: string,
    @Res() res: Response,
  ) {
    const data = await this.service.getAllMasterData(master);
    if (!data) {
      throw new NotFoundException(`Master '${master}' tidak ditemukan`);
    }
    const buffer = await this.pdfService.generatePdfBuffer(
      data,
      `${master}-laporan`,
      `Laporan ${master}`,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${master}-laporan.pdf`,
    );
    return res.send(buffer);
  }

  // ------------------------------------------------------------------
  // Import XLSX file or JSON array
  // ------------------------------------------------------------------
  @Post(':master/import')
  @UseInterceptors(FileInterceptor('file'))
  async importXlsx(
    @Param('master') master: string,
    @UploadedFile() file: any,
    @Body() body: { data?: any[] },
    @Res() res: Response,
  ) {
    if (!file && !body.data) {
      return res.status(400).json({
        success: false,
        message: 'File atau data JSON diperlukan',
      });
    }

    let rows: any[] = [];

    if (file) {
      if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return res.status(400).json({
          success: false,
          message: 'File harus berformat XLSX',
        });
      }
      rows = ExportImportService.buildImportPayload(file.buffer);
    } else {
      rows = body.data || [];
    }

    const count = await this.service.importToMaster(master, rows);
    return res.status(200).json({
      success: true,
      message: `Berhasil import ${count} data ke master '${master}'`,
    });
  }
}
