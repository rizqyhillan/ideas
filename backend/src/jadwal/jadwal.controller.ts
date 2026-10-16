import { Controller, Get, Param, Patch, Post, Body, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('jadwal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Get()
  findAll(
    @CurrentUser() user?: any,
    @Query('search') search?: string,
    @Query('kelasId') kelasId?: string,
    @Query('guruId') guruId?: string,
    @Query('mataPelajaranId') mataPelajaranId?: string,
    @Query('hari') hari?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.jadwalService.findAll(user, {
      search,
      kelasId: kelasId ? Number(kelasId) : undefined,
      guruId: guruId ? Number(guruId) : undefined,
      mataPelajaranId: mataPelajaranId ? Number(mataPelajaranId) : undefined,
      hari,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: any) {
    return this.jadwalService.findOne(id, user);
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
