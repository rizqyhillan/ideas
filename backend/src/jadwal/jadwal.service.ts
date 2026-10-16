import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';

@Injectable()
export class JadwalService {
  constructor(
    @InjectRepository(JadwalPelajaran)
    private jadwalRepo: Repository<JadwalPelajaran>
  ) {}

  async findAll(
    user?: any,
    filters: {
      search?: string;
      kelasId?: number;
      guruId?: number;
      mataPelajaranId?: number;
      hari?: string;
      isActive?: boolean;
    } = {},
  ) {
    const qb = this.jadwalRepo.createQueryBuilder('jadwal')
      .leftJoinAndSelect('jadwal.kelas', 'kelas')
      .leftJoinAndSelect('jadwal.mataPelajaran', 'mataPelajaran')
      .leftJoinAndSelect('jadwal.guru', 'guru')
      .leftJoinAndSelect('guru.pegawai', 'pegawai')
      .leftJoinAndSelect('jadwal.semester', 'semester')
      .leftJoinAndSelect('semester.tahunAjaran', 'tahunAjaran');

    const roles = user?.userRoles2?.map((item: any) => item.role?.code) ?? [];
      if (roles.includes('guru') && !roles.includes('admin') && !roles.includes('super_admin')) {
      qb.andWhere('pegawai.userId = :userId', { userId: user.id });
    }

    if (filters.search) {
      qb.andWhere(
        '(LOWER(kelas.nama) LIKE :search OR LOWER(mataPelajaran.nama) LIKE :search OR LOWER(pegawai.namaLengkap) LIKE :search)',
        { search: `%${filters.search.toLowerCase()}%` },
      );
    }
    if (filters.kelasId) qb.andWhere('jadwal.kelasId = :kelasId', { kelasId: filters.kelasId });
    if (filters.guruId) qb.andWhere('jadwal.guruId = :guruId', { guruId: filters.guruId });
    if (filters.mataPelajaranId) {
      qb.andWhere('jadwal.mataPelajaranId = :mataPelajaranId', {
        mataPelajaranId: filters.mataPelajaranId,
      });
    }
    if (filters.hari) qb.andWhere('jadwal.hari = :hari', { hari: filters.hari });
    if (filters.isActive !== undefined) {
      qb.andWhere('jadwal.isActive = :isActive', { isActive: filters.isActive });
    }

    const data = await qb.orderBy('jadwal.hari', 'ASC').addOrderBy('jadwal.jamMulai', 'ASC').getMany();
    return { success: true, data };
  }

  async findOne(id: number, user?: any) {
    const data = await this.jadwalRepo.findOne({
      where: { id },
      relations: ['kelas', 'mataPelajaran', 'guru', 'guru.pegawai', 'semester', 'semester.tahunAjaran']
    });
    if (!data) throw new NotFoundException('Jadwal tidak ditemukan');

    const roles = user?.userRoles2?.map((item: any) => item.role?.code) ?? [];
    if (roles.includes('guru') && !roles.includes('admin') && !roles.includes('super_admin') && data.guru?.pegawai?.userId !== user.id) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }
    return { success: true, data };
  }

  async create(body: any) {
    const newData = this.jadwalRepo.create(body);
    await this.jadwalRepo.save(newData);
    return { success: true, message: 'Jadwal berhasil ditambahkan', data: newData };
  }

  async update(id: number, body: any) {
    await this.jadwalRepo.update(id, body);
    return this.findOne(id);
  }

  async remove(id: number) {
    const data = await this.jadwalRepo.findOneBy({ id });
    if (!data) throw new NotFoundException('Jadwal tidak ditemukan');
    await this.jadwalRepo.remove(data);
    return { success: true, message: 'Jadwal berhasil dihapus' };
  }
}
