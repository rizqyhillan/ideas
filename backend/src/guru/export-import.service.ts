import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guru } from '../database/entities/entities/Guru';
import { ExportImportService } from '../common/export/export.service';

/**
 * Export/import service for Guru master.
 */
@Injectable()
export class GuruExportImportService extends ExportImportService {
  constructor(
    @InjectRepository(Guru)
    private readonly guruRepository: Repository<Guru>,
  ) {
    super();
  }

  async getAllMasterData(): Promise<any[]> {
    const rows = await this.guruRepository.find({
      relations: { pegawai: true },
    });

    // Export the useful teacher master fields, including NUPTK used by the
    // account-provisioning flow. Passwords are never part of an export.
    return rows.map((guru) => ({
      id: guru.id,
      pegawaiId: guru.pegawaiId,
      kodeGuru: guru.kodeGuru,
      namaLengkap: guru.pegawai?.namaLengkap ?? null,
      nip: guru.pegawai?.nip ?? null,
      nuptk: guru.pegawai?.nuptk ?? null,
      jenisKelamin: guru.pegawai?.jenisKelamin ?? null,
      tempatLahir: guru.pegawai?.tempatLahir ?? null,
      tanggalLahir: guru.pegawai?.tanggalLahir ?? null,
      email: guru.pegawai?.email ?? null,
      noTelepon: guru.pegawai?.noTelepon ?? null,
      alamat: guru.pegawai?.alamat ?? null,
      jabatan: guru.pegawai?.jabatan ?? null,
      statusAktif: guru.pegawai?.statusAktif ?? false,
      userId: guru.pegawai?.userId ?? null,
    }));
  }

  async importToMaster(master: string, rows: any[]): Promise<number> {
    if (!rows || rows.length === 0) return 0;
    const records = rows.map((r) => ({
      kodeGuru: r.kodeGuru ?? null,
      pegawaiId: r.pegawaiId ?? null,
    }));
    const saved = await this.guruRepository.save(records);
    return saved.length;
  }
}
