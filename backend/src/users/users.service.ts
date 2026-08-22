import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, IsNull, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { Users } from '../database/entities/entities/Users';
import { Roles } from '../database/entities/entities/Roles';
import { UserRoles } from '../database/entities/entities/UserRoles';

import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    @InjectRepository(UserRoles)
    private readonly userRolesRepository: Repository<UserRoles>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const usernameExists = await this.findByUsername(dto.username);

      if (usernameExists) {
        throw new BadRequestException('Username sudah digunakan');
      }

      const emailExists = await this.findByEmail(dto.email);

      if (emailExists) {
        throw new BadRequestException('Email sudah digunakan');
      }

      const role = await this.rolesRepository.findOne({
        where: {
          code: dto.role,
        },
      });

      if (!role) {
        throw new BadRequestException('Role tidak ditemukan');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = queryRunner.manager.create(Users, {
        username: dto.username,
        email: dto.email,
        passwordHash,
      });

      await queryRunner.manager.save(user);

      const userRole = queryRunner.manager.create(UserRoles, {
        userId: user.id,
        roleId: role.id,
      });

      await queryRunner.manager.save(userRole);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new BadRequestException('User tidak ditemukan');
      }

      if (dto.username && dto.username !== user.username) {
        const usernameExists = await this.findByUsername(dto.username);

        if (usernameExists) {
          throw new BadRequestException('Username sudah digunakan');
        }

        user.username = dto.username;
      }

      if (dto.email && dto.email !== user.email) {
        const emailExists = await this.findByEmail(dto.email);

        if (emailExists) {
          throw new BadRequestException('Email sudah digunakan');
        }

        user.email = dto.email;
      }

      if (dto.status) {
        user.status = dto.status;
      }

      await queryRunner.manager.save(user);

      if (dto.role) {
        const role = await this.rolesRepository.findOne({
          where: {
            code: dto.role,
          },
        });

        if (!role) {
          throw new BadRequestException('Role tidak ditemukan');
        }

        await queryRunner.manager.update(
          UserRoles,
          {
            userId: id,
          },
          {
            roleId: role.id,
          },
        );
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'User updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    if (user.deletedAt) {
      throw new BadRequestException('User sudah dihapus');
    }

    user.deletedAt = new Date();

    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
  async findAll(query: QueryUserDto) {
    const { page, limit, search, status, sort, order } = query;

    const qb = this.usersRepository.createQueryBuilder('user');

    qb.andWhere('user.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(user.username ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      qb.andWhere('user.status = :status', {
        status,
      });
    }

    qb.orderBy(`user.${sort}`, order);

    qb.skip((page - 1) * limit);

    qb.take(limit);

    const [users, total] = await qb.getManyAndCount();

    const data = users.map(({ passwordHash, deletedAt, ...user }) => user);

    return {
      success: true,

      message: 'Users retrieved successfully',

      data,

      meta: {
        page,

        limit,

        total,

        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.findById(id);

    if (!user) {
      return {
        success: false,
        message: 'User tidak ditemukan',
      };
    }

    const { passwordHash, deletedAt, ...data } = user;

    return {
      success: true,

      message: 'User retrieved successfully',

      data,
    };
  }

  async findById(id: number) {
    return this.usersRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },

      relations: {
        userRoles2: {
          role: {
            rolePermissions: {
              permission: true,
            },
          },
        },

        userPermissions2: {
          permission: true,
        },
      },
    });
  }

  async findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: {
        username,
      },
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async updateLastLogin(id: number) {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }
}
