import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import {
  tahunAjaranService,
  classesService,
  TahunAjaranItem,
  ClassItem,
} from "../../services/academic.service";
import {
  siswaService,
  guruService,
  pegawaiService,
} from "../../services/master.service";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [activeTa, setActiveTa] = useState<TahunAjaranItem | null>(null);
  const [totalSiswa, setTotalSiswa] = useState<number>(0);
  const [totalGuru, setTotalGuru] = useState<number>(0);
  const [totalPegawai, setTotalPegawai] = useState<number>(0);
  const [totalKelas, setTotalKelas] = useState<number>(0);
  const [recentClasses, setRecentClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setLoading(true);
        const [taRes, siswaRes, guruRes, pegawaiRes, classesRes] =
          await Promise.all([
            tahunAjaranService.getActive(),
            siswaService.getAll({ limit: 1 }),
            guruService.getAll({ limit: 1 }),
            pegawaiService.getAll({ limit: 1 }),
            classesService.getAll({ limit: 5, sort: "id", order: "DESC" }),
          ]);

        setActiveTa(taRes);
        setTotalSiswa(siswaRes.meta?.total || 0);
        setTotalGuru(guruRes.meta?.total || 0);
        setTotalPegawai(pegawaiRes.meta?.total || 0);
        setTotalKelas(classesRes.meta?.total || 0);
        setRecentClasses(classesRes.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard Utama | IdEaS - School Management System"
        description="Ringkasan Statistik dan Aktivitas Sistem Informasi Manajemen Sekolah"
      />

      {/* Welcome Banner */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full">
              Sistem Informasi Sekolah
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {user?.username || "Admin"}! 👋
            </h1>
            <p className="mt-1 text-sm text-brand-100 max-w-xl">
              Kelola data akademik, penempatan rombongan belajar, presensi, dan master data civitas sekolah secara terpadu.
            </p>
          </div>

          {activeTa && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                📅
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-brand-200">
                  Tahun Ajaran Aktif
                </div>
                <div className="text-base font-bold text-white">
                  {activeTa.nama}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Siswa */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Total Siswa
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : totalSiswa}
            </h3>
            <Link
              to="/master/siswa"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-2 inline-block"
            >
              Lihat data siswa →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
            🎓
          </div>
        </div>

        {/* Guru */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Total Guru
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : totalGuru}
            </h3>
            <Link
              to="/master/guru"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-2 inline-block"
            >
              Lihat data guru →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
            👨‍🏫
          </div>
        </div>

        {/* Pegawai */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Total Pegawai & Staf
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : totalPegawai}
            </h3>
            <Link
              to="/master/pegawai"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-2 inline-block"
            >
              Lihat data pegawai →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
            👥
          </div>
        </div>

        {/* Kelas */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Rombel / Kelas
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : totalKelas}
            </h3>
            <Link
              to="/academic/classes"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-2 inline-block"
            >
              Kelola kelas →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center text-xl font-bold">
            🏫
          </div>
        </div>
      </div>

      {/* Recent Classes & Quick Navigation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Classes Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white/90">
              Rombongan Belajar Terbaru
            </h3>
            <Link
              to="/academic/classes"
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/40">
                <tr>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5">Tingkat</th>
                  <th className="px-3 py-2.5">Tahun Ajaran</th>
                  <th className="px-3 py-2.5">Wali Kelas</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Memuat data kelas...
                    </td>
                  </tr>
                ) : recentClasses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Belum ada kelas yang dibuat.
                    </td>
                  </tr>
                ) : (
                  recentClasses.map((cls) => (
                    <tr
                      key={cls.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2.5 font-bold text-gray-800 dark:text-white">
                        {cls.nama}
                      </td>
                      <td className="px-3 py-2.5">Kelas {cls.tingkat}</td>
                      <td className="px-3 py-2.5">{cls.tahunAjaran?.nama || "-"}</td>
                      <td className="px-3 py-2.5">
                        {cls.waliKelas?.pegawai?.namaLengkap || "-"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">
            Aksi Cepat
          </h3>
          <div className="space-y-2.5">
            <Link
              to="/academic/tahun-ajaran"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-brand-50 hover:border-brand-200 transition-colors text-xs font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10"
            >
              <span>⚙️ Atur Tahun Ajaran</span>
              <span>→</span>
            </Link>

            <Link
              to="/academic/classes"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-brand-50 hover:border-brand-200 transition-colors text-xs font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10"
            >
              <span>🏫 Kelola Rombel & Wali Kelas</span>
              <span>→</span>
            </Link>

            <Link
              to="/master/siswa"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-brand-50 hover:border-brand-200 transition-colors text-xs font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10"
            >
              <span>🎓 Buku Induk Siswa</span>
              <span>→</span>
            </Link>

            <Link
              to="/master/guru"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-brand-50 hover:border-brand-200 transition-colors text-xs font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10"
            >
              <span>👨‍🏫 Data Guru & Pegawai</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
