import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { Pegawai } from '../database/entities/entities/Pegawai';

import { QueryPegawaiDto } from './dto/query-pegawai.dto';
import { CreatePegawaiDto } from './dto/create-pegawai.dto';
import { UpdatePegawaiDto } from './dto/update-pegawai.dto';

@Injectable()
export class PegawaiService {
  constructor(
    @InjectRepository(Pegawai)
    private readonly pegawaiRepository: Repository<Pegawai>,
  ) {}

  async findAll(query: QueryPegawaiDto) {
    const { page, limit, search, statusAktif, sort, order } = query;

    const qb = this.pegawaiRepository.createQueryBuilder('pegawai');

    qb.andWhere('pegawai.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        `(
          pegawai.namaLengkap ILIKE :search
          OR pegawai.nip ILIKE :search
          OR pegawai.email ILIKE :search
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (statusAktif !== undefined) {
      qb.andWhere('pegawai.statusAktif = :statusAktif', {
        statusAktif,
      });
    }

    qb.orderBy(`pegawai.${sort}`, order);

    qb.skip((page - 1) * limit);

    qb.take(limit);

    const [pegawai, total] = await qb.getManyAndCount();

    return {
      success: true,

      message: 'Pegawai retrieved successfully',

      data: pegawai,

      meta: {
        page,

        limit,

        total,

        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    return this.pegawaiRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  async create(dto: CreatePegawaiDto) {
    const cekNip = dto.nip
      ? await this.pegawaiRepository.findOne({
          where: {
            nip: dto.nip,
          },
        })
      : null;

    if (cekNip) {
      throw new BadRequestException('NIP sudah digunakan');
    }

    const cekNuptk = dto.nuptk
      ? await this.pegawaiRepository.findOne({
          where: {
            nuptk: dto.nuptk,
          },
        })
      : null;

    if (cekNuptk) {
      throw new BadRequestException('NUPTK sudah digunakan');
    }

    const pegawai = this.pegawaiRepository.create({
      ...dto,

      statusAktif: dto.statusAktif ?? true,
    });

    await this.pegawaiRepository.save(pegawai);

    return {
      success: true,

      message: 'Pegawai created successfully',

      data: pegawai,
    };
  }
  async update(id: number, dto: UpdatePegawaiDto) {
    const pegawai = await this.findById(id);

    if (!pegawai) {
      throw new BadRequestException('Pegawai tidak ditemukan');
    }

    if (dto.nip && dto.nip !== pegawai.nip) {
      const cek = await this.pegawaiRepository.findOne({
        where: {
          nip: dto.nip,
        },
      });

      if (cek) {
        throw new BadRequestException('NIP sudah digunakan');
      }
    }

    if (dto.nuptk && dto.nuptk !== pegawai.nuptk) {
      const cek = await this.pegawaiRepository.findOne({
        where: {
          nuptk: dto.nuptk,
        },
      });

      if (cek) {
        throw new BadRequestException('NUPTK sudah digunakan');
      }
    }

    Object.assign(pegawai, dto);

    await this.pegawaiRepository.save(pegawai);

    return {
      success: true,

      message: 'Pegawai updated successfully',

      data: pegawai,
    };
  }
  async remove(id: number) {
    const pegawai = await this.findById(id);

    if (!pegawai) {
      throw new BadRequestException('Pegawai tidak ditemukan');
    }

    pegawai.deletedAt = new Date();

    await this.pegawaiRepository.save(pegawai);

    return {
      success: true,

      message: 'Pegawai deleted successfully',
    };
  }
}
