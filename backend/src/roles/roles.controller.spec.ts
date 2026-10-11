import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: Partial<Record<keyof RolesService, jest.Mock>>;

  const mockResponse = {
    success: true,
    message: 'Success',
    data: { id: 1, code: 'admin', name: 'Admin', isSystem: true },
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({
        success: true,
        message: 'Success',
        data: [mockResponse.data],
      }),
      findOne: jest.fn().mockResolvedValue(mockResponse),
      create: jest.fn().mockResolvedValue(mockResponse),
      update: jest.fn().mockResolvedValue(mockResponse),
      remove: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
      getRolePermissions: jest.fn().mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
      }),
      assignPermission: jest.fn().mockResolvedValue({
        success: true,
        message: 'Assigned',
      }),
      removePermission: jest.fn().mockResolvedValue({
        success: true,
        message: 'Removed',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all roles', async () => {
    const result = await controller.findAll();
    expect(result.data).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one role', async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockResponse);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should create role', async () => {
    const dto = { code: 'admin', name: 'Admin' };
    const result = await controller.create(dto);
    expect(result).toEqual(mockResponse);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update role', async () => {
    const dto = { name: 'Administrator' };
    const result = await controller.update(1, dto);
    expect(result).toEqual(mockResponse);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove role', async () => {
    const result = await controller.remove(1);
    expect(result.success).toBe(true);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should get role permissions', async () => {
    const result = await controller.getRolePermissions(1);
    expect(result.success).toBe(true);
    expect(service.getRolePermissions).toHaveBeenCalledWith(1);
  });

  it('should assign permission', async () => {
    const result = await controller.assignPermission(1, 2);
    expect(result.success).toBe(true);
    expect(service.assignPermission).toHaveBeenCalledWith(1, 2);
  });

  it('should remove permission', async () => {
    const result = await controller.removePermission(1, 2);
    expect(result.success).toBe(true);
    expect(service.removePermission).toHaveBeenCalledWith(1, 2);
  });
});
