import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';

import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { typeormConfig } from './config/typeorm.config';

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

    StudentsModule,

    TeachersModule,
  ],
})
export class AppModule {}