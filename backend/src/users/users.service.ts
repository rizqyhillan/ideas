import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { Users } from '../database/entities/entities/Users';
import { Roles } from '../database/entities/entities/Roles';
import { UserRoles } from '../database/entities/entities/UserRoles';
import { Pegawai } from '../database/entities/entities/Pegawai';
import { Siswa } from '../database/entities/entities/Siswa';
import { Guru } from '../database/entities/entities/Guru';

import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type ProvisionSource = 'guru' | 'siswa';
type ProvisionRole = 'guru' | 'guru_bk';

export interface ProvisionSummary {
  source: ProvisionSource;
  role: string;
  total: number;
  created: number;
  linked: number;
  alreadyLinked: number;
  skipped: number;
  skippedWithoutIdentifier: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    @InjectRepository(UserRoles)
    private readonly userRolesRepository: Repository<UserRoles>,

    @InjectRepository(Pegawai)
    private readonly pegawaiRepository: Repository<Pegawai>,

    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,

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
          code: this.normalizeRoleCode(dto.role),
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
            code: this.normalizeRoleCode(dto.role),
          },
        });

        if (!role) {
          throw new BadRequestException('Role tidak ditemukan');
        }

        await queryRunner.manager.delete(UserRoles, { userId: id });
        const userRole = queryRunner.manager.create(UserRoles, {
          userId: id,
          roleId: role.id,
        });
        await queryRunner.manager.save(userRole);
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

  /**
   * Create or link login accounts from the real school master data.
   *
   * This operation is intentionally idempotent: it never resets a password
   * on an existing account. NUPTK/NISN are used only as the initial password
   * for a newly-created account, so a user can safely change it afterwards.
   */
  async provisionAccounts(
    source: ProvisionSource,
    requestedRole: ProvisionRole = 'guru',
  ): Promise<{ success: true; message: string; data: ProvisionSummary }> {
    const roleCode = source === 'siswa' ? 'siswa' : this.normalizeRoleCode(requestedRole);
    if (source === 'guru' && !['guru', 'guru_bk'].includes(roleCode)) {
      throw new BadRequestException('Role provisioning guru tidak valid');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const summary: ProvisionSummary = {
      source,
      role: roleCode,
      total: 0,
      created: 0,
      linked: 0,
      alreadyLinked: 0,
      skipped: 0,
      skippedWithoutIdentifier: 0,
    };

    try {
      const manager = queryRunner.manager;
      const role = await manager.findOne(Roles, { where: { code: roleCode } });
      if (!role) {
        throw new BadRequestException(`Role '${roleCode}' tidak ditemukan`);
      }

      if (source === 'siswa') {
        const students = await manager.find(Siswa, {
          where: { deletedAt: IsNull() },
        });
        summary.total = students.length;

        for (const student of students) {
          const identifier = student.nisn?.trim();
          if (!identifier) {
            summary.skipped++;
            summary.skippedWithoutIdentifier++;
            continue;
          }

          const result = await this.provisionOneAccount(manager, {
            source,
            domain: student,
            identifier,
            email: student.email,
            status: student.statusAktif ? 'aktif' : 'nonaktif',
            roleId: role.id,
          });
          summary.created += Number(result.created);
          summary.linked += Number(result.linked);
          summary.alreadyLinked += Number(result.alreadyLinked);
          summary.skipped += Number(result.skipped);
        }
      } else {
        const teachers = await manager.find(Guru, {
          relations: { pegawai: true },
        });
        summary.total = teachers.length;

        for (const teacher of teachers) {
          const identifier = teacher.pegawai?.nuptk?.trim();
          if (!identifier) {
            summary.skipped++;
            summary.skippedWithoutIdentifier++;
            continue;
          }

          const result = await this.provisionOneAccount(manager, {
            source,
            domain: teacher.pegawai,
            identifier,
            email: teacher.pegawai.email,
            status: teacher.pegawai.statusAktif ? 'aktif' : 'nonaktif',
            roleId: role.id,
          });
          summary.created += Number(result.created);
          summary.linked += Number(result.linked);
          summary.alreadyLinked += Number(result.alreadyLinked);
          summary.skipped += Number(result.skipped);
        }
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Provisioning akun ${source} selesai`,
        data: summary,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private normalizeRoleCode(roleCode: string): string {
    return roleCode === 'bk' ? 'guru_bk' : roleCode;
  }

  private async provisionOneAccount(
    manager: EntityManager,
    options: {
      source: ProvisionSource;
      domain: Pegawai | Siswa;
      identifier: string;
      email: string | null;
      status: 'aktif' | 'nonaktif';
      roleId: number;
    },
  ): Promise<{
    created: boolean;
    linked: boolean;
    alreadyLinked: boolean;
    skipped: boolean;
  }> {
    const { domain } = options;
    let user = domain.userId
      ? await manager.findOne(Users, {
          where: { id: domain.userId },
          withDeleted: true,
        })
      : null;

    if (!user) {
      user = await manager
        .createQueryBuilder(Users, 'user')
        .withDeleted()
        .where('LOWER(user.username) = LOWER(:username)', {
          username: options.identifier,
        })
        .getOne();
    }

    if (user) {
      const otherPegawai = await manager.findOne(Pegawai, {
        where: { userId: user.id },
      });
      const otherSiswa = await manager.findOne(Siswa, {
        where: { userId: user.id },
      });
      const ownsAnotherProfile =
        (otherPegawai && (options.source !== 'guru' || otherPegawai.id !== domain.id)) ||
        (otherSiswa && (options.source !== 'siswa' || otherSiswa.id !== domain.id));
      if (ownsAnotherProfile) {
        return { created: false, linked: false, alreadyLinked: false, skipped: true };
      }
    }

    let created = false;
    if (!user) {
      let email = options.email?.trim() || null;
      if (email) {
        const emailOwner = await manager
          .createQueryBuilder(Users, 'user')
          .withDeleted()
          .where('LOWER(user.email) = LOWER(:email)', { email })
          .getOne();
        if (emailOwner) email = null;
      }

      user = manager.create(Users, {
        username: options.identifier,
        email,
        passwordHash: await bcrypt.hash(options.identifier, 10),
        status: options.status,
      });
      user = await manager.save(user);
      created = true;
    } else if (user.deletedAt) {
      user.deletedAt = null;
      await manager.save(user);
    }

    const userRoleRepository = manager.getRepository(UserRoles);
    const assignedRole = await userRoleRepository.findOne({
      where: { userId: user.id, roleId: options.roleId },
    });
    if (!assignedRole) {
      await userRoleRepository.save(
        userRoleRepository.create({ userId: user.id, roleId: options.roleId }),
      );
    }

    const wasAlreadyLinked = domain.userId === user.id;
    if (!wasAlreadyLinked) {
      (domain as Pegawai | Siswa).userId = user.id;
      if (options.source === 'guru') {
        await manager.getRepository(Pegawai).save(domain as Pegawai);
      } else {
        await manager.getRepository(Siswa).save(domain as Siswa);
      }
    }

    return {
      created,
      linked: !created && !wasAlreadyLinked,
      alreadyLinked: !created && wasAlreadyLinked,
      skipped: false,
    };
  }
  async findAll(query: QueryUserDto) {
    const { page, limit, search, status, sort, order } = query;

    const qb = this.usersRepository.createQueryBuilder('user');

    qb.leftJoinAndSelect('user.userRoles2', 'userRoles2')
      .leftJoinAndSelect('userRoles2.role', 'role');

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
        pegawai: true,
        siswa: true,
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

  async findByLoginIdentifier(identifier: string) {
    const value = identifier.trim();

    return this.usersRepository.findOne({
      where: [{ email: value }, { username: value }],
      relations: {
        pegawai: true,
        siswa: true,
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

  async updateLastLogin(id: number) {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async updateProfile(
    userId: number,
    dto: {
      username?: string;
      email?: string;
      namaLengkap?: string;
      noTelepon?: string;
    },
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    const username = dto.username?.trim();
    const email = dto.email === undefined ? undefined : dto.email?.trim() || null;
    const namaLengkap = dto.namaLengkap === undefined ? undefined : dto.namaLengkap.trim();
    const noTelepon = dto.noTelepon === undefined ? undefined : dto.noTelepon.trim() || null;

    if (dto.username !== undefined && !username) {
      throw new BadRequestException('Username wajib diisi');
    }

    if (username && username !== user.username) {
      const existing = await this.findByUsername(username);
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Username sudah digunakan');
      }
      user.username = username;
    }

    if (email !== undefined && email !== user.email) {
      const existing = email ? await this.findByEmail(email) : null;
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email sudah digunakan');
      }
      user.email = email;
    }

    await this.usersRepository.save(user);

    // Sync to Pegawai if user is linked to Pegawai
    const pegawai = await this.pegawaiRepository.findOne({
      where: { userId },
    });
    if (pegawai) {
      if (namaLengkap !== undefined) {
        if (!namaLengkap) throw new BadRequestException('Nama lengkap wajib diisi');
        pegawai.namaLengkap = namaLengkap;
      }
      if (noTelepon !== undefined) pegawai.noTelepon = noTelepon;
      if (email !== undefined) pegawai.email = email;
      await this.pegawaiRepository.save(pegawai);
    }

    // Sync to Siswa if user is linked to Siswa
    const siswa = await this.siswaRepository.findOne({
      where: { userId },
    });
    if (siswa) {
      if (namaLengkap !== undefined) {
        if (!namaLengkap) throw new BadRequestException('Nama lengkap wajib diisi');
        siswa.namaLengkap = namaLengkap;
      }
      if (noTelepon !== undefined) siswa.noTelepon = noTelepon;
      if (email !== undefined) siswa.email = email;
      await this.siswaRepository.save(siswa);
    }

    return {
      success: true,
      message: 'Profil berhasil diperbarui',
    };
  }

  async changePassword(
    userId: number,
    dto: {
      oldPassword?: string;
      currentPassword?: string;
      newPassword: string;
      confirmPassword?: string;
    },
  ) {
    const curPass = dto.currentPassword || dto.oldPassword;
    if (!curPass) {
      throw new BadRequestException('Password saat ini harus diisi');
    }

    if (!dto.newPassword || dto.newPassword.length < 6) {
      throw new BadRequestException(
        'Password baru harus memiliki minimal 6 karakter',
      );
    }

    if (!dto.confirmPassword) {
      throw new BadRequestException('Konfirmasi password wajib diisi');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        'Konfirmasi password tidak cocok dengan password baru',
      );
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(curPass, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Password saat ini salah');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.passwordChangedAt = new Date();
    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'Password berhasil diubah',
    };
  }
}
