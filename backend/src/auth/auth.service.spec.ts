import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let usersService: any;
  let jwtService: any;
  let service: AuthService;

  beforeEach(() => {
    usersService = {
      findByLoginIdentifier: jest.fn(),
      updateLastLogin: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };
    service = new AuthService(usersService, jwtService);
  });

  it('rejects an inactive account before issuing a token', async () => {
    usersService.findByLoginIdentifier.mockResolvedValue({ status: 'nonaktif' });

    await expect(
      service.login({ email: 'user@example.test', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('issues a token and returns roles and permissions for a valid account', async () => {
    const passwordHash = await bcrypt.hash('password', 4);
    const user = {
      id: 4,
      username: 'guru-1',
      email: 'guru@example.test',
      status: 'aktif',
      passwordHash,
      deletedAt: null,
      pegawai: { namaLengkap: 'Guru Satu', noTelepon: null, nip: 'G-1' },
      siswa: null,
      userRoles2: [
        {
          role: {
            code: 'guru',
            rolePermissions: [{ permission: { code: 'absensi.create' } }],
          },
        },
      ],
      userPermissions2: [],
    };
    usersService.findByLoginIdentifier.mockResolvedValue(user);
    usersService.findById.mockResolvedValue(user);

    await expect(
      service.login({ email: user.email, password: 'password' }),
    ).resolves.toMatchObject({
      accessToken: 'signed-token',
      user: {
        id: 4,
        roles: ['guru'],
        permissions: ['absensi.create'],
      },
    });
    expect(usersService.updateLastLogin).toHaveBeenCalledWith(4);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 4, username: 'guru-1' }),
    );
  });
});
