import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { TahunAjaran } from '../database/entities/entities/TahunAjaran';
import { CreateTahunAjaranDto } from './dto/create-tahun-ajaran.dto';
import { UpdateTahunAjaranDto } from './dto/update-tahun-ajaran.dto';
import { QueryTahunAjaranDto } from './dto/query-tahun-ajaran.dto';

@Injectable()
export class TahunAjaranService {
  constructor(
    @InjectRepository(TahunAjaran)
    private readonly tahunAjaranRepository: Repository<TahunAjaran>,
    private readonly dataSource: DataSource,
  ) {}

  // =========================================================
  // FIND BY ID (HELPER)
  // =========================================================
  async findById(id: number) {
    return this.tahunAjaranRepository.findOne({
      where: {
        id,
      },
      relations: {
        semesters: true,
      },
    });
  }

  // =========================================================
  // GET ACTIVE
  // =========================================================
  async getActive() {
    const active = await this.tahunAjaranRepository.findOne({
      where: {
        isActive: true,
      },
      relations: {
        semesters: true,
      },
    });

    if (!active) {
      throw new NotFoundException('Tidak ada tahun ajaran yang sedang aktif');
    }

    return {
      success: true,
      message: 'Tahun ajaran aktif retrieved successfully',
      data: active,
    };
  }

  // =========================================================
  // CREATE
  // =========================================================
  async create(dto: CreateTahunAjaranDto) {
    // Validasi tanggal
    if (new Date(dto.tanggalSelesai) <= new Date(dto.tanggalMulai)) {
      throw new BadRequestException(
        'Tanggal selesai harus setelah tanggal mulai',
      );
    }

    // Cek nama tahun ajaran unik
    const existing = await this.tahunAjaranRepository.findOne({
      where: {
        nama: dto.nama,
      },
    });

    if (existing) {
      throw new ConflictException('Tahun ajaran sudah digunakan');
    }

    const isActive = dto.isActive ?? false;

    /*
     * Transaction digunakan supaya ketika membuat
     * tahun ajaran aktif baru:
     * 1. Tahun ajaran aktif lama dinonaktifkan
     * 2. Tahun ajaran baru disimpan dengan isActive = true
     */
    const tahunAjaran = await this.dataSource.transaction(async (manager) => {
      if (isActive) {
        await manager
          .createQueryBuilder()
          .update(TahunAjaran)
          .set({
            isActive: false,
          })
          .where('is_active = :isActive', {
            isActive: true,
          })
          .execute();
      }

      const data = manager.create(TahunAjaran, {
        nama: dto.nama,
        tanggalMulai: dto.tanggalMulai,
        tanggalSelesai: dto.tanggalSelesai,
        isActive,
      });

      return manager.save(TahunAjaran, data);
    });

    return {
      success: true,
      message: 'Tahun ajaran created successfully',
      data: tahunAjaran,
    };
  }

  // =========================================================
  // FIND ALL
  // =========================================================
  async findAll(query: QueryTahunAjaranDto) {
    const { page, limit, search, isActive, sort, order } = query;

    const qb = this.tahunAjaranRepository.createQueryBuilder('tahunAjaran');

    // Search
    if (search) {
      qb.andWhere('tahunAjaran.nama ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Filter active
    if (isActive !== undefined) {
      qb.andWhere('tahunAjaran.isActive = :isActive', {
        isActive,
      });
    }

    // Sorting
    qb.orderBy(`tahunAjaran.${sort}`, order);

    // Pagination
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [tahunAjaran, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Tahun ajaran retrieved successfully',
      data: tahunAjaran,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // =========================================================
  // FIND ONE
  // =========================================================
  async findOne(id: number) {
    const tahunAjaran = await this.findById(id);

    if (!tahunAjaran) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    return {
      success: true,
      message: 'Tahun ajaran retrieved successfully',
      data: tahunAjaran,
    };
  }

  // =========================================================
  // UPDATE
  // =========================================================
  async update(id: number, dto: UpdateTahunAjaranDto) {
    const tahunAjaran = await this.findById(id);

    if (!tahunAjaran) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    // Validasi tanggal jika diubah
    const tanggalMulai = dto.tanggalMulai ?? tahunAjaran.tanggalMulai;
    const tanggalSelesai = dto.tanggalSelesai ?? tahunAjaran.tanggalSelesai;

    if (new Date(tanggalSelesai) <= new Date(tanggalMulai)) {
      throw new BadRequestException(
        'Tanggal selesai harus setelah tanggal mulai',
      );
    }

    // Cek nama jika nama diubah
    if (dto.nama && dto.nama !== tahunAjaran.nama) {
      const existing = await this.tahunAjaranRepository.findOne({
        where: {
          nama: dto.nama,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Tahun ajaran sudah digunakan');
      }
    }

    /*
     * Tahun ajaran aktif tidak boleh dinonaktifkan langsung tanpa ada pengganti.
     */
    if (dto.isActive === false && tahunAjaran.isActive) {
      throw new BadRequestException(
        'Tahun ajaran aktif tidak dapat dinonaktifkan secara langsung. Aktifkan tahun ajaran lain atau buat tahun ajaran baru.',
      );
    }

    // Jika mengaktifkan tahun ajaran ini (yang sebelumnya nonaktif)
    if (dto.isActive === true && !tahunAjaran.isActive) {
      await this.dataSource.transaction(async (manager) => {
        await manager
          .createQueryBuilder()
          .update(TahunAjaran)
          .set({
            isActive: false,
          })
          .where('is_active = :isActive AND id != :id', {
            isActive: true,
            id,
          })
          .execute();

        Object.assign(tahunAjaran, dto);
        tahunAjaran.updatedAt = new Date();

        await manager.save(TahunAjaran, tahunAjaran);
      });
    } else {
      Object.assign(tahunAjaran, dto);
      tahunAjaran.updatedAt = new Date();

      await this.tahunAjaranRepository.save(tahunAjaran);
    }

    const updated = await this.findById(id);

    return {
      success: true,
      message: 'Tahun ajaran updated successfully',
      data: updated,
    };
  }

  // =========================================================
  // DELETE
  // =========================================================
  async remove(id: number) {
    const tahunAjaran = await this.findById(id);

    if (!tahunAjaran) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    if (tahunAjaran.isActive) {
      throw new BadRequestException(
        'Tahun ajaran yang sedang aktif tidak dapat dihapus',
      );
    }

    await this.tahunAjaranRepository.remove(tahunAjaran);

    return {
      success: true,
      message: 'Tahun ajaran deleted successfully',
    };
  }
}
