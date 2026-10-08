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

  async findAll() {
    const data = await this.jadwalRepo.find({
      relations: ['kelas', 'mataPelajaran', 'guru', 'semester', 'semester.tahunAjaran']
    });
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.jadwalRepo.findOne({
      where: { id },
      relations: ['kelas', 'mataPelajaran', 'guru', 'semester', 'semester.tahunAjaran']
    });
    if (!data) throw new NotFoundException('Jadwal tidak ditemukan');
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