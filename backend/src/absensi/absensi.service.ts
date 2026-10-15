import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { AbsensiSesi } from '../database/entities/entities/AbsensiSesi';
import { AbsensiSesiItem } from '../database/entities/entities/AbsensiSesiItem';
import { Kelas } from '../database/entities/entities/Kelas';
import { CreateAbsensiSesiDto } from './dto/create-absensi-sesi.dto';
import { PdfService } from '../common/export/pdf.service';
import { Guru } from '../database/entities/entities/Guru';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';
import { JadwalPiketGuru } from '../database/entities/entities/JadwalPiketGuru';
import { Siswa } from '../database/entities/entities/Siswa';

@Injectable()
export class AbsensiService {
  constructor(
    @InjectRepository(AbsensiSesi)
    private absensiSesiRepo: Repository<AbsensiSesi>,
    @InjectRepository(AbsensiSesiItem)
    private absensiSesiItemRepo: Repository<AbsensiSesiItem>,
    @InjectRepository(Kelas)
    private kelasRepo: Repository<Kelas>,
    @InjectRepository(Guru)
    private guruRepo: Repository<Guru>,
    @InjectRepository(JadwalPelajaran)
    private jadwalRepo: Repository<JadwalPelajaran>,
    @InjectRepository(JadwalPiketGuru)
    private jadwalPiketGuruRepo: Repository<JadwalPiketGuru>,
    @InjectRepository(Siswa)
    private siswaRepo: Repository<Siswa>,
    private pdfService: PdfService,
  ) {}

  private roles(user: any): string[] {
    return user?.userRoles2?.map((item: any) => item.role?.code).filter(Boolean) ?? [];
  }

  private isAdmin(user: any): boolean {
    const roles = this.roles(user);
    return roles.includes('admin') || roles.includes('super_admin');
  }

  private dayOfWeek(date: string): string {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'][day];
  }

  private async guruIdForUser(user: any): Promise<number | null> {
    if (!user?.id) return null;
    const guru = await this.guruRepo
      .createQueryBuilder('guru')
      .innerJoin('guru.pegawai', 'pegawai')
      .where('pegawai.userId = :userId', { userId: user.id })
      .getOne();
    return guru?.id ?? null;
  }

  private async siswaIdForUser(user: any): Promise<number | null> {
    const siswa = await this.siswaRepo.findOne({ where: { userId: user?.id } });
    return siswa?.id ?? null;
  }

  private async isAssignedPiket(guruId: number, tanggal: string): Promise<boolean> {
    return Boolean(
      await this.jadwalPiketGuruRepo
        .createQueryBuilder('assignment')
        .innerJoin('assignment.jadwalPiket', 'piket')
        .where('assignment.guruId = :guruId', { guruId })
        .andWhere('piket.statusAktif = true')
        .andWhere('piket.hari = :hari', { hari: this.dayOfWeek(tanggal) })
        .getOne(),
    );
  }

  private async hasTeachingSchedule(
    guruId: number,
    kelasId: number,
    tanggal: string,
    mataPelajaran?: string,
  ): Promise<boolean> {
    const schedules = await this.jadwalRepo.find({
      where: {
        guruId,
        kelasId,
        hari: this.dayOfWeek(tanggal) as any,
        statusAktif: true,
      },
      relations: ['mataPelajaran'],
    });
    if (!mataPelajaran) return schedules.length > 0;
    return schedules.some(
      (schedule) =>
        schedule.mataPelajaran?.nama?.toLowerCase() === mataPelajaran.toLowerCase(),
    );
  }

  private async resolveWriteContext(dto: CreateAbsensiSesiDto, user: any) {
    if (this.isAdmin(user)) {
      return { guruId: dto.guruId ?? null, mode: dto.mode ?? 'mengajar' };
    }
    if (!this.roles(user).includes('guru')) {
      throw new ForbiddenException('Hanya guru atau admin yang dapat mengisi absensi.');
    }
    const guruId = await this.guruIdForUser(user);
    if (!guruId) throw new ForbiddenException('Akun guru belum terhubung ke data guru.');
    if (dto.guruId && dto.guruId !== guruId) {
      throw new ForbiddenException('Guru hanya boleh mencatat absensi atas namanya sendiri.');
    }

    const mode = dto.mode ?? 'mengajar';
    if (mode === 'piket') {
      if (!(await this.isAssignedPiket(guruId, dto.tanggal))) {
        throw new ForbiddenException('Anda tidak memiliki jadwal piket pada tanggal tersebut.');
      }
      const existing = await this.absensiSesiRepo.findOne({
        where: { kelasId: dto.kelasId, tanggal: dto.tanggal },
      });
      if (existing && existing.guruId !== guruId) {
        throw new ForbiddenException('Kelas tersebut sudah memiliki absensi.');
      }
    } else if (
      !(await this.hasTeachingSchedule(
        guruId,
        dto.kelasId,
        dto.tanggal,
        dto.mataPelajaran === 'Pelajaran Terjadwal' ? undefined : dto.mataPelajaran,
      ))
    ) {
      throw new ForbiddenException('Kelas atau mata pelajaran tidak termasuk jadwal mengajar Anda pada tanggal tersebut.');
    }
    return { guruId, mode };
  }

