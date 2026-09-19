import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbsensiSesi } from '../database/entities/entities/AbsensiSesi';
import { AbsensiSesiItem } from '../database/entities/entities/AbsensiSesiItem';
import { CreateAbsensiSesiDto } from './dto/create-absensi-sesi.dto';

@Injectable()
export class AbsensiService {
  constructor(
    @InjectRepository(AbsensiSesi)
    private absensiSesiRepo: Repository<AbsensiSesi>,
    @InjectRepository(AbsensiSesiItem)
    private absensiSesiItemRepo: Repository<AbsensiSesiItem>,
  ) {}

  async create(dto: CreateAbsensiSesiDto) {
    const session = this.absensiSesiRepo.create({
      kelasId: dto.kelasId,
      guruId: dto.guruId ?? null,
      tanggal: dto.tanggal,
      jamKe: dto.jamKe ?? null,
      mataPelajaran: dto.mataPelajaran ?? null,
      catatan: dto.catatan ?? null,
    });

    const savedSession = await this.absensiSesiRepo.save(session);

    const items = dto.items.map((item) =>
      this.absensiSesiItemRepo.create({
        absensiSesiId: savedSession.id,
        siswaId: item.siswaId,
        status: item.status,
        keterangan: item.keterangan ?? null,
      }),
    );

    await this.absensiSesiItemRepo.save(items);

    return {
      id: savedSession.id,
      kelasId: savedSession.kelasId,
      guruId: savedSession.guruId,
      tanggal: savedSession.tanggal,
      jamKe: savedSession.jamKe,
      mataPelajaran: savedSession.mataPelajaran,
      catatan: savedSession.catatan,
      savedAt: savedSession.savedAt,
      itemsCount: items.length,
    };
  }

  async findByKelasAndTanggal(kelasId: number, tanggal: string) {
    const qb = this.absensiSesiRepo
      .createQueryBuilder('sesi')
      .leftJoinAndSelect('sesi.items', 'items')
      .leftJoinAndSelect('items.siswa', 'siswa')
      .leftJoinAndSelect('sesi.kelas', 'kelas')
      .leftJoinAndSelect('sesi.guru', 'guru')
      .where('sesi.kelasId = :kelasId', { kelasId })
      .andWhere('sesi.tanggal = :tanggal', { tanggal })
      .orderBy('items.siswaId', 'ASC');

    const session = await qb.getOne();

    if (!session) return null;

    const items = (session.items ?? []).map((item) => ({
      siswaId: item.siswaId,
      nisn: item.siswa?.nisn ?? '',
      nis: item.siswa?.nis ?? undefined,
      namaLengkap: item.siswa?.namaLengkap ?? '-',
      jenisKelamin: item.siswa?.jenisKelamin ?? 'L',
      status: item.status,
      keterangan: item.keterangan ?? '',
    }));

    return {
      id: session.id,
      kelasId: session.kelasId,
      kelasNama: session.kelas?.nama ?? '-',
      guruId: session.guruId,
      guruNama: session.guru?.pegawai?.namaLengkap ?? '-',
      tanggal: session.tanggal,
      jamKe: session.jamKe,
      mataPelajaran: session.mataPelajaran,
      catatan: session.catatan,
      savedAt: session.savedAt?.toISOString() ?? new Date().toISOString(),
      items,
    };
  }

  async getAll(params: {
    page?: number;
    limit?: number;
    kelasId?: number;
    tanggal?: string;
  }) {
    const { page = 1, limit = 10, kelasId, tanggal } = params;
    const qb = this.absensiSesiRepo.createQueryBuilder('sesi')
      .leftJoinAndSelect('sesi.items', 'items')
      .leftJoinAndSelect('sesi.kelas', 'kelas')
      .leftJoinAndSelect('sesi.guru', 'guru')
      .leftJoinAndSelect('items.siswa', 'siswa');

    if (kelasId) qb.andWhere('sesi.kelasId = :kelasId', { kelasId });
    if (tanggal) qb.andWhere('sesi.tanggal = :tanggal', { tanggal });

    qb.orderBy('sesi.savedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((sesi) => ({
        id: sesi.id,
        kelasId: sesi.kelasId,
        kelasNama: sesi.kelas?.nama ?? '-',
        guruId: sesi.guruId,
        guruNama: sesi.guru?.pegawai?.namaLengkap ?? '-',
        tanggal: sesi.tanggal,
        jamKe: sesi.jamKe,
        mataPelajaran: sesi.mataPelajaran,
        catatan: sesi.catatan,
        savedAt: sesi.savedAt?.toISOString() ?? '',
        itemsCount: sesi.items.length,
      })),
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
