import { apiFetch, ApiResponse } from "./api";

// ===========================================================================
// SEMESTER
// ===========================================================================
export type JenisSemester = "ganjil" | "genap";

export interface SemesterItem {
  id: number;
  tahunAjaranId: number;
  jenis: JenisSemester;
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSemesterPayload {
  tahunAjaranId: number;
  jenis: JenisSemester;
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive?: boolean;
}

export interface UpdateSemesterPayload extends Partial<CreateSemesterPayload> {}

export interface QuerySemesterParams {
  page?: number;
  limit?: number;
  search?: string;
  tahunAjaranId?: number;
  jenis?: JenisSemester;
  isActive?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const semesterService = {
  async getAll(params?: QuerySemesterParams): Promise<{
    data: SemesterItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.search) sp.append("search", params.search);
    if (params?.tahunAjaranId) sp.append("tahunAjaranId", String(params.tahunAjaranId));
    if (params?.jenis) sp.append("jenis", params.jenis);
    if (params?.isActive !== undefined) sp.append("isActive", String(params.isActive));
    if (params?.sort) sp.append("sort", params.sort);
    if (params?.order) sp.append("order", params.order);
    const qs = sp.toString();
    const res = await apiFetch<ApiResponse<SemesterItem[]>>(`/semester${qs ? `?${qs}` : ""}`);
    return { data: res.data || [], meta: res.meta };
  },

  async getById(id: number): Promise<SemesterItem> {
    const res = await apiFetch<ApiResponse<SemesterItem>>(`/semester/${id}`);
    return res.data!;
  },

  async create(payload: CreateSemesterPayload): Promise<SemesterItem> {
    const res = await apiFetch<ApiResponse<SemesterItem>>("/semester", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateSemesterPayload): Promise<SemesterItem> {
    const res = await apiFetch<ApiResponse<SemesterItem>>(`/semester/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/semester/${id}`, { method: "DELETE" });
  },
};

// ===========================================================================
// MATA PELAJARAN
// ===========================================================================
export interface MataPelajaranItem {
  id: number;
  kode: string;
  nama: string;
  deskripsi?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMataPelajaranPayload {
  kode: string;
  nama: string;
  deskripsi?: string;
  isActive?: boolean;
}

export interface UpdateMataPelajaranPayload extends Partial<CreateMataPelajaranPayload> {}

export interface QueryMataPelajaranParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const mataPelajaranService = {
  async getAll(params?: QueryMataPelajaranParams): Promise<{
    data: MataPelajaranItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.search) sp.append("search", params.search);
    if (params?.isActive !== undefined) sp.append("isActive", String(params.isActive));
    if (params?.sort) sp.append("sort", params.sort);
    if (params?.order) sp.append("order", params.order);
    const qs = sp.toString();
    const res = await apiFetch<ApiResponse<MataPelajaranItem[]>>(`/mata-pelajaran${qs ? `?${qs}` : ""}`);
    return { data: res.data || [], meta: res.meta };
  },

  async getById(id: number): Promise<MataPelajaranItem> {
    const res = await apiFetch<ApiResponse<MataPelajaranItem>>(`/mata-pelajaran/${id}`);
    return res.data!;
  },

  async create(payload: CreateMataPelajaranPayload): Promise<MataPelajaranItem> {
    const res = await apiFetch<ApiResponse<MataPelajaranItem>>("/mata-pelajaran", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateMataPelajaranPayload): Promise<MataPelajaranItem> {
    const res = await apiFetch<ApiResponse<MataPelajaranItem>>(`/mata-pelajaran/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/mata-pelajaran/${id}`, { method: "DELETE" });
  },
};

// ===========================================================================
// JADWAL PELAJARAN
// ===========================================================================
export type NamaHari = "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

export interface JadwalItem {
  id: number;
  semesterId: number;
  kelasId: number;
  mataPelajaranId: number;
  guruId: number;
  hari: NamaHari;
  jamMulai: string;
  jamSelesai: string;
  ruang?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  semester?: { id: number; tahunAjaranNama: string; jenis: JenisSemester };
  kelas?: { id: number; nama: string; tingkat: number };
  mataPelajaran?: { id: number; kode: string; nama: string };
  guru?: { id: number; pegawai?: { namaLengkap: string } };
}

export interface CreateJadwalPayload {
  semesterId: number;
  kelasId: number;
  mataPelajaranId: number;
  guruId: number;
  hari: NamaHari;
  jamMulai: string;
  jamSelesai: string;
  ruang?: string;
  isActive?: boolean;
}

export interface UpdateJadwalPayload extends Partial<CreateJadwalPayload> {}

export interface QueryJadwalParams {
  page?: number;
  limit?: number;
  search?: string;
  kelasId?: number;
  guruId?: number;
  semesterId?: number;
  hari?: NamaHari;
  isActive?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const jadwalService = {
  async getAll(params?: QueryJadwalParams): Promise<{
    data: JadwalItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.search) sp.append("search", params.search);
    if (params?.kelasId) sp.append("kelasId", String(params.kelasId));
    if (params?.guruId) sp.append("guruId", String(params.guruId));
    if (params?.semesterId) sp.append("semesterId", String(params.semesterId));
    if (params?.hari) sp.append("hari", params.hari);
    if (params?.isActive !== undefined) sp.append("isActive", String(params.isActive));
    if (params?.sort) sp.append("sort", params.sort);
    if (params?.order) sp.append("order", params.order);
    const qs = sp.toString();
    const res = await apiFetch<ApiResponse<JadwalItem[]>>(`/jadwal${qs ? `?${qs}` : ""}`);
    return { data: res.data || [], meta: res.meta };
  },

