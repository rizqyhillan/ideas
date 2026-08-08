import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { typeormConfig } from './config/typeorm.config';
import { PegawaiModule } from './pegawai/pegawai.module';
import { SiswaModule } from './siswa/siswa.module';
import { GuruModule } from './guru/guru.module';

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
  ],
})
export class AppModule {}