import { Controller, Get, Post, Body, Query, UseGuards, Res, Req } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AbsensiService } from './absensi.service';
import { CreateAbsensiSesiDto } from './dto/create-absensi-sesi.dto';

@Controller('absensi')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('admin', 'guru', 'siswa')
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post('siswa')
  @Roles('admin', 'guru')
  @Permissions('absensi.create')
  create(@Req() req: any, @Body() dto: CreateAbsensiSesiDto) {
    return this.absensiService.create(dto, req.user);
  }

  @Get('unattended')
  @Permissions('absensi.list')
  getUnattendedClasses(@Req() req: any, @Query('tanggal') tanggal: string) {
    const targetDate = tanggal || new Date().toISOString().split('T')[0];
    return this.absensiService.getUnattendedClasses(targetDate, req.user);
  }

  @Get('siswa')
  @Permissions('absensi.list')
  findOne(
    @Req() req: any,
    @Query('kelasId') kelasId: string,
    @Query('tanggal') tanggal: string,
    @Query('jamKe') jamKe?: string,
  ) {
    if (!kelasId || !tanggal) {
      return { message: 'klasId dan tanggal wajib diisi' };
    }
    return this.absensiService.findByKelasAndTanggal(
      Number(kelasId),
      tanggal,
      jamKe,
      req.user,
    );
  }

  @Get('export/excel')
  @Permissions('laporan.absensi')
  async exportExcel(
    @Req() req: any,
    @Res() res: Response,
    @Query('kelasId') kelasId?: string,
    @Query('guruId') guruId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.absensiService.exportExcel({
      kelasId: kelasId ? Number(kelasId) : undefined,
      guruId: guruId ? Number(guruId) : undefined,
      startDate,
      endDate,
    }, req.user);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="laporan-absensi-${Date.now()}.xlsx"`,
      'Content-Length': String(buffer.length),
    });
    return res.end(buffer);
  }

  @Get('export/pdf')
  @Permissions('laporan.absensi')
  async exportPdf(
    @Req() req: any,
    @Res() res: Response,
    @Query('kelasId') kelasId?: string,
    @Query('guruId') guruId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const buffer = await this.absensiService.exportPdf({
      kelasId: kelasId ? Number(kelasId) : undefined,
      guruId: guruId ? Number(guruId) : undefined,
      startDate,
      endDate,
    }, req.user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="laporan-absensi-${Date.now()}.pdf"`,
      'Content-Length': String(buffer.length),
    });
    return res.end(buffer);
  }

  @Get()
  @Permissions('absensi.list')
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('kelasId') kelasId?: string,
    @Query('tanggal') tanggal?: string,
  ) {
    return this.absensiService.getAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      kelasId: kelasId ? Number(kelasId) : undefined,
      tanggal,
    }, req.user);
  }
}
