import { apiFetch, ApiResponse } from "./api";

// ==========================================
// TAHUN AJARAN TYPES & SERVICE
// ==========================================

export interface TahunAjaranItem {
  id: number;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  semesters?: any[];
}

export interface CreateTahunAjaranPayload {
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive?: boolean;
}

export interface UpdateTahunAjaranPayload {
  nama?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  isActive?: boolean;
}

export interface QueryTahunAjaranParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const tahunAjaranService = {
  async getAll(params?: QueryTahunAjaranParams): Promise<{
    data: TahunAjaranItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.isActive !== undefined)
      searchParams.append("isActive", String(params.isActive));
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

    const queryStr = searchParams.toString();
    const endpoint = `/tahun-ajaran${queryStr ? `?${queryStr}` : ""}`;

    const res = await apiFetch<ApiResponse<TahunAjaranItem[]>>(endpoint);
    return {
      data: res.data || [],
      meta: res.meta,
    };
  },

  async getActive(): Promise<TahunAjaranItem | null> {
    try {
      const res = await apiFetch<ApiResponse<TahunAjaranItem>>("/tahun-ajaran/active");
      return res.data || null;
    } catch {
      return null;
    }
  },

  async getById(id: number): Promise<TahunAjaranItem> {
    const res = await apiFetch<ApiResponse<TahunAjaranItem>>(`/tahun-ajaran/${id}`);
    return res.data!;
  },

  async create(payload: CreateTahunAjaranPayload): Promise<TahunAjaranItem> {
    const res = await apiFetch<ApiResponse<TahunAjaranItem>>("/tahun-ajaran", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateTahunAjaranPayload): Promise<TahunAjaranItem> {
    const res = await apiFetch<ApiResponse<TahunAjaranItem>>(`/tahun-ajaran/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/tahun-ajaran/${id}`, {
      method: "DELETE",
    });
  },
};

// ==========================================
// KELAS & SISWA KELAS TYPES & SERVICE
// ==========================================

export interface ClassItem {
  id: number;
  tahunAjaranId: number;
  nama: string;
  tingkat: number;
  waliKelasId?: number | null;
  kapasitas?: number | null;
  ruang?: string | null;
  statusAktif: boolean;
  createdAt: string;
  updatedAt: string;
  tahunAjaran?: {
    id: number;
    nama: string;
  };
  waliKelas?: {
    id: number;
    kodeGuru?: string;
    pegawai?: {
      id: number;
      namaLengkap: string;
      nip?: string;
    };
  };
  siswaKelas?: any[];
}

export interface CreateClassPayload {
  tahunAjaranId: number;
  nama: string;
  tingkat: number;
  waliKelasId?: number;
  kapasitas?: number;
  ruang?: string;
  statusAktif?: boolean;
}

export interface UpdateClassPayload extends Partial<CreateClassPayload> {}

export interface QueryClassParams {
  page?: number;
  limit?: number;
  search?: string;
  tahunAjaranId?: number;
  tingkat?: number;
  waliKelasId?: number;
  statusAktif?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}

export interface ClassStudentItem {
  id: number;
  siswaId: number;
  kelasId: number;
  tanggalMasuk: string;
  tanggalKeluar?: string | null;
  isActive: boolean;
  siswa: {
    id: number;
    nisn: string;
    nis?: string;
    namaLengkap: string;
    jenisKelamin: "L" | "P";
    noTelepon?: string;
    email?: string;
    statusAktif: boolean;
  };
}

export const classesService = {
  async getAll(params?: QueryClassParams): Promise<{
    data: ClassItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.tahunAjaranId)
      searchParams.append("tahunAjaranId", String(params.tahunAjaranId));
    if (params?.tingkat) searchParams.append("tingkat", String(params.tingkat));
    if (params?.waliKelasId)
      searchParams.append("waliKelasId", String(params.waliKelasId));
    if (params?.statusAktif !== undefined)
      searchParams.append("statusAktif", String(params.statusAktif));
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

    const queryStr = searchParams.toString();
    const endpoint = `/classes${queryStr ? `?${queryStr}` : ""}`;

    const res = await apiFetch<ApiResponse<ClassItem[]>>(endpoint);
    return {
      data: res.data || [],
      meta: res.meta,
    };
  },

  async getById(id: number): Promise<ClassItem> {
    const res = await apiFetch<ApiResponse<ClassItem>>(`/classes/${id}`);
    return res.data!;
  },

  async create(payload: CreateClassPayload): Promise<ClassItem> {
    const res = await apiFetch<ApiResponse<ClassItem>>("/classes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateClassPayload): Promise<ClassItem> {
    const res = await apiFetch<ApiResponse<ClassItem>>(`/classes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/classes/${id}`, {
      method: "DELETE",
    });
  },

  async getClassStudents(classId: number): Promise<ClassStudentItem[]> {
    const res = await apiFetch<ApiResponse<ClassStudentItem[]>>(
      `/classes/${classId}/students`,
    );
    return res.data || [];
  },

  async assignStudents(
    classId: number,
    siswaIds: number[],
    tanggalMasuk?: string,
  ): Promise<ClassStudentItem[]> {
    const res = await apiFetch<ApiResponse<ClassStudentItem[]>>(
      `/classes/${classId}/students`,
      {
        method: "POST",
        body: JSON.stringify({ siswaIds, tanggalMasuk }),
      },
    );
    return res.data || [];
  },

  async removeStudent(
    classId: number,
    siswaId: number,
    tanggalKeluar?: string,
  ): Promise<void> {
    await apiFetch(`/classes/${classId}/students/${siswaId}`, {
      method: "DELETE",
      body: JSON.stringify({ tanggalKeluar }),
    });
  },
};
