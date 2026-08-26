import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

describe('ClassesController', () => {
  let controller: ClassesController;
  let service: Partial<Record<keyof ClassesService, jest.Mock>>;

  const mockResponse = {
    success: true,
    message: 'Success',
    data: { id: 1, nama: 'VII-A', tingkat: 7, tahunAjaranId: 1 },
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
      findOne: jest.fn().mockResolvedValue(mockResponse),
      update: jest.fn().mockResolvedValue(mockResponse),
      remove: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
      assignStudents: jest.fn().mockResolvedValue({
        success: true,
        message: 'Assigned',
        data: [],
      }),
      getClassStudents: jest.fn().mockResolvedValue({
        success: true,
        message: 'Retrieved',
        data: [],
      }),
      removeStudentFromClass: jest.fn().mockResolvedValue({
        success: true,
        message: 'Removed',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create class', async () => {
    const dto = { tahunAjaranId: 1, nama: 'VII-A', tingkat: 7 };
    const user: any = { sub: 1 };
    const result = await controller.create(dto, user);
    expect(result).toEqual(mockResponse);
    expect(service.create).toHaveBeenCalledWith(dto, 1);
  });

  it('should find all classes', async () => {
    const query = { page: 1, limit: 10, sort: 'id', order: 'ASC' as const };
    const result = await controller.findAll(query);
    expect(result.data).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should find one class', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockResponse);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update class', async () => {
    const dto = { nama: 'VII-B' };
    const user: any = { sub: 1 };
    const result = await controller.update(1, dto, user);
    expect(result).toEqual(mockResponse);
    expect(service.update).toHaveBeenCalledWith(1, dto, 1);
  });

  it('should remove class', async () => {
    const user: any = { sub: 1 };
    const result = await controller.remove(1, user);
    expect(result.success).toBe(true);
    expect(service.remove).toHaveBeenCalledWith(1, 1);
  });

  it('should assign students', async () => {
    const dto = { siswaIds: [1, 2] };
    const user: any = { sub: 1 };
    const result = await controller.assignStudents(1, dto, user);
    expect(result.success).toBe(true);
    expect(service.assignStudents).toHaveBeenCalledWith(1, dto, 1);
  });

  it('should get class students', async () => {
    const result = await controller.getClassStudents(1);
    expect(result.success).toBe(true);
    expect(service.getClassStudents).toHaveBeenCalledWith(1);
  });

  it('should remove student from class', async () => {
    const dto = { tanggalKeluar: '2025-01-01' };
    const result = await controller.removeStudentFromClass(1, 10, dto);
    expect(result.success).toBe(true);
    expect(service.removeStudentFromClass).toHaveBeenCalledWith(1, 10, dto);
  });
});
