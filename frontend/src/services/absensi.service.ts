import { apiFetch, ApiResponse } from "./api";

// ============================================================================
// ENUM SESUAI DATABASE (PostgreSQL schema `ideas`)
// ============================================================================
// CREATE TYPE status_absensi AS ENUM ('hadir', 'sakit', 'izin', 'alpa');
export type StatusAbsensi = "hadir" | "sakit" | "izin" | "alpa";

// CREATE TYPE nama_hari AS ENUM ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu');
export type NamaHari =
  | "senin"
  | "selasa"
  | "rabu"
  | "kamis"
  | "jumat"
  | "sabtu";

// CREATE TYPE jenis_semester AS ENUM ('ganjil', 'genap');
export type JenisSemester = "ganjil" | "genap";

export interface StudentAttendanceItem {
  siswaId: number;
  nisn: string;
  nis?: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  status: StatusAbsensi;
  keterangan?: string;
}

export interface AttendanceSessionRecord {
  id?: number;
  kelasId: number;
  kelasNama: string;
  guruId: number;
  guruNama: string;
  tanggal: string; // YYYY-MM-DD
  jamKe?: string;
  mataPelajaran?: string;
  catatan?: string;
  items: StudentAttendanceItem[];
  savedAt: string;
}

const STORAGE_KEY_PREFIX = "ideas_absensi_records_";

export const absensiService = {
  /**
   * Menyimpan sesi absensi ke local storage (dan mencoba sync ke backend jika tersedia)
   */
  async saveAttendance(
    record: AttendanceSessionRecord,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Simpan di local storage berdasarkan kelas dan tanggal
      const key = `${STORAGE_KEY_PREFIX}${record.kelasId}_${record.tanggal}`;
      const serialized = JSON.stringify(record);
      localStorage.setItem(key, serialized);

      // Simpan juga ke index riwayat absensi kelas
      const indexKey = `${STORAGE_KEY_PREFIX}index_${record.kelasId}`;
      const existingHistoryJson = localStorage.getItem(indexKey);
      const historyList: string[] = existingHistoryJson
        ? JSON.parse(existingHistoryJson)
        : [];
      if (!historyList.includes(record.tanggal)) {
        historyList.push(record.tanggal);
        localStorage.setItem(indexKey, JSON.stringify(historyList));
      }

      // 2. Jika ada backend endpoint sesi-absensi, coba kirim
      try {
        await apiFetch("/absensi/siswa", {
          method: "POST",
          body: JSON.stringify(record),
        });
      } catch {
        // Abaikan jika backend belum memiliki controller absensi, data lokal tetap aman tersimpan
      }

      return {
        success: true,
        message: `Absensi kelas ${record.kelasNama} tanggal ${record.tanggal} berhasil disimpan.`,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(err.message || "Gagal menyimpan absensi");
    }
  },

  /**
   * Mengambil riwayat absensi berdasarkan kelas dan tanggal
   */
  async getAttendance(
    kelasId: number,
    tanggal: string,
  ): Promise<AttendanceSessionRecord | null> {
    const key = `${STORAGE_KEY_PREFIX}${kelasId}_${tanggal}`;
    const dataJson = localStorage.getItem(key);
    if (!dataJson) {
      // Coba fetch dari backend jika ada
      try {
        const res = await apiFetch<ApiResponse<AttendanceSessionRecord>>(
          `/absensi/siswa?kelasId=${kelasId}&tanggal=${tanggal}`,
        );
        if (res.data) return res.data;
      } catch {
        return null;
      }
      return null;
    }

    try {
      return JSON.parse(dataJson) as AttendanceSessionRecord;
    } catch {
      return null;
    }
  },

  /**
   * Menghitung ringkasan statistik kehadiran dari daftar siswa
   */
  calculateSummary(items: StudentAttendanceItem[]) {
    const summary = {
      total: items.length,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpa: 0,
    };

    items.forEach((item) => {
      if (item.status === "hadir") summary.hadir += 1;
      else if (item.status === "sakit") summary.sakit += 1;
      else if (item.status === "izin") summary.izin += 1;
      else if (item.status === "alpa") summary.alpa += 1;
    });

    return summary;
  },

  /**
   * Helper nama hari Indonesia dari Date
   */
  getNamaHari(dateStr: string): NamaHari {
    const date = new Date(dateStr);
    const day = date.getDay();
    switch (day) {
      case 1:
        return "senin";
      case 2:
        return "selasa";
      case 3:
        return "rabu";
      case 4:
        return "kamis";
      case 5:
        return "jumat";
      case 6:
        return "sabtu";
      default:
        return "senin";
    }
  },
};
