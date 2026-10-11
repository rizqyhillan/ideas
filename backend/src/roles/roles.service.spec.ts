import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { RolesService } from './roles.service';
import { Roles } from '../database/entities/entities/Roles';
import { Permissions } from '../database/entities/entities/Permissions';
import { RolePermissions } from '../database/entities/entities/RolePermissions';

describe('RolesService', () => {
  let service: RolesService;
  let rolesRepo: Partial<Record<keyof Repository<Roles>, jest.Mock>>;
  let permissionsRepo: Partial<Record<keyof Repository<Permissions>, jest.Mock>>;
  let rolePermissionsRepo: Partial<Record<keyof Repository<RolePermissions>, jest.Mock>>;

  const mockRole: any = {
    id: 1,
    code: 'admin',
    name: 'Admin',
    description: 'Administrator role',
    isSystem: true,
    rolePermissions: [],
  };

  const mockPermission: any = {
    id: 1,
    code: 'dashboard.view',
    module: 'dashboard',
    action: 'view',
    description: 'View dashboard',
  };

  beforeEach(async () => {
    rolesRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    permissionsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    rolePermissionsRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Roles), useValue: rolesRepo },
        { provide: getRepositoryToken(Permissions), useValue: permissionsRepo },
        { provide: getRepositoryToken(RolePermissions), useValue: rolePermissionsRepo },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      rolesRepo.find!.mockResolvedValue([mockRole]);
      const result = await service.findAll();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      rolesRepo.findOne!.mockResolvedValue(mockRole);
      const result = await service.findOne(1);
      expect(result.success).toBe(true);
      expect(result.data.code).toBe('admin');
    });

    it('should throw NotFoundException if role not found', async () => {
      rolesRepo.findOne!.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if code exists', async () => {
      rolesRepo.findOne!.mockResolvedValue(mockRole);
      await expect(
        service.create({ code: 'admin', name: 'Admin' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new role', async () => {
      rolesRepo.findOne!.mockResolvedValue(null);
      rolesRepo.create!.mockReturnValue(mockRole);
      rolesRepo.save!.mockResolvedValue(mockRole);

      const result = await service.create({ code: 'admin', name: 'Admin' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRole);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if isSystem is true', async () => {
      rolesRepo.findOne!.mockResolvedValue({ ...mockRole, isSystem: true });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should remove custom role', async () => {
      rolesRepo.findOne!.mockResolvedValue({ ...mockRole, isSystem: false });
      rolesRepo.remove!.mockResolvedValue(mockRole);

      const result = await service.remove(1);
      expect(result.success).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions assigned to role', async () => {
      rolesRepo.findOne!.mockResolvedValue(mockRole);
      rolePermissionsRepo.find!.mockResolvedValue([
        { roleId: 1, permissionId: 1, permission: mockPermission },
      ]);

      const result = await service.getRolePermissions(1);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockPermission]);
    });
  });

  describe('updateRolePermissions', () => {
    it('should bulk update permissions for a role', async () => {
      rolesRepo.findOne!.mockResolvedValue(mockRole);
      rolePermissionsRepo.delete!.mockResolvedValue({});
      rolePermissionsRepo.create!.mockReturnValue({ roleId: 1, permissionId: 1 });
      rolePermissionsRepo.save!.mockResolvedValue([]);
      rolePermissionsRepo.find!.mockResolvedValue([
        { roleId: 1, permissionId: 1, permission: mockPermission },
      ]);

      const result = await service.updateRolePermissions(1, [1]);
      expect(result.success).toBe(true);
      expect(rolePermissionsRepo.delete).toHaveBeenCalledWith({ roleId: 1 });
      expect(rolePermissionsRepo.save).toHaveBeenCalled();
    });
  });

  describe('assignPermission', () => {
    it('should assign permission to role', async () => {
      rolesRepo.findOne!.mockResolvedValue(mockRole);
      permissionsRepo.findOne!.mockResolvedValue(mockPermission);
      rolePermissionsRepo.findOne!.mockResolvedValue(null);
      rolePermissionsRepo.create!.mockReturnValue({ roleId: 1, permissionId: 1 });
      rolePermissionsRepo.save!.mockResolvedValue({ roleId: 1, permissionId: 1 });

      const result = await service.assignPermission(1, 1);
      expect(result.success).toBe(true);
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role', async () => {
      rolePermissionsRepo.findOne!.mockResolvedValue({ roleId: 1, permissionId: 1 });
      rolePermissionsRepo.remove!.mockResolvedValue({});

      const result = await service.removePermission(1, 1);
      expect(result.success).toBe(true);
    });
  });

  describe('findAllPermissions', () => {
    it('should return all permissions', async () => {
      permissionsRepo.find!.mockResolvedValue([mockPermission]);
      const result = await service.findAllPermissions();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });
});
