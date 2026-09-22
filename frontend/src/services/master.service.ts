import { apiFetch, ApiResponse } from "./api";

function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== "") {
        result[key] = trimmed;
      }
    } else {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

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

export type UpdateSiswaPayload = Partial<CreateSiswaPayload>;

export interface QuerySiswaParams {
  page?: number;
  limit?: number;
  search?: string;
  statusAktif?: boolean;
  sort?: "namaLengkap" | "nis" | "nisn" | "createdAt";
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
    const cleaned = cleanPayload(payload);
    const res = await apiFetch<ApiResponse<SiswaItem>>("/siswa", {
      method: "POST",
      body: JSON.stringify(cleaned),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateSiswaPayload): Promise<SiswaItem> {
    const cleaned = cleanPayload(payload);
    const res = await apiFetch<ApiResponse<SiswaItem>>(`/siswa/${id}`, {
      method: "PATCH",
      body: JSON.stringify(cleaned),
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
  nuptk?: string | null;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tempatLahir?: string | null;
  tanggalLahir?: string | null;
  email?: string | null;
  noTelepon?: string | null;
  alamat?: string | null;
  jabatan?: string | null;
  statusAktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePegawaiPayload {
  nip?: string;
  nuptk?: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  tempatLahir?: string;
  tanggalLahir?: string;
  email?: string;
  noTelepon?: string;
  alamat?: string;
  jabatan?: string;
  statusAktif?: boolean;
}

export type UpdatePegawaiPayload = Partial<CreatePegawaiPayload>;

export const pegawaiService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    statusAktif?: boolean;
    sort?: "id" | "namaLengkap" | "nip" | "createdAt";
    order?: "ASC" | "DESC";
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
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

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
    // Hilangkan field non-whitelist seperti statusKepegawaian agar tidak memicu 400 forbidden error di backend
    const { statusKepegawaian, ...rest } = payload as any;
    void statusKepegawaian;
    const cleaned = cleanPayload(rest);

    const res = await apiFetch<ApiResponse<PegawaiItem>>("/pegawai", {
      method: "POST",
      body: JSON.stringify(cleaned),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdatePegawaiPayload): Promise<PegawaiItem> {
    const { statusKepegawaian, ...rest } = payload as any;
    void statusKepegawaian;
    const cleaned = cleanPayload(rest);

    const res = await apiFetch<ApiResponse<PegawaiItem>>(`/pegawai/${id}`, {
      method: "PATCH",
      body: JSON.stringify(cleaned),
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
  pegawaiId?: number;
}

export const guruService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: "id" | "kodeGuru" | "createdAt";
    order?: "ASC" | "DESC";
  }): Promise<{
    data: GuruItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

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
    const cleaned = cleanPayload(payload);
    const res = await apiFetch<ApiResponse<GuruItem>>("/guru", {
      method: "POST",
      body: JSON.stringify(cleaned),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateGuruPayload): Promise<GuruItem> {
    const cleaned = cleanPayload(payload);
    const res = await apiFetch<ApiResponse<GuruItem>>(`/guru/${id}`, {
      method: "PATCH",
      body: JSON.stringify(cleaned),
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
  status: "aktif" | "nonaktif" | "ditangguhkan";
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles2?: any[];
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: string;
  status?: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  status?: "aktif" | "nonaktif" | "ditangguhkan";
  role?: string;
}

export const usersService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort?: string;
    order?: "ASC" | "DESC";
  }): Promise<{
    data: UserAccountItem[];
    meta?: { page: number; limit: number; total: number; lastPage: number };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

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
    // Backend CreateUserDto hanya menerima: username, email, password, role
    // Mengirim status akan memicu 400 (forbidNonWhitelisted)
    const body: Record<string, string> = {
      username: payload.username.trim(),
      email: payload.email.trim(),
      password: payload.password,
      role: payload.role,
    };

    const res = await apiFetch<ApiResponse<UserAccountItem>>("/users", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<UserAccountItem> {
    // Backend UpdateUserDto menerima: username, email, status, role (tanpa password)
    const body: Record<string, any> = {};
    if (payload.username?.trim()) body.username = payload.username.trim();
    if (payload.email?.trim()) body.email = payload.email.trim();
    if (payload.status) body.status = payload.status;
    if (payload.role) body.role = payload.role;

    const res = await apiFetch<ApiResponse<UserAccountItem>>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  },
};

// ==========================================
// ROLE & PERMISSION TYPES & SERVICE
// ==========================================

export type RoleCode = "admin" | "guru" | "siswa" | "ortu";

export interface RoleItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionItem {
  id: number;
  code: string;
  module: string;
  action: string;
  description?: string;
  createdAt: string;
}

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

export interface UpdateRolePayload {
  code?: string;
  name?: string;
  description?: string;
  isSystem?: boolean;
}

export const roleService = {
  async getAll(): Promise<{ data: RoleItem[] }> {
    const res = await apiFetch<ApiResponse<RoleItem[]>>("/roles");
    return { data: res.data || [] };
  },

  async getById(id: number): Promise<RoleItem> {
    const res = await apiFetch<ApiResponse<RoleItem>>(`/roles/${id}`);
    return res.data!;
  },

  async create(payload: CreateRolePayload): Promise<RoleItem> {
    const res = await apiFetch<ApiResponse<RoleItem>>("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: UpdateRolePayload): Promise<RoleItem> {
    const res = await apiFetch<ApiResponse<RoleItem>>(`/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/roles/${id}`, { method: "DELETE" });
  },

  async getRolePermissions(roleId: number): Promise<PermissionItem[]> {
    const res = await apiFetch<ApiResponse<PermissionItem[]>>(
      `/roles/${roleId}/permissions`
    );
    return res.data || [];
  },

  async assignPermission(
    roleId: number,
    permissionId: number
  ): Promise<void> {
    await apiFetch(`/roles/${roleId}/permissions/${permissionId}`, {
      method: "POST",
    });
  },

  async removePermission(
    roleId: number,
    permissionId: number
  ): Promise<void> {
    await apiFetch(`/roles/${roleId}/permissions/${permissionId}`, {
      method: "DELETE",
    });
  },
};

export const permissionService = {
  async getAll(): Promise<{ data: PermissionItem[] }> {
    const res = await apiFetch<ApiResponse<PermissionItem[]>>("/permissions");
    return { data: res.data || [] };
  },

  async getById(id: number): Promise<PermissionItem> {
    const res = await apiFetch<ApiResponse<PermissionItem>>(`/permissions/${id}`);
    return res.data!;
  },

  async getByModule(module: string): Promise<PermissionItem[]> {
    const res = await apiFetch<ApiResponse<PermissionItem[]>>(
      `/permissions?module=${module}`
    );
    return res.data || [];
  },
};
