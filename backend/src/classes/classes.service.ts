import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';

import { Kelas } from '../database/entities/entities/Kelas';
import { SiswaKelas } from '../database/entities/entities/SiswaKelas';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';
import { Guru } from '../database/entities/entities/Guru';
import { Siswa } from '../database/entities/entities/Siswa';
import { JadwalPelajaran } from '../database/entities/entities/JadwalPelajaran';

import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { AssignStudentsDto, RemoveStudentDto } from './dto/assign-student.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepository: Repository<Kelas>,

    @InjectRepository(SiswaKelas)
    private readonly siswaKelasRepository: Repository<SiswaKelas>,

    @InjectRepository(TahunAjaran)
    private readonly tahunAjaranRepository: Repository<TahunAjaran>,

    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,

    @InjectRepository(Siswa)
    private readonly siswaRepository: Repository<Siswa>,

    @InjectRepository(JadwalPelajaran)
    private readonly jadwalRepository: Repository<JadwalPelajaran>,

    private readonly dataSource: DataSource,
  ) {}

  // =========================================================
  // FIND BY ID (HELPER)
  // =========================================================
  async findById(id: number) {
    return this.kelasRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: {
        tahunAjaran: true,
        waliKelas: {
          pegawai: true,
        },
        siswaKelas: {
          siswa: true,
        },
      },
    });
  }

  private async findGuruForUser(userId: number): Promise<Guru | null> {
    return this.guruRepository
      .createQueryBuilder('guru')
      .innerJoin('guru.pegawai', 'pegawai')
      .where('pegawai.userId = :userId', { userId })
      .getOne();
  }

  private async assertTeacherScope(kelas: Kelas, user?: any) {
    const roles = user?.userRoles2?.map((item: any) => item.role?.code) ?? [];
    if (roles.includes('siswa')) {
      const siswa = await this.siswaRepository.findOne({ where: { userId: user.id, deletedAt: IsNull() } });
      if (!siswa) throw new BadRequestException('Akun siswa belum terhubung ke data siswa');
      const membership = await this.siswaKelasRepository.findOne({ where: { siswaId: siswa.id, kelasId: kelas.id, isActive: true } });
      if (!membership) throw new BadRequestException('Anda tidak terdaftar pada kelas ini');
      return;
    }
    if (!roles.includes('guru') || roles.includes('admin') || roles.includes('super_admin')) return;

    const guru = await this.findGuruForUser(user.id);

    const teachesClass = guru
      ? await this.jadwalRepository.exists({
          where: {
            guruId: guru.id,
            kelasId: kelas.id,
            statusAktif: true,
            deletedAt: IsNull(),
          },
        })
      : false;

    if (!guru || (kelas.waliKelasId !== guru.id && !teachesClass)) {
      throw new BadRequestException(
        'Guru hanya dapat mengakses kelas wali atau kelas pada jadwal mengajarnya',
      );
    }
  }

  // =========================================================
  // CREATE
  // =========================================================
  async create(dto: CreateClassDto, userId?: number) {
    // 1. Cek Tahun Ajaran
    const tahunAjaran = await this.tahunAjaranRepository.findOne({
      where: { id: dto.tahunAjaranId },
    });
    if (!tahunAjaran) {
      throw new BadRequestException('Tahun ajaran tidak ditemukan');
    }

    // 2. Cek Wali Kelas jika diberikan
    if (dto.waliKelasId) {
      const guru = await this.guruRepository.findOne({
        where: { id: dto.waliKelasId },
      });
      if (!guru) {
        throw new BadRequestException('Guru wali kelas tidak ditemukan');
      }

      // Cek apakah guru sudah menjadi wali kelas pada tahun ajaran yang sama
      const statusAktif = dto.statusAktif ?? true;
      if (statusAktif) {
        const waliKonflik = await this.kelasRepository.findOne({
          where: {
            tahunAjaranId: dto.tahunAjaranId,
            waliKelasId: dto.waliKelasId,
            statusAktif: true,
            deletedAt: IsNull(),
          },
        });
        if (waliKonflik) {
          throw new ConflictException(
            'Guru tersebut sudah menjadi wali kelas pada tahun ajaran ini',
          );
        }
      }
    }

    // 3. Cek Nama Kelas unik per tahun ajaran
    const namaKonflik = await this.kelasRepository
      .createQueryBuilder('k')
      .where('k.tahun_ajaran_id = :taId', { taId: dto.tahunAjaranId })
      .andWhere('LOWER(k.nama) = LOWER(:nama)', { nama: dto.nama.trim() })
      .andWhere('k.deleted_at IS NULL')
      .getOne();

    if (namaKonflik) {
      throw new ConflictException(
        `Kelas dengan nama "${dto.nama}" sudah ada pada tahun ajaran ini`,
      );
    }

    const kelas = this.kelasRepository.create({
      tahunAjaranId: dto.tahunAjaranId,
      nama: dto.nama.trim(),
      tingkat: dto.tingkat,
      waliKelasId: dto.waliKelasId ?? null,
      kapasitas: dto.kapasitas ?? null,
      ruang: dto.ruang ?? null,
      statusAktif: dto.statusAktif ?? true,
      createdBy: userId ? ({ id: userId } as any) : null,
      updatedBy: userId ? ({ id: userId } as any) : null,
    });

    const saved = await this.kelasRepository.save(kelas);

    const result = await this.findById(saved.id);

    return {
      success: true,
      message: 'Kelas berhasil dibuat',
      data: result,
    };
  }

  // =========================================================
  // FIND ALL
  // =========================================================
  async findAll(query: QueryClassDto, user?: any) {
    const {
      page,
      limit,
      search,
      tahunAjaranId,
      tingkat,
      waliKelasId,
      statusAktif,
      sort,
      order,
    } = query;

    const qb = this.kelasRepository
      .createQueryBuilder('kelas')
      .leftJoinAndSelect('kelas.tahunAjaran', 'tahunAjaran')
      .leftJoinAndSelect('kelas.waliKelas', 'waliKelas')
      .leftJoinAndSelect('waliKelas.pegawai', 'pegawai')
      .where('kelas.deletedAt IS NULL');

    const roles = user?.userRoles2?.map((item: any) => item.role?.code) ?? [];
    if (roles.includes('guru') && !roles.includes('admin') && !roles.includes('super_admin')) {
      const guru = await this.findGuruForUser(user.id);
      if (!guru) {
        return { success: true, message: 'Classes retrieved successfully', data: [], meta: { page, limit, total: 0, lastPage: 0 } };
      }
      const schedules = await this.jadwalRepository.find({
        where: {
          guruId: guru.id,
          statusAktif: true,
          deletedAt: IsNull(),
        },
        select: { kelasId: true },
      });
      const teachingClassIds = [...new Set(schedules.map((schedule) => schedule.kelasId))];

      if (teachingClassIds.length > 0) {
        qb.andWhere(
          '(kelas.waliKelasId = :currentGuruId OR kelas.id IN (:...teachingClassIds))',
          { currentGuruId: guru.id, teachingClassIds },
        );
      } else {
        qb.andWhere('kelas.waliKelasId = :currentGuruId', { currentGuruId: guru.id });
      }
    }
    if (roles.includes('siswa')) {
      const siswa = await this.siswaRepository.findOne({ where: { userId: user.id, deletedAt: IsNull() } });
      if (!siswa) {
        return { success: true, message: 'Classes retrieved successfully', data: [], meta: { page, limit, total: 0, lastPage: 0 } };
      }
      qb.innerJoin('kelas.siswaKelas', 'currentSiswaKelas', 'currentSiswaKelas.siswaId = :currentSiswaId AND currentSiswaKelas.isActive = true', { currentSiswaId: siswa.id });
    }

    if (search) {
      qb.andWhere('kelas.nama ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (tahunAjaranId) {
      qb.andWhere('kelas.tahunAjaranId = :tahunAjaranId', {
        tahunAjaranId,
      });
    }

    if (tingkat) {
      qb.andWhere('kelas.tingkat = :tingkat', {
        tingkat,
      });
    }

    if (waliKelasId) {
      qb.andWhere('kelas.waliKelasId = :waliKelasId', {
        waliKelasId,
      });
    }

    if (statusAktif !== undefined) {
      qb.andWhere('kelas.statusAktif = :statusAktif', {
        statusAktif,
      });
    }

    qb.orderBy(`kelas.${sort}`, order);

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [classes, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Classes retrieved successfully',
      data: classes,
      meta: {
        page,
        limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // =========================================================
  // FIND ONE
  // =========================================================
  async findOne(id: number, user?: any) {
    const kelas = await this.findById(id);

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    await this.assertTeacherScope(kelas, user);

    return {
      success: true,
      message: 'Kelas retrieved successfully',
      data: kelas,
    };
  }

  // =========================================================
  // UPDATE
  // =========================================================
  async update(id: number, dto: UpdateClassDto, userId?: number) {
    const kelas = await this.findById(id);

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    const tahunAjaranId = dto.tahunAjaranId ?? kelas.tahunAjaranId;
    const nama = dto.nama ? dto.nama.trim() : kelas.nama;
    const waliKelasId =
      dto.waliKelasId !== undefined ? dto.waliKelasId : kelas.waliKelasId;
    const statusAktif =
      dto.statusAktif !== undefined ? dto.statusAktif : kelas.statusAktif;

    // 1. Cek Tahun Ajaran jika diubah
    if (dto.tahunAjaranId && dto.tahunAjaranId !== kelas.tahunAjaranId) {
      const ta = await this.tahunAjaranRepository.findOne({
        where: { id: dto.tahunAjaranId },
      });
      if (!ta) {
        throw new BadRequestException('Tahun ajaran tidak ditemukan');
      }
    }

    // 2. Cek Wali Kelas jika diubah
    if (dto.waliKelasId && dto.waliKelasId !== kelas.waliKelasId) {
      const guru = await this.guruRepository.findOne({
        where: { id: dto.waliKelasId },
      });
      if (!guru) {
        throw new BadRequestException('Guru wali kelas tidak ditemukan');
      }
    }

    // Cek konflik wali kelas
    if (waliKelasId && statusAktif) {
      const waliKonflik = await this.kelasRepository
        .createQueryBuilder('k')
        .where('k.tahun_ajaran_id = :taId', { taId: tahunAjaranId })
        .andWhere('k.wali_kelas_id = :waliId', { waliId: waliKelasId })
        .andWhere('k.status_aktif = true')
        .andWhere('k.id != :id', { id })
        .andWhere('k.deleted_at IS NULL')
        .getOne();

      if (waliKonflik) {
        throw new ConflictException(
          'Guru tersebut sudah menjadi wali kelas pada kelas lain di tahun ajaran ini',
        );
      }
    }

    // 3. Cek Nama Kelas unik
    if (nama !== kelas.nama || tahunAjaranId !== kelas.tahunAjaranId) {
      const namaKonflik = await this.kelasRepository
        .createQueryBuilder('k')
        .where('k.tahun_ajaran_id = :taId', { taId: tahunAjaranId })
        .andWhere('LOWER(k.nama) = LOWER(:nama)', { nama })
        .andWhere('k.id != :id', { id })
        .andWhere('k.deleted_at IS NULL')
        .getOne();

      if (namaKonflik) {
        throw new ConflictException(
          `Kelas dengan nama "${nama}" sudah ada pada tahun ajaran ini`,
        );
      }
    }

    Object.assign(kelas, {
      ...dto,
      nama,
      updatedBy: userId ? ({ id: userId } as any) : kelas.updatedBy,
      updatedAt: new Date(),
    });

    await this.kelasRepository.save(kelas);

    const updated = await this.findById(id);

    return {
      success: true,
      message: 'Kelas berhasil diupdate',
      data: updated,
    };
  }

  // =========================================================
  // REMOVE (SOFT DELETE)
  // =========================================================
  async remove(id: number, userId?: number) {
    const kelas = await this.findById(id);

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    kelas.deletedAt = new Date();
    kelas.statusAktif = false;
    if (userId) {
      kelas.updatedBy = { id: userId } as any;
    }

    await this.kelasRepository.save(kelas);

    // Nonaktifkan siswa di kelas ini
    await this.siswaKelasRepository.update(
      { kelasId: id, isActive: true },
      {
        isActive: false,
        tanggalKeluar: new Date().toISOString().split('T')[0],
        updatedAt: new Date(),
      },
    );

    return {
      success: true,
      message: 'Kelas berhasil dihapus',
    };
  }

  // =========================================================
  // ASSIGN STUDENTS TO CLASS
  // =========================================================
  async assignStudents(
    classId: number,
    dto: AssignStudentsDto,
    userId?: number,
  ) {
    const kelas = await this.findById(classId);
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    if (!kelas.statusAktif) {
      throw new BadRequestException(
        'Tidak dapat menambahkan siswa ke kelas yang tidak aktif',
      );
    }

    const { siswaIds } = dto;
    const tanggalMasuk =
      dto.tanggalMasuk || new Date().toISOString().split('T')[0];

    // Cek keberadaan siswa
    const siswaList = await this.siswaRepository.find({
      where: {
        id: In(siswaIds),
        deletedAt: IsNull(),
      },
    });

    if (siswaList.length !== siswaIds.length) {
      throw new BadRequestException('Satu atau lebih data siswa tidak valid');
    }

    // Cek kapasitas kelas
    if (kelas.kapasitas) {
      const activeCount = await this.siswaKelasRepository.count({
        where: { kelasId: classId, isActive: true },
      });

      if (activeCount + siswaIds.length > kelas.kapasitas) {
        throw new BadRequestException(
          `Kapasitas kelas (${kelas.kapasitas}) tidak mencukupi. Siswa aktif saat ini: ${activeCount}`,
        );
      }
    }

    // Transaksi penempatan siswa
    await this.dataSource.transaction(async (manager) => {
      for (const siswaId of siswaIds) {
        // Nonaktifkan kelas aktif siswa sebelumnya (jika ada)
        await manager
          .createQueryBuilder()
          .update(SiswaKelas)
          .set({
            isActive: false,
            tanggalKeluar: tanggalMasuk,
            updatedAt: new Date(),
          })
          .where('siswa_id = :siswaId AND is_active = true', { siswaId })
          .execute();

        // Cek apakah ada record riwayat di kelas ini
        const existingRecord = await manager.findOne(SiswaKelas, {
          where: {
            kelasId: classId,
            siswaId,
          },
        });

        if (existingRecord) {
          existingRecord.isActive = true;
          existingRecord.tanggalMasuk = tanggalMasuk;
          existingRecord.tanggalKeluar = null;
          existingRecord.updatedAt = new Date();
          if (userId) {
            existingRecord.createdBy = { id: userId } as any;
          }
          await manager.save(SiswaKelas, existingRecord);
        } else {
          const newSiswaKelas = manager.create(SiswaKelas, {
            kelasId: classId,
            siswaId,
            tanggalMasuk,
            isActive: true,
            createdBy: userId ? ({ id: userId } as any) : null,
          });
          await manager.save(SiswaKelas, newSiswaKelas);
        }
      }
    });

    const students = await this.getClassStudents(classId);

    return {
      success: true,
      message: `${siswaIds.length} siswa berhasil ditambahkan ke kelas`,
      data: students.data,
    };
  }

  // =========================================================
  // REMOVE STUDENT FROM CLASS
  // =========================================================
  async removeStudentFromClass(
    classId: number,
    siswaId: number,
    dto: RemoveStudentDto,
  ) {
    const record = await this.siswaKelasRepository.findOne({
      where: {
        kelasId: classId,
        siswaId,
        isActive: true,
      },
    });

    if (!record) {
      throw new NotFoundException(
        'Siswa tidak terdaftar aktif pada kelas ini',
      );
    }

    const tanggalKeluar =
      dto.tanggalKeluar || new Date().toISOString().split('T')[0];

    record.isActive = false;
    record.tanggalKeluar = tanggalKeluar;
    record.updatedAt = new Date();

    await this.siswaKelasRepository.save(record);

    return {
      success: true,
      message: 'Siswa berhasil dikeluarkan dari kelas',
    };
  }

  // =========================================================
  // GET CLASS STUDENTS
  // =========================================================
  async getClassStudents(classId: number, user?: any) {
    const kelas = await this.findById(classId);
    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    await this.assertTeacherScope(kelas, user);

    const list = await this.siswaKelasRepository.find({
      where: {
        kelasId: classId,
        isActive: true,
      },
      relations: {
        siswa: true,
      },
      order: {
        siswa: {
          namaLengkap: 'ASC',
        },
      },
    });

    return {
      success: true,
      message: 'Class students retrieved successfully',
      data: list,
    };
  }
}
