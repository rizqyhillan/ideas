import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guru } from '../database/entities/entities/Guru';
import { JadwalPiket } from '../database/entities/entities/JadwalPiket';
import { JadwalPiketGuru } from '../database/entities/entities/JadwalPiketGuru';
import { Semester } from '../database/entities/entities/Semester';
import { NotificationsModule } from '../notifications/notifications.module';
import { JadwalPiketController } from './jadwal-piket.controller';
import { JadwalPiketService } from './jadwal-piket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JadwalPiket, JadwalPiketGuru, Semester, Guru]),
    NotificationsModule,
  ],
  controllers: [JadwalPiketController],
  providers: [JadwalPiketService],
})
export class JadwalPiketModule {}
