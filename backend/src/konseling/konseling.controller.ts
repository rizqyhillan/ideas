import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { KonselingService } from './konseling.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('konseling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KonselingController {
  constructor(private readonly konselingService: KonselingService) {}

  @Get()
  @Roles('admin', 'guru_bk', 'bk', 'siswa')
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('siswaId') siswaId?: string,
    @Query('guruBkId') guruBkId?: string,
    @Query('visibilitas') visibilitas?: string,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
  ) {
    return this.konselingService.findAllWithFilter({
      user,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      siswaId: siswaId ? Number(siswaId) : undefined,
      guruBkId: guruBkId ? Number(guruBkId) : undefined,
      visibilitas,
      tanggalAwal,
      tanggalAkhir,
    });
  }

  @Get(':id')
  @Roles('admin', 'guru_bk', 'bk', 'siswa')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.konselingService.findOneSecure(id, user);
  }

  @Post()
  @Roles('admin', 'guru_bk', 'bk')
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.konselingService.createSecure(body, user);
  }

  @Patch(':id')
  @Roles('admin', 'guru_bk', 'bk')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.konselingService.updateSecure(id, body, user);
  }

  @Delete(':id')
  @Roles('admin', 'guru_bk', 'bk')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.konselingService.remove(id);
  }
}
