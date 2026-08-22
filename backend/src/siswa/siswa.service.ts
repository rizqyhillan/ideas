import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { Siswa } from '../database/entities/entities/Siswa';

import { CreateSiswaDto } from './dto/create-siswa.dto';
import { UpdateSiswaDto } from './dto/update-siswa.dto';
import { QuerySiswaDto } from './dto/query-siswa.dto';

@Injectable()
export class SiswaService {
  constructor(
    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,
  ) {}

  async findById(id: number) {
    return this.siswaRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
  async create(dto: CreateSiswaDto) {
    const cekNisn = await this.siswaRepository.findOne({
      where: {
        nisn: dto.nisn,
      },
    });

    if (cekNisn) {
      throw new BadRequestException('NISN sudah digunakan');
    }

    if (dto.nis) {
      const cekNis = await this.siswaRepository.findOne({
        where: {
          nis: dto.nis,
        },
      });

      if (cekNis) {
        throw new BadRequestException('NIS sudah digunakan');
      }
    }

    const siswa = this.siswaRepository.create({
      ...dto,
      statusAktif: dto.statusAktif ?? true,
    });

    await this.siswaRepository.save(siswa);

    return {
      success: true,
      message: 'Siswa created successfully',
      data: siswa,
    };
  }

  async findAll(query: QuerySiswaDto) {
    const { page, limit, search, statusAktif, sort, order } = query;

    const qb = this.siswaRepository.createQueryBuilder('siswa');

    qb.andWhere('siswa.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        `(
        siswa.namaLengkap ILIKE :search
        OR siswa.nis ILIKE :search
        OR siswa.nisn ILIKE :search
      )`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (statusAktif !== undefined) {
      qb.andWhere('siswa.statusAktif = :statusAktif', {
        statusAktif,
      });
    }

    qb.orderBy(`siswa.${sort}`, order);

    qb.skip((page - 1) * limit);

    qb.take(limit);

    const [siswa, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Siswa retrieved successfully',
      data: siswa,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const siswa = await this.findById(id);

    if (!siswa) {
      throw new BadRequestException('Siswa tidak ditemukan');
    }

    return {
      success: true,
      message: 'Siswa retrieved successfully',
      data: siswa,
    };
  }

  async update(id: number, dto: UpdateSiswaDto) {
    const siswa = await this.findById(id);

    if (!siswa) {
      throw new BadRequestException('Siswa tidak ditemukan');
    }

    if (dto.nisn && dto.nisn !== siswa.nisn) {
      const cek = await this.siswaRepository.findOne({
        where: {
          nisn: dto.nisn,
        },
      });

      if (cek) {
        throw new BadRequestException('NISN sudah digunakan');
      }
    }

    if (dto.nis && dto.nis !== siswa.nis) {
      const cek = await this.siswaRepository.findOne({
        where: {
          nis: dto.nis,
        },
      });

      if (cek) {
        throw new BadRequestException('NIS sudah digunakan');
      }
    }

    Object.assign(siswa, dto);

    await this.siswaRepository.save(siswa);

    return {
      success: true,
      message: 'Siswa updated successfully',
      data: siswa,
    };
  }

  async remove(id: number) {
    const siswa = await this.findById(id);

    if (!siswa) {
      throw new BadRequestException('Siswa tidak ditemukan');
    }

    siswa.deletedAt = new Date();

    await this.siswaRepository.save(siswa);

    return {
      success: true,
      message: 'Siswa deleted successfully',
    };
  }
}
