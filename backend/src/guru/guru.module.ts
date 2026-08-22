import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Guru } from '../database/entities/entities/Guru';
import { Pegawai } from '../database/entities/entities/Pegawai';

import { GuruController } from './guru.controller';
import { GuruService } from './guru.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guru, Pegawai])],

  controllers: [GuruController],

  providers: [GuruService],

  exports: [GuruService],
})
export class GuruModule {}
