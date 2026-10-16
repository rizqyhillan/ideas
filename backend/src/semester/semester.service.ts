import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from '../database/entities/entities/Semester';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
    @InjectRepository(TahunAjaran)
    private tahunAjaranRepository: Repository<TahunAjaran>,
  ) {}

  async findAll(query: any = {}) {
    const data = await this.semesterRepository.find({
      relations: ['tahunAjaran'],
      order: { tahunAjaranId: 'DESC', jenis: 'ASC' },
    });
    const search = String(query.search || '').trim().toLowerCase();
    const filtered = data.filter((item) => {
      if (query.tahunAjaranId && item.tahunAjaranId !== Number(query.tahunAjaranId)) return false;
      if (query.jenis && item.jenis !== query.jenis) return false;
      if (query.isActive !== undefined && item.isActive !== (query.isActive === true || query.isActive === 'true')) return false;
      if (search && !`${item.tahunAjaran?.nama || ''} ${item.jenis}`.toLowerCase().includes(search)) return false;
      return true;
    });
    return { success: true, data: filtered, meta: { page: 1, limit: filtered.length, total: filtered.length, lastPage: 1 } };
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
    await this.validatePayload(body);
    const duplicate = await this.semesterRepository.findOne({ where: { tahunAjaranId: Number(body.tahunAjaranId), jenis: body.jenis } });
    if (duplicate) throw new ConflictException('Semester dengan jenis tersebut sudah ada pada tahun ajaran ini');
    if (body.isActive === true) await this.semesterRepository.update({ isActive: true }, { isActive: false });
    const newSemester = this.semesterRepository.create({
      tahunAjaranId: Number(body.tahunAjaranId),
      jenis: body.jenis,
      tanggalMulai: body.tanggalMulai,
      tanggalSelesai: body.tanggalSelesai,
      isActive: body.isActive ?? false,
    });
    await this.semesterRepository.save(newSemester);
    return { success: true, message: 'Semester berhasil ditambahkan', data: newSemester };
  }

  async update(id: number, body: any) {
    const current = await this.semesterRepository.findOneBy({ id });
    if (!current) throw new NotFoundException('Semester tidak ditemukan');
    const payload = { ...current, ...body };
    await this.validatePayload(payload);
    const duplicate = await this.semesterRepository.findOne({ where: { tahunAjaranId: Number(payload.tahunAjaranId), jenis: payload.jenis } });
    if (duplicate && duplicate.id !== id) throw new ConflictException('Semester dengan jenis tersebut sudah ada pada tahun ajaran ini');
    if (payload.isActive === true) await this.semesterRepository.update({ isActive: true }, { isActive: false });
    await this.semesterRepository.update(id, {
      tahunAjaranId: Number(payload.tahunAjaranId), jenis: payload.jenis,
      tanggalMulai: payload.tanggalMulai, tanggalSelesai: payload.tanggalSelesai,
      isActive: payload.isActive ?? false,
    });
    return this.findOne(id);
  }

  private async validatePayload(body: any) {
    if (!body.tahunAjaranId || !body.jenis || !body.tanggalMulai || !body.tanggalSelesai) {
      throw new BadRequestException('Tahun ajaran, jenis, dan periode semester wajib diisi');
    }
    if (!['ganjil', 'genap'].includes(body.jenis)) throw new BadRequestException('Jenis semester tidak valid');
    if (new Date(body.tanggalSelesai) <= new Date(body.tanggalMulai)) throw new BadRequestException('Tanggal selesai harus setelah tanggal mulai');
    const tahunAjaran = await this.tahunAjaranRepository.findOneBy({ id: Number(body.tahunAjaranId) });
    if (!tahunAjaran) throw new BadRequestException('Tahun ajaran tidak ditemukan');
    if (body.tanggalMulai < tahunAjaran.tanggalMulai || body.tanggalSelesai > tahunAjaran.tanggalSelesai) {
      throw new BadRequestException('Periode semester harus berada di dalam periode tahun ajaran');
    }
  }

  async remove(id: number) {
    const semester = await this.semesterRepository.findOneBy({ id });
    if (!semester) throw new NotFoundException('Semester tidak ditemukan');
    await this.semesterRepository.remove(semester);
    return { success: true, message: 'Semester berhasil dihapus' };
  }
}
