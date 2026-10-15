import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const roles = (user.userRoles2 || []).map((item: any) => item.role?.code).filter(Boolean);
    // Database lama memakai super_admin, sedangkan kode baru memakai admin.
    // Keduanya harus memiliki perilaku otorisasi yang sama.
    const normalizedRoles = roles.includes('super_admin') ? [...roles, 'admin'] : roles;

    return requiredRoles.some((role) => normalizedRoles.includes(role));
  }
}
