import { Injectable, Provider, Inject } from '@nestjs/common';
import * as XLSX from 'xlsx';

/**
 * Base export/import utility service for all master modules.
 * Contains generic XLSX/PDF utilities plus abstract methods implemented
 * by each module with its own TypeORM repository.
 * Uses a token for dependency injection of the concrete service.
 */
export const EXPORT_IMPORT_SERVICE = Symbol('EXPORT_IMPORT_SERVICE');

@Injectable()
export abstract class ExportImportService {
  protected static readonly MASTER_ENTITIES: Record<string, string> = {
    siswa: 'Siswa',
    pegawai: 'Pegawai',
    guru: 'Guru',
    mata_pelajaran: 'MataPelajaran',
    tahun_ajaran: 'TahunAjaran',
    kelas: 'Classes',
    absensi: 'AbsensiSesi',
    jadwal: 'JadwalPelajaran',
    ekstrakurikuler: 'Ekstrakurikuler',
    semester: 'Semester',
    roles: 'Roles',
    permissions: 'Permissions',
    users: 'Users',
  };

  /** Convert an array of objects into an XLSX workbook (single sheet). */
  static toWorkbook(data: any[], sheetName: string = 'Sheet1'): XLSX.WorkBook {
    const ws = XLSX.utils.json_to_sheet(data);
    return {
      SheetNames: [sheetName],
      Sheets: { [sheetName]: ws },
    };
  }

  /** Return an XLSX buffer from an array of objects. */
  static toExcelBuffer(data: any[], fileName: string = 'export'): Buffer {
    const wb = this.toWorkbook(data, 'Sheet1');
    return Buffer.from(
      XLSX.write(wb, { bookType: 'xlsx', type: 'buffer', cellStyles: true }),
    );
  }

  /** Parse an uploaded XLSX file into an array of row objects. */
  static buildImportPayload(buffer: Buffer): any[] {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(ws, { defval: '' });
  }

  /**
   * Get all data for a master entity.
   * Must be implemented by each module with its own repository.
   */
  abstract getAllMasterData(master: string): Promise<any[]>;

  /**
   * Import data into the specified master.
   * Must be implemented by each module with its own repository.
   */
  abstract importToMaster(master: string, rows: any[]): Promise<number>;
}
