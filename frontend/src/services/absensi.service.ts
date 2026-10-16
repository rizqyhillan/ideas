import { apiFetch, ApiResponse } from "./api";

// ============================================================================
// ENUM SESUAI DATABASE (PostgreSQL schema `ideas`)
// ============================================================================
// CREATE TYPE status_absensi AS ENUM ('hadir', 'sakit', 'izin', 'alpa');
export type StatusAbsensi = "hadir" | "sakit" | "izin" | "alpa";

// CREATE TYPE nama_hari AS ENUM ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu');
export type NamaHari =
  "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

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
  mode?: "mengajar" | "piket";
  jamKe?: string;
  mataPelajaran?: string;
  catatan?: string;
  items: StudentAttendanceItem[];
  savedAt: string;
}

const STORAGE_KEY_PREFIX = "ideas_absensi_records_";

export const absensiService = {
  /**
   * Menyimpan sesi absensi ke backend lalu memperbarui cache lokal.
   * Backend tetap menjadi sumber data utama.
   */
  async saveAttendance(
    record: AttendanceSessionRecord,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Kirim hanya field yang didefinisikan oleh CreateAbsensiSesiDto.
      // Data presentasi siswa (nisn, namaLengkap, jenisKelamin) tetap dipakai
      // oleh UI, tetapi bukan bagian dari payload API absensi.
      const payload = {
        kelasId: record.kelasId,
        ...(record.guruId > 0 ? { guruId: record.guruId } : {}),
        ...(record.mode ? { mode: record.mode } : {}),
        tanggal: record.tanggal,
        ...(record.jamKe ? { jamKe: record.jamKe } : {}),
        ...(record.mataPelajaran ? { mataPelajaran: record.mataPelajaran } : {}),
        ...(record.catatan ? { catatan: record.catatan } : {}),
        items: record.items.map(({ siswaId, status, keterangan }) => ({
          siswaId,
          status,
          ...(keterangan ? { keterangan } : {}),
        })),
      };

      // Simpan ke backend terlebih dahulu.
      const response = await apiFetch<ApiResponse<{ id?: number; savedAt?: string }>>(
        "/absensi/siswa",
        {
        method: "POST",
        body: JSON.stringify(payload),
        },
      );

      const syncedRecord: AttendanceSessionRecord = {
        ...record,
        id: response.data?.id ?? record.id,
        savedAt: response.data?.savedAt ?? record.savedAt,
      };

      // Cache hanya diperbarui setelah server berhasil menyimpan.
      const key = `${STORAGE_KEY_PREFIX}${record.kelasId}_${record.tanggal}_${record.jamKe || "default"}`;
      localStorage.setItem(key, JSON.stringify(syncedRecord));

      const indexKey = `${STORAGE_KEY_PREFIX}index_${record.kelasId}`;
      const existingHistoryJson = localStorage.getItem(indexKey);
      const historyList: string[] = existingHistoryJson
        ? JSON.parse(existingHistoryJson)
        : [];
      if (!historyList.includes(record.tanggal)) {
        historyList.push(record.tanggal);
        localStorage.setItem(indexKey, JSON.stringify(historyList));
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
    jamKe?: string,
    mataPelajaran?: string,
  ): Promise<AttendanceSessionRecord | null> {
    const key = `${STORAGE_KEY_PREFIX}${kelasId}_${tanggal}_${jamKe || "default"}`;
    const res = await apiFetch<ApiResponse<AttendanceSessionRecord>>(
      `/absensi/siswa?kelasId=${kelasId}&tanggal=${tanggal}${jamKe ? `&jamKe=${encodeURIComponent(jamKe)}` : ""}${mataPelajaran ? `&mataPelajaran=${encodeURIComponent(mataPelajaran)}` : ""}`,
    );

    if (!res.data) {
      // Hapus cache lama agar tidak muncul lagi sebagai sesi yang valid.
      localStorage.removeItem(key);
      return null;
    }

    // Cache mengikuti data terbaru dari server, bukan sebaliknya.
    localStorage.setItem(key, JSON.stringify(res.data));
    return res.data;
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
   * Mengambil daftar kelas yang belum diabsen pada tanggal tertentu (untuk guru piket/admin)
   */
  async getUnattendedClasses(
    tanggal: string,
  ): Promise<Array<{ id: number; nama: string; tingkat: number; ruang: string | null; kapasitas: number | null; waliKelas: string | null }>> {
    const res = await apiFetch<ApiResponse<Array<{ id: number; nama: string; tingkat: number; ruang: string | null; kapasitas: number | null; waliKelas: string | null }>>>(
      `/absensi/unattended?tanggal=${tanggal}`,
    );
    return res.data || [];
  },

  async checkPiketAccess(tanggal: string): Promise<boolean> {
    const res = await apiFetch<ApiResponse<{ allowed: boolean }>>(
      `/absensi/piket/access?tanggal=${tanggal}`,
    );
    return res.data?.allowed === true;
  },

  /**
   * Mengambil URL download export absensi
   */
  getExportUrl(format: "excel" | "pdf", params: { kelasId?: number; guruId?: number; startDate?: string; endDate?: string }): string {
    const sp = new URLSearchParams();
    if (params.kelasId) sp.append("kelasId", String(params.kelasId));
    if (params.guruId) sp.append("guruId", String(params.guruId));
    if (params.startDate) sp.append("startDate", params.startDate);
    if (params.endDate) sp.append("endDate", params.endDate);
    const qs = sp.toString();
    return `/absensi/export/${format}${qs ? `?${qs}` : ""}`;
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
