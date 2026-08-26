import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  usersService,
  UserAccountItem,
  CreateUserPayload,
} from "../../services/master.service";

export default function UsersPage() {
  const [data, setData] = useState<UserAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: "",
    email: "",
    password: "",
    role: "admin",
    status: "aktif",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await usersService.getAll({
        search,
        status: statusFilter || undefined,
      });
      setData(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "admin",
      status: "aktif",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: UserAccountItem) {
    setEditingId(item.id);
    const roleCode = item.userRoles2?.[0]?.role?.code || "guru";
    setFormData({
      username: item.username,
      email: item.email,
      password: "",
      role: roleCode,
      status: item.status,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.username || !formData.email) {
      setFormError("Username dan Email wajib diisi.");
      return;
    }
    if (!editingId && !formData.password) {
      setFormError("Password wajib diisi untuk pengguna baru.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        const payload: any = {
          username: formData.username,
          email: formData.email,
          status: formData.status,
          role: formData.role,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await usersService.update(editingId, payload);
        setSuccessMsg("Akun pengguna berhasil diperbarui!");
      } else {
        await usersService.create(formData);
        setSuccessMsg("Akun pengguna baru berhasil dibuat!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan akun pengguna");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan/menghapus akun ini?")) return;
    try {
      await usersService.delete(id);
      setSuccessMsg("Akun pengguna berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus pengguna");
    }
  }

  return (
    <>
      <PageMeta
        title="Master Pengguna | IdEaS"
        description="Manajemen Akun Login dan Akses Pengguna"
      />
      <PageBreadcrumb pageTitle="Data Akun Pengguna" />

      {/* Alerts */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium dark:bg-success-500/10 dark:border-success-500/30 dark:text-success-400">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
          {errorMsg}
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Daftar Akun Pengguna Sistem
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola akun login, peran (role), dan status aktifitas pengguna
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="terkunci">Terkunci</option>
            </select>

            <Input
              type="text"
              placeholder="Cari Username/Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 sm:w-56"
            />
            <Button size="sm" onClick={openCreateModal}>
              + Tambah Pengguna
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Peran (Role)</th>
                <th className="px-4 py-3">Terakhir Login</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                      {item.username}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                      {item.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded uppercase bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        {item.userRoles2?.[0]?.role?.name ||
                          item.userRoles2?.[0]?.role?.code ||
                          "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString("id-ID")
                        : "Belum pernah"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.status === "aktif" ? (
                        <Badge color="success" size="sm">
                          Aktif
                        </Badge>
                      ) : item.status === "terkunci" ? (
                        <Badge color="warning" size="sm">
                          Terkunci
                        </Badge>
                      ) : (
                        <Badge color="light" size="sm">
                          Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-md p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Akun Pengguna" : "Tambah Akun Pengguna"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Kelola username, email, password, dan hak akses peran
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>
              Username <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Username akun"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="nama@ideas.id"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>
              Password {editingId ? "(Kosongkan jika tidak diubah)" : <span className="text-error-500">*</span>}
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.password || ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!editingId}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                Peran (Role) <span className="text-error-500">*</span>
              </Label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                required
              >
                <option value="admin">Admin</option>
                <option value="guru">Guru</option>
                <option value="guru_bk">Guru BK</option>
                <option value="staff_perpustakaan">Staff Perpustakaan</option>
                <option value="staff_ekstrakurikuler">Staff Ekstrakurikuler</option>
                <option value="kepala_sekolah">Kepala Sekolah</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>

            <div>
              <Label>Status Akun</Label>
              <select
                value={formData.status || "aktif"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="terkunci">Terkunci</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Batal
            </button>
            <Button size="sm" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Pengguna"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
