import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

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
      icon: "📅",
      unread: true,
      link: "/academic/tahun-ajaran",
    },
    {
      id: "2",
      title: "Presensi Harian Terbuka",
      desc: "Pencatatan absensi siswa kelas hari ini sudah dapat dilakukan.",
      time: "Hari ini",
      category: "Absensi",
      icon: "📋",
      unread: true,
      link: "/academic/absensi",
    },
    {
      id: "3",
      title: "Sesi Akun Aktif",
      desc: `Anda masuk sebagai ${user?.username || "Pengguna"}. Kelola profil dan keamanan akun Anda.`,
      time: "Sesi ini",
      category: "Sistem",
      icon: "🔐",
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
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
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
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 shadow-xs flex items-center justify-center text-base shrink-0 dark:bg-gray-800 dark:border-gray-700">
                  {item.icon}
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
