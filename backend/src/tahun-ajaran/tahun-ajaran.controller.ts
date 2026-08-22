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
@Roles('admin')
export class TahunAjaranController {
  constructor(private readonly tahunAjaranService: TahunAjaranService) {}

  @Post()
  create(@Body() createTahunAjaranDto: CreateTahunAjaranDto) {
    return this.tahunAjaranService.create(createTahunAjaranDto);
  }

  @Get()
  findAll(@Query() query: QueryTahunAjaranDto) {
    return this.tahunAjaranService.findAll(query);
  }

  @Get('active')
  getActive() {
    return this.tahunAjaranService.getActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tahunAjaranService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTahunAjaranDto: UpdateTahunAjaranDto,
  ) {
    return this.tahunAjaranService.update(id, updateTahunAjaranDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tahunAjaranService.remove(id);
  }
}
