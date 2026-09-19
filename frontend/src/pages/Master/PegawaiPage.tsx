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
  pegawaiService,
  PegawaiItem,
  CreatePegawaiPayload,
} from "../../services/master.service";

export default function PegawaiPage() {
  const [data, setData] = useState<PegawaiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | "">("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreatePegawaiPayload>({
    nip: "",
    nuptk: "",
    namaLengkap: "",
    jenisKelamin: "L",
    tempatLahir: "",
    tanggalLahir: "",
    email: "",
    noTelepon: "",
    alamat: "",
    jabatan: "Guru",
    statusAktif: true,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await pegawaiService.getAll({
        search,
        statusAktif: statusFilter === "" ? undefined : Boolean(statusFilter),
      });
      setData(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data pegawai");
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
      nip: "",
      nuptk: "",
      namaLengkap: "",
      jenisKelamin: "L",
      tempatLahir: "",
      tanggalLahir: "",
      email: "",
      noTelepon: "",
      alamat: "",
      jabatan: "Guru",
      statusAktif: true,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: PegawaiItem) {
    setEditingId(item.id);
    setFormData({
      nip: item.nip || "",
      nuptk: item.nuptk || "",
      namaLengkap: item.namaLengkap,
      jenisKelamin: item.jenisKelamin,
      tempatLahir: item.tempatLahir || "",
      tanggalLahir: item.tanggalLahir ? item.tanggalLahir.split("T")[0] : "",
      email: item.email || "",
      noTelepon: item.noTelepon || "",
      alamat: item.alamat || "",
      jabatan: item.jabatan || "",
      statusAktif: item.statusAktif,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.jenisKelamin) {
      setFormError("Nama Lengkap dan Jenis Kelamin wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await pegawaiService.update(editingId, formData);
        setSuccessMsg("Data pegawai berhasil diperbarui!");
      } else {
        await pegawaiService.create(formData);
        setSuccessMsg("Data pegawai baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan data pegawai");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus data pegawai ini?")) return;
    try {
      await pegawaiService.delete(id);
      setSuccessMsg("Data pegawai berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus pegawai");
    }
  }

  return (
    <>
      <PageMeta
        title="Master Pegawai | IdEaS"
        description="Manajemen Data Pendidik & Tenaga Kependidikan"
      />
      <PageBreadcrumb pageTitle="Data Pegawai & Staf" />

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
              Daftar Pegawai & Tenaga Kependidikan
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola biodata guru, staf tata usaha, dan tenaga kependidikan
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
              placeholder="Cari NIP / Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 sm:w-56"
            />
            <Button size="sm" onClick={openCreateModal}>
              + Tambah Pegawai
            </Button>
          </div>
        </div>

        {/* Table (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Nama Lengkap & NIP</th>
                <th className="px-4 py-3 text-center">L/P</th>
                <th className="px-4 py-3">Jabatan & Kepegawaian</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Memuat data pegawai...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Belum ada data pegawai.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.namaLengkap}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        NIP: {item.nip || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold">
                      {item.jenisKelamin}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {item.jabatan || "-"}
                      </div>
                      {item.nuptk && (
                        <span className="text-gray-400">
                          NUPTK: {item.nuptk}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div>{item.noTelepon || "-"}</div>
                      <div className="text-gray-400">{item.email || ""}</div>
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

        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-3 mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat data pegawai...</div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Belum ada data pegawai.</div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.namaLengkap}</h4>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      NIP: {item.nip || "-"}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.jenisKelamin === "L"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                        : "bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400"
                    }`}
                  >
                    {item.jenisKelamin}
                  </span>
                </div>
                <div className="text-xs mb-3">
                  <span className="text-gray-400">Jabatan:</span>
                  <span className="text-gray-700 dark:text-gray-300">{item.jabatan || "-"}</span>
                  {item.nuptk && (
                    <span className="text-gray-400 block">NUPTK: {item.nuptk}</span>
                  )}
                </div>
                <div className="text-xs mb-3">
                  <span className="text-gray-400">Kontak:</span>
                  <span className="text-gray-700 dark:text-gray-300">{item.noTelepon || "-"}</span>
                  <span className="text-gray-400 block">{item.email || ""}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Badge color={item.statusAktif ? "success" : "light"} size="sm">
                    {item.statusAktif ? "Aktif" : "Nonaktif"}
                  </Badge>
                  <div className="flex gap-2">
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Create / Edit Pegawai */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-lg p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Isi biodata pegawai dan data kepegawaian
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
              <Label>NIP (Nomor Induk Pegawai)</Label>
              <Input
                type="text"
                placeholder="198501012010011001"
                value={formData.nip || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nip: e.target.value })
                }
              />
            </div>
            <div>
              <Label>
                Nama Lengkap <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Budi Santoso, S.Pd"
                value={formData.namaLengkap}
                onChange={(e) =>
                  setFormData({ ...formData, namaLengkap: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <Label>NUPTK (Opsional)</Label>
              <Input
                type="text"
                placeholder="16 digit NUPTK"
                value={formData.nuptk || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nuptk: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Jabatan / Posisi</Label>
            <Input
              type="text"
              placeholder="Guru Matematika / Staf TU / Kepala Laboratorium"
              value={formData.jabatan || ""}
              onChange={(e) =>
                setFormData({ ...formData, jabatan: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="pegawai@ideas.id"
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

          <div className="flex items-center gap-3 pt-2">
            <Checkbox
              checked={formData.statusAktif || false}
              onChange={(checked) =>
                setFormData({ ...formData, statusAktif: checked })
              }
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pegawai Berstatus Aktif
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
              {isSaving ? "Menyimpan..." : "Simpan Pegawai"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
