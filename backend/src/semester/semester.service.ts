import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from '../database/entities/entities/Semester';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>
  ) {}

  async findAll() {
    const data = await this.semesterRepository.find({
      relations: ['tahunAjaran']
    });
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.semesterRepository.findOne({
      where: { id },
      relations: ['tahunAjaran']
    });
    if (!data) throw new NotFoundException('Semester tidak ditemukan');
    return { success: true, data };
  }

  async create(body: any) {
    const newSemester = this.semesterRepository.create(body);
    await this.semesterRepository.save(newSemester);
    return { success: true, message: 'Semester berhasil ditambahkan', data: newSemester };
  }

  async update(id: number, body: any) {
    await this.semesterRepository.update(id, body);
    return this.findOne(id);
  }

  async remove(id: number) {
    const semester = await this.semesterRepository.findOneBy({ id });
    if (!semester) throw new NotFoundException('Semester tidak ditemukan');
    await this.semesterRepository.remove(semester);
    return { success: true, message: 'Semester berhasil dihapus' };
  }
}