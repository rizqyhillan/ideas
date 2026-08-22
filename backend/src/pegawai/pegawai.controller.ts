import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Body,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { PegawaiService } from './pegawai.service';

import { QueryPegawaiDto } from './dto/query-pegawai.dto';
import { CreatePegawaiDto } from './dto/create-pegawai.dto';
import { UpdatePegawaiDto } from './dto/update-pegawai.dto';

@Controller('pegawai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PegawaiController {
  constructor(private readonly pegawaiService: PegawaiService) {}

  @Get()
  findAll(@Query() query: QueryPegawaiDto) {
    return this.pegawaiService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.pegawaiService.findById(id);
  }

  @Post()
  create(
    @Body()
    dto: CreatePegawaiDto,
  ) {
    return this.pegawaiService.create(dto);
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdatePegawaiDto,
  ) {
    return this.pegawaiService.update(id, dto);
  }
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.pegawaiService.remove(id);
  }
}
