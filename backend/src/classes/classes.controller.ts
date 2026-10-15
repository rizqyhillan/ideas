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
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('admin')
  create(
    @Body() createClassDto: CreateClassDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.create(createClassDto, user?.sub);
  }

  @Get()
  @Roles('admin', 'guru', 'bk', 'guru_bk', 'siswa')
  findAll(@Query() query: QueryClassDto, @CurrentUser() user?: JwtPayload) {
    return user ? this.classesService.findAll(query, user) : this.classesService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'guru', 'bk', 'guru_bk', 'siswa')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: JwtPayload) {
    return user ? this.classesService.findOne(id, user) : this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.update(id, updateClassDto, user?.sub);
  }

  @Delete(':id')
  @Roles('admin')
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
  @Roles('admin')
  assignStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.assignStudents(id, dto, user?.sub);
  }

  @Get(':id/students')
  @Roles('admin', 'guru', 'bk', 'guru_bk', 'siswa')
  getClassStudents(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: JwtPayload) {
    return user ? this.classesService.getClassStudents(id, user) : this.classesService.getClassStudents(id);
  }

  @Delete(':id/students/:siswaId')
  @Roles('admin')
  removeStudentFromClass(
    @Param('id', ParseIntPipe) id: number,
    @Param('siswaId', ParseIntPipe) siswaId: number,
    @Body() dto: RemoveStudentDto,
  ) {
    return this.classesService.removeStudentFromClass(id, siswaId, dto);
  }
}
