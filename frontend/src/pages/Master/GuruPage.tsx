import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  guruService,
  GuruItem,
  CreateGuruPayload,
  pegawaiService,
  PegawaiItem,
} from "../../services/master.service";

export default function GuruPage() {
  const [data, setData] = useState<GuruItem[]>([]);
  const [pegawaiList, setPegawaiList] = useState<PegawaiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateGuruPayload>({
    pegawaiId: 0,
    kodeGuru: "",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const [guruRes, pegawaiRes] = await Promise.all([
        guruService.getAll({ search }),
        pegawaiService.getAll({ limit: 100, statusAktif: true }),
      ]);
      setData(guruRes.data);
      setPegawaiList(pegawaiRes.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data guru");
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
      pegawaiId: pegawaiList[0]?.id || 0,
      kodeGuru: "",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: GuruItem) {
    setEditingId(item.id);
    setFormData({
      pegawaiId: item.pegawaiId,
      kodeGuru: item.kodeGuru || "",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.pegawaiId) {
      setFormError("Silakan pilih pegawai terlebih dahulu.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await guruService.update(editingId, { kodeGuru: formData.kodeGuru });
        setSuccessMsg("Data guru berhasil diperbarui!");
      } else {
        await guruService.create(formData);
        setSuccessMsg("Guru baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan data guru");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus status guru ini?")) return;
    try {
      await guruService.delete(id);
      setSuccessMsg("Data guru berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus guru");
    }
  }

  return (
    <>
      <PageMeta
        title="Master Guru | IdEaS"
        description="Manajemen Data Tenaga Pendidik / Guru"
      />
      <PageBreadcrumb pageTitle="Data Guru Pengajar" />

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
              Daftar Guru Pengajar
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola data guru pengajar dari data pegawai sekolah
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Cari guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 sm:w-64"
            />
            <Button size="sm" onClick={openCreateModal}>
              + Tambah Guru
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Kode Guru</th>
                <th className="px-4 py-3">Nama Lengkap & NIP</th>
                <th className="px-4 py-3">Jabatan / Status</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Memuat data guru...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Belum ada data guru pengajar.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {item.kodeGuru || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.pegawai?.namaLengkap}
                      </div>
                      {item.pegawai?.nip && (
                        <div className="text-xs text-gray-400">
                          NIP: {item.pegawai.nip}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div>{item.pegawai?.jabatan || "Guru"}</div>
                      {item.pegawai?.nuptk && (
                        <span className="text-gray-400">
                          NUPTK: {item.pegawai.nuptk}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div>{item.pegawai?.noTelepon || "-"}</div>
                      <div className="text-gray-400">{item.pegawai?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.pegawai?.statusAktif ? (
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
      </div>

      {/* Modal Create / Edit Guru */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-md p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Kode Guru" : "Tambah Guru Pengajar"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pilih pegawai untuk dijadikan sebagai guru pengajar
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
              Pilih Pegawai <span className="text-error-500">*</span>
            </Label>
            <select
              disabled={Boolean(editingId)}
              value={formData.pegawaiId}
              onChange={(e) =>
                setFormData({ ...formData, pegawaiId: Number(e.target.value) })
              }
              className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-60"
              required
            >
              <option value="">Pilih Pegawai...</option>
              {pegawaiList
                .filter(
                  (p) =>
                    !data.some((g) => g.pegawaiId === p.id) ||
                    p.id === formData.pegawaiId,
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namaLengkap} {p.nip ? `(NIP: ${p.nip})` : ""}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label>Kode Guru (Opsional)</Label>
            <Input
              type="text"
              placeholder="Contoh: G01, MTK1"
              value={formData.kodeGuru || ""}
              onChange={(e) =>
                setFormData({ ...formData, kodeGuru: e.target.value })
              }
            />
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
              {isSaving ? "Menyimpan..." : "Simpan Guru"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
