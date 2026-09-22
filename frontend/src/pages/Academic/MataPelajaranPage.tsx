import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { mataPelajaranService, MataPelajaranItem } from "../../services/academic-extras.service";

export default function MataPelajaranPage() {
  const [data, setData] = useState<MataPelajaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const res = await mataPelajaranService.getAll({ search, limit: 100 });
      setData(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.kode || !formData.nama) {
      setFormError("Kode dan nama mata pelajaran wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError("");
      const payload = {
        kode: formData.kode,
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        isActive: formData.isActive,
      };
      if (editingId) {
        await mataPelajaranService.update(editingId, payload);
        setSuccessMsg("Mata pelajaran berhasil diperbarui");
      } else {
        await mataPelajaranService.create(payload);
        setSuccessMsg("Mata pelajaran berhasil ditambahkan");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    try {
      await mataPelajaranService.delete(id);
      setSuccessMsg("Mata pelajaran dihapus");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus");
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({ kode: "", nama: "", deskripsi: "", isActive: true });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: MataPelajaranItem) {
    setEditingId(item.id);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      deskripsi: item.deskripsi || "",
      isActive: item.isActive,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Mata Pelajaran" />
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg alert-success-flat">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg alert-error-flat">
          {errorMsg}
        </div>
      )}
      <div className="card-flat">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daftar Mata Pelajaran</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kelola mata pelajaran yang diajarkan</p>
          </div>
          <div className="flex items-center gap-3">
            <Input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 sm:w-64" />
            <Button size="sm" onClick={openCreateModal}>+ Tambah</Button>
          </div>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="table-body-row">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada data</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-mono text-xs bg-gray-100 dark:bg-gray-800">{item.kode}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">{item.nama}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{item.deskripsi || "-"}</td>
                    <td className="px-4 py-3.5 text-center">
                      {item.isActive ? <Badge color="success" size="sm">Aktif</Badge> : <Badge color="light" size="sm">Nonaktif</Badge>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="btn-action-sm">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="btn-action-sm">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {loading ? <div className="py-8 text-center text-gray-400">Memuat...</div> : data.length === 0 ? <div className="py-8 text-center text-gray-400">Belum ada data</div> : data.map((item) => (
            <div key={item.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 card-flat">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{item.kode}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.nama}</span>
                    {!item.isActive && <Badge color="light" size="sm">Nonaktif</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.deskripsi || "-"}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEditModal(item)} className="btn-action-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn-action-sm">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg p-6">
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</h3>
        </div>
        {formError && <div className="mb-4 p-3 rounded-lg alert-error-flat">{formError}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Kode *</Label>
            <Input type="text" placeholder="Contoh: MAT" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <Label>Nama *</Label>
            <Input type="text" placeholder="Contoh: Matematika" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <textarea
              className="w-full h-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Deskripsi singkat..."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={formData.isActive ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
              className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-action-sm">Batal</button>
            <Button size="sm" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
