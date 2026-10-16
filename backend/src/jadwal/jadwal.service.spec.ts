import { JadwalService } from './jadwal.service';

describe('JadwalService active status contract', () => {
  let repository: any;
  let service: JadwalService;

  beforeEach(() => {
    repository = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    };
    service = new JadwalService(repository);
  });

  it('filters by the statusAktif entity column and exposes isActive to the client', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1, statusAktif: true }]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findAll(undefined, { isActive: true });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'jadwal.statusAktif = :isActive',
      { isActive: true },
    );
    expect(result.data).toEqual([{ id: 1, statusAktif: true, isActive: true }]);
  });

  it('maps isActive from the client to statusAktif before saving', async () => {
    repository.create.mockImplementation((payload: any) => payload);
    repository.save.mockImplementation(async (payload: any) => payload);

    const result = await service.create({ kelasId: 2, isActive: false });

    expect(repository.create).toHaveBeenCalledWith({
      kelasId: 2,
      statusAktif: false,
    });
    expect(result.data).toEqual({
      kelasId: 2,
      statusAktif: false,
      isActive: false,
    });
  });

  it('maps isActive from the client to statusAktif before updating', async () => {
    repository.findOne.mockResolvedValue({ id: 1, statusAktif: true });

    const result = await service.update(1, { isActive: true });

    expect(repository.update).toHaveBeenCalledWith(1, { statusAktif: true });
    expect(result.data).toEqual({ id: 1, statusAktif: true, isActive: true });
  });
});
