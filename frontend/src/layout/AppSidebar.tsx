import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { Icon } from "../components/icons/ideas-icon";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  { icon: <Icon name="home" size={20} />, name: "Dashboard", path: "/" },
  {
    icon: <Icon name="calendar" size={20} />,
    name: "Akademik",
    subItems: [
      { name: "Tahun Ajaran", path: "/academic/tahun-ajaran", pro: false },
      { name: "Semester", path: "/academic/semester", pro: false },
      { name: "Kelas & Rombel", path: "/academic/classes", pro: false },
      { name: "Mata Pelajaran", path: "/academic/mata-pelajaran", pro: false },
      { name: "Jadwal Pelajaran", path: "/academic/jadwal", pro: false },
      { name: "Absensi Siswa", path: "/academic/absensi", pro: false },
      { name: "Konseling (BK)", path: "/academic/konseling", pro: false },
    ],
  },
  {
    icon: <Icon name="users" size={20} />,
    name: "Master Civitas",
    subItems: [
      { name: "Data Siswa", path: "/master/siswa", pro: false },
      { name: "Data Guru", path: "/master/guru", pro: false },
      { name: "Data Pegawai", path: "/master/pegawai", pro: false },
      { name: "Data Pengguna", path: "/master/users", pro: false },
      { name: "Role & Hak Akses", path: "/master/roles", pro: false },
      { name: "Permissions", path: "/master/permissions", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <Icon name="user" size={20} />,
    name: "Profil Saya",
    path: "/profile",
  },
];

const ITEM_PERMISSIONS: Record<string, string[]> = {
  "Dashboard": ["dashboard.view"],
  "Tahun Ajaran": ["classes.view", "kelas.list"],
  "Semester": ["classes.view", "kelas.list"],
  "Kelas & Rombel": ["classes.view", "kelas.list"],
  "Mata Pelajaran": ["subjects.view", "guru.list"],
  "Jadwal Pelajaran": ["schedules.view", "jadwal.list"],
  "Absensi Siswa": [
    "student_attendance.view",
    "absensi.list",
    "absensi.create",
    "laporan.absensi",
  ],
  "Konseling (BK)": ["counseling.view", "counseling.view_own", "konseling.list", "siswa.list"],
  "Data Siswa": ["students.view", "siswa.list"],
  "Data Guru": ["teachers.view", "guru.list"],
  "Data Pegawai": ["teachers.view", "guru.list"],
  "Data Pengguna": ["users.view"],
  "Role & Hak Akses": ["roles.manage"],
  "Permissions": ["roles.manage"],
};

const AppSidebar: React.FC = () => {
  const { user, hasAnyPermission, hasPermission } = useAuth();

  const filteredNavItems = useMemo(() => {
    if (!user) return [];

    const userRoles = (user?.roles || []).map((r: any) =>
      typeof r === "string" ? r : r.code || r.name || "",
    );
    const isCivitasAdmin =
      userRoles.includes("admin") ||
      userRoles.includes("super_admin") ||
      hasPermission("users.view") ||
      hasPermission("roles.manage");

    const isAdmin = userRoles.includes("admin") || userRoles.includes("super_admin");
    const isGuru = userRoles.includes("guru");
    const isBk = userRoles.includes("bk") || userRoles.includes("guru_bk");
    const isSiswa = userRoles.includes("siswa");
    const roleMenu: Record<string, string[]> = {
      guru: ["Dashboard", "Jadwal Pelajaran", "Absensi Siswa"],
      bk: ["Dashboard", "Konseling (BK)"],
      guru_bk: ["Dashboard", "Konseling (BK)"],
      siswa: ["Dashboard", "Konseling (BK)"],
    };

    return navItems
      .map((item) => {
        if (!isAdmin && !isCivitasAdmin) {
          const allowed = isGuru
            ? roleMenu.guru
            : isBk
              ? roleMenu.bk
              : isSiswa
                ? roleMenu.siswa
                : undefined;
          if (allowed && item.name !== "Akademik" && !allowed.includes(item.name)) {
            return null;
          }
        }
        // Master Civitas hanya untuk admin & staff sekolah
        if (item.name === "Master Civitas" && !isCivitasAdmin) {
          return null;
        }

        if (item.subItems) {
          const allowedSub = item.subItems.filter((sub) => {
            if ((sub.name === "Tahun Ajaran" || sub.name === "Semester") && !isAdmin) {
              return false;
            }
            if (!isAdmin && !isCivitasAdmin) {
              const allowed = isGuru
                ? roleMenu.guru
                : isBk
                  ? roleMenu.bk
                  : isSiswa
                    ? roleMenu.siswa
                    : undefined;
              if (allowed && !allowed.includes(sub.name)) return false;
            }
            const required = ITEM_PERMISSIONS[sub.name];
            if (!required) return true;
            return hasAnyPermission(...required);
          });
          if (allowedSub.length === 0) return null;
          return { ...item, subItems: allowedSub };
        } else {
          const required = ITEM_PERMISSIONS[item.name];
          if (required && !hasAnyPermission(...required)) {
            return null;
          }
          return item;
        }
      })
      .filter(Boolean) as NavItem[];
  }, [user, hasAnyPermission, hasPermission]);

  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    closeMobileSidebar,
  } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    closeMobileSidebar();
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main" | "others", index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) return null;
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              <Icon
                name="chevronDown"
                size={16}
                className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                }`}
              />
            </button>
          ) : nav.path ? (
            <Link
              to={nav.path}
              onClick={closeMobileSidebar}
              className={`menu-item group ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          ) : null}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={closeMobileSidebar}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100vh-4rem)] lg:h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-5 px-4 flex items-center border-b border-gray-100 dark:border-gray-800 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-between"
        }`}
      >
        <Link to="/" className="flex items-center gap-3">
          <img
            src={
              isExpanded || isHovered || isMobileOpen
                ? "/images/logo/Logo-Splasma-Website.png"
                : "/images/logo/Logo-Splasma-kotak.png"
            }
            alt="Logo Splasma"
            className={
              isExpanded || isHovered || isMobileOpen
                ? "h-11 w-auto object-contain shrink-0"
                : "w-8 h-8 rounded-md object-contain shrink-0"
            }
          />
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <Icon name="dotsHorizontal" size={14} />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <Icon name="dotsHorizontal" size={14} />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
