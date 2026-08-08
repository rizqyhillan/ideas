import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pegawai } from '../database/entities/entities/Pegawai';

import { PegawaiController } from './pegawai.controller';
import { PegawaiService } from './pegawai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pegawai,
    ]),
  ],

  controllers: [
    PegawaiController,
  ],

  providers: [
    PegawaiService,
  ],

  exports: [
    PegawaiService,
  ],
})
export class PegawaiModule {}