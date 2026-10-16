import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsensiSesi } from '../database/entities/entities/AbsensiSesi';
import { AbsensiSesiItem } from '../database/entities/entities/AbsensiSesiItem';
import { Kelas } from '../database/entities/entities/Kelas';
import { Guru } from '../database/entities/entities/Guru';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';
import { JadwalPiketGuru } from '../database/entities/entities/JadwalPiketGuru';
import { Siswa } from '../database/entities/entities/Siswa';
import { SiswaKelas } from '../database/entities/entities/SiswaKelas';
import { AbsensiController } from './absensi.controller';
import { AbsensiService } from './absensi.service';
import { PdfService } from '../common/export/pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AbsensiSesi,
      AbsensiSesiItem,
      Kelas,
      Guru,
      JadwalPelajaran,
      JadwalPiketGuru,
      Siswa,
      SiswaKelas,
    ]),
  ],
  controllers: [AbsensiController],
  providers: [AbsensiService, PdfService],
  exports: [AbsensiService],
})
export class AbsensiModule {}
