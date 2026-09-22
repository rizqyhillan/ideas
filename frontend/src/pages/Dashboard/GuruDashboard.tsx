import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { guruService, GuruItem } from "../../services/master.service";
import {
  classesService,
  ClassItem,
} from "../../services/academic.service";

export default function GuruDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myGuru, setMyGuru] = useState<GuruItem | null>(null);
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);
  const [stats, setStats] = useState({
    totalKelas: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const guruRes = await guruService.getAll({ limit: 100 });
        const guruList = guruRes.data;

        let foundGuru: GuruItem | undefined;
        let guruClasses: ClassItem[] = [];

        if (user) {
          foundGuru = guruList.find(
            (g) =>
              g.pegawai?.userId === user.id ||
              (g.pegawai?.email && g.pegawai.email.toLowerCase() === user.email?.toLowerCase()) ||
              g.kodeGuru === user.username
          );
        }

        if (foundGuru) {
          setMyGuru(foundGuru);
          const classesRes = await classesService.getAll({
            waliKelasId: foundGuru.id,
            limit: 50,
          });
          guruClasses = classesRes.data;
          setMyClasses(guruClasses);
          setStats({
            totalKelas: guruClasses.length,
            totalStudents: guruClasses.reduce((acc, cls) => {
              const count = cls.siswaKelas?.filter((s) => s.isActive).length || 0;
              return acc + count;
            }, 0),
          });
        }
      } catch (err) {
        console.error("Gagal memuat data guru:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const namaGuru = myGuru?.pegawai?.namaLengkap || user?.username || "Guru";
  const nip = myGuru?.pegawai?.nip || "-";
  const kodeGuru = myGuru?.kodeGuru || "-";
  const jabatan = myGuru?.pegawai?.jabatan || "Guru Pengajar";

  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard Guru" />

      {/* Welcome Banner - Teacher Theme */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full">
              Akun Guru Pengajar
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hai, {namaGuru.split(" ")[0]}! 👨‍🏫
            </h1>
            <p className="mt-1 text-sm text-emerald-100 max-w-xl">
              Kelola kelas yang diampu dan input absensi siswa.
            </p>
          </div>
          {kodeGuru !== "-" && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                🏫
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold text-emerald-200">
                  Kode Guru
                </div>
                <div className="text-base font-bold text-white">
                  {kodeGuru}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guru Identity Card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {namaGuru.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {namaGuru}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {nip !== "-" && (
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                  NIP: {nip}
                </span>
              )}
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                {kodeGuru}
              </span>
              <Badge color="success" size="sm">{jabatan}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik Singkat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Kelas Diampu
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : stats.totalKelas}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Ruang kelas yang aktif</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shrink-0">
            🏫
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Total Siswa
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : stats.totalStudents}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Siswa di bawah tanggung jawab</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center text-xl font-bold shrink-0">
            🎓
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Data Kelas
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {loading ? "..." : "—"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Rombel yang dikelola</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
            🕐
          </div>
        </div>
      </div>

      {/* Kelas yang Diampu */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white/90">
            Kelas yang Diampu
          </h3>
          <Link
            to="/academic/absensi"
            className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Input Absensi → 
          </Link>
        </div>

        {loading ? (
          <div className="py-6 text-center text-gray-400 text-sm">
            Memuat data kelas...
          </div>
        ) : myClasses.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            <div className="text-4xl mb-3">🏫</div>
            <p className="font-medium">Belum ada kelas yang diberikan.</p>
            <p className="text-sm mt-1">Admin dapat menetapkan kelas untuk anda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myClasses.map((kelas) => {
              const studentCount = kelas.siswaKelas?.filter((s) => s.isActive).length || 0;
              return (
                <div
                  key={kelas.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 dark:bg-gray-800/40 dark:border-gray-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        Kelas {kelas.nama}
                      </h4>
                      <Badge color={kelas.statusAktif ? "success" : "light"} size="sm">
                        {kelas.statusAktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Tingkat {kelas.tingkat}</span>
                      {kelas.ruang && <span>Ruang: {kelas.ruang}</span>}
                      <span>•</span>
                      <span>{studentCount} siswa aktif</span>
                      {kelas.tahunAjaran && (
                        <>
                          <span>•</span>
                          <span>{kelas.tahunAjaran.nama}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Link
                      to={`/academic/absensi?kelas=${kelas.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      📝 Absensi
                    </Link>
                    <Link
                      to="/academic/classes"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      🏫 Kelas
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-base font-bold text-gray-800 dark:text-white/90 mb-4">
          Menu Cepat
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/academic/absensi"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-emerald-500/10"
          >
            <span className="text-xl">📝</span>
            <div>
              <div className="font-medium">Absensi Siswa</div>
              <div className="text-xs text-gray-400">Input kehadiran harian</div>
            </div>
          </Link>
          <Link
            to="/academic/classes"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-amber-50 hover:border-amber-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-amber-500/10"
          >
            <span className="text-xl">🕐</span>
            <div>
              <div className="font-medium">Kelas Diampu</div>
              <div className="text-xs text-gray-400">Lihat rombel aktif</div>
            </div>
          </Link>
          <Link
            to="/academic/tahun-ajaran"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-brand-50 hover:border-brand-200 transition-colors text-sm font-semibold text-gray-700 dark:bg-gray-800/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10"
          >
            <span className="text-xl">📅</span>
            <div>
              <div className="font-medium">Tahun Ajaran</div>
              <div className="text-xs text-gray-400">Informasi periode</div>
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
