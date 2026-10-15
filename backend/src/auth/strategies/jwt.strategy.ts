import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status !== 'aktif') {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    // Passport places this return value in `request.user`. The rest of the
    // application uses the JWT shape (`sub`) while permission guards also
    // need the loaded role/permission relations. Keep both available.
    return Object.assign(user, {
      sub: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
    });
  }
}
