import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Roles } from '../database/entities/entities/Roles';
import { Permissions } from '../database/entities/entities/Permissions';
import { RolePermissions } from '../database/entities/entities/RolePermissions';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,

    @InjectRepository(RolePermissions)
    private readonly rolePermissionsRepository: Repository<RolePermissions>,
  ) {}

  async findAll() {
    const data = await this.rolesRepository.find({
      order: { id: 'ASC' },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    return {
      success: true,
      message: 'Roles retrieved successfully',
      data,
    };
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role dengan ID ${id} tidak ditemukan`);
    }

    return {
      success: true,
      message: 'Role retrieved successfully',
      data: role,
    };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.rolesRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Role dengan kode "${dto.code}" sudah ada`);
    }

    const role = this.rolesRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      isSystem: dto.isSystem ?? false,
    });

    const saved = await this.rolesRepository.save(role);

    return {
      success: true,
      message: 'Role berhasil dibuat',
      data: saved,
    };
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.rolesRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role dengan ID ${id} tidak ditemukan`);
    }

    if (dto.code && dto.code !== role.code) {
      const existing = await this.rolesRepository.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Role dengan kode "${dto.code}" sudah ada`);
      }
    }

    Object.assign(role, dto);
    const updated = await this.rolesRepository.save(role);

    return {
      success: true,
      message: 'Role berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: number) {
    const role = await this.rolesRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role dengan ID ${id} tidak ditemukan`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Role sistem tidak dapat dihapus');
    }

    await this.rolesRepository.remove(role);

    return {
      success: true,
      message: 'Role berhasil dihapus',
    };
  }

  // ==========================================
  // PERMISSIONS MANAGEMENT PER ROLE
  // ==========================================

  async getRolePermissions(roleId: number) {
    await this.findOne(roleId);

    const rolePerms = await this.rolePermissionsRepository.find({
      where: { roleId },
      relations: {
        permission: true,
      },
      order: {
        permission: {
          module: 'ASC',
          action: 'ASC',
        },
      },
    });

    const permissions = rolePerms.map((rp) => rp.permission).filter(Boolean);

    return {
      success: true,
      message: 'Role permissions retrieved successfully',
      data: permissions,
    };
  }

  async updateRolePermissions(roleId: number, permissionIds: number[]) {
    await this.findOne(roleId);

    // Hapus seluruh permission lama untuk role ini
    await this.rolePermissionsRepository.delete({ roleId });

    // Tambahkan permission yang baru jika ada
    if (permissionIds && permissionIds.length > 0) {
      const distinctIds = Array.from(new Set(permissionIds));
      const entities = distinctIds.map((permissionId) =>
        this.rolePermissionsRepository.create({
          roleId,
          permissionId,
        }),
      );
      await this.rolePermissionsRepository.save(entities);
    }

    return this.getRolePermissions(roleId);
  }

  async assignPermission(roleId: number, permissionId: number) {
    await this.findOne(roleId);

    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(`Permission dengan ID ${permissionId} tidak ditemukan`);
    }

    const existing = await this.rolePermissionsRepository.findOne({
      where: { roleId, permissionId },
    });
    if (existing) {
      return {
        success: true,
        message: 'Permission sudah dimiliki oleh role ini',
      };
    }

    const rolePerm = this.rolePermissionsRepository.create({
      roleId,
      permissionId,
    });
    await this.rolePermissionsRepository.save(rolePerm);

    return {
      success: true,
      message: 'Permission berhasil ditambahkan ke role',
    };
  }

  async removePermission(roleId: number, permissionId: number) {
    const rolePerm = await this.rolePermissionsRepository.findOne({
      where: { roleId, permissionId },
    });

    if (!rolePerm) {
      throw new NotFoundException('Permission tidak terasosiasi dengan role ini');
    }

    await this.rolePermissionsRepository.remove(rolePerm);

    return {
      success: true,
      message: 'Permission berhasil dicabut dari role',
    };
  }

  // ==========================================
  // GLOBAL PERMISSIONS CATALOG
  // ==========================================

  async findAllPermissions(module?: string) {
    const where: any = {};
    if (module) {
      where.module = module;
    }

    const permissions = await this.permissionsRepository.find({
      where,
      order: { module: 'ASC', action: 'ASC' },
    });

    return {
      success: true,
      message: 'Permissions catalog retrieved successfully',
      data: permissions,
    };
  }

  async findOnePermission(id: number) {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission dengan ID ${id} tidak ditemukan`);
    }

    return {
      success: true,
      message: 'Permission retrieved successfully',
      data: permission,
    };
  }
}
