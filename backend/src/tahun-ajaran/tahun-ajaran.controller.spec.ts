import { Test, TestingModule } from '@nestjs/testing';
import { TahunAjaranController } from './tahun-ajaran.controller';
import { TahunAjaranService } from './tahun-ajaran.service';

describe('TahunAjaranController', () => {
  let controller: TahunAjaranController;
  let service: Partial<Record<keyof TahunAjaranService, jest.Mock>>;

  const mockResponse = {
    success: true,
    message: 'Success',
    data: {
      id: 1,
      nama: '2024/2025',
      tanggalMulai: '2024-07-01',
      tanggalSelesai: '2025-06-30',
      isActive: true,
    },
  };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockResponse),
      findAll: jest.fn().mockResolvedValue({
        success: true,
        message: 'Success',
        data: [mockResponse.data],
        meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
      }),
      getActive: jest.fn().mockResolvedValue(mockResponse),
      findOne: jest.fn().mockResolvedValue(mockResponse),
      update: jest.fn().mockResolvedValue(mockResponse),
      remove: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TahunAjaranController],
      providers: [
        {
          provide: TahunAjaranService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TahunAjaranController>(TahunAjaranController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create tahun ajaran', async () => {
    const dto = {
      nama: '2024/2025',
      tanggalMulai: '2024-07-01',
      tanggalSelesai: '2025-06-30',
    };
    const result = await controller.create(dto);
    expect(result).toEqual(mockResponse);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should find all', async () => {
    const query = { page: 1, limit: 10, sort: 'id', order: 'ASC' as const };
    const result = await controller.findAll(query);
    expect(result.data).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should get active tahun ajaran', async () => {
    const result = await controller.getActive();
    expect(result).toEqual(mockResponse);
    expect(service.getActive).toHaveBeenCalled();
  });

  it('should find one', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockResponse);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update', async () => {
    const dto = { nama: '2024/2025' };
    const result = await controller.update(1, dto);
    expect(result).toEqual(mockResponse);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove', async () => {
    const result = await controller.remove(1);
    expect(result.success).toBe(true);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
