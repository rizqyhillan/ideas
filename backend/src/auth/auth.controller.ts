import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from './types/jwt-payload';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUser()
    user: JwtPayload & { id?: number },
  ) {
    // `request.user` is enriched by JwtStrategy and supports both the JWT
    // identifier (`sub`) and the database entity identifier (`id`). The
    // fallback keeps this endpoint safe during upgrades from the old guard.
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new UnauthorizedException('Sesi login tidak valid');
    }

    return this.authService.me(Number(userId));
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser()
    user: JwtPayload & { id?: number },
    @Body() dto: { username?: string; email?: string; namaLengkap?: string; noTelepon?: string },
  ) {
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new UnauthorizedException('Sesi login tidak valid');
    }

    return this.authService.updateProfile(Number(userId), dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser()
    user: JwtPayload & { id?: number },
    @Body()
    dto: {
      oldPassword?: string;
      currentPassword?: string;
      newPassword: string;
      confirmPassword?: string;
    },
  ) {
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new UnauthorizedException('Sesi login tidak valid');
    }

    return this.authService.changePassword(Number(userId), dto);
  }

  @Get('test-permission')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dashboard.view')
  testPermission() {
    return {
      message: 'Permission OK',
    };
  }
}
