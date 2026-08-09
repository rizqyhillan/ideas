import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { username, password } = dto;

    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    if (user.status !== 'aktif') {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Username atau password salah');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = {
      sub: user.id,
      username: user.username,
      status: user.status,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { passwordHash, deletedAt, ...userData } = user;

    return {
      accessToken,
      user: userData,
    };
  }

  async me(userId: number) {
  const user = await this.usersService.findById(userId);

  if (!user) {
    throw new UnauthorizedException('User tidak ditemukan');
  }

  const { passwordHash, deletedAt, ...userData } = user;

  return userData;
}
}