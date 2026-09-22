import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  roleService,
  RoleItem,
  CreateRolePayload,
} from "../../services/master.service";

export default function RolesPage() {
  const [data, setData] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateRolePayload>({
    code: "",
    name: "",
    description: "",
    isSystem: false,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const res = await roleService.getAll();
      setData(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      isSystem: false,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: RoleItem) {
    setEditingId(item.id);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      isSystem: item.isSystem,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setFormError("Kode dan Nama wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await roleService.update(editingId, formData);
        setSuccessMsg("Role berhasil diperbarui!");
      } else {
        await roleService.create(formData);
        setSuccessMsg("Role berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus role ini?")) return;
    try {
      await roleService.delete(id);
      setSuccessMsg("Role berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus");
    }
  }

  return (
    <>
      <PageMeta title="Role & Hak Akses | IdEaS" description="Kelola role dan hak akses pengguna" />
      <PageBreadcrumb pageTitle="Role & Hak Akses" />

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

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daftar Role</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kelola role dan hak akses pengguna</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Cari role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56"
            />
            <Button size="sm" onClick={openCreateModal} className="w-full sm:w-auto justify-center">
              + Tambah Role
            </Button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Role</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3 text-center">System</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : data.filter((r) => !search || r.code.includes(search) || r.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
              ) : (
                data
                  .filter((r) => !search || r.code.includes(search) || r.name.toLowerCase().includes(search.toLowerCase()))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-900 dark:text-white">{item.code}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-white">{item.name}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 truncate max-w-xs">{item.description || "-"}</td>
                      <td className="px-4 py-3.5 text-center">
                        {item.isSystem ? (
                          <Badge color="info" size="sm">System</Badge>
                        ) : (
                          <Badge color="light" size="sm">Custom</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(item)} className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-3 mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat data...</div>
          ) : data.filter((r) => !search || r.code.includes(search) || r.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="py-8 text-center text-gray-400">Tidak ada data ditemukan.</div>
          ) : (
            data
              .filter((r) => !search || r.code.includes(search) || r.name.toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                      <span className="text-xs font-mono text-gray-500">{item.code}</span>
                    </div>
                    {item.isSystem ? <Badge color="info" size="sm">System</Badge> : <Badge color="light" size="sm">Custom</Badge>}
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mb-3">{item.description}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(item)} className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400">Hapus</button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg p-4 sm:p-6">
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? "Edit Role" : "Tambah Role"}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Atur informasi role</p>
        </div>
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">{formError}</div>
        )}
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <Label>Kode <span className="text-error-500">*</span></Label>
            <Input type="text" placeholder="admin, guru, siswa" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })} />
          </div>
          <div>
            <Label>Nama<span className="text-error-500">*</span></Label>
            <Input type="text" placeholder="Nama Role" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Input type="text" placeholder="Deskripsi role..." value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isSystem" checked={formData.isSystem} onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <label htmlFor="isSystem" className="text-sm text-gray-700 dark:text-gray-300">Role Sistem (tidak bisa dihapus)</label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">Batal</button>
            <Button size="sm" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan Data"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
