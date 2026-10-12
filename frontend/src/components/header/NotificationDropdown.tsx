import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../icons/ideas-icon";

interface SchoolNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: "Akademik" | "Absensi" | "Sistem";
  icon: string;
  unread: boolean;
  link: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<SchoolNotification[]>([
    {
      id: "1",
      title: "Tahun Ajaran Aktif",
      desc: "Tahun ajaran aktif sedang berjalan. Pastikan jadwal kelas dan wali kelas terisi.",
      time: "Hari ini",
      category: "Akademik",
      icon: "calendar",
      unread: true,
      link: "/academic/tahun-ajaran",
    },
    {
      id: "2",
      title: "Presensi Harian Terbuka",
      desc: "Pencatatan absensi siswa kelas hari ini sudah dapat dilakukan.",
      time: "Hari ini",
      category: "Absensi",
      icon: "clipboard-list",
      unread: true,
      link: "/academic/absensi",
    },
    {
      id: "3",
      title: "Sesi Akun Aktif",
      desc: `Anda masuk sebagai ${user?.username || "Pengguna"}. Kelola profil dan keamanan akun Anda.`,
      time: "Sesi ini",
      category: "Sistem",
      icon: "lock",
      unread: false,
      link: "/profile",
    },
  ]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setNotifying(false);
    }
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setNotifying(false);
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifikasi Sistem"
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {notifying && (
          <span className="absolute right-1 top-1 z-10 h-2.5 w-2.5 rounded-full bg-brand-500">
            <span className="absolute inline-flex w-full h-full bg-brand-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <Icon name="bell" size={20} className="text-gray-500 dark:text-gray-400" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex max-h-[480px] w-[320px] sm:w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 z-50"
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h5 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Pemberitahuan Sistem
            </h5>
            <span className="text-[11px] text-gray-400">
              Aktivitas terbaru sistem sekolah
            </span>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-[11px] text-brand-600 hover:text-brand-700 font-medium dark:text-brand-400"
          >
            Tandai Dibaca
          </button>
        </div>

        <ul className="flex flex-col gap-1 overflow-y-auto max-h-[300px] custom-scrollbar">
          {notifications.map((item) => (
            <li key={item.id}>
              <Link
                to={item.link}
                onClick={closeDropdown}
                className={`flex gap-3 rounded-xl p-3 transition-colors ${
                  item.unread
                    ? "bg-brand-50/40 hover:bg-brand-50/80 dark:bg-brand-950/20 dark:hover:bg-brand-950/30"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 shadow-xs flex items-center justify-center shrink-0 dark:bg-gray-800 dark:border-gray-700">
                  <Icon name={item.icon} size={18} className="text-brand-500 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                  <span className="inline-block mt-1 text-[9px] uppercase font-semibold tracking-wider text-brand-600 dark:text-brand-400">
                    {item.category}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 text-center">
          <Link
            to="/academic/absensi"
            onClick={closeDropdown}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Buka Presensi Hari Ini →
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
