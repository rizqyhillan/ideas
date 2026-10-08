import { Controller, Get, Param, Patch, Post, Body, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('jadwal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Get()
  findAll() {
    return this.jadwalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jadwalService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: any) {
    return this.jadwalService.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.jadwalService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jadwalService.remove(id);
  }
}