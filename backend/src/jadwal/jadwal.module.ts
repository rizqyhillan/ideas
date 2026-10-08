import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JadwalController } from './jadwal.controller';
import { JadwalService } from './jadwal.service';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';

@Module({
  imports: [TypeOrmModule.forFeature([JadwalPelajaran])],
  controllers: [JadwalController],
  providers: [JadwalService]
})
export class JadwalModule {}