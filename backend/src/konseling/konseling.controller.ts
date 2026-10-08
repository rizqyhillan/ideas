import { Controller, Get, Param, Patch, Post, Body, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { KonselingService } from './konseling.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('konseling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KonselingController {
  constructor(private readonly konselingService: KonselingService) {}

  @Get()
  findAll(@Query('siswaId') siswaId?: number) {
    if (siswaId) {
      return this.konselingService.findAllBySiswa(siswaId);
    }
    return this.konselingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.konselingService.findOne(id);
  }

  @Post()
  @Roles('admin', 'guru')
  create(@Body() body: any) {
    return this.konselingService.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'guru')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.konselingService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.konselingService.remove(id);
  }
}