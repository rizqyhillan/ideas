import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (user.status !== 'aktif') {
      throw new UnauthorizedException('Akun tidak aktif');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const fullUser = await this.me(user.id);

    return {
      accessToken,
      user: fullUser,
    };
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const { passwordHash, deletedAt, ...userData } = user;

    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    if (user.userRoles2) {
      for (const ur of user.userRoles2) {
        if (ur.role) {
          roles.push(ur.role.code);
          if (ur.role.code === 'admin') {
            permissionsSet.add('*');
          }
          if (ur.role.rolePermissions) {
            for (const rp of ur.role.rolePermissions) {
              if (rp.permission?.code) {
                permissionsSet.add(rp.permission.code);
              }
            }
          }
        }
      }
    }

    if (user.userPermissions2) {
      for (const up of user.userPermissions2) {
        if (up.permission?.code) {
          permissionsSet.add(up.permission.code);
        }
      }
    }

    return {
      ...userData,
      roles,
      permissions: Array.from(permissionsSet),
    };
  }
}
