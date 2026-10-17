import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Icon } from "../../components/icons/ideas-icon";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Textarea from "../../components/form/input/TextArea";
import SearchableSelect from "../../components/form/SearchableSelect";
import {
  konselingService,
  CatatanKonselingItem,
  CreateCatatanKonselingPayload,
  VisibilitasKonseling,
} from "../../services/academic-extras.service";
import { siswaService, SiswaItem, guruService, GuruItem } from "../../services/master.service";
import { useAuth } from "../../context/AuthContext";

const visibilitasOptions: {
  value: VisibilitasKonseling;
  label: string;
  color: string;
}[] = [
  { value: "rahasia", label: "Rahasia", color: "error" },
  { value: "internal_bk", label: "Internal BK", color: "warning" },
  { value: "siswa", label: "Siswa", color: "info" },
];

export default function KonselingPage() {
  const { user } = useAuth();

  const isSiswa = useMemo(() => {
    return user?.roles?.includes("siswa");
  }, [user]);

  const canManageKonseling = useMemo(() => {
    if (!user) return false;
    return (
      user.roles?.includes("admin") ||
      user.roles?.includes("guru_bk") ||
      user.permissions?.includes("counseling.create") ||
      user.permissions?.includes("konseling.create")
    );
  }, [user]);

  const [data, setData] = useState<CatatanKonselingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibilitasFilter, setVisibilitasFilter] = useState<
    VisibilitasKonseling | ""
  >("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Master data options for modal
  const [studentOptions, setStudentOptions] = useState<SiswaItem[]>([]);
  const [guruOptions, setGuruOptions] = useState<GuruItem[]>([]);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateCatatanKonselingPayload>({
    siswaId: 0,
    guruBkId: 0,
    tanggal: new Date().toISOString().split("T")[0],
    topik: "",
    isi: "",
    visibilitas: "rahasia",
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load students & teachers for modal dropdowns
  useEffect(() => {
    if (!canManageKonseling) return;
    async function loadMaster() {
      try {
        const [siswaRes, guruRes] = await Promise.all([
          siswaService.getAll({ limit: 100, statusAktif: true }),
          guruService.getAll({ limit: 100, role: "guru_bk" }),
        ]);
        setStudentOptions(siswaRes.data || []);
        setGuruOptions(guruRes.data || []);
      } catch {
        // silent fallback
      }
    }
    loadMaster();
  }, [canManageKonseling]);

  const studentSelectOptions = useMemo(
    () =>
      studentOptions.map((s) => ({
        value: s.id,
        label: s.namaLengkap,
        sublabel: s.nisn ? `NISN: ${s.nisn}` : undefined,
      })),
    [studentOptions]
  );

  const guruSelectOptions = useMemo(
    () =>
      guruOptions.map((g) => ({
        value: g.id,
        label: g.pegawai?.namaLengkap || `Guru #${g.id}`,
        sublabel: g.pegawai?.nip ? `NIP: ${g.pegawai.nip}` : undefined,
      })),
    [guruOptions]
  );

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
        // setTotalCount(res.meta.total || 0);
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
      siswaId: studentOptions[0]?.id || 0,
      guruBkId: guruOptions[0]?.id || 0,
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
    if (!formData.siswaId || !formData.guruBkId || !formData.tanggal || !formData.topik || !formData.isi) {
      setFormError("Siswa, Guru BK, tanggal, topik, dan isi wajib diisi.");
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
    <div className="konseling-page">
      <PageMeta
        title="Catatan Konseling | IdEaS"
        description="Kelola catatan konseling siswa"
      />
      <PageBreadcrumb pageTitle="Catatan Konseling" />

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
          <div className="min-w-0">
            <Icon name="Brain" className="icon-box mr-2 align-middle" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 inline-flex items-center">
              Daftar Catatan Konseling
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Catatan konseling siswa oleh guru BK
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            {!isSiswa && (
              <select
                value={visibilitasFilter === "" ? "" : visibilitasFilter}
                onChange={(e) => {
                  setVisibilitasFilter(
                    e.target.value as VisibilitasKonseling | "",
                  );
                  setPage(1);
                }}
                className="select-ui w-full sm:w-auto"
              >
                <option value="">Semua Visibilitas</option>
                {visibilitasOptions.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            )}
            <Input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-56"
            />
            {canManageKonseling && (
              <Button
                size="sm"
                onClick={openCreateModal}
                className="w-full sm:w-auto justify-center"
              >
                + Tambah Catatan
              </Button>
            )}
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
                {canManageKonseling && (
                  <th className="px-4 py-3 text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 table-body-row">
              {loading ? (
                <tr>
                  <td colSpan={canManageKonseling ? 6 : 5} className="py-8 text-center text-gray-400">
                    Memuat data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={canManageKonseling ? 6 : 5} className="py-8 text-center text-gray-400">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 text-xs font-mono">
                      {item.tanggal?.split("T")[0]}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-white">
                      {item.siswa?.namaLengkap || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="truncate max-w-xs">{item.topik}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        color={
                          (visibilitasOptions.find(
                            (v) => v.value === item.visibilitas,
                          )?.color as any) || "light"
                        }
                        size="sm"
                      >
                        {
                          visibilitasOptions.find(
                            (v) => v.value === item.visibilitas,
                          )?.label
                        }
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {item.tindakLanjut || "-"}
                    </td>
                    {canManageKonseling && (
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn-action-sm text-brand-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn-action-sm text-error-600"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 block space-y-3 md:hidden">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              Tidak ada data ditemukan.
            </div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="academic-mobile-card"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-2">
                    <Icon
                      name="BookOpen"
                      size={18}
                      className="icon-box mt-0.5 shrink-0 text-gray-500 dark:text-gray-400"
                    />
                    <div className="academic-mobile-card__content">
                      <h4 className="break-words font-semibold leading-snug text-gray-900 dark:text-white">
                        {item.topik}
                      </h4>
                      <div className="mt-1 break-words text-xs text-gray-500">
                        <div>Siswa: {item.siswa?.namaLengkap || "-"}</div>
                        <div>{item.tanggal?.split("T")[0]}</div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    color={
                      (visibilitasOptions.find(
                        (v) => v.value === item.visibilitas,
                      )?.color as any) || "light"
                    }
                    size="sm"
                  >
                    {
                      visibilitasOptions.find(
                        (v) => v.value === item.visibilitas,
                      )?.label
                    }
                  </Badge>
                </div>
                {item.tindakLanjut && (
                  <div className="mb-3 break-words text-xs text-gray-600 dark:text-gray-300">
                    Tindak lanjut: {item.tindakLanjut}
                  </div>
                )}
                {canManageKonseling && (
                  <div className="academic-mobile-card__actions">
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn-action-sm text-brand-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-action-sm text-error-600"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-start gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Halaman {page} dari {totalPages}
            </span>
            <div className="academic-mobile-card__actions sm:flex sm:w-auto">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-action-sm"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-action-sm"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="konseling-modal w-[calc(100%-1rem)] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Catatan Konseling" : "Tambah Catatan Konseling"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Catat hasil konseling siswa
          </p>
        </div>
        {formError && (
          <div className="mb-4 p-3 rounded-lg alert-error-flat">
            {formError}
          </div>
        )}
        <form
          onSubmit={handleSave}
          className="space-y-3 overflow-y-auto px-1 sm:space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label>
                Siswa <span className="text-error-500">*</span>
              </Label>
              <SearchableSelect
                options={studentSelectOptions}
                value={formData.siswaId}
                onChange={(val) =>
                  setFormData({ ...formData, siswaId: Number(val) })
                }
                placeholder="Pilih Siswa..."
                searchPlaceholder="Cari siswa atau NISN..."
              />
            </div>
            <div>
              <Label>
                Guru BK <span className="text-error-500">*</span>
              </Label>
              <SearchableSelect
                options={guruSelectOptions}
                value={formData.guruBkId}
                onChange={(val) =>
                  setFormData({ ...formData, guruBkId: Number(val) })
                }
                placeholder="Pilih Guru BK..."
                searchPlaceholder="Cari guru BK atau NIP..."
              />
            </div>
          </div>
          <div>
            <Label>
              Tanggal <span className="text-error-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.tanggal}
              onChange={(e) =>
                setFormData({ ...formData, tanggal: e.target.value })
              }
            />
          </div>
          <div>
            <Label>
              Topik <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Masukkan topik konseling..."
              value={formData.topik}
              onChange={(e) =>
                setFormData({ ...formData, topik: e.target.value })
              }
            />
          </div>
          <div>
            <Label>
              Isi Konseling <span className="text-error-500">*</span>
            </Label>
            <Textarea
              rows={4}
              placeholder="Catat isi konseling..."
              value={formData.isi}
              onChange={(val) => setFormData({ ...formData, isi: val })}
            />
          </div>
          <div>
            <Label>Tindak Lanjut</Label>
            <Textarea
              rows={2}
              placeholder="Catatan tindak lanjut..."
              value={formData.tindakLanjut || ""}
              onChange={(val) =>
                setFormData({ ...formData, tindakLanjut: val })
              }
            />
          </div>
          <div>
            <Label>Visibilitas</Label>
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3 mt-1">
              {visibilitasOptions.map((v) => (
                <label
                  key={v.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${formData.visibilitas === v.value ? `border-${v.color}-300 bg-${v.color}-50` : `border-gray-200 bg-white`} dark:bg-gray-800 dark:border-gray-700`}
                >
                  <input
                    type="radio"
                    name="visibilitas"
                    value={v.value}
                    checked={formData.visibilitas === v.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibilitas: e.target.value as VisibilitasKonseling,
                      })
                    }
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm">{v.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 sm:gap-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-action-sm"
            >
              Batal
            </button>
            <Button size="sm" disabled={isSaving} className="btn-action-sm">
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