  async getById(id: number): Promise<JadwalItem> {
    const res = await apiFetch<ApiResponse<JadwalItem>>(`/jadwal/${id}`);
    return res.data!;
  },

  async create(payload: CreateJadwalPayload): Promise<JadwalItem> {
    const res = await apiFetch<ApiResponse<JadwalItem>>("/jadwal", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateJadwalPayload): Promise<JadwalItem> {
    const res = await apiFetch<ApiResponse<JadwalItem>>(`/jadwal/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/jadwal/${id}`, { method: "DELETE" });
  },
};

// ===========================================================================
// CATATAN KONSELING (BK)
// ===========================================================================

export type VisibilitasKonseling = "rahasia" | "internal_bk" | "siswa";

export interface CatatanKonselingItem {
  id: number;
  siswaId: number;
  guruBkId: number;
  tanggal: string;
  topik: string;
  isi: string;
  tindakLanjut?: string;
  visibilitas: VisibilitasKonseling;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  siswa?: { id: number; nisn: string; namaLengkap: string; foto?: string; jenisKelamin: "L" | "P" };
  guruBk?: { id: number; pegawai: { namaLengkap: string } };
}

export interface CreateCatatanKonselingPayload {
  siswaId: number;
  guruBkId: number;
  tanggal: string;
  topik: string;
  isi: string;
  tindakLanjut?: string;
  visibilitas: VisibilitasKonseling;
}

export interface UpdateCatatanKonselingPayload extends Partial<CreateCatatanKonselingPayload> {}

export interface QueryCatatanKonselingParams {
  page?: number;
  limit?: number;
  search?: string;
  siswaId?: number;
  guruBkId?: number;
  visibilitas?: VisibilitasKonseling;
  tanggalAwal?: string;
  tanggalAkhir?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const konselingService = {
  async getAll(params?: QueryCatatanKonselingParams): Promise<{
    data: CatatanKonselingItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.search) sp.append("search", params.search);
    if (params?.siswaId) sp.append("siswaId", String(params.siswaId));
    if (params?.guruBkId) sp.append("guruBkId", String(params.guruBkId));
    if (params?.visibilitas) sp.append("visibilitas", params.visibilitas);
    if (params?.tanggalAwal) sp.append("tanggalAwal", params.tanggalAwal);
    if (params?.tanggalAkhir) sp.append("tanggalAkhir", params.tanggalAkhir);
    if (params?.sort) sp.append("sort", params.sort);
    if (params?.order) sp.append("order", params.order);
    const qs = sp.toString();
    const res = await apiFetch<ApiResponse<CatatanKonselingItem[]>>(`/konseling${qs ? `?${qs}` : ""}`);
    return { data: res.data || [], meta: res.meta };
  },

  async getById(id: number): Promise<CatatanKonselingItem> {
    const res = await apiFetch<ApiResponse<CatatanKonselingItem>>(`/konseling/${id}`);
    return res.data!;
  },

  async create(payload: CreateCatatanKonselingPayload): Promise<CatatanKonselingItem> {
    const res = await apiFetch<ApiResponse<CatatanKonselingItem>>("/konseling", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateCatatanKonselingPayload): Promise<CatatanKonselingItem> {
    const res = await apiFetch<ApiResponse<CatatanKonselingItem>>(`/konseling/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/konseling/${id}`, { method: "DELETE" });
  },

  async getBySiswa(siswaId: number): Promise<CatatanKonselingItem[]> {
    const res = await apiFetch<ApiResponse<CatatanKonselingItem[]>>(`/konseling?siswaId=${siswaId}`);
    return res.data || [];
  },

  async getSiswaList(search?: string): Promise<{ id: number; nisn: string; namaLengkap: string; foto?: string; jenisKelamin: "L" | "P" }[]> {
    const sp = new URLSearchParams();
    if (search) sp.append("search", search);
    const qs = sp.toString();
    const res = await apiFetch<ApiResponse<any[]>>(`/siswa${qs ? `?${qs}` : ""}`);
    const filtered = (res.data || []).filter((s: any) => !s.deletedAt);
    return filtered;
  },

  async getGuruBKLIST(): Promise<{ id: number; pegawai: { namaLengkap: string } }[]> {
    const res = await apiFetch<ApiResponse<any[]>>(`/guru?role=bk`);
    return res.data || [];
  },
};
