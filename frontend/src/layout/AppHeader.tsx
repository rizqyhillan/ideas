import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Icon } from "../components/icons/ideas-icon";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    if (!query) return;

    if (query.includes("sis") || query.includes("murid")) {
      navigate("/master/siswa");
    } else if (query.includes("gur") || query.includes("pengajar")) {
      navigate("/master/guru");
    } else if (query.includes("peg") || query.includes("staf") || query.includes("staff")) {
      navigate("/master/pegawai");
    } else if (query.includes("kel") || query.includes("rombel")) {
      navigate("/academic/classes");
    } else if (query.includes("absen") || query.includes("presensi")) {
      navigate("/academic/absensi");
    } else if (query.includes("tahun") || query.includes("ajar") || query.includes("ta")) {
      navigate("/academic/tahun-ajaran");
    } else if (query.includes("user") || query.includes("pengguna") || query.includes("akun")) {
      navigate("/master/users");
    } else if (query.includes("jadwal") || query.includes("agenda")) {
      navigate("/academic/classes");
    } else if (query.includes("profil") || query.includes("saya")) {
      navigate("/profile");
    } else {
      navigate(`/master/siswa?search=${encodeURIComponent(query)}`);
    }

    setSearchTerm("");
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <Icon name="x" size={20} />
            ) : (
              <Icon name="menu" size={16} />
            )}
          </button>

          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-brand-50 dark:bg-brand-900/20">
              <Icon name="school" size={16} className="text-brand-600 dark:text-brand-400" />
            </div>
            <span className="font-extrabold tracking-tight text-gray-900 dark:text-white text-base">
              IdEaS
            </span>
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle user options"
          >
            <Icon name="moreVertical" size={20} />
          </button>

          <div className="hidden lg:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                  <Icon name="search" size={18} className="text-gray-400" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ketik modul (siswa, guru, kelas, absen) & tekan Enter..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                />

                <button
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
                >
                  <Icon name="command" size={11} />
                  <span className="text-[11px] font-mono">K</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}
            <NotificationDropdown />
            {/* <!-- Notification Menu Area --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