  async create(dto: CreateAbsensiSesiDto, user: any) {
    const context = await this.resolveWriteContext(dto, user);
    let session = await this.absensiSesiRepo
      .createQueryBuilder('sesi')
      .where('sesi.kelasId = :kelasId', { kelasId: dto.kelasId })
      .andWhere('sesi.tanggal = :tanggal', { tanggal: dto.tanggal })
      .andWhere(dto.jamKe ? 'sesi.jamKe = :jamKe' : 'sesi.jamKe IS NULL', {
        jamKe: dto.jamKe,
      })
      .getOne();

    if (session) {
      session.guruId = context.guruId ?? session.guruId;
      session.jamKe = dto.jamKe ?? session.jamKe;
      session.mataPelajaran = dto.mataPelajaran ?? session.mataPelajaran;
      session.catatan = dto.catatan ?? session.catatan;
      session.savedAt = new Date();
      await this.absensiSesiRepo.save(session);

      await this.absensiSesiItemRepo.delete({ absensiSesiId: session.id });
    } else {
      session = this.absensiSesiRepo.create({
        kelasId: dto.kelasId,
        guruId: context.guruId,
        tanggal: dto.tanggal,
        jamKe: dto.jamKe ?? null,
        mataPelajaran: dto.mataPelajaran ?? null,
        catatan: dto.catatan ?? null,
      });
      session = await this.absensiSesiRepo.save(session);
    }

    const items = dto.items.map((item) =>
      this.absensiSesiItemRepo.create({
        absensiSesiId: session.id,
        siswaId: item.siswaId,
        status: item.status,
        keterangan: item.keterangan ?? null,
      }),
    );

    await this.absensiSesiItemRepo.save(items);

    return {
      id: session.id,
      kelasId: session.kelasId,
      guruId: session.guruId,
      tanggal: session.tanggal,
      jamKe: session.jamKe,
      mataPelajaran: session.mataPelajaran,
      catatan: session.catatan,
      savedAt: session.savedAt,
      itemsCount: items.length,
    };
  }

