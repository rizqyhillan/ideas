import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MataPelajaran } from '../database/entities/entities/MataPelajaran';

@Injectable()
export class MataPelajaranService {
  constructor(
    @InjectRepository(MataPelajaran)
    private mataPelajaranRepo: Repository<MataPelajaran>
  ) {}

  async findAll() {
    const data = await this.mataPelajaranRepo.find();
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.mataPelajaranRepo.findOneBy({ id });
    if (!data) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    return { success: true, data };
  }

  async create(body: any) {
    const newData = this.mataPelajaranRepo.create(body);
    await this.mataPelajaranRepo.save(newData);
    return { success: true, message: 'Mata pelajaran berhasil ditambahkan', data: newData };
  }

  async update(id: number, body: any) {
    await this.mataPelajaranRepo.update(id, body);
    return this.findOne(id);
  }

  async remove(id: number) {
    const data = await this.mataPelajaranRepo.findOneBy({ id });
    if (!data) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    await this.mataPelajaranRepo.remove(data);
    return { success: true, message: 'Mata pelajaran berhasil dihapus' };
  }
}