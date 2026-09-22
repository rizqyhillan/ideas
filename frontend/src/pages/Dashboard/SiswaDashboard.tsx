import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";

export default function SiswaDashboard() {
  const { user } = useAuth();

  const namaSiswa = user?.namaLengkap || user?.username || "Siswa";
  const email = user?.email || "-";

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard Siswa" />

      {/* Welcome Banner - Student Theme */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-brand-500 to-indigo-600 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full">
              Akun Siswa
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {namaSiswa.split(" ")[0]}! 🎓
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-xl">
              Cek kehadiran kamu, lihat data kelas, dan kelola profil siswa.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <div>
              <div className="text-[11px] uppercase font-semibold text-blue-200">
                Status
              </div>
              <div className="text-base font-bold text-white">
                Aktif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Identity Card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {namaSiswa.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {namaSiswa}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {email}
              </span>
              <Badge color="success" size="sm">Siswa</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Akademik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Kelas Terdaftar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 flex items-center justify-center text-lg font-bold">
              🏫
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                Kelas Terdaftar
              </h3>
              <p className="text-xs text-gray-400">Rombongan belajar kamu</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700">
            <div className="text-center py-2">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                -
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Data kelas akan ditampilkan setelah dikonfigurasi oleh admin.
              </p>
            </div>
          </div>
        </div>

        {/* Informasi Kelas */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center text-lg font-bold">
              🕐
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                Data Kelas
              </h3>
              <p className="text-xs text-gray-400">Informasi rombongan belajar</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700">
            <div className="text-center py-2">
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                -
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Informasi kelas akan ditampilkan setelah dikonfigurasi oleh admin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cek Absensi Hari Ini */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-success-500 to-emerald-500 text-white p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block px-2 py-0.5 text-xs font-semibold uppercase bg-white/20 backdrop-blur-md rounded-full mb-2">
              Presensi
            </div>
            <h3 className="text-lg font-bold">Cek Absensi Hari Ini</h3>
            <p className="text-sm text-white/80 mt-1">
              Apakah kamu sudah menandatangani kehadiran hari ini?
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            📝
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">
          Menu Cepat
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/academic/absensi"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-blue-500/10"
          >
            <span className="text-xl">📝</span>
            <div>
              <div className="font-medium">Cek Absensi</div>
              <div className="text-xs text-gray-400">Lihat status kehadiran</div>
            </div>
          </Link>
          <Link
            to="/academic/classes"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-amber-50 hover:border-amber-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-amber-500/10"
          >
            <span className="text-xl">🕐</span>
            <div>
              <div className="font-medium">Data Kelas</div>
              <div className="text-xs text-gray-400">Lihat rombongan belajar</div>
            </div>
          </Link>
          <Link
            to="/academic/tahun-ajaran"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-purple-50 hover:border-purple-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-purple-500/10"
          >
            <span className="text-xl">📅</span>
            <div>
              <div className="font-medium">Tahun Ajaran</div>
              <div className="text-xs text-gray-400">Periode akademik</div>
            </div>
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-100 hover:border-gray-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="text-xl">👤</span>
            <div>
              <div className="font-medium">Profil Saya</div>
              <div className="text-xs text-gray-400">Edit data pribadi</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
