import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import ActionAlert, { type ActionAlertConfig } from "../../components/ui/alert/ActionAlert";
import { Icon } from "../../components/icons/ideas-icon";
import {
  jadwalGuruPiketService,
  JadwalGuruPiketItem,
  JadwalGuruPiketPayload,
  NamaHari,
  semesterService,
  SemesterItem,
} from "../../services/academic-extras.service";
import { guruService, GuruItem } from "../../services/master.service";

const hariList: NamaHari[] = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

interface JadwalGuruPiketPageProps {
  canManage?: boolean;
}

const emptyForm = {
  semesterId: "",
  nama: "",
  hari: "senin" as NamaHari,
  jamMulai: "06:30",
  jamSelesai: "08:00",
  lokasi: "",
  statusAktif: true,
  guruIds: [] as number[],
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function JadwalGuruPiketPage({
  canManage = false,
}: JadwalGuruPiketPageProps) {
  const [data, setData] = useState<JadwalGuruPiketItem[]>([]);
  const [semesterList, setSemesterList] = useState<SemesterItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [semesterId, setSemesterId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    canManage ? "all" : "active",
  );
  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingGuruList, setLoadingGuruList] = useState(canManage);
  const [errorMsg, setErrorMsg] = useState("");
  const [guruLoadError, setGuruLoadError] = useState("");
  const [actionAlert, setActionAlert] = useState<ActionAlertConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadSemesters() {
      try {
        setLoadingMeta(true);
        const semesterRes = await semesterService.getAll({ limit: 100 });
        if (!active) return;
        setSemesterList(semesterRes.data);
        const defaultSemester =
          semesterRes.data.find((semester) => semester.isActive) ||
          semesterRes.data[0];
        if (defaultSemester) setSemesterId(String(defaultSemester.id));
      } catch (error: unknown) {
        if (active) setErrorMsg(getErrorMessage(error, "Gagal memuat data semester"));
      } finally {
        if (active) setLoadingMeta(false);
      }
    }

    async function loadGurus() {
      if (!canManage) {
        setGuruList([]);
        setLoadingGuruList(false);
        return;
      }

      try {
        setLoadingGuruList(true);
        setGuruLoadError("");
        const guruRes = await guruService.getAll({ limit: 100 });
        if (active) setGuruList(guruRes.data);
      } catch (error: unknown) {
        if (active) {
          setGuruList([]);
          setGuruLoadError(getErrorMessage(error, "Gagal memuat daftar guru"));
        }
      } finally {
        if (active) setLoadingGuruList(false);
      }
    }

    setErrorMsg("");
    void loadSemesters();
    void loadGurus();
    return () => {
      active = false;
    };
  }, [canManage]);

  useEffect(() => {
    let active = true;
    async function loadSchedule() {
      if (!semesterId) {
        setData([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg("");
        const schedule = await jadwalGuruPiketService.getAll({
          semesterId: Number(semesterId),
          search: debouncedSearch || undefined,
          statusAktif:
            statusFilter === "all" ? undefined : statusFilter === "active",
        });
        if (active) setData(schedule);
      } catch (error: unknown) {
        if (active) setErrorMsg(getErrorMessage(error, "Gagal memuat jadwal guru piket"));
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadSchedule();
    return () => {
      active = false;
    };
  }, [semesterId, debouncedSearch, statusFilter]);

  const groupedSchedule = useMemo(
    () =>
      hariList.map((hari) => ({
        hari,
        items: data
          .filter((item) => item.hari === hari)
          .slice()
          .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai)),
      })),
    [data],
  );

  const selectedSemester = semesterList.find(
    (semester) => String(semester.id) === semesterId,
  );

  function formatTime(value: string) {
    return value.split("T")[1]?.slice(0, 5) || value.slice(0, 5);
  }

  function semesterName(semester: SemesterItem) {
    return `${semester.tahunAjaran?.nama || `Tahun Ajaran ${semester.tahunAjaranId}`} · ${semester.jenis}`;
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({ ...emptyForm, semesterId });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: JadwalGuruPiketItem) {
    setEditingId(item.id);
    setFormData({
      semesterId: String(item.semesterId),
      nama: item.nama,
      hari: item.hari,
      jamMulai: formatTime(item.jamMulai),
      jamSelesai: formatTime(item.jamSelesai),
      lokasi: item.lokasi || "",
      statusAktif: item.statusAktif,
      guruIds: item.guruIds || [],
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function loadAfterSave(message: string) {
    setIsModalOpen(false);
    const schedule = await jadwalGuruPiketService.getAll({
      semesterId: Number(semesterId),
      search: search.trim() || undefined,
      statusAktif:
        statusFilter === "all" ? undefined : statusFilter === "active",
    });
    setData(schedule);
    setActionAlert({ variant: "success", title: "Berhasil", message });
  }

  async function persistSchedule(
    payload: JadwalGuruPiketPayload,
    targetId: number | null,
  ) {
    try {
      setIsSaving(true);
      setFormError("");
      if (targetId) {
        await jadwalGuruPiketService.update(targetId, payload);
        await loadAfterSave("Jadwal guru piket berhasil diperbarui.");
      } else {
        await jadwalGuruPiketService.create(payload);
        await loadAfterSave("Jadwal guru piket berhasil ditambahkan.");
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Gagal menyimpan jadwal guru piket.");
      setFormError(message);
      setActionAlert({ variant: "error", title: "Jadwal gagal disimpan", message });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const validationMessage = !formData.semesterId || !formData.nama.trim()
      ? "Semester dan nama jadwal wajib diisi."
      : formData.guruIds.length === 0
        ? "Pilih minimal satu guru yang bertugas."
        : formData.jamSelesai <= formData.jamMulai
          ? "Jam selesai harus lebih akhir dari jam mulai."
          : "";

    if (validationMessage) {
      setFormError(validationMessage);
      setActionAlert({
        variant: "error",
        title: "Periksa data jadwal",
        message: validationMessage,
      });
      return;
    }

    const payload: JadwalGuruPiketPayload = {
      semesterId: Number(formData.semesterId),
      nama: formData.nama.trim(),
      hari: formData.hari,
      jamMulai: formData.jamMulai,
      jamSelesai: formData.jamSelesai,
      lokasi: formData.lokasi.trim() || null,
      statusAktif: formData.statusAktif,
      guruIds: formData.guruIds,
    };
    const targetId = editingId;

    setActionAlert({
      variant: "warning",
      title: targetId ? "Simpan perubahan jadwal?" : "Tambah jadwal piket?",
      message: `Jadwal ${payload.nama} setiap ${payload.hari}, pukul ${payload.jamMulai}–${payload.jamSelesai}, dengan ${formData.guruIds.length} guru akan ${targetId ? "diperbarui" : "ditambahkan"}.`,
      confirmLabel: targetId ? "Ya, perbarui" : "Ya, tambahkan",
      onConfirm: () => void persistSchedule(payload, targetId),
    });
  }

  async function archiveSchedule(id: number) {
    try {
      await jadwalGuruPiketService.archive(id);
      setData((current) => current.filter((item) => item.id !== id));
      setActionAlert({
        variant: "success",
        title: "Jadwal diarsipkan",
        message: "Jadwal guru piket berhasil diarsipkan. Riwayat kehadiran tetap disimpan.",
      });
    } catch (error: unknown) {
      setActionAlert({
        variant: "error",
        title: "Jadwal gagal diarsipkan",
        message: getErrorMessage(error, "Gagal mengarsipkan jadwal."),
      });
    }
  }

  function handleArchive(id: number) {
    const item = data.find((schedule) => schedule.id === id);
    setActionAlert({
      variant: "warning",
      title: "Arsipkan jadwal ini?",
      message: `${item?.nama || "Jadwal guru piket"} tidak akan tampil sebagai jadwal aktif. Riwayat kehadiran tetap disimpan.`,
      confirmLabel: "Ya, arsipkan",
      onConfirm: () => void archiveSchedule(id),
    });
  }

  function toggleGuru(guruId: number) {
    setFormData((current) => ({
      ...current,
      guruIds: current.guruIds.includes(guruId)
        ? current.guruIds.filter((id) => id !== guruId)
        : [...current.guruIds, guruId],
    }));
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={canManage ? "Kelola Jadwal Guru Piket" : "Jadwal Guru Piket"}
      />

      {errorMsg && (
        <div className="mb-4 rounded-xl border border-error-200 bg-error-50 p-3 text-sm font-medium text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {errorMsg}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-5 lg:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
              Jadwal Piket Mingguan
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {selectedSemester
                ? semesterName(selectedSemester)
                : "Pilih semester untuk melihat jadwal."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:min-w-56 sm:w-56">
              <Select
                value={semesterId}
                onChange={setSemesterId}
                disabled={loadingMeta || semesterList.length === 0}
                placeholder="Pilih Semester"
                options={semesterList.map((semester) => ({
                  value: String(semester.id),
                  label: `${semesterName(semester)}${semester.isActive ? " · Aktif" : ""}`,
                }))}
                className="h-10"
              />
              {canManage && !loadingMeta && semesterList.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
                  {errorMsg
                    ? "Data semester belum berhasil dimuat. Periksa koneksi backend lalu muat ulang halaman."
                    : "Buat minimal satu semester terlebih dahulu; semester tersebut tidak harus aktif."}
                </p>
              )}
            </div>
            {canManage && (
              <Button
                size="sm"
                onClick={openCreateModal}
                disabled={!semesterId}
                startIcon={<Icon name="plus" size={15} />}
                className="justify-center"
              >
                Tambah Jadwal
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center">
          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari jadwal, lokasi, atau nama guru..."
            className="w-full sm:max-w-sm"
          />
          {canManage && (
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
              options={[
                { value: "all", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ]}
              className="h-10 sm:w-40"
            />
          )}
        </div>

        {loadingMeta || loading ? (
          <div className="grid min-w-[760px] grid-cols-6 gap-3 overflow-hidden">
            {hariList.map((hari) => (
              <div key={hari} className="h-44 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : !semesterId ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Belum ada data semester yang dapat dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[900px] grid-cols-6 gap-3">
              {groupedSchedule.map(({ hari, items }) => (
                <div key={hari} className="min-w-0">
                  <div className="mb-2 rounded-lg bg-brand-50 px-2 py-2 text-center dark:bg-brand-500/10">
                    <span className="text-xs font-semibold capitalize text-brand-700 dark:text-brand-300">
                      {hari}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-200 py-7 text-center text-xs text-gray-400 dark:border-gray-700">
                        Belum ada jadwal
                      </div>
                    ) : (
                      items.map((item) => (
                        <article
                          key={item.id}
                          className={`rounded-xl border p-3 transition-colors ${
                            item.statusAktif
                              ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60"
                              : "border-gray-200 bg-gray-50 opacity-70 dark:border-gray-700 dark:bg-gray-900/30"
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                              {formatTime(item.jamMulai)}–{formatTime(item.jamSelesai)}
                            </span>
                            {!item.statusAktif && (
                              <Badge color="light" size="sm">Nonaktif</Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                            {item.nama}
                          </h3>
                          <div className="mt-2 space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                            <p className="flex items-start gap-1.5">
                              <Icon name="users" size={13} className="mt-0.5 shrink-0" />
                              <span>{item.gurus.map((guru) => guru.namaLengkap).join(", ") || "Belum ada guru ditugaskan"}</span>
                            </p>
                            {item.lokasi && (
                              <p className="flex items-center gap-1.5">
                                <Icon name="mappin" size={13} className="shrink-0" />
                                <span>{item.lokasi}</span>
                              </p>
                            )}
                          </div>
                          {canManage && (
                            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleArchive(item.id)}
                                className="text-xs font-medium text-error-600 hover:text-error-700 dark:text-error-400"
                              >
                                Arsipkan
                              </button>
                            </div>
                          )}
                        </article>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {canManage && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="w-[calc(100%-1rem)] max-w-xl p-4 sm:p-6"
        >
          <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Jadwal Guru Piket" : "Tambah Jadwal Guru Piket"}
            </h2>
          </div>
          {formError && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-xs text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {formError}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Semester *</Label>
              <Select
                value={formData.semesterId}
                onChange={(semesterId) =>
                  setFormData((current) => ({ ...current, semesterId }))
                }
                disabled={loadingMeta || semesterList.length === 0}
                placeholder="Pilih semester"
                options={semesterList.map((semester) => ({
                  value: String(semester.id),
                  label: semesterName(semester),
                }))}
                className="h-10"
              />
            </div>
            <div>
              <Label>Nama Tugas Piket *</Label>
              <Input
                value={formData.nama}
                onChange={(event) => setFormData({ ...formData, nama: event.target.value })}
                placeholder="Contoh: Piket Gerbang Utama"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label>Hari *</Label>
                <Select
                  value={formData.hari}
                  onChange={(hari) =>
                    setFormData((current) => ({ ...current, hari: hari as NamaHari }))
                  }
                  options={hariList.map((hari) => ({
                    value: hari,
                    label: hari.charAt(0).toUpperCase() + hari.slice(1),
                  }))}
                  className="h-10"
                />
              </div>
              <div>
                <Label>Mulai *</Label>
                <Input type="time" value={formData.jamMulai} onChange={(event) => setFormData({ ...formData, jamMulai: event.target.value })} required />
              </div>
              <div>
                <Label>Selesai *</Label>
                <Input type="time" value={formData.jamSelesai} onChange={(event) => setFormData({ ...formData, jamSelesai: event.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Lokasi</Label>
              <Input value={formData.lokasi} onChange={(event) => setFormData({ ...formData, lokasi: event.target.value })} placeholder="Gerbang utama, lobby, dan lainnya" />
            </div>
            <div>
              <Label>Guru yang Bertugas *</Label>
              {guruLoadError && (
                <p className="mb-2 rounded-md bg-error-50 p-2 text-xs text-error-700 dark:bg-error-500/10 dark:text-error-400">
                  {guruLoadError}
                </p>
              )}
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                {loadingGuruList ? (
                  <p className="p-2 text-xs text-gray-500">Memuat daftar guru...</p>
                ) : guruList.length === 0 ? (
                  <p className="p-2 text-xs text-gray-500">Belum ada data guru.</p>
                ) : guruList.map((guru) => (
                  <label key={guru.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={formData.guruIds.includes(guru.id)}
                      onChange={() => toggleGuru(guru.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{guru.pegawai?.namaLengkap || `Guru #${guru.id}`}</span>
                    {guru.pegawai?.nip && <span className="text-xs text-gray-400">NIP {guru.pegawai.nip}</span>}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.statusAktif}
                onChange={(event) => setFormData({ ...formData, statusAktif: event.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              Jadwal aktif
            </label>
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="ui-button ui-button--sm ui-button--outline"
              >
                Batal
              </button>
              <Button disabled={isSaving || loadingGuruList || guruList.length === 0}>
                {isSaving ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      <ActionAlert
        config={actionAlert}
        onClose={() => setActionAlert(null)}
        onConfirm={() => {
          const confirmedAction = actionAlert?.onConfirm;
          setActionAlert(null);
          confirmedAction?.();
        }}
      />
    </div>
  );
}
