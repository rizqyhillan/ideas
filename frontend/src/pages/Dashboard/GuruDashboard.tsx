import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { CardIcon, Icon } from "../../components/icons/ideas-icon";
import Badge from "../../components/ui/badge/Badge";
import { guruService, GuruItem } from "../../services/master.service";
import { classesService, ClassItem } from "../../services/academic.service";

export default function GuruDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myGuru, setMyGuru] = useState<GuruItem | null>(null);
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);
  const [stats, setStats] = useState({ totalKelas: 0, totalStudents: 0 });

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
          const classesRes = await classesService.getAll({ waliKelasId: foundGuru.id, limit: 50 });
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
  const kodeGuru = myGuru?.kodeGuru || "-";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Guru</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Kelola kelas yang diampu dan input absensi siswa
        </p>
      </div>

      {/* Identity Card */}
      <div className="mb-6 card-flat p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold shrink-0">
            {namaGuru.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {namaGuru}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {myGuru?.pegawai?.nip && (
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  NIP: {myGuru.pegawai.nip}
                </span>
              )}
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                {kodeGuru}
              </span>
              <Badge color="success" size="sm">{myGuru?.pegawai?.jabatan || "Guru Pengajar"}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Kelas Diampu"
          value={loading ? "-" : stats.totalKelas}
          icon="school"
          sub="Ruang kelas yang aktif"
        />
        <StatCard
          label="Total Siswa"
          value={loading ? "-" : stats.totalStudents}
          icon="users"
          sub="Siswa di bawah tanggung jawab"
        />
        <StatCard
          label="Status"
          value={myGuru?.aktif ? "Aktif" : "Nonaktif"}
          icon="activity"
          sub="Status akun guru"
        />
      </div>

      {/* Kelas yang Diampu */}
      <div className="mb-6 card-flat p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Kelas yang Diampu
          </h3>
          <Link to="/academic/absensi" className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            Input Absensi →
          </Link>
        </div>

        {loading ? (
          <div className="py-6 text-center text-gray-400 text-sm">Memuat data kelas...</div>
        ) : myClasses.length === 0 ? (
          <div className="py-6 text-center">
            <CardIcon name="school" size={28} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Belum ada kelas yang diberikan.</p>
            <p className="text-xs mt-1 text-gray-400">Admin dapat menetapkan kelas untuk anda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myClasses.map((kelas) => {
              const studentCount = kelas.siswaKelas?.filter((s) => s.isActive).length || 0;
              return (
                <div
                  key={kelas.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Kelas {kelas.nama}</h4>
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/academic/absensi?kelas=${kelas.id}`}
                      className="btn-action-sm bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                      <Icon name="clipboard" size={13} />
                      Absensi
                    </Link>
                    <Link
                      to="/academic/classes"
                      className="btn-action-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Icon name="school" size={13} />
                      Kelas
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Menu Cepat */}
      <div className="card-flat p-5">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Menu Cepat</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <QuickLink icon="clipboard" label="Absensi Siswa" sub="Input kehadiran harian" link="/academic/absensi" />
          <QuickLink icon="school" label="Kelas Diampu" sub="Lihat rombel aktif" link="/academic/classes" />
          <QuickLink icon="calendar" label="Tahun Ajaran" sub="Informasi periode" link="/academic/tahun-ajaran" />
          <QuickLink icon="user" label="Profil Saya" sub="Edit data pribadi" link="/profile" />
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  sub: string;
}) {
  return (
    <div className="card-flat p-4 flex items-start justify-between">
      <div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
          {label}
        </span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className="icon-box bg-emerald-50 dark:bg-emerald-900/20">
        <CardIcon name={icon} />
      </div>
    </div>
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
