import { Controller, Get, Param, Patch, Post, Body, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('semester')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get()
  findAll() {
    return this.semesterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.semesterService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() body: any) {
    return this.semesterService.create(body);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.semesterService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.semesterService.remove(id);
  }
}