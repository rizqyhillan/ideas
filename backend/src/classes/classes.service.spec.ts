import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { Kelas } from '../database/entities/entities/Kelas';
import { SiswaKelas } from '../database/entities/entities/SiswaKelas';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';
import { Guru } from '../database/entities/entities/Guru';
import { Siswa } from '../database/entities/entities/Siswa';

describe('ClassesService', () => {
  let service: ClassesService;
  let kelasRepo: Partial<Record<keyof Repository<Kelas>, jest.Mock>>;
  let siswaKelasRepo: Partial<Record<keyof Repository<SiswaKelas>, jest.Mock>>;
  let tahunAjaranRepo: Partial<Record<keyof Repository<TahunAjaran>, jest.Mock>>;
  let guruRepo: Partial<Record<keyof Repository<Guru>, jest.Mock>>;
  let siswaRepo: Partial<Record<keyof Repository<Siswa>, jest.Mock>>;
  let dataSource: any;
  let mockKelas: any;

  beforeEach(async () => {
    mockKelas = {
      id: 1,
      tahunAjaranId: 1,
      nama: 'VII-A',
      tingkat: 7,
      waliKelasId: 1,
      kapasitas: 30,
      ruang: 'R.101',
      statusAktif: true,
      deletedAt: null,
      tahunAjaran: { id: 1, nama: '2024/2025' },
      waliKelas: { id: 1, pegawai: { namaLengkap: 'Budi Santoso' } },
      siswaKelas: [],
    };

    kelasRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    siswaKelasRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };

    tahunAjaranRepo = {
      findOne: jest.fn(),
    };

    guruRepo = {
      findOne: jest.fn(),
    };

    siswaRepo = {
      find: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(Kelas), useValue: kelasRepo },
        { provide: getRepositoryToken(SiswaKelas), useValue: siswaKelasRepo },
        { provide: getRepositoryToken(TahunAjaran), useValue: tahunAjaranRepo },
        { provide: getRepositoryToken(Guru), useValue: guruRepo },
        { provide: getRepositoryToken(Siswa), useValue: siswaRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if tahun ajaran not found', async () => {
      tahunAjaranRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.create({
          tahunAjaranId: 99,
          nama: 'VII-A',
          tingkat: 7,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if class name already exists in same academic year', async () => {
      tahunAjaranRepo.findOne!.mockResolvedValue({ id: 1 });
      kelasRepo.createQueryBuilder!.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockKelas),
      });

      await expect(
        service.create({
          tahunAjaranId: 1,
          nama: 'VII-A',
          tingkat: 7,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create class successfully', async () => {
      tahunAjaranRepo.findOne!.mockResolvedValue({ id: 1 });
      kelasRepo.createQueryBuilder!.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      kelasRepo.create!.mockReturnValue(mockKelas);
      kelasRepo.save!.mockResolvedValue(mockKelas);
      kelasRepo.findOne!.mockResolvedValue(mockKelas);

      const result = await service.create({
        tahunAjaranId: 1,
        nama: 'VII-A',
        tingkat: 7,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockKelas);
    });
  });

  describe('findOne', () => {
    it('should return class detail by id', async () => {
      kelasRepo.findOne!.mockResolvedValue(mockKelas);

      const result = await service.findOne(1);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      kelasRepo.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete class and deactivate students', async () => {
      kelasRepo.findOne!.mockResolvedValue({ ...mockKelas });
      kelasRepo.save!.mockResolvedValue({ ...mockKelas, deletedAt: new Date() });
      siswaKelasRepo.update!.mockResolvedValue({ affected: 5 });

      const result = await service.remove(1, 10);
      expect(result.success).toBe(true);
      expect(kelasRepo.save).toHaveBeenCalled();
      expect(siswaKelasRepo.update).toHaveBeenCalled();
    });
  });

  describe('assignStudents', () => {
    it('should throw BadRequestException if student list is invalid', async () => {
      kelasRepo.findOne!.mockResolvedValue(mockKelas);
      siswaRepo.find!.mockResolvedValue([]); // returns fewer students than requested

      await expect(
        service.assignStudents(1, { siswaIds: [1, 2] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should assign students successfully', async () => {
      kelasRepo.findOne!.mockResolvedValue(mockKelas);
      siswaRepo.find!.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      siswaKelasRepo.count!.mockResolvedValue(0);
      siswaKelasRepo.find!.mockResolvedValue([
        { id: 1, siswaId: 1, kelasId: 1, siswa: { namaLengkap: 'Siswa 1' } },
        { id: 2, siswaId: 2, kelasId: 1, siswa: { namaLengkap: 'Siswa 2' } },
      ]);
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const managerMock = {
          createQueryBuilder: jest.fn().mockReturnValue({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue(undefined),
          }),
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
        };
        return cb(managerMock);
      });

      const result = await service.assignStudents(1, { siswaIds: [1, 2] });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });
});
