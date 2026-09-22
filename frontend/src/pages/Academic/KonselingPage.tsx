import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Icon } from "../../components/icons/ideas-icon";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Textarea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import {
  konselingService,
  CatatanKonselingItem,
  CreateCatatanKonselingPayload,
  VisibilitasKonseling,
} from "../../services/academic-extras.service";

const visibilitasOptions: { value: VisibilitasKonseling; label: string; color: string }[] = [
  { value: "rahasia", label: "Rahasia", color: "error" },
  { value: "internal_bk", label: "Internal BK", color: "warning" },
  { value: "siswa", label: "Siswa", color: "info" },
];

export default function KonselingPage() {
  const [data, setData] = useState<CatatanKonselingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibilitasFilter, setVisibilitasFilter] = useState<VisibilitasKonseling | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateCatatanKonselingPayload>({
    siswaId: 1,
    guruBkId: 1,
    tanggal: new Date().toISOString().split("T")[0],
    topik: "",
    isi: "",
    visibilitas: "rahasia",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
        search,
      };
      if (visibilitasFilter) params.visibilitas = visibilitasFilter;

      const res = await konselingService.getAll(params);
      setData(res.data);
      if (res.meta) {
        setTotalPages(res.meta.lastPage || 1);
        setTotalCount(res.meta.total || 0);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, search, visibilitasFilter]);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      siswaId: 1,
      guruBkId: 1,
      tanggal: new Date().toISOString().split("T")[0],
      topik: "",
      isi: "",
      visibilitas: "rahasia",
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: CatatanKonselingItem) {
    setEditingId(item.id);
    setFormData({
      siswaId: item.siswaId,
      guruBkId: item.guruBkId,
      tanggal: item.tanggal?.split("T")[0] || "",
      topik: item.topik,
      isi: item.isi,
      visibilitas: item.visibilitas,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.topik || !formData.isi) {
      setFormError("Topik dan Isi wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await konselingService.update(editingId, formData);
        setSuccessMsg("Catatan konseling berhasil diperbarui!");
      } else {
        await konselingService.create(formData);
        setSuccessMsg("Catatan konseling berhasil ditambahkan!");
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
    if (!confirm("Hapus catatan konseling ini?")) return;
    try {
      await konselingService.delete(id);
      setSuccessMsg("Catatan konseling berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus");
    }
  }

  return (
    <>
      <PageMeta title="Catatan Konseling | IdEaS" description="Kelola catatan konseling siswa" />
      <PageBreadcrumb pageTitle="Catatan Konseling" />

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

      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6 card-flat">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Icon name="Brain" className="icon-box mr-2 align-middle" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 inline-flex items-center">Daftar Catatan Konseling</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Catatan konseling siswa oleh guru BK</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <select
              value={visibilitasFilter === "" ? "" : visibilitasFilter}
              onChange={(e) => setVisibilitasFilter(e.target.value as VisibilitasKonseling | "")}
              className="h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 w-full sm:w-auto"
            >
              <option value="">Semua Visibilitas</option>
              {visibilitasOptions.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
            <Input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full sm:w-56"
            />
            <Button size="sm" onClick={openCreateModal} className="w-full sm:w-auto justify-center">
              + Tambah Catatan
            </Button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 table-head">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Topik</th>
                <th className="px-4 py-3">Visibilitas</th>
                <th className="px-4 py-3">Tindak Lanjut</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 table-body-row">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 text-xs font-mono">{item.tanggal?.split("T")[0]}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-white">
                      {item.siswa?.namaLengkap || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="truncate max-w-xs">{item.topik}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge color={visibilitasOptions.find((v) => v.value === item.visibilitas)?.color || "light"} size="sm">
                        {visibilitasOptions.find((v) => v.value === item.visibilitas)?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {item.tindakLanjut || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="btn-action-sm text-brand-600">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="btn-action-sm text-error-600">Hapus</button>
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
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Tidak ada data ditemukan.</div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 card-flat">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <Icon name="BookOpen" size={18} className="icon-box mt-0.5 text-gray-500 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate ml-2">{item.topik}</h4>
                    <div className="text-xs text-gray-500">
                      <div>Siswa: {item.siswa?.namaLengkap || "-"}</div>
                      <div>{item.tanggal?.split("T")[0]}</div>
                    </div>
                  </div>
                  <Badge color={visibilitasOptions.find((v) => v.value === item.visibilitas)?.color || "light"} size="sm">
                    {visibilitasOptions.find((v) => v.value === item.visibilitas)?.label}
                  </Badge>
                </div>
                {item.tindakLanjut && (
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">Tindak lanjut: {item.tindakLanjut}</div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(item)} className="btn-action-sm text-brand-600">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn-action-sm text-error-600">Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
            <span>Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-action-sm">Sebelumnya</button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-action-sm">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg p-4 sm:p-6">
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? "Edit Catatan Konseling" : "Tambah Catatan Konseling"}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Catat hasil konseling siswa</p>
        </div>
        {formError && (
          <div className="mb-4 p-3 rounded-lg alert-error-flat">{formError}</div>
        )}
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Siswa <span className="text-error-500">*</span></Label>
              <select value={formData.siswaId} onChange={(e) => setFormData({ ...formData, siswaId: Number(e.target.value) })} className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                <option value={1}>Siswa 1</option>
              </select>
            </div>
            <div>
              <Label>Guru BK <span className="text-error-500">*</span></Label>
              <select value={formData.guruBkId} onChange={(e) => setFormData({ ...formData, guruBkId: Number(e.target.value) })} className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                <option value={1}>Guru BK 1</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Tanggal <span className="text-error-500">*</span></Label>
            <Input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} />
          </div>
          <div>
            <Label>Topik <span className="text-error-500">*</span></Label>
            <Input type="text" placeholder="Masukkan topik konseling..." value={formData.topik} onChange={(e) => setFormData({ ...formData, topik: e.target.value })} />
          </div>
          <div>
            <Label>Isi Konseling <span className="text-error-500">*</span></Label>
            <Textarea rows={4} placeholder="Catat isi konseling..." value={formData.isi} onChange={(val) => setFormData({ ...formData, isi: val })} />
          </div>
          <div>
            <Label>Tindak Lanjut</Label>
            <Textarea rows={2} placeholder="Catatan tindak lanjut..." value={formData.tindakLanjut || ""} onChange={(val) => setFormData({ ...formData, tindakLanjut: val })} />
          </div>
          <div>
            <Label>Visibilitas</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {visibilitasOptions.map((v) => (
                <label key={v.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${formData.visibilitas === v.value ? `border-${v.color}-300 bg-${v.color}-50` : `border-gray-200 bg-white`} dark:bg-gray-800 dark:border-gray-700`}>
                  <input type="radio" name="visibilitas" value={v.value} checked={formData.visibilitas === v.value} onChange={(e) => setFormData({ ...formData, visibilitas: e.target.value as VisibilitasKonseling })} className="h-4 w-4 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm">{v.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-action-sm">Batal</button>
            <Button size="sm" disabled={isSaving} className="btn-action-sm">{isSaving ? "Menyimpan..." : "Simpan Data"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
