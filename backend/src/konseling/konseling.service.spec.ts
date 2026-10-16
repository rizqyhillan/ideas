import { ForbiddenException } from '@nestjs/common';

import { KonselingService } from './konseling.service';

describe('KonselingService student visibility', () => {
  const user = { id: 17, userRoles2: [{ role: { code: 'siswa' } }] };
  let konselingRepo: any;
  let siswaRepo: any;
  let service: KonselingService;

  beforeEach(() => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    konselingRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
    };
    siswaRepo = { findOne: jest.fn().mockResolvedValue({ id: 8 }) };
    service = new KonselingService(konselingRepo, siswaRepo, {} as any);
  });

  it('limits a student list to their own student-visible notes', async () => {
    await service.findAllWithFilter({ user });

    const queryBuilder = konselingRepo.createQueryBuilder.mock.results[0].value;
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('k.siswaId = :mySiswaId', {
      mySiswaId: 8,
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'k.visibilitas = :studentVisibility',
      { studentVisibility: 'siswa' },
    );
  });

  it('rejects a student reading their own confidential note', async () => {
    konselingRepo.findOne.mockResolvedValue({
      id: 4,
      siswaId: 8,
      visibilitas: 'rahasia',
    });

    await expect(service.findOneSecure(4, user)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows a student to read their own student-visible note', async () => {
    const note = { id: 4, siswaId: 8, visibilitas: 'siswa' };
    konselingRepo.findOne.mockResolvedValue(note);

    await expect(service.findOneSecure(4, user)).resolves.toEqual({
      success: true,
      data: note,
    });
  });
});
