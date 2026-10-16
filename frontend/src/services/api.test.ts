import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiFetch,
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  TOKEN_KEY,
  USER_KEY,
} from "./api";

describe("API session storage", () => {
  afterEach(() => {
    clearStoredAuth();
    vi.unstubAllGlobals();
  });

  it("menyimpan sesi persisten hanya di local storage", () => {
    setStoredToken("token-persisten", true);
    setStoredUser({ id: 7, nama: "Ayu" }, true);

    expect(localStorage.getItem(TOKEN_KEY)).toBe("token-persisten");
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(getStoredToken()).toBe("token-persisten");
    expect(getStoredUser<{ id: number; nama: string }>()).toEqual({
      id: 7,
      nama: "Ayu",
    });
  });

  it("menyimpan sesi sementara hanya di session storage", () => {
    setStoredToken("token-sementara", false);
    setStoredUser({ id: 8 }, false);

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("token-sementara");
    expect(getStoredUser<{ id: number }>()).toEqual({ id: 8 });
  });
});

describe("apiFetch", () => {
  afterEach(() => {
    clearStoredAuth();
    vi.unstubAllGlobals();
  });

  it("mengirim token autentikasi dan mengembalikan respons JSON", async () => {
    setStoredToken("abc123", true);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/profil", { method: "GET" })).resolves.toEqual({
      success: true,
      data: { id: 1 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/profil",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      }),
    );
  });

  it("menghapus sesi ketika backend mengembalikan 401", async () => {
    setStoredToken("kadaluwarsa", true);
    setStoredUser({ id: 1 }, true);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ message: "Token tidak valid" }),
      }),
    );

    await expect(apiFetch("/profil")).rejects.toThrow("Token tidak valid");
    expect(getStoredToken()).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });
});
