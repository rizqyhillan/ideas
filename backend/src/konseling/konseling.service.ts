import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatatanKonseling } from '../database/entities/entities/CatatanKonseling';
import { Siswa } from '../database/entities/entities/Siswa';
import { Guru } from '../database/entities/entities/Guru';

@Injectable()
export class KonselingService {
  constructor(
    @InjectRepository(CatatanKonseling)
    private konselingRepo: Repository<CatatanKonseling>,
    @InjectRepository(Siswa)
    private siswaRepo: Repository<Siswa>,
    @InjectRepository(Guru)
    private guruRepo: Repository<Guru>,
  ) {}

  private extractRoles(user: any): string[] {
    const fromUserRoles =
      user?.userRoles2?.map((ur: any) => ur.role?.code).filter(Boolean) || [];
    const directRoles = Array.isArray(user?.roles) ? user.roles : [];
    return Array.from(new Set([...fromUserRoles, ...directRoles]));
  }

  private isAdmin(user: any): boolean {
    const roles = this.extractRoles(user);
    return roles.includes('admin') || roles.includes('super_admin');
  }

  private isBk(user: any): boolean {
    const roles = this.extractRoles(user);
    return roles.includes('bk') || roles.includes('guru_bk');
  }

  private async getStudentForUser(user: any): Promise<Siswa | null> {
    return this.siswaRepo.findOne({ where: { userId: user.id } });
  }

  private async getGuruForUser(user: any): Promise<Guru | null> {
    return this.guruRepo
      .createQueryBuilder('guru')
      .leftJoinAndSelect('guru.pegawai', 'pegawai')
      .where('pegawai.userId = :userId', { userId: user.id })
      .getOne();
  }

  async findAllWithFilter(params: {
    user: any;
    page?: number;
    limit?: number;
    search?: string;
    siswaId?: number;
    guruBkId?: number;
    visibilitas?: string;
    tanggalAwal?: string;
    tanggalAkhir?: string;
  }) {
    const {
      user,
      page = 1,
      limit = 10,
      search,
      guruBkId,
      visibilitas,
      tanggalAwal,
      tanggalAkhir,
    } = params;

    const roles = this.extractRoles(user);
    const isStudent = roles.includes('siswa');
    const isAdminOrBk = this.isAdmin(user) || this.isBk(user);

    const qb = this.konselingRepo
      .createQueryBuilder('k')
      .leftJoinAndSelect('k.siswa', 'siswa')
      .leftJoinAndSelect('k.guruBk', 'guruBk')
      .leftJoinAndSelect('guruBk.pegawai', 'pegawai');

    // Rule README: Siswa HANYA bisa melihat hasil konseling mereka sendiri-sendiri
    if (isStudent && !isAdminOrBk) {
      const studentRecord = await this.getStudentForUser(user);

      if (!studentRecord) {
        return {
          success: true,
          data: [],
          meta: { page, limit, total: 0, lastPage: 0 },
        };
      }

      qb.andWhere('k.siswaId = :mySiswaId', { mySiswaId: studentRecord.id });
    } else {
      if (params.siswaId) {
        qb.andWhere('k.siswaId = :siswaId', { siswaId: params.siswaId });
      }
      if (visibilitas) {
        qb.andWhere('k.visibilitas = :visibilitas', { visibilitas });
      }
      if (guruBkId) {
        qb.andWhere('k.guruBkId = :guruBkId', { guruBkId });
      }
    }

    if (search) {
      qb.andWhere(
        '(LOWER(k.topik) LIKE :search OR LOWER(k.isi) LIKE :search OR LOWER(siswa.namaLengkap) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (tanggalAwal && tanggalAkhir) {
      qb.andWhere('k.tanggal BETWEEN :tAwal AND :tAkhir', {
        tAwal: tanggalAwal,
        tAkhir: tanggalAkhir,
      });
    } else if (tanggalAwal) {
      qb.andWhere('k.tanggal >= :tAwal', { tAwal: tanggalAwal });
    } else if (tanggalAkhir) {
      qb.andWhere('k.tanggal <= :tAkhir', { tAkhir: tanggalAkhir });
    }

    qb.orderBy('k.tanggal', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneSecure(id: number, user: any) {
    const data = await this.konselingRepo.findOne({
      where: { id },
      relations: ['siswa', 'guruBk', 'guruBk.pegawai'],
    });

    if (!data) throw new NotFoundException('Catatan konseling tidak ditemukan');

    const roles = this.extractRoles(user);
    const isStudent = roles.includes('siswa');
    const isAdminOrBk = this.isAdmin(user) || this.isBk(user);

    if (isStudent && !isAdminOrBk) {
      const studentRecord = await this.getStudentForUser(user);
      if (
        !studentRecord ||
        data.siswaId !== studentRecord.id
      ) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke catatan konseling ini',
        );
      }
    }

    return { success: true, data };
  }

  async createSecure(body: any, user: any) {
    const studentId = Number(body.siswaId);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      throw new ForbiddenException('Siswa konseling wajib dipilih');
    }

    const student = await this.siswaRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const currentGuru = await this.getGuruForUser(user);
    let guruBkId = body.guruBkId ? Number(body.guruBkId) : null;

    if (!this.isAdmin(user)) {
      if (!currentGuru) {
        throw new ForbiddenException('Akun Guru BK belum terhubung ke data guru');
      }
      guruBkId = currentGuru.id;
    }

    if (!guruBkId || !Number.isInteger(guruBkId) || guruBkId <= 0) {
      throw new ForbiddenException('Guru BK wajib dipilih');
    }

    const guruBk = await this.guruRepo.findOne({ where: { id: guruBkId } });
    if (!guruBk) throw new NotFoundException('Guru BK tidak ditemukan');

    const payload = {
      ...body,
      siswaId: studentId,
      guruBkId,
      createdBy: user?.id ?? null,
    };

    const newData = this.konselingRepo.create(payload);
    const saved = await this.konselingRepo.save(newData);

    return {
      success: true,
      message: 'Catatan konseling berhasil ditambahkan',
      data: saved,
    };
  }

