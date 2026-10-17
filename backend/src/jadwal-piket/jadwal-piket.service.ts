import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { Guru } from '../database/entities/entities/Guru';
import { JadwalPiket } from '../database/entities/entities/JadwalPiket';
import { JadwalPiketGuru } from '../database/entities/entities/JadwalPiketGuru';
import { Semester } from '../database/entities/entities/Semester';
import { Users } from '../database/entities/entities/Users';
import { CreateJadwalPiketDto, UpdateJadwalPiketDto } from './dto/create-jadwal-piket.dto';
import { QueryJadwalPiketDto } from './dto/query-jadwal-piket.dto';
import { NotificationsService } from '../notifications/notifications.service';

const DAY_ORDER: Record<string, number> = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
};

@Injectable()
export class JadwalPiketService {
  constructor(
    @InjectRepository(JadwalPiket)
    private readonly jadwalRepository: Repository<JadwalPiket>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryJadwalPiketDto) {
    const qb = this.jadwalRepository
      .createQueryBuilder('jadwal')
      .leftJoinAndSelect('jadwal.semester', 'semester')
      .leftJoinAndSelect('semester.tahunAjaran', 'tahunAjaran')
      .leftJoinAndSelect('jadwal.jadwalPiketGurus', 'penugasan')
      .leftJoinAndSelect('penugasan.guru', 'guru')
      .leftJoinAndSelect('guru.pegawai', 'pegawai')
      .where('jadwal.deletedAt IS NULL');

    if (query.semesterId) {
      qb.andWhere('jadwal.semesterId = :semesterId', {
        semesterId: query.semesterId,
      });
    }
    if (query.hari) qb.andWhere('jadwal.hari = :hari', { hari: query.hari });
    if (query.statusAktif !== undefined) {
      qb.andWhere('jadwal.statusAktif = :statusAktif', {
        statusAktif: query.statusAktif,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(jadwal.nama) LIKE :search OR LOWER(jadwal.lokasi) LIKE :search OR LOWER(pegawai.namaLengkap) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    const rows = await qb
      .orderBy(
        `CASE jadwal.hari WHEN 'senin' THEN 1 WHEN 'selasa' THEN 2 WHEN 'rabu' THEN 3 WHEN 'kamis' THEN 4 WHEN 'jumat' THEN 5 ELSE 6 END`,
        'ASC',
      )
      .addOrderBy('jadwal.jamMulai', 'ASC')
      .addOrderBy('jadwal.nama', 'ASC')
      .getMany();

    return { success: true, data: rows.map((row) => this.toResponse(row)) };
  }

  async findOne(id: number) {
    const row = await this.jadwalRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        semester: { tahunAjaran: true },
        jadwalPiketGurus: { guru: { pegawai: true } },
      },
    });
    if (!row) throw new NotFoundException('Jadwal guru piket tidak ditemukan');
    return { success: true, data: this.toResponse(row) };
  }

