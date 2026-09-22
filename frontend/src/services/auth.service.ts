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

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const res = await apiFetch<ApiResponse<LoginResult> | LoginResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if ("data" in res && res.data) {
      return res.data;
    }
    return res as LoginResult;
  },

  async me(): Promise<UserProfile> {
    const res = await apiFetch<ApiResponse<UserProfile> | UserProfile>("/auth/me", {
      method: "GET",
    });

    if ("data" in res && res.data) {
      return res.data;
    }
    return res as UserProfile;
  },
};
