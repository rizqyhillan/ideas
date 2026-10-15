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
  UseGuards,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExportImportService } from './export.service';
import { PdfService } from './pdf.service';
import { SiswaExportImportService } from '../../siswa/export-import.service';
import { GuruExportImportService } from '../../guru/export-import.service';
import { PegawaiExportImportService } from '../../pegawai/export-import.service';
import { ClassesExportImportService } from '../../classes/export-import.service';
import { MataPelajaranExportImportService } from '../../mata-pelajaran/export-import.service';
import { TahunAjaranExportImportService } from '../../tahun-ajaran/export-import.service';
import { SemesterExportImportService } from '../../semester/export-import.service';
import { JadwalExportImportService } from '../../jadwal/export-import.service';
import { RolesExportImportService } from '../../roles/export-import.service';
import { UsersExportImportService } from '../../users/export-import.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

const SERVICE_MAP: Record<string, any> = {
  siswa: SiswaExportImportService,
  guru: GuruExportImportService,
  pegawai: PegawaiExportImportService,
  kelas: ClassesExportImportService,
  classes: ClassesExportImportService,
  'mata-pelajaran': MataPelajaranExportImportService,
  matapelajaran: MataPelajaranExportImportService,
  'tahun-ajaran': TahunAjaranExportImportService,
  tahunajaran: TahunAjaranExportImportService,
  semester: SemesterExportImportService,
  jadwal: JadwalExportImportService,
  roles: RolesExportImportService,
  role: RolesExportImportService,
  users: UsersExportImportService,
  user: UsersExportImportService,
};

/**
 * Unified export/import controller for all master modules.
 * Exposes:
 *   GET  /api/export/:master              → XLSX download
 *   GET  /api/export/:master/pdf          → PDF download
 *   POST /api/export/:master/import       → XLSX/JSON import
 */
@Controller('api/export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ExportImportController {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly pdfService: PdfService,
  ) {}

  private getService(master: string): ExportImportService {
    const key = master.toLowerCase();
    const serviceClass = SERVICE_MAP[key];
    if (!serviceClass) {
      throw new NotFoundException(`Master '${master}' tidak ditemukan atau belum didukung.`);
    }
    try {
      return this.moduleRef.get(serviceClass, { strict: false });
    } catch {
      throw new NotFoundException(`Service untuk master '${master}' tidak tersedia.`);
    }
  }

  // ------------------------------------------------------------------
  // Download XLSX
  // ------------------------------------------------------------------
  @Get(':master')
  async downloadXlsx(
    @Param('master') master: string,
    @Res() res: Response,
  ) {
    const service = this.getService(master);
    const data = await service.getAllMasterData(master);
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
    const service = this.getService(master);
    const data = await service.getAllMasterData(master);
    if (!data) {
      throw new NotFoundException(`Master '${master}' tidak ditemukan`);
    }
    const buffer = await this.pdfService.generatePdfBuffer(
      data,
      `${master}-laporan`,
      `Laporan ${master.toUpperCase()}`,
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
    if (!file && !body?.data) {
      return res.status(400).json({
        success: false,
        message: 'File atau data JSON diperlukan',
      });
    }

    let rows: any[] = [];
    if (file) {
      rows = ExportImportService.buildImportPayload(file.buffer);
    } else {
      rows = body.data || [];
    }

    const service = this.getService(master);
    const count = await service.importToMaster(master, rows);
    return res.status(200).json({
      success: true,
      message: `Berhasil import ${count} data ke master '${master}'`,
      count,
    });
  }
}