  async create(dto: CreateJadwalPiketDto, user: Users) {
    this.assertTimeRange(dto.jamMulai, dto.jamSelesai);
    if (!dto.nama.trim()) {
      throw new BadRequestException('Nama tugas piket wajib diisi');
    }
    if (!dto.guruIds?.length) {
      throw new BadRequestException('Pilih minimal satu guru yang bertugas');
    }
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const manager = runner.manager;
      await this.assertSemesterExists(manager, dto.semesterId);
      await this.assertGurusExist(manager, dto.guruIds ?? []);

      const row = manager.create(JadwalPiket, {
        semesterId: dto.semesterId,
        nama: dto.nama.trim(),
        hari: dto.hari,
        jamMulai: dto.jamMulai,
        jamSelesai: dto.jamSelesai,
        lokasi: dto.lokasi?.trim() || null,
        statusAktif: dto.statusAktif ?? true,
        createdBy: { id: user.id } as Users,
      });
      const saved = await manager.save(row);

      if (dto.guruIds?.length) {
        const assignments = dto.guruIds.map((guruId) =>
          manager.create(JadwalPiketGuru, {
            jadwalPiketId: saved.id,
            guruId,
            assignedBy: { id: user.id } as Users,
          }),
        );
        await manager.save(assignments);
        await this.notifyGurus(
          manager,
          dto.guruIds,
          `Anda mendapat jadwal piket: ${saved.nama}`,
          this.describeAssignment(saved),
        );
      }

      await runner.commitTransaction();
      return this.findOne(saved.id);
    } catch (error) {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      this.rethrowDatabaseError(error);
    } finally {
      await runner.release();
    }
  }

  async update(id: number, dto: UpdateJadwalPiketDto, user: Users) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const manager = runner.manager;
      const row = await manager.findOne(JadwalPiket, {
        where: { id, deletedAt: IsNull() },
        relations: { jadwalPiketGurus: true },
      });
      if (!row) throw new NotFoundException('Jadwal guru piket tidak ditemukan');
      const previous = {
        semesterId: row.semesterId,
        nama: row.nama,
        hari: row.hari,
        jamMulai: row.jamMulai,
        jamSelesai: row.jamSelesai,
        lokasi: row.lokasi,
        statusAktif: row.statusAktif,
      };

      const jamMulai = dto.jamMulai ?? row.jamMulai;
      const jamSelesai = dto.jamSelesai ?? row.jamSelesai;
      this.assertTimeRange(jamMulai, jamSelesai);
      if (dto.semesterId !== undefined) {
        await this.assertSemesterExists(manager, dto.semesterId);
      }
      if (dto.nama !== undefined && !dto.nama.trim()) {
        throw new BadRequestException('Nama tugas piket wajib diisi');
      }
      if (dto.guruIds !== undefined) {
        if (dto.guruIds.length === 0) {
          throw new BadRequestException('Jadwal harus memiliki minimal satu guru yang bertugas');
        }
        await this.assertGurusExist(manager, dto.guruIds);
      }

      if (dto.semesterId !== undefined) row.semesterId = dto.semesterId;
      if (dto.nama !== undefined) row.nama = dto.nama.trim();
      if (dto.hari !== undefined) row.hari = dto.hari;
      if (dto.jamMulai !== undefined) row.jamMulai = dto.jamMulai;
      if (dto.jamSelesai !== undefined) row.jamSelesai = dto.jamSelesai;
      if (dto.lokasi !== undefined) row.lokasi = dto.lokasi?.trim() || null;
      if (dto.statusAktif !== undefined) row.statusAktif = dto.statusAktif;
      const scheduleDetailsChanged =
        row.semesterId !== previous.semesterId ||
        row.nama !== previous.nama ||
        row.hari !== previous.hari ||
        row.jamMulai !== previous.jamMulai ||
        row.jamSelesai !== previous.jamSelesai ||
        row.lokasi !== previous.lokasi ||
        row.statusAktif !== previous.statusAktif;
      await manager.save(row);

      if (dto.guruIds !== undefined) {
        const assignmentRepo = manager.getRepository(JadwalPiketGuru);
        const currentIds = new Set(row.jadwalPiketGurus.map((item) => item.guruId));
        const nextIds = new Set(dto.guruIds);
        const addedIds = [...nextIds].filter((guruId) => !currentIds.has(guruId));
        const removedIds = [...currentIds].filter((guruId) => !nextIds.has(guruId));

        for (const guruId of addedIds) {
          await assignmentRepo.save(
            assignmentRepo.create({
              jadwalPiketId: id,
              guruId,
              assignedBy: { id: user.id } as Users,
            }),
          );
        }

        for (const guruId of removedIds) {
          const hasAttendance = await manager
            .createQueryBuilder()
            .select('1')
            .from('absensi_guru_piket', 'absensi')
            .where('absensi.jadwal_piket_id = :id AND absensi.guru_id = :guruId', {
              id,
              guruId,
            })
            .limit(1)
            .getRawOne();
          if (hasAttendance) {
            throw new ConflictException(
              'Guru yang sudah memiliki riwayat kehadiran piket tidak dapat dilepas dari jadwal.',
            );
          }
          await assignmentRepo.delete({ jadwalPiketId: id, guruId });
        }

        if (addedIds.length > 0) {
          await this.notifyGurus(
            manager,
            addedIds,
            `Anda mendapat jadwal piket: ${row.nama}`,
            this.describeAssignment(row),
          );
        }
        if (removedIds.length > 0) {
          await this.notifyGurus(
            manager,
            removedIds,
            `Penugasan piket diperbarui: ${row.nama}`,
            `Anda tidak lagi ditugaskan pada ${this.describeAssignment(row)}`,
          );
        }
        const retainedIds = [...nextIds].filter((guruId) => currentIds.has(guruId));
        if (scheduleDetailsChanged && retainedIds.length > 0) {
          await this.notifyGurus(
            manager,
            retainedIds,
            `Jadwal piket diperbarui: ${row.nama}`,
            this.describeAssignment(row),
          );
        }
      } else if (scheduleDetailsChanged && row.jadwalPiketGurus.length > 0) {
        await this.notifyGurus(
          manager,
          row.jadwalPiketGurus.map((item) => item.guruId),
          `Jadwal piket diperbarui: ${row.nama}`,
          this.describeAssignment(row),
        );
      }

      await runner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      this.rethrowDatabaseError(error);
    } finally {
      await runner.release();
    }
  }

  async remove(id: number) {
    const row = await this.jadwalRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { jadwalPiketGurus: { guru: { pegawai: true } } },
    });
    if (!row) throw new NotFoundException('Jadwal guru piket tidak ditemukan');

    // Keep assignment and attendance history intact.
    row.statusAktif = false;
    row.deletedAt = new Date();
    await this.jadwalRepository.save(row);
    const userIds = (row.jadwalPiketGurus ?? [])
      .map((assignment) => assignment.guru?.pegawai?.userId)
      .filter((userId): userId is number => Boolean(userId));
    await this.notificationsService.createForUsers({
      userIds,
      title: `Jadwal piket dibatalkan: ${row.nama}`,
      description: `${this.describeAssignment(row)} Jadwal tersebut telah dibatalkan oleh admin.`,
      category: 'Akademik',
      link: '/academic/jadwal-guru-piket',
    });
    return { success: true, message: 'Jadwal guru piket berhasil diarsipkan' };
  }

  private toResponse(row: JadwalPiket) {
    const assignments = row.jadwalPiketGurus ?? [];
    const gurus = assignments
      .map(({ guru }) => guru)
      .filter(Boolean)
      .map((guru) => ({
        id: guru.id,
        kodeGuru: guru.kodeGuru,
        namaLengkap: guru.pegawai?.namaLengkap ?? '',
        nip: guru.pegawai?.nip ?? null,
        email: guru.pegawai?.email ?? null,
      }));

    return {
      id: row.id,
      semesterId: row.semesterId,
      nama: row.nama,
      hari: row.hari,
      jamMulai: row.jamMulai,
      jamSelesai: row.jamSelesai,
      lokasi: row.lokasi,
      statusAktif: row.statusAktif,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      semester: row.semester
        ? {
            id: row.semester.id,
            jenis: row.semester.jenis,
            tahunAjaranId: row.semester.tahunAjaranId,
            tahunAjaranNama: row.semester.tahunAjaran?.nama ?? '',
          }
        : null,
      gurus,
      guruIds: gurus.map((guru) => guru.id),
    };
  }

  private assertTimeRange(start: string, end: string) {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    if (toMinutes(end) <= toMinutes(start)) {
      throw new BadRequestException('Jam selesai harus lebih akhir dari jam mulai');
    }
  }

  private async assertSemesterExists(manager: EntityManager, semesterId: number) {
    const semester = await manager.findOne(Semester, { where: { id: semesterId } });
    if (!semester) throw new BadRequestException('Semester tidak ditemukan');
  }

  private async assertGurusExist(manager: EntityManager, guruIds: number[]) {
    if (!guruIds.length) return;
    const found = await manager
      .getRepository(Guru)
      .createQueryBuilder('guru')
      .where('guru.id IN (:...guruIds)', { guruIds })
      .getCount();
    if (found !== new Set(guruIds).size) {
      throw new BadRequestException('Satu atau lebih data guru tidak ditemukan');
    }
  }

  private async notifyGurus(
    manager: EntityManager,
    guruIds: number[],
    title: string,
    description: string,
  ) {
    if (guruIds.length === 0) return;
    const gurus = await manager.getRepository(Guru).find({
      where: { id: In(guruIds) },
      relations: { pegawai: true },
    });
    const userIds = gurus
      .filter((guru) => guru.pegawai?.statusAktif && guru.pegawai.userId)
      .map((guru) => guru.pegawai.userId!);
    await this.notificationsService.createForUsers(
      {
        userIds,
        title,
        description,
        category: 'Akademik',
        link: '/academic/jadwal-guru-piket',
      },
      manager,
    );
  }

  private describeAssignment(jadwal: JadwalPiket) {
    const hari = jadwal.hari.charAt(0).toUpperCase() + jadwal.hari.slice(1);
    const waktu = `${jadwal.jamMulai.slice(0, 5)}–${jadwal.jamSelesai.slice(0, 5)}`;
    const lokasi = jadwal.lokasi ? ` di ${jadwal.lokasi}` : '';
    return `${jadwal.nama}, ${hari} pukul ${waktu}${lokasi}.`;
  }

  private rethrowDatabaseError(error: any): never {
    if (error?.code === '23505') {
      throw new ConflictException('Jadwal piket dengan kombinasi yang sama sudah ada');
    }
    throw error;
  }
}
