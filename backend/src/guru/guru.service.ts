import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Guru } from '../database/entities/entities/Guru';
import { Pegawai } from '../database/entities/entities/Pegawai';

import { CreateGuruDto } from './dto/create-guru.dto';
import { UpdateGuruDto } from './dto/update-guru.dto';
import { QueryGuruDto } from './dto/query-guru.dto';

@Injectable()
export class GuruService {
  constructor(
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,

    @InjectRepository(Pegawai)
    private readonly pegawaiRepository: Repository<Pegawai>,
  ) {}

  async findById(id: number) {
    return this.guruRepository.findOne({
      where: {
        id,
      },
      relations: {
        pegawai: true,
      },
    });
  }

  async create(dto: CreateGuruDto) {
    const pegawai = await this.pegawaiRepository.findOne({
      where: {
        id: dto.pegawaiId,
      },
    });

    if (!pegawai) {
      throw new BadRequestException('Pegawai tidak ditemukan');
    }

    const sudahGuru = await this.guruRepository.findOne({
      where: {
        pegawaiId: dto.pegawaiId,
      },
    });

    if (sudahGuru) {
      throw new BadRequestException('Pegawai sudah menjadi guru');
    }

    if (dto.kodeGuru) {
      const cekKodeGuru = await this.guruRepository.findOne({
        where: {
          kodeGuru: dto.kodeGuru,
        },
      });

      if (cekKodeGuru) {
        throw new BadRequestException('Kode guru sudah digunakan');
      }
    }

    const guru = this.guruRepository.create({
      pegawaiId: dto.pegawaiId,
      kodeGuru: dto.kodeGuru ?? null,
    });

    await this.guruRepository.save(guru);

    return {
      success: true,
      message: 'Guru created successfully',
      data: guru,
    };
  }

  async findAll(query: QueryGuruDto) {
    const { page, limit, search, sort, order } = query;

    const qb = this.guruRepository.createQueryBuilder('guru');

    qb.leftJoinAndSelect('guru.pegawai', 'pegawai');

    if (search) {
      qb.andWhere(
        `(
          guru.kodeGuru ILIKE :search
          OR pegawai.namaLengkap ILIKE :search
          OR pegawai.nip ILIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    switch (sort) {
      case 'kodeGuru':
        qb.orderBy('guru.kodeGuru', order);
        break;

      case 'createdAt':
        qb.orderBy('guru.createdAt', order);
        break;

      default:
        qb.orderBy('guru.id', order);
    }

    qb.skip((page - 1) * limit);

    qb.take(limit);

    const [guru, total] = await qb.getManyAndCount();

    return {
      success: true,

      message: 'Guru retrieved successfully',

      data: guru,

      meta: {
        page,

        limit,

        total,

        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const guru = await this.findById(id);

    if (!guru) {
      throw new BadRequestException('Guru tidak ditemukan');
    }

    return {
      success: true,

      message: 'Guru retrieved successfully',

      data: guru,
    };
  }

  async update(id: number, dto: UpdateGuruDto) {
    const guru = await this.findById(id);

    if (!guru) {
      throw new BadRequestException('Guru tidak ditemukan');
    }

    if (dto.pegawaiId && dto.pegawaiId !== guru.pegawaiId) {
      const pegawai = await this.pegawaiRepository.findOne({
        where: {
          id: dto.pegawaiId,
        },
      });

      if (!pegawai) {
        throw new BadRequestException('Pegawai tidak ditemukan');
      }

      const sudahGuru = await this.guruRepository.findOne({
        where: {
          pegawaiId: dto.pegawaiId,
        },
      });

      if (sudahGuru) {
        throw new BadRequestException('Pegawai sudah menjadi guru');
      }
    }

    if (dto.kodeGuru && dto.kodeGuru !== guru.kodeGuru) {
      const cekKode = await this.guruRepository.findOne({
        where: {
          kodeGuru: dto.kodeGuru,
        },
      });

      if (cekKode) {
        throw new BadRequestException('Kode guru sudah digunakan');
      }
    }

    Object.assign(guru, dto);

    await this.guruRepository.save(guru);

    return {
      success: true,

      message: 'Guru updated successfully',

      data: guru,
    };
  }

  async remove(id: number) {
    const guru = await this.findById(id);

    if (!guru) {
      throw new BadRequestException('Guru tidak ditemukan');
    }

    await this.guruRepository.remove(guru);

    return {
      success: true,

      message: 'Guru deleted successfully',
    };
  }
}
