import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import {
  ClassItem,
  TahunAjaranItem,
} from "../../services/academic.service";
import { classesService } from "../../services/academic.service";
import { tahunAjaranService } from "../../services/academic.service";
import {
  siswaService,
  guruService,
  pegawaiService,
} from "../../services/master.service";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    siswa: number;
    guru: number;
    pegawai: number;
    kelas: number;
    tahunAjaran: TahunAjaranItem | null;
  }>({
    siswa: 0,
    guru: 0,
    pegawai: 0,
    kelas: 0,
    tahunAjaran: null,
  });
  const [recentClasses, setRecentClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [siswaRes, guruRes, pegawaiRes, classesRes, taRes] =
          await Promise.all([
            siswaService.getAll({ limit: 1 }),
            guruService.getAll({ limit: 1 }),
            pegawaiService.getAll({ limit: 1 }),
            classesService.getAll({ limit: 5, sort: "id", order: "DESC" }),
            tahunAjaranService.getActive(),
          ]);

        setStats({
          siswa: siswaRes.meta?.total || 0,
          guru: guruRes.meta?.total || 0,
          pegawai: pegawaiRes.meta?.total || 0,
          kelas: classesRes.meta?.total || 0,
          tahunAjaran: taRes,
        });
        setRecentClasses(classesRes.data);
      } catch (err) {
        console.error("Gagal memuat statistik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard Admin" />

      {/* Welcome Banner */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full">
              Panel Admin
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {user?.namaLengkap || user?.username || "Admin"}! 👋
            </h1>
            <p className="mt-1 text-sm text-brand-100 max-w-xl">
              Kelola data akademik, penempatan rombongan belajar, presensi, dan master data civitas sekolah secara terpadu.
            </p>
          </div>
          {stats.tahunAjaran && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                📅
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-brand-200">
                  Tahun Ajaran Aktif
                </div>
                <div className="text-base font-bold text-white">
                  {stats.tahunAjaran.nama}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <MetricCard
          label="Total Siswa"
          value={loading ? "..." : stats.siswa}
          icon="🎓"
          color="blue"
          link="/master/siswa"
          sub="Buku Induk Siswa"
        />
        <MetricCard
          label="Total Guru"
          value={loading ? "..." : stats.guru}
          icon="👨‍🏫"
          color="emerald"
          link="/master/guru"
          sub="Data Guru Pengajar"
        />
        <MetricCard
          label="Total Pegawai"
          value={loading ? "..." : stats.pegawai}
          icon="👥"
          color="amber"
          link="/master/pegawai"
          sub="Staf & Tenaga Kependidikan"
        />
        <MetricCard
          label="Rombel / Kelas"
          value={loading ? "..." : stats.kelas}
          icon="🏫"
          color="purple"
          link="/academic/classes"
          sub="Ruang Kelas Terdaftar"
        />
      </div>

      {/* Content Grid */}
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
                          <Badge color="success" size="sm">Aktif</Badge>
                        ) : (
                          <Badge color="light" size="sm">Nonaktif</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">
            Aksi Cepat
          </h3>
          <div className="space-y-2.5">
            <QuickAction
              icon="⚙️"
              label="Atur Tahun Ajaran"
              link="/academic/tahun-ajaran"
            />
            <QuickAction
              icon="🏫"
              label="Kelola Rombel"
              link="/academic/classes"
            />
            <QuickAction
              icon="🎓"
              label="Buku Induk Siswa"
              link="/master/siswa"
            />
            <QuickAction
              icon="👨‍🏫"
              label="Data Guru & Pegawai"
              link="/master/guru"
            />
            <QuickAction
              icon="📝"
              label="Presensi Siswa"
              link="/academic/absensi"
            />
            <QuickAction
              icon="🔐"
              label="Manajemen Akun"
              link="/master/users"
            />
          </div>

          {/* Hak Akses */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Hak Akses
            </h4>
            <div className="flex flex-wrap gap-2">
              {user?.roles?.map((role: any) => (
                <span
                  key={role.id || role.code}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                >
                  {role.name || role.code}
                </span>
              ))}
              {(!user?.roles || user.roles.length === 0) && (
                <span className="text-xs text-gray-400">Belum ada role</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  link,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  link: string;
  sub: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", text: "text-blue-600 hover:underline dark:text-blue-400" },
    emerald: { bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", text: "text-emerald-600 hover:underline dark:text-emerald-400" },
    amber: { bg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", text: "text-amber-600 hover:underline dark:text-amber-400" },
    purple: { bg: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400", text: "text-purple-600 hover:underline dark:text-purple-400" },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
          {label}
        </span>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
          {value}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
        <Link
          to={link}
          className={`text-xs font-medium ${c.text} mt-2 inline-block`}
        >
          Kelola →
        </Link>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center text-xl font-bold shrink-0`}>
        {icon}
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  link,
}: {
  icon: string;
  label: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-brand-50 hover:border-brand-200 transition-colors text-xs font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10"
    >
      <span className="flex items-center gap-2">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      <span className="text-gray-400">→</span>
    </Link>
  );
}
