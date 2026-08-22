import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

export const jwtConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],

  inject: [ConfigService],

  useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow<string>('jwt.secret'),

    signOptions: {
      expiresIn: config.getOrThrow('jwt.expiresIn'),
    },
  }),
};
