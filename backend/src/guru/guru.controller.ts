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

import { GuruService } from './guru.service';

import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { QueryGuruDto } from './dto/query-guru.dto';

@Controller('guru')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles('admin')
export class GuruController {
  constructor(
    private readonly guruService: GuruService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateGuruDto,
  ) {
    return this.guruService.create(
      dto,
    );
  }

  @Get()
  findAll(
    @Query()
    query: QueryGuruDto,
  ) {
    return this.guruService.findAll(
      query,
    );
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.guruService.findOne(
      id,
    );
  }

  @Patch(':id')
  update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateGuruDto,
  ) {
    return this.guruService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.guruService.remove(
      id,
    );
  }
}