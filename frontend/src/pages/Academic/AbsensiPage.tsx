import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  classesService,
  ClassItem,
  ClassStudentItem,
} from "../../services/academic.service";
import { guruService, GuruItem } from "../../services/master.service";
import {
  absensiService,
  StatusAbsensi,
  StudentAttendanceItem,
} from "../../services/absensi.service";
import { useAuth } from "../../context/AuthContext";
import {
  CheckCircleIcon,
  CheckLineIcon,
  CloseLineIcon,
  InfoIcon,
  UserIcon,
} from "../../icons";

export default function AbsensiPage() {
  const { user } = useAuth();

  // Master options
  const [gurus, setGurus] = useState<GuruItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Active Teacher state
  const [selectedGuruId, setSelectedGuruId] = useState<number | "">("");

  // Session & Class state
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [tanggal, setTanggal] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [jamPelajaran, setJamPelajaran] = useState<string>("Jam Ke 1 - 2 (07:30 - 09:00)");
  const [mataPelajaran, setMataPelajaran] = useState<string>("");
  const [catatanSesi, setCatatanSesi] = useState<string>("");

  // Student Attendance table state
  const [students, setStudents] = useState<StudentAttendanceItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Feedback alerts
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 1. Initial Load: Ambil data guru dan kelas
  useEffect(() => {
    async function loadInit() {
      try {
        setLoadingInitial(true);
        const [guruRes, classesRes] = await Promise.all([
          guruService.getAll({ limit: 100 }),
          classesService.getAll({ statusAktif: true, limit: 100 }),
        ]);

        setGurus(guruRes.data);
        setClasses(classesRes.data);

        // Cari guru yang sesuai dengan akun login
        let currentGuru: GuruItem | undefined;
        if (user) {
          currentGuru = guruRes.data.find(
            (g) =>
              g.pegawai?.userId === user.id ||
              (g.pegawai?.email && g.pegawai.email.toLowerCase() === user.email.toLowerCase()) ||
              g.kodeGuru === user.username
          );
        }

        if (currentGuru) {
          setSelectedGuruId(currentGuru.id);
        } else if (guruRes.data.length > 0) {
          // Jika akun admin atau belum tertaut guru khusus, pilih guru pertama sebagai default
          setSelectedGuruId(guruRes.data[0].id);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || "Gagal memuat data master guru dan kelas");
      } finally {
        setLoadingInitial(false);
      }
    }

    loadInit();
  }, [user]);

  // Guru yang sedang aktif
  const activeGuru = useMemo(() => {
    if (!selectedGuruId) return null;
    return gurus.find((g) => g.id === Number(selectedGuruId)) || null;
  }, [selectedGuruId, gurus]);

  // Daftar kelas yang relevan dengan guru yang sedang mengajar
  // Jika guru adalah wali kelas dari suatu kelas, kelas tersebut diprioritaskan
  const guruClasses = useMemo(() => {
    if (!activeGuru) return classes;
    const taughtClasses = classes.filter((c) => c.waliKelasId === activeGuru.id);
    // Jika ada kelas binaan wali kelas, tampilkan; jika belum terdaftar spesifik, tampilkan seluruh kelas aktif
    return taughtClasses.length > 0 ? taughtClasses : classes;
  }, [activeGuru, classes]);

  // Set default kelas saat daftar kelas guru berubah
  useEffect(() => {
    if (guruClasses.length > 0) {
      // Jika kelas saat ini tidak ada dalam daftar guruClasses, pilih kelas pertama
      const exists = guruClasses.some((c) => c.id === Number(selectedClassId));
      if (!exists) {
        setSelectedClassId(guruClasses[0].id);
      }
    } else {
      setSelectedClassId("");
    }
  }, [guruClasses]);

  // 2. Ambil siswa di kelas yang sedang diajar saat selectedClassId atau tanggal berubah
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    async function loadClassStudentsAndAttendance() {
      try {
        setLoadingStudents(true);
        setErrorMsg("");
        setSuccessMsg("");

        // Cek apakah ada riwayat tersimpan sebelumnya untuk kelas & tanggal ini
        const existingSession = await absensiService.getAttendance(
          Number(selectedClassId),
          tanggal
        );

        if (existingSession && existingSession.items && existingSession.items.length > 0) {
          setStudents(existingSession.items);
          if (existingSession.jamKe) setJamPelajaran(existingSession.jamKe);
          if (existingSession.mataPelajaran) setMataPelajaran(existingSession.mataPelajaran);
          if (existingSession.catatan) setCatatanSesi(existingSession.catatan);
          setSuccessMsg(
            `Memuat data absensi tersimpan untuk tanggal ${tanggal} (${existingSession.items.length} siswa).`
          );
        } else {
          // Ambil siswa aktif di kelas yang dipilih dari backend
          const classStudents: ClassStudentItem[] = await classesService.getClassStudents(
            Number(selectedClassId)
          );

          // Inisialisasi: DEFAULT SEMUA SISWA ADALAH "hadir"
          const initialItems: StudentAttendanceItem[] = classStudents.map((cs) => ({
            siswaId: cs.siswa.id,
            nisn: cs.siswa.nisn,
            nis: cs.siswa.nis,
            namaLengkap: cs.siswa.namaLengkap,
            jenisKelamin: cs.siswa.jenisKelamin,
            status: "hadir" as StatusAbsensi, // Sesuai enum 'status_absensi'
            keterangan: "",
          }));

          setStudents(initialItems);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || "Gagal memuat siswa di kelas ini");
      } finally {
        setLoadingStudents(false);
      }
    }

    loadClassStudentsAndAttendance();
  }, [selectedClassId, tanggal]);

  // Selected Class details
  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === Number(selectedClassId)) || null;
  }, [classes, selectedClassId]);

  // Handlers untuk mengubah status kehadiran siswa
  // Sesuai permintaan: defaultnya adalah "hadir" lalu jika tidak hadir tinggal tekan tombol di tulisan "hadir" tersebut
  const handleToggleStatus = (siswaId: number) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.siswaId !== siswaId) return student;

        // Toggle sequence: hadir -> sakit -> izin -> alpa -> hadir
        let nextStatus: StatusAbsensi = "sakit";
        if (student.status === "hadir") {
          nextStatus = "sakit";
        } else if (student.status === "sakit") {
          nextStatus = "izin";
        } else if (student.status === "izin") {
          nextStatus = "alpa";
        } else {
          nextStatus = "hadir";
        }

        return {
          ...student,
          status: nextStatus,
          keterangan: nextStatus === "hadir" ? "" : student.keterangan || "",
        };
      })
    );
  };

  // Set status spesifik secara langsung (Hadir, Sakit, Izin, Alpa)
  const handleSetSpecificStatus = (siswaId: number, status: StatusAbsensi) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.siswaId !== siswaId) return student;
        return {
          ...student,
          status,
          keterangan: status === "hadir" ? "" : student.keterangan || "",
        };
      })
    );
  };

  // Update catatan keterangan tidak hadir
  const handleUpdateKeterangan = (siswaId: number, keterangan: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.siswaId !== siswaId) return student;
        return {
          ...student,
          keterangan,
        };
      })
    );
  };

  // Tandai Semua Hadir
  const handleMarkAllHadir = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "hadir",
        keterangan: "",
      }))
    );
    setSuccessMsg("Semua siswa berhasil ditandai 'Hadir'.");
  };

  // Simpan Absensi
  const handleSaveAttendance = async () => {
    if (!selectedClassId || !activeClass) {
      setErrorMsg("Pilih kelas terlebih dahulu.");
      return;
    }
    if (students.length === 0) {
      setErrorMsg("Tidak ada data siswa untuk disimpan.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const record = {
        kelasId: Number(selectedClassId),
        kelasNama: activeClass.nama,
        guruId: activeGuru ? activeGuru.id : 0,
        guruNama: activeGuru?.pegawai?.namaLengkap || user?.username || "Guru Pengajar",
        tanggal,
        jamKe: jamPelajaran,
        mataPelajaran: mataPelajaran || "Pelajaran Terjadwal",
        catatan: catatanSesi,
        items: students,
        savedAt: new Date().toISOString(),
      };

      const result = await absensiService.saveAttendance(record);
      setSuccessMsg(result.message);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal menyimpan absensi siswa");
    } finally {
      setIsSaving(false);
    }
  };

  // Statistik Kehadiran
  const stats = useMemo(() => {
    return absensiService.calculateSummary(students);
  }, [students]);

  // Filtered students for search or status tab
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        (s.nis && s.nis.includes(searchQuery));
      const matchStatus =
        filterStatus === "all" ? true : s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, filterStatus]);

  return (
    <>
      <PageMeta
        title="Absensi Siswa - Splasma IDEAS"
        description="Pencatatan kehadiran siswa sesuai kelas dan akun guru pengajar"
      />

      <PageBreadcrumb pageTitle="Absensi Siswa" />

      {/* Alert Notifications */}
      {successMsg && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-success-200 bg-success-50 p-4 text-sm text-success-800 dark:border-success-800 dark:bg-success-900/20 dark:text-success-400">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-success-500" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg("")}
            className="text-success-500 hover:text-success-700"
          >
            <CloseLineIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-800 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          <div className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-error-500" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-error-500 hover:text-error-700"
          >
            <CloseLineIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Banner Informasi Guru & Sesi Mengajar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {activeGuru?.pegawai?.namaLengkap || user?.username || "Guru Pengajar"}
                </h2>
                {activeGuru?.kodeGuru && (
                  <Badge variant="light" color="primary" size="sm">
                    Kode: {activeGuru.kodeGuru}
                  </Badge>
                )}
                <Badge variant="solid" color="success" size="sm">
                  Aktif Mengajar
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                NIP: {activeGuru?.pegawai?.nip || "-"} | Email:{" "}
                {activeGuru?.pegawai?.email || user?.email || "-"}
              </p>
            </div>
          </div>

          {/* Jika admin atau ingin mengganti guru */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="mb-0 text-xs text-gray-500 whitespace-nowrap">
                Ganti Akun Guru:
              </Label>
              <select
                value={selectedGuruId}
                onChange={(e) => setSelectedGuruId(Number(e.target.value) || "")}
                disabled={loadingInitial}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {gurus.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.pegawai?.namaLengkap || `Guru #${g.id}`} {g.kodeGuru ? `(${g.kodeGuru})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form Filter Sesi & Kelas yang Sedang Diajar */}
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 md:grid-cols-4 dark:border-gray-800">
          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Kelas yang Sedang Diajar <span className="text-error-500">*</span>
            </Label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value) || "")}
              className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {guruClasses.length === 0 ? (
                <option value="">Tidak ada kelas tersedia</option>
              ) : (
                guruClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.nama} (Tingkat {c.tingkat})
                  </option>
                ))
              )}
            </select>
            {activeClass && (
              <span className="mt-1 block text-xs text-brand-600 dark:text-brand-400">
                Ruang: {activeClass.ruang || "-"} | Kapasitas: {activeClass.kapasitas || 32} siswa
              </span>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tanggal Presensi
            </Label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Jam Pelajaran / Sesi
            </Label>
            <Input
              type="text"
              placeholder="Contoh: Jam Ke 1 - 2"
              value={jamPelajaran}
              onChange={(e) => setJamPelajaran(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Mata Pelajaran (Opsional)
            </Label>
            <Input
              type="text"
              placeholder="Contoh: Matematika"
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Ringkasan Kehadiran Realtime (Metric Cards) */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Siswa</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-gray-400">siswa terdaftar</span>
          </div>
        </div>

        <div className="rounded-xl border border-success-200 bg-success-50/50 p-4 shadow-theme-xs dark:border-success-900/30 dark:bg-success-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-success-700 dark:text-success-400">Hadir</p>
            <Badge variant="solid" color="success" size="sm">
              {stats.total > 0 ? `${Math.round((stats.hadir / stats.total) * 100)}%` : "0%"}
            </Badge>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-success-700 dark:text-success-400">
              {stats.hadir}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-warning-200 bg-warning-50/50 p-4 shadow-theme-xs dark:border-warning-900/30 dark:bg-warning-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-warning-700 dark:text-warning-400">Sakit (S)</p>
            <span className="h-2 w-2 rounded-full bg-warning-500"></span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-warning-700 dark:text-warning-400">
              {stats.sakit}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-theme-xs dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Izin (I)</p>
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {stats.izin}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-error-200 bg-error-50/50 p-4 shadow-theme-xs dark:border-error-900/30 dark:bg-error-950/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-error-700 dark:text-error-400">Alpa (A)</p>
            <span className="h-2 w-2 rounded-full bg-error-500"></span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-error-700 dark:text-error-400">
              {stats.alpa}
            </span>
          </div>
        </div>
      </div>

      {/* Tabel Absensi Siswa */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {/* Table Header Controls */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Daftar Siswa Kelas {activeClass?.nama || ""}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menampilkan {filteredStudents.length} siswa di kelas yang sedang diajar.
              Tekan tombol pada tulisan <strong className="text-success-600 font-semibold">&quot;Hadir&quot;</strong> untuk menandai siswa tidak masuk.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllHadir}
              disabled={loadingStudents || students.length === 0}
              startIcon={<CheckLineIcon className="h-4 w-4 text-success-500" />}
              className="w-full sm:w-auto justify-center"
            >
              Tandai Semua Hadir
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAttendance}
              disabled={loadingStudents || isSaving || students.length === 0}
              startIcon={<CheckCircleIcon className="h-4 w-4" />}
              className="w-full sm:w-auto justify-center"
            >
              {isSaving ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <span className="mr-2 text-gray-500">Filter Status:</span>
            {[
              { key: "all", label: "Semua", count: stats.total },
              { key: "hadir", label: "Hadir", count: stats.hadir },
              { key: "sakit", label: "Sakit", count: stats.sakit },
              { key: "izin", label: "Izin", count: stats.izin },
              { key: "alpa", label: "Alpa", count: stats.alpa },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  filterStatus === tab.key
                    ? "bg-brand-500 text-white dark:bg-brand-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Data (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-5 py-3 text-center w-16">
                  Absen
                </th>
                <th scope="col" className="px-5 py-3 w-32">
                  NISN / NIS
                </th>
                <th scope="col" className="px-5 py-3">
                  Nama Siswa
                </th>
                <th scope="col" className="px-5 py-3 text-center w-20">
                  L/P
                </th>
                <th scope="col" className="px-5 py-3 text-center w-64">
                  Keterangan Masuk
                </th>
                <th scope="col" className="px-5 py-3">
                  Catatan Alasan (Jika Tidak Hadir)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loadingStudents ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    <p className="mt-2 text-xs">Memuat daftar siswa kelas...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Tidak ada data siswa ditemukan.</p>
                    <p className="text-xs text-gray-400">
                      Pastikan kelas memiliki siswa aktif yang terdaftar.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isHadir = student.status === "hadir";
                  const isSakit = student.status === "sakit";
                  const isIzin = student.status === "izin";
                  const isAlpa = student.status === "alpa";

                  return (
                    <tr
                      key={student.siswaId}
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/40 ${
                        !isHadir
                          ? isSakit
                            ? "bg-warning-50/20 dark:bg-warning-950/10"
                            : isIzin
                            ? "bg-blue-50/20 dark:bg-blue-950/10"
                            : "bg-error-50/20 dark:bg-error-950/10"
                          : ""
                      }`}
                    >
                      {/* Nomor Absen */}
                      <td className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300">
                        {idx + 1}
                      </td>

                      {/* NISN / NIS */}
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                        <div>{student.nisn}</div>
                        {student.nis && (
                          <span className="text-[10px] text-gray-400">NIS: {student.nis}</span>
                        )}
                      </td>

                      {/* Nama Siswa */}
                      <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{student.namaLengkap}</span>
                        </div>
                      </td>

                      {/* Jenis Kelamin */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                            student.jenisKelamin === "L"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                              : "bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400"
                          }`}
                        >
                          {student.jenisKelamin}
                        </span>
                      </td>

                      {/* Keterangan Masuk (Tombol Interaktif) */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          {/* Tombol Utama Status: Default "Hadir", tekan untuk mengubah */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.siswaId)}
                            title="Klik untuk mengubah status kehadiran siswa"
                            className={`group inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-95 ${
                              isHadir
                                ? "border border-success-400 bg-success-500 text-white hover:bg-success-600 dark:border-success-500 dark:bg-success-600"
                                : isSakit
                                ? "border border-warning-400 bg-warning-500 text-white hover:bg-warning-600"
                                : isIzin
                                ? "border border-blue-400 bg-blue-500 text-white hover:bg-blue-600"
                                : "border border-error-400 bg-error-500 text-white hover:bg-error-600"
                            }`}
                          >
                            {isHadir && <CheckLineIcon className="h-3.5 w-3.5" />}
                            {isSakit && <span className="font-bold">S</span>}
                            {isIzin && <span className="font-bold">I</span>}
                            {isAlpa && <CloseLineIcon className="h-3.5 w-3.5" />}

                            <span className="capitalize">{student.status}</span>
                            <span className="text-[10px] opacity-75 group-hover:opacity-100">
                              (Tekan)
                            </span>
                          </button>

                          {/* Tombol Pilihan Cepat Spesifik (H | S | I | A) */}
                          <div className="flex items-center gap-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleSetSpecificStatus(student.siswaId, "hadir")}
                              className={`rounded px-1.5 py-0.5 font-medium transition ${
                                isHadir
                                  ? "bg-success-100 font-bold text-success-800 dark:bg-success-900/40 dark:text-success-300"
                                  : "text-gray-400 hover:text-success-600 dark:hover:text-success-400"
                              }`}
                              title="Tandai Hadir"
                            >
                              H
                            </button>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleSetSpecificStatus(student.siswaId, "sakit")}
                              className={`rounded px-1.5 py-0.5 font-medium transition ${
                                isSakit
                                  ? "bg-warning-100 font-bold text-warning-800 dark:bg-warning-900/40 dark:text-warning-300"
                                  : "text-gray-400 hover:text-warning-600 dark:hover:text-warning-400"
                              }`}
                              title="Tandai Sakit"
                            >
                              S
                            </button>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleSetSpecificStatus(student.siswaId, "izin")}
                              className={`rounded px-1.5 py-0.5 font-medium transition ${
                                isIzin
                                  ? "bg-blue-100 font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                  : "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              }`}
                              title="Tandai Izin"
                            >
                              I
                            </button>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleSetSpecificStatus(student.siswaId, "alpa")}
                              className={`rounded px-1.5 py-0.5 font-medium transition ${
                                isAlpa
                                  ? "bg-error-100 font-bold text-error-800 dark:bg-error-900/40 dark:text-error-300"
                                  : "text-gray-400 hover:text-error-600 dark:hover:text-error-400"
                              }`}
                              title="Tandai Alpa"
                            >
                              A
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Catatan / Keterangan Alasan Tidak Hadir */}
                      <td className="px-5 py-3.5">
                        {!isHadir ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={student.keterangan || ""}
                              onChange={(e) =>
                                handleUpdateKeterangan(student.siswaId, e.target.value)
                              }
                              placeholder={
                                isSakit
                                  ? "Alasan sakit (cth: Demam, Surat dokter)..."
                                  : isIzin
                                  ? "Alasan izin (cth: Keperluan keluarga)..."
                                  : "Alasan alpa (tanpa kabar)..."
                              }
                              className="h-8 w-full rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Hadir mengikuti pelajaran
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Dioptimalkan Khusus Smartphone Guru) */}
        <div className="block md:hidden p-3 sm:p-4 space-y-3">
          {loadingStudents ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <p className="mt-2 text-xs">Memuat daftar siswa kelas...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Tidak ada data siswa ditemukan.</p>
              <p className="text-xs text-gray-400 mt-1">Pastikan kelas memiliki siswa aktif.</p>
            </div>
          ) : (
            filteredStudents.map((student, idx) => {
              const isHadir = student.status === "hadir";
              const isSakit = student.status === "sakit";
              const isIzin = student.status === "izin";
              const isAlpa = student.status === "alpa";

              return (
                <div
                  key={student.siswaId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isHadir
                      ? "bg-white border-gray-200 dark:bg-gray-800/40 dark:border-gray-700"
                      : isSakit
                      ? "bg-warning-50/40 border-warning-200 dark:bg-warning-950/20 dark:border-warning-900/40"
                      : isIzin
                      ? "bg-blue-50/40 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40"
                      : "bg-error-50/40 border-error-200 dark:bg-error-950/20 dark:border-error-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {student.namaLengkap}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-mono">
                          NISN: {student.nisn} {student.nis ? `• NIS: ${student.nis}` : ""}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        student.jenisKelamin === "L"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"
                      }`}
                    >
                      {student.jenisKelamin}
                    </span>
                  </div>

                  {/* 4 Tombol Status Tap-Friendly */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => handleSetSpecificStatus(student.siswaId, "hadir")}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition active:scale-95 text-center ${
                        isHadir
                          ? "bg-success-600 text-white border-success-600 shadow-xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-success-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSpecificStatus(student.siswaId, "sakit")}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition active:scale-95 text-center ${
                        isSakit
                          ? "bg-warning-500 text-white border-warning-500 shadow-xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-warning-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSpecificStatus(student.siswaId, "izin")}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition active:scale-95 text-center ${
                        isIzin
                          ? "bg-blue-500 text-white border-blue-500 shadow-xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetSpecificStatus(student.siswaId, "alpa")}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border transition active:scale-95 text-center ${
                        isAlpa
                          ? "bg-error-500 text-white border-error-500 shadow-xs"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-error-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Alpa
                    </button>
                  </div>

                  {/* Keterangan input if not hadir */}
                  {!isHadir && (
                    <input
                      type="text"
                      value={student.keterangan || ""}
                      onChange={(e) =>
                        handleUpdateKeterangan(student.siswaId, e.target.value)
                      }
                      placeholder={
                        isSakit
                          ? "Alasan sakit (cth: Demam, surat dokter)..."
                          : isIzin
                          ? "Alasan izin (cth: Acara keluarga)..."
                          : "Alasan tanpa keterangan (alpa)..."
                      }
                      className="h-8 w-full rounded-lg border border-gray-300 bg-white px-2.5 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Simpan Button */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 p-5 sm:flex-row dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Siswa: <strong>{stats.total}</strong> | Hadir:{" "}
            <strong className="text-success-600">{stats.hadir}</strong> | Sakit:{" "}
            <strong className="text-warning-600">{stats.sakit}</strong> | Izin:{" "}
            <strong className="text-blue-600">{stats.izin}</strong> | Alpa:{" "}
            <strong className="text-error-600">{stats.alpa}</strong>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllHadir}
              disabled={loadingStudents || students.length === 0}
            >
              Reset Semua Hadir
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAttendance}
              disabled={loadingStudents || isSaving || students.length === 0}
              startIcon={<CheckCircleIcon className="h-4 w-4" />}
            >
              {isSaving ? "Menyimpan..." : "Simpan Data Absensi"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
