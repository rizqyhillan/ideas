import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatatanKonseling } from '../database/entities/entities/CatatanKonseling';

@Injectable()
export class KonselingService {
  constructor(
    @InjectRepository(CatatanKonseling)
    private konselingRepo: Repository<CatatanKonseling>
  ) {}

  async findAll() {
    const data = await this.konselingRepo.find({
      relations: ['siswa', 'siswa.users', 'guruBk', 'guruBk.users']
    });
    return { success: true, data };
  }

  async findAllBySiswa(siswaId: number) {
    const data = await this.konselingRepo.find({
      where: { siswaId },
      relations: ['siswa', 'siswa.users', 'guruBk', 'guruBk.users']
    });
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.konselingRepo.findOne({
      where: { id },
      relations: ['siswa', 'siswa.users', 'guruBk', 'guruBk.users']
    });
    if (!data) throw new NotFoundException('Catatan konseling tidak ditemukan');
    return { success: true, data };
  }

  async create(body: any) {
    const newData = this.konselingRepo.create(body);
    await this.konselingRepo.save(newData);
    return { success: true, message: 'Catatan konseling berhasil ditambahkan', data: newData };
  }

  async update(id: number, body: any) {
    await this.konselingRepo.update(id, body);
    return this.findOne(id);
  }

  async remove(id: number) {
    const data = await this.konselingRepo.findOneBy({ id });
    if (!data) throw new NotFoundException('Catatan konseling tidak ditemukan');
    await this.konselingRepo.remove(data);
    return { success: true, message: 'Catatan konseling berhasil dihapus' };
  }
}