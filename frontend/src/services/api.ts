const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const TOKEN_KEY = "ideas_access_token";
export const USER_KEY = "ideas_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUser<T>(): T | null {
  const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as T;
  } catch {
    return null;
  }
}

export function setStoredUser<T>(user: T, remember: boolean) {
  const userJson = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(USER_KEY, userJson);
    sessionStorage.removeItem(USER_KEY);
  } else {
    sessionStorage.setItem(USER_KEY, userJson);
    localStorage.removeItem(USER_KEY);
  }
}

export interface ApiResponse<T = any> {
  success?: boolean;
  statusCode?: number;
  message?: string | string[];
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = "Terjadi kesalahan pada server";
      if (data) {
        if (typeof data.message === "string") {
          errorMessage = data.message;
        } else if (Array.isArray(data.message)) {
          errorMessage = data.message.join(", ");
        } else if (data.error) {
          errorMessage = data.error;
        }
      }

      if (response.status === 401) {
        clearStoredAuth();
      }

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend. Pastikan server backend sedang berjalan.");
    }
    throw error;
  }
}
