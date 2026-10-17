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

import { SiswaService } from './siswa.service';
import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { QuerySiswaDto } from './dto/query-siswa.dto';

@Controller('siswa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateSiswaDto) {
    return this.siswaService.create(dto);
  }

  @Get()
  @Roles('admin', 'guru', 'guru_bk')
  findAll(@Query() query: QuerySiswaDto) {
    return this.siswaService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'guru', 'guru_bk')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.siswaService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() dto: UpdateSiswaDto,
  ) {
    return this.siswaService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.siswaService.remove(id);
  }
}
