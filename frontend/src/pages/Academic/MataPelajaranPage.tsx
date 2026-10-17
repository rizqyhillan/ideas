import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import {
  mataPelajaranService,
  MataPelajaranItem,
} from "../../services/academic-extras.service";
import { guruService, GuruItem } from "../../services/master.service";

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
    guruPengampuId: undefined as number | undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [gurus, setGurus] = useState<GuruItem[]>([]);

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

  useEffect(() => {
    guruService.getAll({ limit: 200 }).then((res) => setGurus(res.data)).catch(() => {});
  }, []);

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
        guruPengampuId: formData.guruPengampuId ?? null,
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
    setFormData({ kode: "", nama: "", deskripsi: "", isActive: true, guruPengampuId: undefined });
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
      guruPengampuId: item.guruPengampuId ?? undefined,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  return (
    <div className="mapel-page">
      <PageBreadcrumb pageTitle="Mata Pelajaran" />
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg alert-success-flat">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg alert-error-flat">{errorMsg}</div>
      )}
      <div className="card-flat p-4 sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              Daftar Mata Pelajaran
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola mata pelajaran yang diajarkan
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button size="sm" className="w-full sm:w-auto" onClick={openCreateModal}>
              + Tambah
            </Button>
          </div>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Pengampu</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="table-body-row">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Memuat...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-mono text-xs bg-gray-100 dark:bg-gray-800">
                      {item.kode}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {item.nama}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 dark:text-gray-400">
                      {item.guruPengampu?.pegawai?.namaLengkap
                        ? item.guruPengampu.pegawai.namaLengkap
                        : <span className="italic text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {item.deskripsi || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.isActive ? (
                        <Badge color="success" size="sm">
                          Aktif
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
                          className="btn-action-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-action-sm"
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
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat...</div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Belum ada data</div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="academic-mobile-card"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="academic-mobile-card__content">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                        {item.kode}
                      </span>
                      {!item.isActive && (
                        <Badge color="light" size="sm">
                          Nonaktif
                        </Badge>
                      )}
                    </div>
                    <p className="break-words text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                      {item.nama}
                    </p>
                    <p className="mt-1 break-words text-xs text-gray-500 dark:text-gray-400">
                      {item.deskripsi || "-"}
                    </p>
                    {item.guruPengampu?.pegawai?.namaLengkap && (
                      <p className="mt-1 break-words text-xs text-gray-500 dark:text-gray-400">
                        Pengampu: {item.guruPengampu.pegawai.namaLengkap}
                      </p>
                    )}
                  </div>
                  <div className="academic-mobile-card__actions">
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn-action-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-action-sm"
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="w-[calc(100%-1rem)] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
          </h3>
        </div>
        {formError && (
          <div className="mb-4 p-3 rounded-lg alert-error-flat">
            {formError}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
          <div>
            <Label>Kode *</Label>
            <Input
              type="text"
              placeholder="Contoh: MAT"
              value={formData.kode}
              onChange={(e) =>
                setFormData({ ...formData, kode: e.target.value.toUpperCase() })
              }
            />
          </div>
          <div>
            <Label>Nama *</Label>
            <Input
              type="text"
              placeholder="Contoh: Matematika"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <textarea
              className="w-full h-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Deskripsi singkat..."
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Guru Pengampu</Label>
            <select
              value={formData.guruPengampuId ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  guruPengampuId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="select-ui"
            >
              <option value="">Pilih Guru Pengampu (Opsional)</option>
              {gurus.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.pegawai?.namaLengkap}{g.kodeGuru ? ` (${g.kodeGuru})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={formData.isActive ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
              className="select-ui mt-1 h-10"
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 sm:gap-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-action-sm"
            >
              Batal
            </button>
            <Button size="sm" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
