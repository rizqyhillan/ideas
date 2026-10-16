import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MataPelajaran } from '../database/entities/entities/MataPelajaran';
import { Guru } from '../database/entities/entities/Guru';

@Injectable()
export class MataPelajaranService {
  constructor(
    @InjectRepository(MataPelajaran)
    private mataPelajaranRepo: Repository<MataPelajaran>,
    @InjectRepository(Guru)
    private guruRepo: Repository<Guru>,
  ) {}

  private present(data: MataPelajaran) {
    return {
      ...data,
      isActive: data.statusAktif,
      guruPengampu: data.guruPengampu ?? null,
    };
  }

  async findAll() {
    const data = await this.mataPelajaranRepo.find({
      relations: { guruPengampu: { pegawai: true } },
    });
    return { success: true, data: data.map((item) => this.present(item)) };
  }

  async findOne(id: number) {
    const data = await this.mataPelajaranRepo.findOne({
      where: { id },
      relations: { guruPengampu: { pegawai: true } },
    });
    if (!data) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    return { success: true, data: this.present(data) };
  }

  async create(body: any) {
    const guruPengampuId = await this.resolveGuruPengampu(body.guruPengampuId);
    const newData = this.mataPelajaranRepo.create({
      kode: body.kode,
      nama: body.nama,
      deskripsi: body.deskripsi,
      statusAktif: body.isActive ?? body.statusAktif ?? true,
      guruPengampuId,
    });
    await this.mataPelajaranRepo.save(newData);
    return { success: true, message: 'Mata pelajaran berhasil ditambahkan', data: this.present(newData) };
  }

  async update(id: number, body: any) {
    const payload: Partial<MataPelajaran> = {};
    if (body.kode !== undefined) payload.kode = body.kode;
    if (body.nama !== undefined) payload.nama = body.nama;
    if (body.deskripsi !== undefined) payload.deskripsi = body.deskripsi;
    if (body.isActive !== undefined) payload.statusAktif = body.isActive;
    if (body.statusAktif !== undefined) payload.statusAktif = body.statusAktif;
    if (body.guruPengampuId !== undefined) {
      payload.guruPengampuId = await this.resolveGuruPengampu(body.guruPengampuId);
    }
    await this.mataPelajaranRepo.update(id, payload);
    return this.findOne(id);
  }

  private async resolveGuruPengampu(value: unknown): Promise<number | null> {
    if (value === undefined || value === null || value === '') return null;
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('Guru pengampu tidak valid');
    }
    const guru = await this.guruRepo.findOne({ where: { id } });
    if (!guru) throw new BadRequestException('Guru pengampu tidak ditemukan');
    return id;
  }

  async remove(id: number) {
    const data = await this.mataPelajaranRepo.findOneBy({ id });
    if (!data) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    await this.mataPelajaranRepo.remove(data);
    return { success: true, message: 'Mata pelajaran berhasil dihapus' };
  }
}
