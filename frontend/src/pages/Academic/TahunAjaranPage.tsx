import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Checkbox from "../../components/form/input/Checkbox";
import { Icon } from "../../components/icons/ideas-icon";
import {
  tahunAjaranService,
  TahunAjaranItem,
  CreateTahunAjaranPayload,
} from "../../services/academic.service";

export default function TahunAjaranPage() {
  const [data, setData] = useState<TahunAjaranItem[]>([]);
  const [activeItem, setActiveItem] = useState<TahunAjaranItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateTahunAjaranPayload>({
    nama: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    isActive: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [listRes, activeRes] = await Promise.all([
        tahunAjaranService.getAll({ search, sort: "id", order: "DESC" }),
        tahunAjaranService.getActive(),
      ]);
      setData(listRes.data);
      setActiveItem(activeRes);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data tahun ajaran");
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
      nama: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      isActive: false,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: TahunAjaranItem) {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      tanggalMulai: item.tanggalMulai ? item.tanggalMulai.split("T")[0] : "",
      tanggalSelesai: item.tanggalSelesai ? item.tanggalSelesai.split("T")[0] : "",
      isActive: item.isActive,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.nama || !formData.tanggalMulai || !formData.tanggalSelesai) {
      setFormError("Semua bidang bertanda bintang wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await tahunAjaranService.update(editingId, formData);
        setSuccessMsg("Tahun ajaran berhasil diperbarui!");
      } else {
        await tahunAjaranService.create(formData);
        setSuccessMsg("Tahun ajaran baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan tahun ajaran");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus data tahun ajaran ini?")) return;
    try {
      await tahunAjaranService.delete(id);
      setSuccessMsg("Tahun ajaran berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus tahun ajaran");
    }
  }

  return (
    <>
      <PageMeta
        title="Tahun Ajaran | IdEaS"
        description="Manajemen Tahun Ajaran dan Periode Akademik"
      />
      <PageBreadcrumb pageTitle="Tahun Ajaran" />

      {/* Active Academic Year Banner */}
      {activeItem && (
        <div className="mb-6 card-flat border border-brand-200 dark:border-brand-900/50">
          <div className="flex items-center gap-3">
            <div className="icon-box bg-brand-500 text-white shadow-sm">
              <Icon name="GraduationCap" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Tahun Ajaran {activeItem.nama}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Periode: {activeItem.tanggalMulai.split("T")[0]} s/d{" "}
                  {activeItem.tanggalSelesai.split("T")[0]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Tahun Ajaran Aktif
                </span>
                <Badge color="success" size="sm">
                  Aktif
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg alert-success-flat">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg alert-error-flat">
          {error}
        </div>
      )}

      {/* Main Card */}
      <div className="card-flat lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Daftar Tahun Ajaran
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola daftar periode tahun ajaran akademik sekolah
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Cari tahun ajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64"
            />
            <Button size="sm" onClick={openCreateModal}>
              + Tambah Tahun Ajaran
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="table-head border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Tahun Ajaran</th>
                <th className="px-4 py-3">Tanggal Mulai</th>
                <th className="px-4 py-3">Tanggal Selesai</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="table-body-row divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Memuat data tahun ajaran...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Belum ada data tahun ajaran.
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3.5 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {item.nama}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.tanggalMulai ? item.tanggalMulai.split("T")[0] : "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.tanggalSelesai ? item.tanggalSelesai.split("T")[0] : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.isActive ? (
                        <Badge color="success" size="sm">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge color="light" size="sm">
                          Selesai / Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 text-xs font-medium text-brand-600 rounded-lg hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 text-xs font-medium text-error-600 rounded-lg hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-gray-400">
              Memuat data tahun ajaran...
            </div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              Belum ada data tahun ajaran.
            </div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="card-flat">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {item.nama}
                      </span>
                      {item.isActive && (
                        <Badge color="success" size="sm">Aktif</Badge>
                      )}
                      {!item.isActive && (
                        <Badge color="light" size="sm">Selesai</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>
                        Mulai:{" "}
                        {item.tanggalMulai
                          ? item.tanggalMulai.split("T")[0]
                          : "-"}
                      </p>
                      <p>
                        Selesai:{" "}
                        {item.tanggalSelesai
                          ? item.tanggalSelesai.split("T")[0]
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 text-xs font-medium text-brand-600 rounded-lg hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 text-xs font-medium text-error-600 rounded-lg hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-lg p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Format nama tahun ajaran harus berupa format YYYY/YYYY (contoh: 2024/2025)
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
              Nama Tahun Ajaran <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Contoh: 2024/2025"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                Tanggal Mulai <span className="text-error-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.tanggalMulai}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalMulai: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>
                Tanggal Selesai <span className="text-error-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.tanggalSelesai}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalSelesai: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Checkbox
              checked={formData.isActive || false}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Jadikan sebagai Tahun Ajaran Aktif Saat Ini
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Batal
            </button>
            <Button size="sm" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Tahun Ajaran"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
