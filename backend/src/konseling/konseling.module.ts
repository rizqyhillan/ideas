import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KonselingController } from './konseling.controller';
import { KonselingService } from './konseling.service';
import { CatatanKonseling } from '../database/entities/entities/CatatanKonseling';
import { Siswa } from '../database/entities/entities/Siswa';
import { Guru } from '../database/entities/entities/Guru';

@Module({
  imports: [TypeOrmModule.forFeature([CatatanKonseling, Siswa, Guru])],
  controllers: [KonselingController],
  providers: [KonselingService],
  exports: [KonselingService],
})
export class KonselingModule {}