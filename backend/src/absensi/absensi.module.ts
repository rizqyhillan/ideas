import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsensiSesi } from '../database/entities/entities/AbsensiSesi';
import { AbsensiSesiItem } from '../database/entities/entities/AbsensiSesiItem';
import { AbsensiController } from './absensi.controller';
import { AbsensiService } from './absensi.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AbsensiSesi, AbsensiSesiItem]),
  ],
  controllers: [AbsensiController],
  providers: [AbsensiService],
  exports: [AbsensiService],
})
export class AbsensiModule {}