  async updateSecure(id: number, body: any, user: any) {
    const existing = await this.konselingRepo.findOneBy({ id });
    if (!existing)
      throw new NotFoundException('Catatan konseling tidak ditemukan');

    const patch: any = {
      ...body,
      updatedBy: user?.id ?? null,
    };

    if (patch.siswaId !== undefined) {
      const studentId = Number(patch.siswaId);
      const student = await this.siswaRepo.findOne({ where: { id: studentId } });
      if (!student) throw new NotFoundException('Siswa tidak ditemukan');
      patch.siswaId = studentId;
    }

    if (patch.guruBkId !== undefined) {
      const guruBkId = Number(patch.guruBkId);
      const guruBk = await this.guruRepo.findOne({ where: { id: guruBkId } });
      if (!guruBk) throw new NotFoundException('Guru BK tidak ditemukan');
      patch.guruBkId = guruBkId;
    }

    await this.konselingRepo.update(id, patch);

    return this.findOneSecure(id, user);
  }

  async remove(id: number) {
    const data = await this.konselingRepo.findOneBy({ id });
    if (!data) throw new NotFoundException('Catatan konseling tidak ditemukan');
    await this.konselingRepo.remove(data);
    return { success: true, message: 'Catatan konseling berhasil dihapus' };
  }

  async findAll() {
    const data = await this.konselingRepo.find({
      relations: ['siswa', 'guruBk', 'guruBk.pegawai'],
    });
    return { success: true, data };
  }

  async findAllBySiswa(siswaId: number) {
    const data = await this.konselingRepo.find({
      where: { siswaId },
      relations: ['siswa', 'guruBk', 'guruBk.pegawai'],
    });
    return { success: true, data };
  }

  async findOne(id: number) {
    const data = await this.konselingRepo.findOne({
      where: { id },
      relations: ['siswa', 'guruBk', 'guruBk.pegawai'],
    });
    if (!data) throw new NotFoundException('Catatan konseling tidak ditemukan');
    return { success: true, data };
  }

  async create(body: any) {
    const newData = this.konselingRepo.create(body);
    await this.konselingRepo.save(newData);
    return {
      success: true,
      message: 'Catatan konseling berhasil ditambahkan',
      data: newData,
    };
  }

  async update(id: number, body: any) {
    await this.konselingRepo.update(id, body);
    return this.findOne(id);
  }
}
