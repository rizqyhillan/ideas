import { apiFetch, ApiResponse } from "./api";

// ==========================================
// SISWA TYPES & SERVICE
// ==========================================

export interface SiswaItem {
  id: number;
  userId?: number | null;
  nisn: string;
  nis?: string | null;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  email?: string | null;
  noTelepon?: string | null;
  alamat?: string | null;
  namaWali?: string | null;
  noTeleponWali?: string | null;
  statusAktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiswaPayload {
  nisn: string;
  nis?: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tempatLahir?: string;
  tanggalLahir?: string;
  email?: string;
  noTelepon?: string;
  alamat?: string;
  namaWali?: string;
  noTeleponWali?: string;
  statusAktif?: boolean;
}

export interface UpdateSiswaPayload extends Partial<CreateSiswaPayload> {}

export interface QuerySiswaParams {
  page?: number;
  limit?: number;
  search?: string;
  statusAktif?: boolean;
  sort?: string;
  order?: "ASC" | "DESC";
}

export const siswaService = {
  async getAll(params?: QuerySiswaParams): Promise<{
    data: SiswaItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.statusAktif !== undefined)
      searchParams.append("statusAktif", String(params.statusAktif));
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

    const queryStr = searchParams.toString();
    const endpoint = `/siswa${queryStr ? `?${queryStr}` : ""}`;

    const res = await apiFetch<ApiResponse<SiswaItem[]>>(endpoint);
    return {
      data: res.data || [],
      meta: res.meta,
    };
  },

  async getById(id: number): Promise<SiswaItem> {
    const res = await apiFetch<ApiResponse<SiswaItem>>(`/siswa/${id}`);
    return res.data!;
  },

  async create(payload: CreateSiswaPayload): Promise<SiswaItem> {
    const res = await apiFetch<ApiResponse<SiswaItem>>("/siswa", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateSiswaPayload): Promise<SiswaItem> {
    const res = await apiFetch<ApiResponse<SiswaItem>>(`/siswa/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/siswa/${id}`, {
      method: "DELETE",
    });
  },
};

// ==========================================
// PEGAWAI TYPES & SERVICE
// ==========================================

export interface PegawaiItem {
  id: number;
  userId?: number | null;
  nip?: string | null;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  email?: string | null;
  noTelepon?: string | null;
  alamat?: string | null;
  jabatan?: string | null;
  statusKepegawaian?: string | null;
  statusAktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePegawaiPayload {
  nip?: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tempatLahir?: string;
  tanggalLahir?: string;
  email?: string;
  noTelepon?: string;
  alamat?: string;
  jabatan?: string;
  statusKepegawaian?: string;
  statusAktif?: boolean;
}

export interface UpdatePegawaiPayload extends Partial<CreatePegawaiPayload> {}

export const pegawaiService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    statusAktif?: boolean;
  }): Promise<{
    data: PegawaiItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.statusAktif !== undefined)
      searchParams.append("statusAktif", String(params.statusAktif));

    const queryStr = searchParams.toString();
    const endpoint = `/pegawai${queryStr ? `?${queryStr}` : ""}`;

    const res = await apiFetch<ApiResponse<PegawaiItem[]>>(endpoint);
    return {
      data: res.data || [],
      meta: res.meta,
    };
  },

  async getById(id: number): Promise<PegawaiItem> {
    const res = await apiFetch<ApiResponse<PegawaiItem>>(`/pegawai/${id}`);
    return res.data!;
  },

  async create(payload: CreatePegawaiPayload): Promise<PegawaiItem> {
    const res = await apiFetch<ApiResponse<PegawaiItem>>("/pegawai", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdatePegawaiPayload): Promise<PegawaiItem> {
    const res = await apiFetch<ApiResponse<PegawaiItem>>(`/pegawai/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/pegawai/${id}`, {
      method: "DELETE",
    });
  },
};

// ==========================================
// GURU TYPES & SERVICE
// ==========================================

export interface GuruItem {
  id: number;
  pegawaiId: number;
  kodeGuru?: string | null;
  createdAt: string;
  updatedAt: string;
  pegawai: PegawaiItem;
}

export interface CreateGuruPayload {
  pegawaiId: number;
  kodeGuru?: string;
}

export interface UpdateGuruPayload {
  kodeGuru?: string;
}

export const guruService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: GuruItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);

    const queryStr = searchParams.toString();
    const endpoint = `/guru${queryStr ? `?${queryStr}` : ""}`;

    const res = await apiFetch<ApiResponse<GuruItem[]>>(endpoint);
    return {
      data: res.data || [],
      meta: res.meta,
    };
  },

  async getById(id: number): Promise<GuruItem> {
    const res = await apiFetch<ApiResponse<GuruItem>>(`/guru/${id}`);
    return res.data!;
  },

  async create(payload: CreateGuruPayload): Promise<GuruItem> {
    const res = await apiFetch<ApiResponse<GuruItem>>("/guru", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateGuruPayload): Promise<GuruItem> {
    const res = await apiFetch<ApiResponse<GuruItem>>(`/guru/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/guru/${id}`, {
      method: "DELETE",
    });
  },
};

// ==========================================
// USERS TYPES & SERVICE
// ==========================================

export interface UserAccountItem {
  id: number;
  username: string;
  email: string;
  status: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles2?: any[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password?: string;
  role: string;
  status?: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  status?: string;
  role?: string;
}

export const usersService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: UserAccountItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);

    const queryStr = searchParams.toString();
    const endpoint = `/users${queryStr ? `?${queryStr}` : ""}`;

    const res = await apiFetch<ApiResponse<UserAccountItem[]>>(endpoint);
    return {
      data: res.data || [],
      meta: res.meta,
    };
  },

  async getById(id: number): Promise<UserAccountItem> {
    const res = await apiFetch<ApiResponse<UserAccountItem>>(`/users/${id}`);
    return res.data!;
  },

  async create(payload: CreateUserPayload): Promise<UserAccountItem> {
    const res = await apiFetch<ApiResponse<UserAccountItem>>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<UserAccountItem> {
    const res = await apiFetch<ApiResponse<UserAccountItem>>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  },
};
