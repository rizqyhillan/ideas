import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Checkbox from "../../components/form/input/Checkbox";
import {
  siswaService,
  SiswaItem,
  CreateSiswaPayload,
} from "../../services/master.service";

export default function SiswaPage() {
  const [data, setData] = useState<SiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateSiswaPayload>({
    nisn: "",
    nis: "",
    namaLengkap: "",
    jenisKelamin: "L",
    tempatLahir: "",
    tanggalLahir: "",
    email: "",
    noTelepon: "",
    alamat: "",
    namaWali: "",
    noTeleponWali: "",
    statusAktif: true,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await siswaService.getAll({
        page,
        limit: 10,
        search,
        statusAktif: statusFilter === "" ? undefined : Boolean(statusFilter),
        sort: "createdAt",
        order: "DESC",
      });
      setData(res.data);
      if (res.meta) {
        setTotalPages(res.meta.lastPage || 1);
        setTotalCount(res.meta.total || 0);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, statusFilter, page]);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      nisn: "",
      nis: "",
      namaLengkap: "",
      jenisKelamin: "L",
      tempatLahir: "",
      tanggalLahir: "",
      email: "",
      noTelepon: "",
      alamat: "",
      namaWali: "",
      noTeleponWali: "",
      statusAktif: true,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: SiswaItem) {
    setEditingId(item.id);
    setFormData({
      nisn: item.nisn,
      nis: item.nis || "",
      namaLengkap: item.namaLengkap,
      jenisKelamin: item.jenisKelamin,
      tempatLahir: item.tempatLahir || "",
      tanggalLahir: item.tanggalLahir ? item.tanggalLahir.split("T")[0] : "",
      email: item.email || "",
      noTelepon: item.noTelepon || "",
      alamat: item.alamat || "",
      namaWali: item.namaWali || "",
      noTeleponWali: item.noTeleponWali || "",
      statusAktif: item.statusAktif,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.nisn || !formData.namaLengkap || !formData.jenisKelamin) {
      setFormError("NISN, Nama Lengkap, dan Jenis Kelamin wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await siswaService.update(editingId, formData);
        setSuccessMsg("Data siswa berhasil diperbarui!");
      } else {
        await siswaService.create(formData);
        setSuccessMsg("Data siswa baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan data siswa");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) return;
    try {
      await siswaService.delete(id);
      setSuccessMsg("Data siswa berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus siswa");
    }
  }

  return (
    <>
      <PageMeta
        title="Master Siswa | IdEaS"
        description="Buku Induk Data Siswa"
      />
      <PageBreadcrumb pageTitle="Data Induk Siswa" />

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

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Daftar Siswa (Total: {totalCount})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola data induk pelajar dan informasi kontak wali
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter === "" ? "" : String(statusFilter)}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value === "" ? "" : e.target.value === "true",
                )
              }
              className="h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>

            <Input
              type="text"
              placeholder="Cari NISN/Nama..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-40 sm:w-56"
            />
            <Button size="sm" onClick={openCreateModal}>
              + Tambah Siswa
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">NISN / NIS</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3 text-center">L/P</th>
                <th className="px-4 py-3">Kontak & Alamat</th>
                <th className="px-4 py-3">Nama Wali</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Memuat data siswa...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-900 dark:text-white">
                      <div className="font-semibold">{item.nisn}</div>
                      {item.nis && (
                        <span className="text-gray-400">NIS: {item.nis}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-gray-100">
                      {item.namaLengkap}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold">
                      {item.jenisKelamin}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div>{item.noTelepon || item.email || "-"}</div>
                      {item.alamat && (
                        <div className="text-gray-400 truncate max-w-xs">
                          {item.alamat}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {item.namaWali || "-"}
                      </div>
                      {item.noTeleponWali && (
                        <div className="text-gray-400">
                          {item.noTeleponWali}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.statusAktif ? (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50 dark:border-gray-700"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50 dark:border-gray-700"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-xl p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Data Siswa" : "Tambah Data Siswa"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Isi biodata lengkap siswa dan kontak orang tua/wali
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                NISN <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="0081234567"
                value={formData.nisn}
                onChange={(e) =>
                  setFormData({ ...formData, nisn: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>NIS (Nomor Induk Sekolah)</Label>
              <Input
                type="text"
                placeholder="2024001"
                value={formData.nis || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nis: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label>
                Nama Lengkap <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Nama Lengkap Siswa"
                value={formData.namaLengkap}
                onChange={(e) =>
                  setFormData({ ...formData, namaLengkap: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>
                Jenis Kelamin <span className="text-error-500">*</span>
              </Label>
              <select
                value={formData.jenisKelamin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenisKelamin: e.target.value as "L" | "P",
                  })
                }
                className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                required
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Tempat Lahir</Label>
              <Input
                type="text"
                placeholder="Jakarta"
                value={formData.tempatLahir || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tempatLahir: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={formData.tanggalLahir || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalLahir: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="siswa@ideas.id"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>No. Telepon / WhatsApp</Label>
              <Input
                type="text"
                placeholder="081234567890"
                value={formData.noTelepon || ""}
                onChange={(e) =>
                  setFormData({ ...formData, noTelepon: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>Alamat Lengkap</Label>
            <Input
              type="text"
              placeholder="Jl. Mawar No. 12, RT 01 / RW 02"
              value={formData.alamat || ""}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nama Orang Tua / Wali</Label>
              <Input
                type="text"
                placeholder="Nama Wali"
                value={formData.namaWali || ""}
                onChange={(e) =>
                  setFormData({ ...formData, namaWali: e.target.value })
                }
              />
            </div>
            <div>
              <Label>No. Telepon Wali</Label>
              <Input
                type="text"
                placeholder="081298765432"
                value={formData.noTeleponWali || ""}
                onChange={(e) =>
                  setFormData({ ...formData, noTeleponWali: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Checkbox
              checked={formData.statusAktif || false}
              onChange={(checked) =>
                setFormData({ ...formData, statusAktif: checked })
              }
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Siswa Berstatus Aktif
            </span>
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
              {isSaving ? "Menyimpan..." : "Simpan Data Siswa"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
