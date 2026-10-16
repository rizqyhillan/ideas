import { ForbiddenException } from '@nestjs/common';

import { PermissionsGuard } from './permissions.guard';
import { RolesGuard } from './roles.guard';

function contextWithUser(user: unknown) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
}

describe('authorization guards', () => {
  it('treats super_admin as an admin role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    };
    const guard = new RolesGuard(reflector as any);

    expect(
      guard.canActivate(
        contextWithUser({ userRoles2: [{ role: { code: 'super_admin' } }] }),
      ),
    ).toBe(true);
  });

  it('permits an aliased permission granted through a role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['classes.view']),
    };
    const guard = new PermissionsGuard(reflector as any);

    expect(
      guard.canActivate(
        contextWithUser({
          userRoles2: [
            {
              role: {
                code: 'guru',
                rolePermissions: [{ permission: { code: 'kelas.list' } }],
              },
            },
          ],
          userPermissions2: [],
        }),
      ),
    ).toBe(true);
  });

  it('rejects a request without the required permission', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['users.delete']),
    };
    const guard = new PermissionsGuard(reflector as any);

    expect(() =>
      guard.canActivate(
        contextWithUser({ userRoles2: [], userPermissions2: [] }),
      ),
    ).toThrow(ForbiddenException);
  });
});
