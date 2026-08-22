import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { TahunAjaranService } from './tahun-ajaran.service';
import { TahunAjaran } from '../database/entities/entities/TahunAjaran';

describe('TahunAjaranService', () => {
  let service: TahunAjaranService;
  let repository: Partial<Record<keyof Repository<TahunAjaran>, jest.Mock>>;
  let dataSource: any;

  const mockTahunAjaran = {
    id: 1,
    nama: '2024/2025',
    tanggalMulai: '2024-07-01',
    tanggalSelesai: '2025-06-30',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    semesters: [],
    kelas: [],
    anggotaEkstrakurikulers: [],
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TahunAjaranService,
        {
          provide: getRepositoryToken(TahunAjaran),
          useValue: repository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<TahunAjaranService>(TahunAjaranService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActive', () => {
    it('should return active tahun ajaran', async () => {
      repository.findOne!.mockResolvedValue(mockTahunAjaran);

      const result = await service.getActive();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTahunAjaran);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: { semesters: true },
      });
    });

    it('should throw NotFoundException when no active tahun ajaran', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.getActive()).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if tanggalSelesai <= tanggalMulai', async () => {
      await expect(
        service.create({
          nama: '2024/2025',
          tanggalMulai: '2025-01-01',
          tanggalSelesai: '2024-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if nama already exists', async () => {
      repository.findOne!.mockResolvedValue(mockTahunAjaran);

      await expect(
        service.create({
          nama: '2024/2025',
          tanggalMulai: '2024-07-01',
          tanggalSelesai: '2025-06-30',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create tahun ajaran with transaction if isActive is true', async () => {
      repository.findOne!.mockResolvedValue(null);
      const managerMock = {
        createQueryBuilder: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue(undefined),
        }),
        create: jest.fn().mockReturnValue(mockTahunAjaran),
        save: jest.fn().mockResolvedValue(mockTahunAjaran),
      };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(managerMock));

      const result = await service.create({
        nama: '2024/2025',
        tanggalMulai: '2024-07-01',
        tanggalSelesai: '2025-06-30',
        isActive: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTahunAjaran);
    });
  });

  describe('findOne', () => {
    it('should return tahun ajaran by id', async () => {
      repository.findOne!.mockResolvedValue(mockTahunAjaran);

      const result = await service.findOne(1);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if trying to remove active academic year', async () => {
      repository.findOne!.mockResolvedValue({ ...mockTahunAjaran, isActive: true });

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should remove inactive academic year successfully', async () => {
      const inactiveYear = { ...mockTahunAjaran, isActive: false };
      repository.findOne!.mockResolvedValue(inactiveYear);
      repository.remove!.mockResolvedValue(inactiveYear);

      const result = await service.remove(1);

      expect(result.success).toBe(true);
      expect(repository.remove).toHaveBeenCalledWith(inactiveYear);
    });
  });
});