  async findByKelasAndTanggal(
    kelasId: number,
    tanggal: string,
    jamKe?: string,
    user?: any,
  ) {
    const qb = this.absensiSesiRepo
      .createQueryBuilder('sesi')
      .leftJoinAndSelect('sesi.items', 'items')
      .leftJoinAndSelect('items.siswa', 'siswa')
      .leftJoinAndSelect('sesi.kelas', 'kelas')
      .leftJoinAndSelect('sesi.guru', 'guru')
      .leftJoinAndSelect('guru.pegawai', 'pegawai')
      .where('sesi.kelasId = :kelasId', { kelasId })
      .andWhere('sesi.tanggal = :tanggal', { tanggal })
      .andWhere(jamKe ? 'sesi.jamKe = :jamKe' : '1=1', { jamKe })
      .orderBy('items.siswaId', 'ASC');

    const session = await qb.getOne();

    if (!session) return null;
    await this.assertCanReadSession(session, user);

    const roles = this.roles(user);
    const ownStudentId = roles.includes('siswa') ? await this.siswaIdForUser(user) : null;
    const visibleItems = ownStudentId
      ? (session.items ?? []).filter((item) => item.siswaId === ownStudentId)
      : session.items ?? [];
    const items = visibleItems.map((item) => ({
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
  }, user?: any) {
    const { page = 1, limit = 10, kelasId, tanggal } = params;
    const qb = this.absensiSesiRepo.createQueryBuilder('sesi')
      .leftJoinAndSelect('sesi.items', 'items')
      .leftJoinAndSelect('sesi.kelas', 'kelas')
      .leftJoinAndSelect('sesi.guru', 'guru')
      .leftJoinAndSelect('guru.pegawai', 'pegawai')
      .leftJoinAndSelect('items.siswa', 'siswa');

    if (kelasId) qb.andWhere('sesi.kelasId = :kelasId', { kelasId });
    if (tanggal) qb.andWhere('sesi.tanggal = :tanggal', { tanggal });

    if (this.roles(user).includes('siswa')) {
      const ownStudentId = await this.siswaIdForUser(user);
      if (!ownStudentId) throw new ForbiddenException('Akun siswa belum terhubung ke data siswa.');
      qb.andWhere('items.siswaId = :ownStudentId', { ownStudentId });
    } else if (!this.isAdmin(user)) {
      const guruId = await this.guruIdForUser(user);
      if (!guruId) throw new ForbiddenException('Akun guru belum terhubung ke data guru.');
      qb.andWhere('sesi.guruId = :scopeGuruId', { scopeGuruId: guruId });
    }

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

  async getUnattendedClasses(tanggal: string, user?: any) {
    if (!this.isAdmin(user)) {
      const guruId = await this.guruIdForUser(user);
      if (!guruId || !(await this.isAssignedPiket(guruId, tanggal))) {
        throw new ForbiddenException('Daftar kelas belum diabsen hanya tersedia untuk guru piket.');
      }
    }
    const allClasses = await this.kelasRepo.find({
      where: { statusAktif: true },
      relations: ['waliKelas', 'waliKelas.pegawai'],
      order: { tingkat: 'ASC', nama: 'ASC' },
    });

    const recordedSessions = await this.absensiSesiRepo.find({
      where: { tanggal },
      select: ['kelasId'],
    });

    const attendedClassIds = new Set(recordedSessions.map((s) => s.kelasId));

    return allClasses
      .filter((c) => !attendedClassIds.has(c.id))
      .map((c) => ({
        id: c.id,
        nama: c.nama,
        tingkat: c.tingkat,
        ruang: c.ruang,
        kapasitas: c.kapasitas,
        waliKelas: c.waliKelas?.pegawai?.namaLengkap ?? null,
      }));
  }

  private async fetchAttendanceReportRows(params: {
    kelasId?: number;
    guruId?: number;
    startDate?: string;
    endDate?: string;
  }, user?: any) {
    const qb = this.absensiSesiRepo
      .createQueryBuilder('sesi')
      .leftJoinAndSelect('sesi.items', 'items')
      .leftJoinAndSelect('items.siswa', 'siswa')
      .leftJoinAndSelect('sesi.kelas', 'kelas')
      .leftJoinAndSelect('sesi.guru', 'guru')
      .leftJoinAndSelect('guru.pegawai', 'pegawai');

    if (params.kelasId) {
      qb.andWhere('sesi.kelasId = :kelasId', { kelasId: params.kelasId });
    }
    if (params.guruId) {
      qb.andWhere('sesi.guruId = :guruId', { guruId: params.guruId });
    }
    if (params.startDate && params.endDate) {
      qb.andWhere('sesi.tanggal BETWEEN :start AND :end', {
        start: params.startDate,
        end: params.endDate,
      });
    } else if (params.startDate) {
      qb.andWhere('sesi.tanggal >= :start', { start: params.startDate });
    } else if (params.endDate) {
      qb.andWhere('sesi.tanggal <= :end', { end: params.endDate });
    }

    if (!this.isAdmin(user)) {
      const ownGuruId = await this.guruIdForUser(user);
      if (!ownGuruId) throw new ForbiddenException('Akun guru belum terhubung ke data guru.');
      if (params.guruId && params.guruId !== ownGuruId) {
        throw new ForbiddenException('Guru hanya boleh mengekspor absensi miliknya sendiri.');
      }
      qb.andWhere('sesi.guruId = :scopeGuruId', { scopeGuruId: ownGuruId });
    }

    qb.orderBy('sesi.tanggal', 'DESC')
      .addOrderBy('kelas.nama', 'ASC')
      .addOrderBy('siswa.namaLengkap', 'ASC');

    const sessions = await qb.getMany();

    const rows: any[] = [];
    for (const sesi of sessions) {
      for (const item of sesi.items || []) {
        rows.push({
          Tanggal: sesi.tanggal,
          Kelas: sesi.kelas?.nama || '-',
          'Mata Pelajaran': sesi.mataPelajaran || '-',
          'Guru Pengajar': sesi.guru?.pegawai?.namaLengkap || '-',
          NISN: item.siswa?.nisn || '-',
          'Nama Siswa': item.siswa?.namaLengkap || '-',
          'Jenis Kelamin': item.siswa?.jenisKelamin || '-',
          Status: item.status ? item.status.toUpperCase() : '-',
          Keterangan: item.keterangan || '-',
        });
      }
    }
    return rows;
  }

  async exportExcel(params: {
    kelasId?: number;
    guruId?: number;
    startDate?: string;
    endDate?: string;
  }, user?: any): Promise<Buffer> {
    const rows = await this.fetchAttendanceReportRows(params, user);
    const dataToExport =
      rows.length > 0
        ? rows
        : [
            {
              Informasi: 'Tidak ada data absensi untuk filter yang dipilih.',
            },
          ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi Siswa');
    return Buffer.from(
      XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', cellStyles: true }),
    );
  }

  async exportPdf(params: {
    kelasId?: number;
    guruId?: number;
    startDate?: string;
    endDate?: string;
  }, user?: any): Promise<Buffer> {
    const rows = await this.fetchAttendanceReportRows(params, user);
    const dataToExport =
      rows.length > 0
        ? rows
        : [
            {
              Pesan: 'Tidak ada data absensi untuk filter yang dipilih.',
            },
          ];

    return this.pdfService.generatePdfBuffer(
      dataToExport,
      'Laporan-Absensi',
      'REKAPITULASI ABSENSI SISWA',
    );
  }

  private async assertCanReadSession(session: AbsensiSesi, user: any) {
    if (this.isAdmin(user)) return;
    if (this.roles(user).includes('siswa')) {
      const ownStudentId = await this.siswaIdForUser(user);
      const isInSession = session.items?.some((item) => item.siswaId === ownStudentId);
      if (!ownStudentId || !isInSession) {
        throw new ForbiddenException('Anda tidak memiliki akses ke absensi ini.');
      }
      return;
    }
    const guruId = await this.guruIdForUser(user);
    if (!guruId || session.guruId !== guruId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke absensi ini.');
    }
  }
}
