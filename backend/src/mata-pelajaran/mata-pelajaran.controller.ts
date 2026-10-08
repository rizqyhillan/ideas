import { Controller, Get, Param, Patch, Post, Body, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MataPelajaranService } from './mata-pelajaran.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('mata-pelajaran')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MataPelajaranController {
  constructor(private readonly mataPelajaranService: MataPelajaranService) {}

  @Get()
  findAll() {
    return this.mataPelajaranService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mataPelajaranService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: any) {
    return this.mataPelajaranService.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.mataPelajaranService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mataPelajaranService.remove(id);
  }
}