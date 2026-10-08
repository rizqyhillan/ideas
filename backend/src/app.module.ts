import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { typeormConfig } from './config/typeorm.config';
import { PegawaiModule } from './pegawai/pegawai.module';
import { SiswaModule } from './siswa/siswa.module';
import { GuruModule } from './guru/guru.module';
import { TahunAjaranModule } from './tahun-ajaran/tahun-ajaran.module';
import { ClassesModule } from './classes/classes.module';
import { AbsensiModule } from './absensi/absensi.module';
import { SemesterModule } from './semester/semester.module';
import { MataPelajaranModule } from './mata-pelajaran/mata-pelajaran.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { KonselingModule } from './konseling/konseling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeormConfig),

    UsersModule,

    AuthModule,

    PegawaiModule,

    SiswaModule,

    GuruModule,

    TahunAjaranModule,

    ClassesModule,
    AbsensiModule,
    SemesterModule,
    MataPelajaranModule,
    JadwalModule,
    KonselingModule,
  ],
})
export class AppModule {}
