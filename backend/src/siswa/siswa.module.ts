import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Siswa } from '../database/entities/entities/Siswa';

import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Siswa]),
  ],
  controllers: [SiswaController],
  providers: [SiswaService],
})
export class SiswaModule {}