import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const permissions = new Set<string>();

    /**
     * Permission dari Role
     */
    user.userRoles2?.forEach((userRole: any) => {
      userRole.role?.rolePermissions?.forEach((rolePermission: any) => {
        permissions.add(rolePermission.permission.code);
      });
    });

    /**
     * Permission langsung ke User
     */
    user.userPermissions2?.forEach((userPermission: any) => {
      if (userPermission.isAllowed) {
        permissions.add(userPermission.permission.code);
      }
    });

    const hasPermission = requiredPermissions.every((permission) =>
      permissions.has(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki permission.');
    }

    return true;
  }
}
