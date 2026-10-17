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
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { GuruService } from './guru.service';

import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { QueryGuruDto } from './dto/query-guru.dto';

@Controller('guru')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuruController {
  constructor(private readonly guruService: GuruService) {}

  @Post()
  @Roles('admin')
  create(
    @Body()
    dto: CreateGuruDto,
  ) {
    return this.guruService.create(dto);
  }

  @Get()
  @Roles('admin', 'guru', 'guru_bk')
  findAll(
    @Query()
    query: QueryGuruDto,
    @CurrentUser() user?: any,
  ) {
    return user ? this.guruService.findAll(query, user) : this.guruService.findAll(query);
  }

  @Get('me')
  @Roles('guru', 'guru_bk')
  findMe(@CurrentUser() user: any) {
    return this.guruService.findByUser(user);
  }

  @Get(':id')
  @Roles('admin', 'guru', 'guru_bk')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.guruService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateGuruDto,
  ) {
    return this.guruService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.guruService.remove(id);
  }
}
