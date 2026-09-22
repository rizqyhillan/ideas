import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { CardIcon, Icon } from "../../components/icons/ideas-icon";
import {
  tahunAjaranService,
  classesService,
  TahunAjaranItem,
  ClassItem,
} from "../../services/academic.service";
import { siswaService, guruService, pegawaiService } from "../../services/master.service";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [activeTa, setActiveTa] = useState<TahunAjaranItem | null>(null);
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalGuru, setTotalGuru] = useState(0);
  const [totalPegawai, setTotalPegawai] = useState(0);
  const [totalKelas, setTotalKelas] = useState(0);
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

      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dashboard Utama
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {user?.username || "Admin"} — Kelola data akademik dan civitas sekolah
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-flat p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Total Siswa
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {loading ? "-" : totalSiswa}
              </h3>
              <Link to="/master/siswa" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-1.5 inline-block">
                Lihat data →
              </Link>
            </div>
            <div className="icon-box bg-blue-50 dark:bg-blue-900/20">
              <CardIcon name="users" />
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Total Guru
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {loading ? "-" : totalGuru}
              </h3>
              <Link to="/master/guru" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-1.5 inline-block">
                Lihat data →
              </Link>
            </div>
            <div className="icon-box bg-emerald-50 dark:bg-emerald-900/20">
              <CardIcon name="award" />
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Total Pegawai
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {loading ? "-" : totalPegawai}
              </h3>
              <Link to="/master/pegawai" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-1.5 inline-block">
                Lihat data →
              </Link>
            </div>
            <div className="icon-box bg-amber-50 dark:bg-amber-900/20">
              <CardIcon name="user" />
            </div>
          </div>
        </div>

        <div className="card-flat p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Rombel / Kelas
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {loading ? "-" : totalKelas}
              </h3>
              <Link to="/academic/classes" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 mt-1.5 inline-block">
                Kelola →
              </Link>
            </div>
            <div className="icon-box bg-purple-50 dark:bg-purple-900/20">
              <CardIcon name="school" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Classes */}
        <div className="lg:col-span-2 card-flat p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Rombongan Belajar Terbaru
            </h3>
            <Link to="/academic/classes" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
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
                      <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-white">{cls.nama}</td>
                      <td className="px-3 py-2.5">Kelas {cls.tingkat}</td>
                      <td className="px-3 py-2.5">{cls.tahunAjaran?.nama || "-"}</td>
                      <td className="px-3 py-2.5">{cls.waliKelas?.pegawai?.namaLengkap || "-"}</td>
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
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Aksi Cepat</h3>
          <div className="space-y-1.5">
            <QuickLink icon="calendar" label="Atur Tahun Ajaran" link="/academic/tahun-ajaran" />
            <QuickLink icon="school" label="Kelola Rombel" link="/academic/classes" />
            <QuickLink icon="users" label="Buku Induk Siswa" link="/master/siswa" />
            <QuickLink icon="award" label="Data Guru & Pegawai" link="/master/guru" />
          </div>
        </div>
      </div>
    </>
  );
}

function QuickLink({ icon, label, link }: { icon: string; label: string; link: string }) {
  return (
    <Link
      to={link}
      className="flex items-center justify-between p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
    >
      <span className="flex items-center gap-2">
        <CardIcon name={icon} />
        {label}
      </span>
      <Icon name="chevronRight" size={14} className="text-gray-400" />
    </Link>
  );
}
