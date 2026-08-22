import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TahunAjaran } from '../database/entities/entities/TahunAjaran';

import { TahunAjaranController } from './tahun-ajaran.controller';
import { TahunAjaranService } from './tahun-ajaran.service';

@Module({
  imports: [TypeOrmModule.forFeature([TahunAjaran])],
  controllers: [TahunAjaranController],
  providers: [TahunAjaranService],
})
export class TahunAjaranModule {}
