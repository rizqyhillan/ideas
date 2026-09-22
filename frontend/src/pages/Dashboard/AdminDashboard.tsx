import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { CardIcon, Icon } from "../../components/icons/ideas-icon";
import Badge from "../../components/ui/badge/Badge";
import {
  ClassItem,
  TahunAjaranItem,
} from "../../services/academic.service";
import { classesService } from "../../services/academic.service";
import { tahunAjaranService } from "../../services/academic.service";
import { siswaService, guruService, pegawaiService } from "../../services/master.service";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    siswa: number;
    guru: number;
    pegawai: number;
    kelas: number;
    tahunAjaran: TahunAjaranItem | null;
  }>({ siswa: 0, guru: 0, pegawai: 0, kelas: 0, tahunAjaran: null });
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
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {user?.namaLengkap || user?.username || "Admin"} — Kelola data sekolah
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Siswa"
          value={loading ? "-" : stats.siswa}
          icon="users"
          link="/master/siswa"
          sub="Buku Induk Siswa"
        />
        <MetricCard
          label="Total Guru"
          value={loading ? "-" : stats.guru}
          icon="award"
          link="/master/guru"
          sub="Data Guru Pengajar"
        />
        <MetricCard
          label="Total Pegawai"
          value={loading ? "-" : stats.pegawai}
          icon="user"
          link="/master/pegawai"
          sub="Staf & Tenaga Kependidikan"
        />
        <MetricCard
          label="Rombel / Kelas"
          value={loading ? "-" : stats.kelas}
          icon="school"
          link="/academic/classes"
          sub="Ruang Kelas Terdaftar"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Classes */}
        <div className="lg:col-span-2 card-flat p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Rombongan Belajar Terbaru
            </h3>
            <Link
              to="/academic/classes"
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5">Tingkat</th>
                  <th className="px-3 py-2.5">Tahun Ajaran</th>
                  <th className="px-3 py-2.5">Wali Kelas</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="table-body-row">
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
                    <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20">
                      <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white">
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
        <div className="card-flat p-5">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
            Aksi Cepat
          </h3>
          <div className="space-y-1">
            <QuickAction icon="calendar" label="Atur Tahun Ajaran" link="/academic/tahun-ajaran" />
            <QuickAction icon="school" label="Kelola Rombel" link="/academic/classes" />
            <QuickAction icon="users" label="Buku Induk Siswa" link="/master/siswa" />
            <QuickAction icon="award" label="Data Guru & Pegawai" link="/master/guru" />
            <QuickAction icon="clipboard" label="Presensi Siswa" link="/academic/absensi" />
            <QuickAction icon="settings" label="Manajemen Akun" link="/master/users" />
          </div>

          {/* Hak Akses */}
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Hak Akses
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {user?.roles?.map((role: any) => (
                <span
                  key={role.id || role.code}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
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
  link,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  link: string;
  sub: string;
}) {
  return (
    <div className="card-flat p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {label}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
            {value}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          <Link
            to={link}
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-1.5 inline-block"
          >
            Kelola →
          </Link>
        </div>
        <div className="icon-box bg-gray-100 dark:bg-gray-800">
          <CardIcon name={icon} />
        </div>
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
      className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors text-xs font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <CardIcon name={icon} className="shrink-0" />
      <span>{label}</span>
      <Icon name="chevronRight" size={14} className="ml-auto text-gray-400 shrink-0" />
    </Link>
  );
}
