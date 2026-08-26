import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Kelas } from '../database/entities/entities/Kelas';
import { SiswaKelas } from '../database/entities/entities/SiswaKelas';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';
import { Guru } from '../database/entities/entities/Guru';
import { Siswa } from '../database/entities/entities/Siswa';

import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kelas,
      SiswaKelas,
      TahunAjaran,
      Guru,
      Siswa,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
