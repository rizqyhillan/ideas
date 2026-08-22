import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],

  inject: [ConfigService],

  useFactory: (config: ConfigService) => ({
    type: 'postgres',

    host: config.getOrThrow<string>('database.host'),

    port: config.getOrThrow<number>('database.port'),

    username: config.getOrThrow<string>('database.username'),

    password: config.getOrThrow<string>('database.password'),

    database: config.getOrThrow<string>('database.database'),

    autoLoadEntities: true,

    synchronize: false,
  }),
};
