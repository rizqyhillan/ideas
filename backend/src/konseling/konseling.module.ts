import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KonselingController } from './konseling.controller';
import { KonselingService } from './konseling.service';
import { CatatanKonseling } from '../database/entities/entities/CatatanKonseling';

@Module({
  imports: [TypeOrmModule.forFeature([CatatanKonseling])],
  controllers: [KonselingController],
  providers: [KonselingService]
})
export class KonselingModule {}