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
import type { JwtPayload } from '../auth/types/jwt-payload';

import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { AssignStudentsDto, RemoveStudentDto } from './dto/assign-student.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(
    @Body() createClassDto: CreateClassDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.create(createClassDto, user?.sub);
  }

  @Get()
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.update(id, updateClassDto, user?.sub);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.remove(id, user?.sub);
  }

  // =========================================================
  // MANAJEMEN SISWA KELAS
  // =========================================================

  @Post(':id/students')
  assignStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.assignStudents(id, dto, user?.sub);
  }

  @Get(':id/students')
  getClassStudents(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.getClassStudents(id);
  }

  @Delete(':id/students/:siswaId')
  removeStudentFromClass(
    @Param('id', ParseIntPipe) id: number,
    @Param('siswaId', ParseIntPipe) siswaId: number,
    @Body() dto: RemoveStudentDto,
  ) {
    return this.classesService.removeStudentFromClass(id, siswaId, dto);
  }
}
