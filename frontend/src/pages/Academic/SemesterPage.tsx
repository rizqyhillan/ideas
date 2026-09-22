import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Icon } from "../../components/icons/ideas-icon";
import {
  semesterService,
  SemesterItem,
  CreateSemesterPayload,
  JenisSemester,
} from "../../services/academic-extras.service";
import { tahunAjaranService } from "../../services/academic.service";

export default function SemesterPage() {
  const [data, setData] = useState<SemesterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateSemesterPayload>({
    tahunAjaranId: 1,
    jenis: "ganjil",
    tanggalMulai: "",
    tanggalSelesai: "",
    isActive: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [tahunAjaranList, setTahunAjaranList] = useState<{ id: number; nama: string }[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const [semesterRes, taRes] = await Promise.all([
        semesterService.getAll({ search, limit: 100 }),
        tahunAjaranService.getAll(),
      ]);
      setData(semesterRes.data);
      setTahunAjaranList(taRes.data);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search]);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      tahunAjaranId: tahunAjaranList[0]?.id || 1,
      jenis: "ganjil",
      tanggalMulai: "",
      tanggalSelesai: "",
      isActive: false,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: SemesterItem) {
    setEditingId(item.id);
    setFormData({
      tahunAjaranId: item.tahunAjaranId,
      jenis: item.jenis,
      tanggalMulai: item.tanggalMulai?.split("T")[0] || "",
      tanggalSelesai: item.tanggalSelesai?.split("T")[0] || "",
      isActive: item.isActive,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.tahunAjaranId || !formData.tanggalMulai || !formData.tanggalSelesai) {
      setFormError("Semua bidang wajib diisi.");
      return;
    }
    if (formData.tanggalSelesai <= formData.tanggalMulai) {
      setFormError("Tanggal Selesai harus setelah Tanggal Mulai.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await semesterService.update(editingId, formData);
        setSuccessMsg("Semester berhasil diperbarui");
      } else {
        await semesterService.create(formData);
        setSuccessMsg("Semester berhasil ditambahkan");
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
    if (!confirm("Hapus semester ini?")) return;
    try {
      await semesterService.delete(id);
      setSuccessMsg("Semester dihapus");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus");
    }
  }

  return (
    <>
      <PageMeta title="Semester | IdEaS" description="Kelola semester ajaran" />
      <PageBreadcrumb pageTitle="Semester" />

      {successMsg && (
        <div className="alert-success-flat">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="alert-error-flat">
          {error}
        </div>
      )}

      <div className="card-flat">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daftar Semester</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kelola semester akademik (Ganjil / Genap)</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Cari semester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64"
            />
            <Button size="sm" onClick={openCreateModal}>+ Tambah Semester</Button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Tanggal Mulai</th>
                <th className="px-4 py-3">Tanggal Selesai</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="table-body-row">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada semester</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3.5 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {tahunAjaranList.find((t) => t.id === item.tahunAjaranId)?.nama || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge color={item.jenis === "ganjil" ? "info" : "warning"} size="sm" rounded="md">
                        {item.jenis === "ganjil" ? "Ganjil" : "Genap"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">{item.tanggalMulai?.split("T")[0] || "-"}</td>
                    <td className="px-4 py-3.5">{item.tanggalSelesai?.split("T")[0] || "-"}</td>
                    <td className="px-4 py-3.5 text-center">
                      {item.isActive ? (
                        <Badge color="success" size="sm" rounded="md">Aktif</Badge>
                      ) : (
                        <Badge color="light" size="sm" rounded="md">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="btn-action-sm">
                          <Icon name="edit" size={14} />
                          <span className="ml-1">Edit</span>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="btn-action-sm">
                          <Icon name="trash" size={14} />
                          <span className="ml-1">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat...</div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Belum ada semester</div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card-flat">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {tahunAjaranList.find((t) => t.id === item.tahunAjaranId)?.nama || "-"}
                      </span>
                      <Badge color={item.jenis === "ganjil" ? "info" : "warning"} size="sm" rounded="md">
                        {item.jenis === "ganjil" ? "Ganjil" : "Genap"}
                      </Badge>
                      {item.isActive && <Badge color="success" size="sm" rounded="md">Aktif</Badge>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>Mulai: {item.tanggalMulai?.split("T")[0] || "-"}</p>
                      <p>Selesai: {item.tanggalSelesai?.split("T")[0] || "-"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditModal(item)} className="btn-action-sm">
                      <Icon name="edit" size={14} />
                      <span className="ml-1">Edit</span>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-action-sm">
                      <Icon name="trash" size={14} />
                      <span className="ml-1">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg p-6">
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Semester" : "Tambah Semester"}
          </h3>
        </div>
        {formError && (
          <div className="alert-error-flat">
            {formError}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Tahun Ajaran *</Label>
            <select
              value={String(formData.tahunAjaranId)}
              onChange={(e) => setFormData({ ...formData, tahunAjaranId: Number(e.target.value) })}
              className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Pilih Tahun Ajaran</option>
              {tahunAjaranList.map((ta) => (
                <option key={ta.id} value={String(ta.id)}>{ta.nama}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Jenis Semester *</Label>
              <select
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value as JenisSemester })}
                className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tanggal Mulai *</Label>
              <Input type="date" value={formData.tanggalMulai} onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })} />
            </div>
            <div>
              <Label>Tanggal Selesai *</Label>
              <Input type="date" value={formData.tanggalSelesai} onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="isActive" checked={formData.isActive || false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            <Label htmlFor="isActive" className="mb-0 text-sm">Jadikan Semester Aktif</Label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-action-sm">
              <Icon name="x" size={14} />
              <span className="ml-1">Batal</span>
            </button>
            <Button size="sm" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
