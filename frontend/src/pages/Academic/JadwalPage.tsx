import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import { Icon } from "../../components/icons/ideas-icon";
import {
  jadwalService,
  JadwalItem,
} from "../../services/academic-extras.service";
import { classesService, ClassItem } from "../../services/academic.service";
import { guruService, GuruItem } from "../../services/master.service";
import {
  mataPelajaranService,
  MataPelajaranItem,
} from "../../services/academic-extras.service";
import {
  semesterService,
  SemesterItem,
} from "../../services/academic-extras.service";
import { useAuth } from "../../context/AuthContext";

type Hari = "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

const hariList: Hari[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

export default function JadwalPage() {
  const { user } = useAuth();
  const isAdminUser = Boolean(
    user?.roles?.includes("admin") || user?.roles?.includes("super_admin"),
  );
  const [data, setData] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState<number | "">("");
  const [filterHari, setFilterHari] = useState<Hari | "">("");
  const [filterGuru, setFilterGuru] = useState<number | "">("");
  const [filterMapel, setFilterMapel] = useState<number | "">("");
  const [viewMode, setViewMode] = useState<"kalender" | "tabel">("kalender");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    semesterId: "",
    kelasId: "",
    mataPelajaranId: "",
    guruId: "",
    hari: "senin" as Hari,
    jamMulai: "07:00",
    jamSelesai: "08:30",
    ruang: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [kelasList, setKelasList] = useState<ClassItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaranItem[]>([]);
  const [semesterList, setSemesterList] = useState<SemesterItem[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (filterKelas) params.kelasId = filterKelas;
      if (filterHari) params.hari = filterHari;
      if (filterGuru && isAdminUser) params.guruId = filterGuru;
      if (filterMapel) params.mataPelajaranId = filterMapel;

      const [jadwalRes, kelasRes, guruRes, mapelRes, semesterRes] =
        await Promise.all([
          jadwalService.getAll(params),
          classesService.getAll({ limit: 100 }),
          guruService.getAll({ limit: 100 }),
          mataPelajaranService.getAll({ limit: 100 }),
          semesterService.getAll({ limit: 100 }),
        ]);

      setData(jadwalRes.data);
      setKelasList(kelasRes.data);
      setGuruList(guruRes.data);
      setMapelList(mapelRes.data);
      setSemesterList(semesterRes.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, filterKelas, filterHari, filterGuru, filterMapel, isAdminUser]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.semesterId ||
      !formData.kelasId ||
      !formData.mataPelajaranId ||
      !formData.guruId ||
      !formData.jamMulai ||
      !formData.jamSelesai
    ) {
      setFormError("Semua bidang wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError("");
      const payload = {
        semesterId: Number(formData.semesterId),
        kelasId: Number(formData.kelasId),
        mataPelajaranId: Number(formData.mataPelajaranId),
        guruId: Number(formData.guruId),
        hari: formData.hari,
        jamMulai: formData.jamMulai,
        jamSelesai: formData.jamSelesai,
        ruang: formData.ruang,
        isActive: formData.isActive,
      };
      if (editingId) {
        await jadwalService.update(editingId, payload);
        setSuccessMsg("Jadwal berhasil diperbarui");
      } else {
        await jadwalService.create(payload);
        setSuccessMsg("Jadwal berhasil ditambahkan");
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
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await jadwalService.delete(id);
      setSuccessMsg("Jadwal dihapus");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus");
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      semesterId: "",
      kelasId: "",
      mataPelajaranId: "",
      guruId: "",
      hari: "senin",
      jamMulai: "07:00",
      jamSelesai: "08:30",
      ruang: "",
      isActive: true,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: JadwalItem) {
    setEditingId(item.id);
    setFormData({
      semesterId: String(item.semesterId),
      kelasId: String(item.kelasId),
      mataPelajaranId: String(item.mataPelajaranId),
      guruId: String(item.guruId),
      hari: item.hari,
      jamMulai: item.jamMulai?.split("T")[1]?.slice(0, 5) || "07:00",
      jamSelesai: item.jamSelesai?.split("T")[1]?.slice(0, 5) || "08:30",
      ruang: item.ruang || "",
      isActive: item.isActive,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  const formatJam = (time: string | undefined) => {
    if (!time) return "-";
    return time.split("T")[1]?.slice(0, 5) || time;
  };

  return (
    <div className="jadwal-page">
      <PageBreadcrumb pageTitle="Jadwal Pelajaran" />
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
          {errorMsg}
        </div>
      )}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5 lg:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
              Daftar Jadwal Pelajaran
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola jadwal mengajar per kelas dan guru
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 text-xs font-medium dark:border-gray-700 sm:w-auto">
              <button
                onClick={() => setViewMode("kalender")}
                className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 transition-colors sm:flex-none ${
                  viewMode === "kalender"
                    ? "bg-brand-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon name="calendar" size={14} />
                Kalender
              </button>
              <button
                onClick={() => setViewMode("tabel")}
                className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 transition-colors sm:flex-none ${
                  viewMode === "tabel"
                    ? "bg-brand-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon name="list" size={14} />
                Tabel
              </button>
            </div>
            {isAdminUser && (
              <Button size="sm" onClick={openCreateModal} className="w-full sm:w-auto">
                + Tambah Jadwal
              </Button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="jadwal-filter mb-4 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800 sm:gap-3">
          <Input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48"
          />
          <div className="w-full sm:w-44">
            <Select
              value={filterKelas === "" ? "" : String(filterKelas)}
              placeholder="Semua Kelas"
              options={kelasList.map((k) => ({
                value: String(k.id),
                label: `Kelas ${k.nama}`,
              }))}
              onChange={(value) => setFilterKelas(Number(value) || "")}
              className="h-10"
            />
          </div>
          <div className="w-full sm:w-36">
            <Select
              value={filterHari}
              placeholder="Semua Hari"
              options={hariList.map((h) => ({
                value: h,
                label: h.charAt(0).toUpperCase() + h.slice(1),
              }))}
              onChange={(value) => setFilterHari((value as Hari) || "")}
              className="h-10"
            />
          </div>
          {isAdminUser && (
            <div className="w-full sm:w-48">
              <Select
                value={filterGuru === "" ? "" : String(filterGuru)}
                placeholder="Semua Guru"
                options={guruList.map((guru) => ({
                  value: String(guru.id),
                  label: guru.pegawai?.namaLengkap || `Guru #${guru.id}`,
                }))}
                onChange={(value) => setFilterGuru(Number(value) || "")}
                className="h-10"
              />
            </div>
          )}
          <div className="w-full sm:w-52">
            <Select
              value={filterMapel === "" ? "" : String(filterMapel)}
              placeholder="Semua Mata Pelajaran"
              options={mapelList.map((mapel) => ({
                value: String(mapel.id),
                label: mapel.nama,
              }))}
              onChange={(value) => setFilterMapel(Number(value) || "")}
              className="h-10"
            />
          </div>
        </div>

        {/* Kalender View */}
        {viewMode === "kalender" && (
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-[640px] pb-2">
              {hariList.map((hari) => {
                const jadwalHari = data.filter(
                  (d) =>
                    d.hari === hari &&
                    (filterKelas === "" || d.kelasId === filterKelas) &&
                    (filterGuru === "" || d.guruId === filterGuru) &&
                    (filterMapel === "" || d.mataPelajaranId === filterMapel)
                );
                return (
                  <div key={hari} className="flex-1 min-w-[140px]">
                    <div className="mb-2 px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-center">
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {hari.charAt(0).toUpperCase() + hari.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {loading ? (
                        <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      ) : jadwalHari.length === 0 ? (
                        <div className="py-6 text-center text-xs text-gray-400">
                          —
                        </div>
                      ) : (
                        jadwalHari
                          .slice()
                          .sort((a, b) =>
                            (a.jamMulai || "").localeCompare(b.jamMulai || "")
                          )
                          .map((item) => (
                            <div
                              key={item.id}
                              className={`rounded-lg border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-900/60 transition-colors ${isAdminUser ? "hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer" : ""}`}
                              onClick={isAdminUser ? () => openEditModal(item) : undefined}
                            >
                              <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mb-0.5">
                                {formatJam(item.jamMulai)}–{formatJam(item.jamSelesai)}
                              </p>
                              <p className="text-xs font-semibold leading-snug text-gray-900 dark:text-white">
                                {mapelList.find((m) => m.id === item.mataPelajaranId)?.nama || "-"}
                              </p>
                              <p className="mt-0.5 text-[10px] text-gray-400">
                                Kode: {mapelList.find((m) => m.id === item.mataPelajaranId)?.kode || "-"}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {kelasList.find((k) => k.id === item.kelasId)?.nama || ""}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">
                                {guruList.find((g) => g.id === item.guruId)?.pegawai?.namaLengkap || ""}
                              </p>
                              {item.ruang && (
                                <p className="text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                  <Icon name="mappin" size={10} />
                                  {item.ruang}
                                </p>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop Table */}
        {viewMode === "tabel" && (
          <>
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Hari</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Mata Pelajaran</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3">Ruang</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Memuat...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Belum ada jadwal
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5">
                      <Badge color="primary" size="sm">
                        {item.hari?.charAt(0).toUpperCase() +
                          item.hari?.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {kelasList.find((k) => k.id === item.kelasId)?.nama ||
                        "Kelas ..."}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="block font-medium text-gray-800 dark:text-white">
                        {mapelList.find((m) => m.id === item.mataPelajaranId)
                          ?.nama || "-"}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        Kode: {mapelList.find((m) => m.id === item.mataPelajaranId)?.kode || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {guruList.find((g) => g.id === item.guruId)?.pegawai
                        ?.namaLengkap || "-"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs">
                      {formatJam(item.jamMulai)} - {formatJam(item.jamSelesai)}
                    </td>
                    <td className="px-4 py-3.5">{item.ruang || "-"}</td>
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
                      {isAdminUser ? (
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
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat...</div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              Belum ada jadwal
            </div>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="jadwal-mobile-card"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge color="primary" size="sm">
                        {item.hari?.charAt(0).toUpperCase() +
                          item.hari?.slice(1)}
                      </Badge>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {kelasList.find((k) => k.id === item.kelasId)?.nama ||
                          "Kelas ..."}
                      </span>
                    </div>
                    <p className="jadwal-subject mt-2 text-sm font-medium text-gray-800 dark:text-white">
                      {mapelList.find((m) => m.id === item.mataPelajaranId)
                        ?.nama || "-"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Kode: {mapelList.find((m) => m.id === item.mataPelajaranId)?.kode || "-"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Guru:{" "}
                      {guruList.find((g) => g.id === item.guruId)?.pegawai
                        ?.namaLengkap || "-"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Icon name="clock" size={13} className="inline mr-1 text-gray-400" />
                        {formatJam(item.jamMulai)} - {formatJam(item.jamSelesai)}
                      </span>
                      {item.ruang && (
                        <span className="flex items-center">
                          <Icon name="mappin" size={13} className="inline mr-1 text-gray-400" />
                          {item.ruang}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdminUser && (
                    <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-md bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md bg-error-50 px-2.5 py-1.5 text-xs font-medium text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="jadwal-modal w-[calc(100%-1rem)] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Jadwal" : "Tambah Jadwal Pelajaran"}
          </h3>
        </div>
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium dark:bg-red-500/10">
            {formError}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label>Semester *</Label>
              <select
                value={formData.semesterId}
                onChange={(e) =>
                  setFormData({ ...formData, semesterId: e.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Pilih Semester</option>
                {semesterList.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.tahunAjaranId} - {s.jenis}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Kelas *</Label>
              <select
                value={formData.kelasId}
                onChange={(e) =>
                  setFormData({ ...formData, kelasId: e.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Pilih Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={String(k.id)}>
                    Kelas {k.nama} (Tingkat {k.tingkat})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label>Mata Pelajaran *</Label>
              <select
                value={formData.mataPelajaranId}
                onChange={(e) =>
                  setFormData({ ...formData, mataPelajaranId: e.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Pilih Mapel</option>
                {mapelList.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.nama} ({m.kode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Guru *</Label>
              <select
                value={formData.guruId}
                onChange={(e) =>
                  setFormData({ ...formData, guruId: e.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Pilih Guru</option>
                {guruList.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.pegawai?.namaLengkap || `Guru #${g.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div>
              <Label>Hari *</Label>
              <select
                value={formData.hari}
                onChange={(e) =>
                  setFormData({ ...formData, hari: e.target.value as Hari })
                }
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {hariList.map((h) => (
                  <option key={h} value={h}>
                    {h.charAt(0).toUpperCase() + h.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Jam Mulai *</Label>
              <Input
                type="time"
                value={formData.jamMulai}
                onChange={(e) =>
                  setFormData({ ...formData, jamMulai: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Jam Selesai *</Label>
              <Input
                type="time"
                value={formData.jamSelesai}
                onChange={(e) =>
                  setFormData({ ...formData, jamSelesai: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label>Ruang</Label>
              <Input
                type="text"
                placeholder="Contoh: Ruang 101"
                value={formData.ruang}
                onChange={(e) =>
                  setFormData({ ...formData, ruang: e.target.value })
                }
              />
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
                className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 sm:gap-3 sm:pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 sm:px-4"
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
