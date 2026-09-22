import { apiFetch, ApiResponse } from "./api";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  namaLengkap?: string;
  avatar?: string;
  status?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
}

export const userService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sort?: string;
    order?: "ASC" | "DESC";
  }): Promise<{ data: UserProfile[]; meta?: any }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);

    const qs = searchParams.toString();
    const res = await apiFetch<ApiResponse<UserProfile[]>>(
      `/users${qs ? `?${qs}` : ""}`
    );
    return { data: res.data || [], meta: res.meta };
  },

  async getById(id: number): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile>>(`/users/${id}`);
    return res.data!;
  },

  async create(payload: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile>>(`/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async update(id: number, payload: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile>>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/users/${id}`, { method: "DELETE" });
  },
};
