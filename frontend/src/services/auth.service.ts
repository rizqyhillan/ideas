import { apiFetch, ApiResponse } from "./api";

export interface UserRole {
  id: number;
  roleId: number;
  role?: {
    id: number;
    code: string;
    name: string;
    description?: string;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  namaLengkap?: string;
  noTelepon?: string;
  nip?: string;
  nisn?: string;
  pegawai?: any;
  siswa?: any;
  status: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  userRoles2?: UserRole[];
  userPermissions2?: any[];
  roles?: string[];
  permissions?: string[];
}

export interface LoginResult {
  accessToken: string;
  user: UserProfile;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  namaLengkap?: string;
  noTelepon?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResult> {
    const res = await apiFetch<ApiResponse<LoginResult> | LoginResult>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email: identifier, password }),
      },
    );

    if ("data" in res && res.data) {
      return res.data;
    }
    return res as LoginResult;
  },

  async me(): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile> | UserProfile>(
      "/auth/me",
      {
        method: "GET",
      },
    );

    if ("data" in res && res.data) {
      return res.data;
    }
    return res as UserProfile;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile> | UserProfile>(
      "/auth/profile",
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    if ("data" in res && res.data) {
      return res.data;
    }
    return res as UserProfile;
  },

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch<{ success: boolean; message: string }>(
      "/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return res;
  },
};
