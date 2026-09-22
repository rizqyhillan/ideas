import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Checkbox from "../../components/form/input/Checkbox";
import {
  classesService,
  ClassItem,
  ClassStudentItem,
  CreateClassPayload,
  tahunAjaranService,
  TahunAjaranItem,
} from "../../services/academic.service";
import {
  guruService,
  GuruItem,
  siswaService,
  SiswaItem,
} from "../../services/master.service";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tahunAjarans, setTahunAjarans] = useState<TahunAjaranItem[]>([]);
  const [gurus, setGurus] = useState<GuruItem[]>([]);
  const [allSiswa, setAllSiswa] = useState<SiswaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedTaId, setSelectedTaId] = useState<number | "">("");
  const [selectedTingkat, setSelectedTingkat] = useState<number | "">("");

  // Alert feedback
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Create / Edit Class
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [classForm, setClassForm] = useState<CreateClassPayload>({
    tahunAjaranId: 0,
    nama: "",
    tingkat: 7,
    waliKelasId: undefined,
    kapasitas: 32,
    ruang: "",
    statusAktif: true,
  });
  const [classFormError, setClassFormError] = useState("");
  const [isSavingClass, setIsSavingClass] = useState(false);

  // Modal Manage Students
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedSiswaId, setSelectedSiswaId] = useState<number | "">("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentModalError, setStudentModalError] = useState("");

  async function loadInitialOptions() {
    try {
      const [taRes, guruRes, siswaRes] = await Promise.all([
        tahunAjaranService.getAll({ sort: "id", order: "DESC" }),
        guruService.getAll({ limit: 100 }),
        siswaService.getAll({ limit: 500, statusAktif: true }),
      ]);
      setTahunAjarans(taRes.data);
      setGurus(guruRes.data);
      setAllSiswa(siswaRes.data);

      const activeTa = taRes.data.find((t) => t.isActive);
      if (activeTa) {
        setSelectedTaId(activeTa.id);
      }
    } catch (err: any) {
      console.error("Failed to load options", err);
    }
  }

  async function loadClasses() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await classesService.getAll({
        search,
        tahunAjaranId: selectedTaId ? Number(selectedTaId) : undefined,
        tingkat: selectedTingkat ? Number(selectedTingkat) : undefined,
        sort: "id",
        order: "ASC",
      });
      setClasses(res.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialOptions();
  }, []);

  useEffect(() => {
    loadClasses();
  }, [search, selectedTaId, selectedTingkat]);

  // Handle Class Create / Edit
  function openCreateClassModal() {
    setEditingClassId(null);
    const defaultTa = selectedTaId || (tahunAjarans[0]?.id ?? 0);
    setClassForm({
      tahunAjaranId: Number(defaultTa),
      nama: "",
      tingkat: 7,
      waliKelasId: undefined,
      kapasitas: 32,
      ruang: "",
      statusAktif: true,
    });
    setClassFormError("");
    setIsClassModalOpen(true);
  }

  function openEditClassModal(item: ClassItem) {
    setEditingClassId(item.id);
    setClassForm({
      tahunAjaranId: item.tahunAjaranId,
      nama: item.nama,
      tingkat: item.tingkat,
      waliKelasId: item.waliKelasId ?? undefined,
      kapasitas: item.kapasitas ?? undefined,
      ruang: item.ruang ?? "",
      statusAktif: item.statusAktif,
    });
    setClassFormError("");
    setIsClassModalOpen(true);
  }

  async function handleSaveClass(e: React.FormEvent) {
    e.preventDefault();
    if (!classForm.nama || !classForm.tahunAjaranId || !classForm.tingkat) {
      setClassFormError("Tahun ajaran, nama kelas, dan tingkat wajib diisi.");
      return;
    }

    try {
      setIsSavingClass(true);
      setClassFormError("");
      if (editingClassId) {
        await classesService.update(editingClassId, classForm);
        setSuccessMsg("Data kelas berhasil diperbarui!");
      } else {
        await classesService.create(classForm);
        setSuccessMsg("Kelas baru berhasil dibuat!");
      }
      setIsClassModalOpen(false);
      loadClasses();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setClassFormError(err?.message || "Gagal menyimpan kelas");
    } finally {
      setIsSavingClass(false);
    }
  }

  async function handleDeleteClass(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) return;
    try {
      await classesService.delete(id);
      setSuccessMsg("Kelas berhasil dihapus!");
      loadClasses();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus kelas");
    }
  }

  // Handle Manage Students Modal
  async function openStudentsModal(cls: ClassItem) {
    setSelectedClass(cls);
    setSelectedSiswaId("");
    setStudentModalError("");
    setIsStudentsModalOpen(true);
    try {
      setLoadingStudents(true);
      const list = await classesService.getClassStudents(cls.id);
      setClassStudents(list);
    } catch (err: any) {
      setStudentModalError(err?.message || "Gagal memuat siswa kelas");
    } finally {
      setLoadingStudents(false);
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !selectedSiswaId) return;

    try {
      setIsAddingStudent(true);
      setStudentModalError("");
      const updatedList = await classesService.assignStudents(selectedClass.id, [
        Number(selectedSiswaId),
      ]);
      setClassStudents(updatedList);
      setSelectedSiswaId("");
      setSuccessMsg("Siswa berhasil ditambahkan ke kelas!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setStudentModalError(err?.message || "Gagal menambahkan siswa ke kelas");
    } finally {
      setIsAddingStudent(false);
    }
  }

  async function handleRemoveStudent(siswaId: number) {
    if (!selectedClass) return;
    if (!confirm("Keluarkan siswa ini dari kelas?")) return;

    try {
      await classesService.removeStudent(selectedClass.id, siswaId);
      const list = await classesService.getClassStudents(selectedClass.id);
      setClassStudents(list);
      setSuccessMsg("Siswa berhasil dikeluarkan dari kelas.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err?.message || "Gagal mengeluarkan siswa");
    }
  }

  // Filter siswa yang belum di kelas ini
  const availableSiswa = useMemo(() => {
    return allSiswa.filter(
      (s) => !classStudents.some((cs) => cs.siswaId === s.id)
    );
  }, [allSiswa, classStudents]);

  return (
    <>
      <PageMeta
        title="Kelas & Rombel | IdEaS"
        description="Manajemen Data Kelas dan Rombongan Belajar Siswa"
      />
      <PageBreadcrumb pageTitle="Kelas & Rombongan Belajar" />

      {/* Feedback Alerts */}
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

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Header & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Daftar Rombongan Belajar (Kelas)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kelola kelas, penunjukan wali kelas, dan anggota rombel per tahun ajaran
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tahun Ajaran */}
            <select
              value={selectedTaId}
              onChange={(e) =>
                setSelectedTaId(e.target.value ? Number(e.target.value) : "")
              }
              className="h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Semua Tahun Ajaran</option>
              {tahunAjarans.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} {ta.isActive ? " (Aktif)" : ""}
                </option>
              ))}
            </select>

            {/* Filter Tingkat */}
            <select
              value={selectedTingkat}
              onChange={(e) =>
                setSelectedTingkat(e.target.value ? Number(e.target.value) : "")
              }
              className="h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Semua Tingkat</option>
              <option value="7">Kelas 7</option>
              <option value="8">Kelas 8</option>
              <option value="9">Kelas 9</option>
            </select>

            <Input
              type="text"
              placeholder="Cari kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-36 sm:w-48"
            />

            <Button size="sm" onClick={openCreateClassModal}>
              + Tambah Kelas
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Nama Kelas</th>
                <th className="px-4 py-3">Tingkat</th>
                <th className="px-4 py-3">Tahun Ajaran</th>
                <th className="px-4 py-3">Wali Kelas</th>
                <th className="px-4 py-3 text-center">Kapasitas / Ruang</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Memuat data kelas...
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Tidak ada data kelas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr
                    key={cls.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                      {cls.nama}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        Kelas {cls.tingkat}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {cls.tahunAjaran?.nama || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      {cls.waliKelas?.pegawai?.namaLengkap ? (
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">
                            {cls.waliKelas.pegawai.namaLengkap}
                          </div>
                          <span className="text-xs text-gray-400">
                            Kode: {cls.waliKelas.kodeGuru || "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Belum ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {cls.kapasitas ? `${cls.kapasitas} Siswa` : "Tanpa batas"}
                      </span>
                      {cls.ruang && (
                        <div className="text-[11px] text-gray-400">
                          Ruang: {cls.ruang}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {cls.statusAktif ? (
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
                          onClick={() => openStudentsModal(cls)}
                          className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                        >
                          Kelola Siswa
                        </button>
                        <button
                          onClick={() => openEditClassModal(cls)}
                          className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-gray-400">
              Memuat data kelas...
            </div>
          ) : classes.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              Tidak ada data kelas yang sesuai filter.
            </div>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {cls.nama}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        Kelas {cls.tingkat}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                      <p>
                        TA: {cls.tahunAjaran?.nama || "-"}
                      </p>
                      <p>
                        Ruang: {cls.ruang || "-"} | Kapasitas:{" "}
                        {cls.kapasitas ? `${cls.kapasitas} siswa` : "Tanpa batas"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => openStudentsModal(cls)}
                      className="px-2 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                    >
                      Kelola
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {cls.waliKelas?.pegawai?.namaLengkap ? (
                      <>
                        Wali: {cls.waliKelas.pegawai.namaLengkap}
                        {cls.waliKelas.kodeGuru ? ` (${cls.waliKelas.kodeGuru})` : ""}
                      </>
                    ) : (
                      <span className="italic">Belum ada wali kelas</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditClassModal(cls)}
                      className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="px-2 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
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

      {/* Modal Create / Edit Class */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        className="max-w-lg p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingClassId ? "Edit Rombongan Belajar" : "Tambah Rombongan Belajar"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tentukan nama kelas, tahun ajaran, dan penunjukan wali kelas
          </p>
        </div>

        {classFormError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
            {classFormError}
          </div>
        )}

        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <Label>
              Tahun Ajaran <span className="text-error-500">*</span>
            </Label>
            <select
              value={classForm.tahunAjaranId}
              onChange={(e) =>
                setClassForm({
                  ...classForm,
                  tahunAjaranId: Number(e.target.value),
                })
              }
              className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              required
            >
              <option value="">Pilih Tahun Ajaran</option>
              {tahunAjarans.map((ta) => (
                <option key={ta.id} value={ta.id}>
                  {ta.nama} {ta.isActive ? " (Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>
                Nama Kelas <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Contoh: VII-A"
                value={classForm.nama}
                onChange={(e) =>
                  setClassForm({ ...classForm, nama: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>
                Tingkat <span className="text-error-500">*</span>
              </Label>
              <select
                value={classForm.tingkat}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    tingkat: Number(e.target.value),
                  })
                }
                className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                required
              >
                <option value={7}>Kelas 7</option>
                <option value={8}>Kelas 8</option>
                <option value={9}>Kelas 9</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Wali Kelas</Label>
            <select
              value={classForm.waliKelasId || ""}
              onChange={(e) =>
                setClassForm({
                  ...classForm,
                  waliKelasId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Pilih Guru Wali Kelas (Opsional)</option>
              {gurus.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.pegawai?.namaLengkap} {g.kodeGuru ? ` (${g.kodeGuru})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Kapasitas Siswa</Label>
              <Input
                type="number"
                placeholder="32"
                value={classForm.kapasitas || ""}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    kapasitas: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div>
              <Label>Ruang Kelas</Label>
              <Input
                type="text"
                placeholder="Contoh: R.101"
                value={classForm.ruang || ""}
                onChange={(e) =>
                  setClassForm({ ...classForm, ruang: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Checkbox
              checked={classForm.statusAktif || false}
              onChange={(checked) =>
                setClassForm({ ...classForm, statusAktif: checked })
              }
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Kelas Aktif
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Batal
            </button>
            <Button size="sm" disabled={isSavingClass}>
              {isSavingClass ? "Menyimpan..." : "Simpan Kelas"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Manage Students */}
      <Modal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        className="max-w-2xl p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Kelola Siswa - Kelas {selectedClass?.nama}
            </h3>
            <Badge color="light" size="sm">
              Total: {classStudents.length} Siswa
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daftar siswa aktif terdaftar pada rombel ini
          </p>
        </div>

        {studentModalError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
            {studentModalError}
          </div>
        )}

        {/* Add Student Form */}
        <form
          onSubmit={handleAddStudent}
          className="mb-5 p-3.5 rounded-xl border border-brand-100 bg-brand-50/50 dark:bg-brand-500/5 dark:border-brand-900/40 flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="flex-1 w-full">
            <select
              value={selectedSiswaId}
              onChange={(e) =>
                setSelectedSiswaId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              required
            >
              <option value="">Pilih Siswa untuk Ditambahkan...</option>
              {availableSiswa.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.namaLengkap} (NISN: {s.nisn})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingStudent ? "Menambahkan..." : "+ Tambahkan Siswa"}
          </button>
        </form>

        {/* Students List */}
        <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-xl dark:border-gray-800">
          {loadingStudents ? (
            <div className="py-6 text-center text-gray-400">
              Memuat daftar siswa...
            </div>
          ) : classStudents.length === 0 ? (
            <div className="py-6 text-center text-gray-400">
              Belum ada siswa yang ditempatkan di kelas ini.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-3 py-2.5">No</th>
                  <th className="px-3 py-2.5">NISN / NIS</th>
                  <th className="px-3 py-2.5">Nama Lengkap</th>
                  <th className="px-3 py-2.5">L/P</th>
                  <th className="px-3 py-2.5">Tgl Masuk</th>
                  <th className="px-3 py-2.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {classStudents.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-2.5 font-medium">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-mono">
                      {item.siswa?.nisn || "-"}{" "}
                      {item.siswa?.nis ? `(${item.siswa.nis})` : ""}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white">
                      {item.siswa?.namaLengkap}
                    </td>
                    <td className="px-3 py-2.5">{item.siswa?.jenisKelamin}</td>
                    <td className="px-3 py-2.5">
                      {item.tanggalMasuk ? item.tanggalMasuk.split("T")[0] : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(item.siswaId)}
                        className="px-2 py-0.5 text-[11px] font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                      >
                        Keluarkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
          <button
            type="button"
            onClick={() => setIsStudentsModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </>
  );
}
