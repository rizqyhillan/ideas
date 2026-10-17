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
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateJadwalPiketDto, UpdateJadwalPiketDto } from './dto/create-jadwal-piket.dto';
import { QueryJadwalPiketDto } from './dto/query-jadwal-piket.dto';
import { JadwalPiketService } from './jadwal-piket.service';

@Controller('jadwal-piket')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JadwalPiketController {
  constructor(private readonly jadwalPiketService: JadwalPiketService) {}

  @Get()
  @Roles('admin', 'guru')
  findAll(@Query() query: QueryJadwalPiketDto) {
    return this.jadwalPiketService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'guru')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jadwalPiketService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateJadwalPiketDto, @Req() req: any) {
    return this.jadwalPiketService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJadwalPiketDto,
    @Req() req: any,
  ) {
    return this.jadwalPiketService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jadwalPiketService.remove(id);
  }
}
