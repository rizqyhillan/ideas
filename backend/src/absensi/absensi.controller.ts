import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AbsensiService } from './absensi.service';
import { CreateAbsensiSesiDto } from './dto/create-absensi-sesi.dto';

@Controller('absensi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post('siswa')
  create(@Body() dto: CreateAbsensiSesiDto) {
    return this.absensiService.create(dto);
  }

  @Get('siswa')
  findOne(
    @Query('kelasId') kelasId: string,
    @Query('tanggal') tanggal: string,
  ) {
    if (!kelasId || !tanggal) {
      return { message: 'klasId dan tanggal wajib diisi' };
    }
    return this.absensiService.findByKelasAndTanggal(
      Number(kelasId),
      tanggal,
    );
  }

  @Get()
  findAll(
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
    });
  }
}
