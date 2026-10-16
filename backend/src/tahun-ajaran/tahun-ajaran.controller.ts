import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { TahunAjaranService } from './tahun-ajaran.service';
import { CreateTahunAjaranDto } from './dto/create-tahun-ajaran.dto';
import { UpdateTahunAjaranDto } from './dto/update-tahun-ajaran.dto';
import { QueryTahunAjaranDto } from './dto/query-tahun-ajaran.dto';

@Controller('tahun-ajaran')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TahunAjaranController {
  constructor(private readonly tahunAjaranService: TahunAjaranService) {}

  @Post()
  @Roles('admin')
  create(@Body() createTahunAjaranDto: CreateTahunAjaranDto) {
    return this.tahunAjaranService.create(createTahunAjaranDto);
  }

  @Get()
  @Roles('admin', 'guru', 'bk', 'guru_bk', 'siswa')
  findAll(@Query() query: QueryTahunAjaranDto) {
    return this.tahunAjaranService.findAll(query);
  }

  @Get('active')
  @Roles('admin', 'guru', 'bk', 'guru_bk', 'siswa')
  getActive() {
    return this.tahunAjaranService.getActive();
  }

  @Get(':id')
  @Roles('admin', 'guru', 'bk', 'guru_bk', 'siswa')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tahunAjaranService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTahunAjaranDto: UpdateTahunAjaranDto,
  ) {
    return this.tahunAjaranService.update(id, updateTahunAjaranDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tahunAjaranService.remove(id);
  }
}
