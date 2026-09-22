import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { CardIcon, Icon } from "../../components/icons/ideas-icon";
import Badge from "../../components/ui/badge/Badge";

export default function SiswaDashboard() {
  const { user } = useAuth();
  const namaSiswa = user?.namaLengkap || user?.username || "Siswa";
  const email = user?.email || "-";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Siswa</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Cek kehadiran, lihat data kelas, dan kelola profil
        </p>
      </div>

      {/* Identity Card */}
      <div className="mb-6 card-flat p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xl font-bold shrink-0">
            {namaSiswa.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {namaSiswa}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                {email}
              </span>
              <Badge color="success" size="sm">Siswa</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Akademik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card-flat p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box bg-purple-50 dark:bg-purple-900/20">
              <CardIcon name="school" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                Kelas Terdaftar
              </h3>
              <p className="text-xs text-gray-400">Rombongan belajar kamu</p>
            </div>
          </div>
          <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-gray-400">-</p>
              <p className="text-xs text-gray-400 mt-1">
                Data kelas akan ditampilkan setelah dikonfigurasi oleh admin.
              </p>
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-box bg-amber-50 dark:bg-amber-900/20">
              <CardIcon name="clock" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                Data Kelas
              </h3>
              <p className="text-xs text-gray-400">Informasi rombongan belajar</p>
            </div>
          </div>
          <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-gray-400">-</p>
              <p className="text-xs text-gray-400 mt-1">
                Informasi kelas akan ditampilkan setelah dikonfigurasi oleh admin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cek Absensi Hari Ini */}
      <div className="mb-6 card-flat p-5 border-l-4 border-l-success-500 bg-success-50/30 dark:bg-success-950/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Cek Absensi Hari Ini</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Apakah kamu sudah menandatangani kehadiran hari ini?
            </p>
          </div>
          <div className="icon-box bg-white/80 dark:bg-gray-800/80 shadow-sm">
            <Icon name="clipboard" size={20} className="text-success-600 dark:text-success-400" />
          </div>
        </div>
      </div>

      {/* Menu Cepat */}
      <div className="card-flat p-5">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Menu Cepat</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <QuickLink icon="clipboard" label="Cek Absensi" sub="Lihat status kehadiran" link="/academic/absensi" />
          <QuickLink icon="school" label="Data Kelas" sub="Lihat rombongan belajar" link="/academic/classes" />
          <QuickLink icon="calendar" label="Tahun Ajaran" sub="Periode akademik" link="/academic/tahun-ajaran" />
          <QuickLink icon="user" label="Profil Saya" sub="Edit data pribadi" link="/profile" />
        </div>
      </div>
    </>
  );
}

function QuickLink({
  icon,
  label,
  sub,
  link,
}: {
  icon: string;
  label: string;
  sub: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="flex items-center gap-3 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm dark:bg-gray-900 dark:border-gray-800"
    >
      <div className="icon-box bg-gray-100 dark:bg-gray-800 shrink-0">
        <CardIcon name={icon} />
      </div>
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{label}</div>
        <div className="text-xs text-gray-400">{sub}</div>
      </div>
    </Link>
  );
}
