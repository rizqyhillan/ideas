import { ConflictException, ForbiddenException } from '@nestjs/common';

import { AbsensiSesi } from '../database/entities/entities/AbsensiSesi';
import { AbsensiSesiItem } from '../database/entities/entities/AbsensiSesiItem';
import { AbsensiService } from './absensi.service';

describe('AbsensiService session ownership', () => {
  let sessionRepo: any;
  let itemRepo: any;
  let service: AbsensiService;
  let existingSession: any;

  beforeEach(() => {
    existingSession = {
      id: 41,
      kelasId: 5,
      guruId: 99,
      tanggal: '2026-10-16',
      jamKe: '1',
      mataPelajaran: 'Matematika',
    };
    const existingSessionQuery = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockImplementation(() => existingSession),
    };
    const membershipQuery = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ siswaId: 13 }]),
    };
    const managedSessionRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(existingSessionQuery),
      save: jest.fn(),
      create: jest.fn(),
    };
    itemRepo = { delete: jest.fn(), create: jest.fn(), save: jest.fn() };
    sessionRepo = {
      manager: {
        transaction: jest.fn(async (callback: any) =>
          callback({
            getRepository: (entity: unknown) =>
              entity === AbsensiSesi ? managedSessionRepo : itemRepo,
          }),
        ),
      },
    };
    const guruRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 2 }),
      }),
    };

    service = new AbsensiService(
      sessionRepo,
      itemRepo,
      { findOne: jest.fn().mockResolvedValue({ id: 5, waliKelasId: 2 }) },
      guruRepo,
      {},
      {},
      {},
      { createQueryBuilder: jest.fn().mockReturnValue(membershipQuery) },
      {} as any,
    );
  });

  it('prevents a teacher from replacing another teacher’s attendance session', async () => {
    await expect(
      service.create(
        {
          kelasId: 5,
          tanggal: '2026-10-16',
          jamKe: '1',
          items: [{ siswaId: 13, status: 'hadir' }],
        },
        { id: 7, userRoles2: [{ role: { code: 'guru' } }] },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(itemRepo.delete).not.toHaveBeenCalled();
  });

  it('prevents a teacher from replacing a session with a different subject', async () => {
    existingSession.guruId = 2;

    await expect(
      service.create(
        {
          kelasId: 5,
          tanggal: '2026-10-16',
          jamKe: '1',
          mataPelajaran: 'Bahasa Indonesia',
          items: [{ siswaId: 13, status: 'hadir' }],
        },
        { id: 7, userRoles2: [{ role: { code: 'guru' } }] },
      ),
    ).rejects.toThrow(ConflictException);

    expect(itemRepo.delete).not.toHaveBeenCalled();
  });
});
