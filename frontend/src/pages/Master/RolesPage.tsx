import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Icon } from "../../components/icons/ideas-icon";
import {
  roleService,
  permissionService,
  RoleItem,
  PermissionItem,
  CreateRolePayload,
} from "../../services/master.service";
import { useAuth } from "../../context/AuthContext";

// Mapping modul ke nama bahasa Indonesia dan ikon
const MODULE_CONFIG: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  students: {
    label: "Data Siswa",
    icon: "graduation-cap",
    description: "Buku induk pelajar dan profil siswa",
  },
  teachers: {
    label: "Data Guru & Pegawai",
    icon: "users",
    description: "Tenaga pendidik dan staf kependidikan",
  },
  classes: {
    label: "Kelas & Rombel",
    icon: "school",
    description: "Rombongan belajar, tingkat, dan wali kelas",
  },
  subjects: {
    label: "Mata Pelajaran",
    icon: "book-open",
    description: "Daftar kurikulum dan mata pelajaran",
  },
  schedules: {
    label: "Jadwal Pelajaran",
    icon: "calendar",
    description: "Jadwal jam mengajar dan alokasi kelas",
  },
  student_attendance: {
    label: "Presensi Siswa",
    icon: "clipboard-list",
    description: "Pencatatan kehadiran harian siswa",
  },
  duty_attendance: {
    label: "Presensi Guru Piket",
    icon: "clock",
    description: "Kehadiran piket dan verifikasi jam guru",
  },
  counseling: {
    label: "Bimbingan Konseling (BK)",
    icon: "message-square",
    description: "Catatan konseling dan pembinaan siswa",
  },
  users: {
    label: "Pengguna Sistem",
    icon: "user",
    description: "Akun login dan status akses sistem",
  },
  roles: {
    label: "Role & Hak Akses",
    icon: "shield",
    description: "Manajemen peran dan konfigurasi hak akses",
  },
  audit: {
    label: "Audit Log",
    icon: "search",
    description: "Catatan riwayat aktivitas pengguna",
  },
  dashboard: {
    label: "Dashboard",
    icon: "bar-chart-3",
    description: "Akses ke halaman ringkasan dan statistik",
  },
};

export default function RolesPage() {
  const { refreshUser } = useAuth();
  const [data, setData] = useState<RoleItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Create / Edit Role
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateRolePayload>({
    code: "",
    name: "",
    description: "",
    isSystem: false,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Modal Atur Hak Akses / Permissions
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [permSearch, setPermSearch] = useState("");
  const [isSavingPerms, setIsSavingPerms] = useState(false);
  const [permModalError, setPermModalError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getAll(),
        permissionService.getAll(),
      ]);
      setData(rolesRes.data);
      setAllPermissions(permsRes.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data role & permission");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Kelompokkan permission berdasarkan modul
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    for (const p of allPermissions) {
      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    }
    return groups;
  }, [allPermissions]);

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      isSystem: false,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: RoleItem) {
    setEditingId(item.id);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      isSystem: item.isSystem,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setFormError("Kode dan Nama wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError("");
      if (editingId) {
        await roleService.update(editingId, formData);
        setSuccessMsg("Role berhasil diperbarui!");
      } else {
        await roleService.create(formData);
        setSuccessMsg("Role baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan role");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus role ini?")) return;
    try {
      await roleService.delete(id);
      setSuccessMsg("Role berhasil dihapus!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus role");
    }
  }

  // ==========================================
  // MANAJEMEN HAK AKSES MODAL
  // ==========================================

  async function openPermissionsModal(role: RoleItem) {
    setSelectedRole(role);
    setPermModalError("");
    setPermSearch("");
    setIsPermModalOpen(true);

    // Buka seluruh modul secara default
    const initialOpen: Record<string, boolean> = {};
    Object.keys(groupedPermissions).forEach((mod) => {
      initialOpen[mod] = true;
    });
    setOpenModules(initialOpen);

    try {
      const perms = await roleService.getRolePermissions(role.id);
      const permIds = new Set(perms.map((p) => p.id));
      setSelectedPermIds(permIds);
    } catch (err: any) {
      setPermModalError(err?.message || "Gagal memuat hak akses role");
    }
  }

  function togglePermission(id: number) {
    const next = new Set(selectedPermIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPermIds(next);
  }

  function toggleModule(moduleName: string) {
    const modulePerms = groupedPermissions[moduleName] || [];
    const allChecked = modulePerms.every((p) => selectedPermIds.has(p.id));

    const next = new Set(selectedPermIds);
    if (allChecked) {
      // Uncheck all in this module
      modulePerms.forEach((p) => next.delete(p.id));
    } else {
      // Check all in this module
      modulePerms.forEach((p) => next.add(p.id));
    }
    setSelectedPermIds(next);
  }

  function toggleFolderAccordion(moduleName: string) {
    setOpenModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  }

  function selectAll() {
    const all = new Set(allPermissions.map((p) => p.id));
    setSelectedPermIds(all);
  }

  function deselectAll() {
    setSelectedPermIds(new Set());
  }

  async function handleSavePermissions() {
    if (!selectedRole) return;
    try {
      setIsSavingPerms(true);
      setPermModalError("");
      const ids = Array.from(selectedPermIds);
      await roleService.updateRolePermissions(selectedRole.id, ids);

      setSuccessMsg(`Hak akses role "${selectedRole.name}" berhasil diperbarui!`);
      setIsPermModalOpen(false);
      loadData();
      refreshUser(); // Perbarui hak akses user yang sedang login jika relevan
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setPermModalError(err?.message || "Gagal menyimpan hak akses");
    } finally {
      setIsSavingPerms(false);
    }
  }

  function getActionBadgeColor(action: string) {
    switch (action) {
      case "view":
      case "view_own":
        return "info";
      case "create":
        return "success";
      case "update":
        return "warning";
      case "delete":
        return "error";
      default:
        return "light";
    }
  }

  return (
    <>
      <PageMeta
        title="Role & Hak Akses | IdEaS"
        description="Kelola peran pengguna dan konfigurasi izin hak akses per modul"
      />
      <PageBreadcrumb pageTitle="Role & Hak Akses" />

      {/* Alerts */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium dark:bg-success-500/10 dark:border-success-500/30 dark:text-success-400">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
          {errorMsg}
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Daftar Role Pengguna
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Atur hak akses tindakan (view, create, update, delete) per modul untuk setiap peran
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Cari role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56"
            />
            <Button
              size="sm"
              onClick={openCreateModal}
              className="w-full sm:w-auto justify-center"
            >
              + Tambah Role
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Kode Role</th>
                <th className="px-4 py-3">Nama Role</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3 text-center">Hak Akses Aktif</th>
                <th className="px-4 py-3 text-center">Tipe</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Memuat data role...
                  </td>
                </tr>
              ) : data.filter(
                  (r) =>
                    !search ||
                    r.code.includes(search) ||
                    r.name.toLowerCase().includes(search.toLowerCase()),
                ).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Tidak ada data role ditemukan.
                  </td>
                </tr>
              ) : (
                data
                  .filter(
                    (r) =>
                      !search ||
                      r.code.includes(search) ||
                      r.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((item) => {
                    const permCount = (item as any).rolePermissions?.length ?? 0;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3.5 font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                          {item.code}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate">
                          {item.description || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => openPermissionsModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 transition-colors"
                          >
                            <Icon name="shield" size={13} />
                            <span>{permCount} Hak Akses</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {item.isSystem ? (
                            <Badge color="info" size="sm">
                              Sistem
                            </Badge>
                          ) : (
                            <Badge color="light" size="sm">
                              Kustom
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openPermissionsModal(item)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-xs"
                            >
                              Atur Hak Akses
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                            >
                              Edit
                            </button>
                            {!item.isSystem && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2.5 py-1 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden space-y-3 mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat data...</div>
          ) : (
            data
              .filter(
                (r) =>
                  !search ||
                  r.code.includes(search) ||
                  r.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <span className="text-xs font-mono text-gray-500">
                        {item.code}
                      </span>
                    </div>
                    {item.isSystem ? (
                      <Badge color="info" size="sm">
                        Sistem
                      </Badge>
                    ) : (
                      <Badge color="light" size="sm">
                        Kustom
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => openPermissionsModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                    >
                      <Icon name="shield" size={13} />
                      Atur Hak Akses
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Edit
                    </button>
                    {!item.isSystem && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL ATUR HAK AKSES PER MODUL (FOLDER ACCORDION)         */}
      {/* ========================================================= */}
      <Modal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        className="max-w-4xl p-5 sm:p-7"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 flex items-center justify-center">
                  <Icon name="shield" size={18} />
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Atur Hak Akses: {selectedRole?.name}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {selectedRole?.code}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Centang tindakan modul yang diizinkan untuk peran ini. Folder modul yang tidak dicentang otomatis disembunyikan di sidebar dan ditolak via URL.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {selectedPermIds.size} / {allPermissions.length} Aktif
              </span>
            </div>
          </div>

          {/* Quick Filter & Select All Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Cari modul atau permission..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="h-9 px-3 text-xs w-full sm:w-64 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={selectAll}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
              >
                <Icon name="check" size={13} />
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                <Icon name="x" size={13} />
                Batal Semua
              </button>
            </div>
          </div>
        </div>

        {permModalError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
            {permModalError}
          </div>
        )}

        {/* Modules Folder Accordion List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 pr-2">
          {Object.entries(groupedPermissions)
            .filter(([moduleName, perms]) => {
              if (!permSearch) return true;
              const term = permSearch.toLowerCase();
              const modConfig = MODULE_CONFIG[moduleName];
              const modLabel = modConfig?.label.toLowerCase() || "";
              return (
                moduleName.includes(term) ||
                modLabel.includes(term) ||
                perms.some(
                  (p) =>
                    p.code.toLowerCase().includes(term) ||
                    (p.description && p.description.toLowerCase().includes(term)),
                )
              );
            })
            .map(([moduleName, perms]) => {
              const modConfig = MODULE_CONFIG[moduleName] || {
                label: moduleName,
                icon: "folder",
                description: `Modul ${moduleName}`,
              };

              const activeInModuleCount = perms.filter((p) =>
                selectedPermIds.has(p.id),
              ).length;
              const allInModuleChecked =
                perms.length > 0 && activeInModuleCount === perms.length;
              const someInModuleChecked =
                activeInModuleCount > 0 && !allInModuleChecked;
              const isFolderOpen = Boolean(openModules[moduleName]);

              return (
                <div
                  key={moduleName}
                  className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/60 overflow-hidden transition-all shadow-xs"
                >
                  {/* Folder Header */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-gray-100/60 dark:bg-gray-800/40 dark:hover:bg-gray-800/70 cursor-pointer">
                    <div
                      className="flex items-center gap-3 flex-1"
                      onClick={() => toggleFolderAccordion(moduleName)}
                    >
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-transform"
                      >
                        <Icon
                          name="chevron-right"
                          size={16}
                          className={`transform transition-transform ${
                            isFolderOpen ? "rotate-90" : "rotate-0"
                          }`}
                        />
                      </button>

                      <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 flex items-center justify-center shrink-0">
                        <Icon name={modConfig.icon} size={16} />
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {modConfig.label}
                          </h4>
                          <span className="text-[11px] font-mono text-gray-400">
                            ({moduleName})
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {modConfig.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Badge count */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          activeInModuleCount > 0
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        }`}
                      >
                        {activeInModuleCount}/{perms.length} Aktif
                      </span>

                      {/* Checkbox select all module */}
                      <label
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer pl-2 border-l border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={allInModuleChecked}
                          ref={(input) => {
                            if (input) input.indeterminate = someInModuleChecked;
                          }}
                          onChange={() => toggleModule(moduleName)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="hidden sm:inline text-[11px]">
                          Pilih Modul
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Folder Content (Actions list) */}
                  {isFolderOpen && (
                    <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {perms.map((p) => {
                          const isChecked = selectedPermIds.has(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                isChecked
                                  ? "border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-500/5"
                                  : "border-gray-100 bg-gray-50/40 hover:bg-gray-50 dark:border-gray-800/80 dark:bg-gray-800/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.id)}
                                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    color={getActionBadgeColor(p.action) as any}
                                    size="sm"
                                  >
                                    {p.action}
                                  </Badge>
                                  <span className="text-[11px] font-mono text-gray-500 truncate">
                                    {p.code}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
                                  {p.description || p.code}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
          <div className="text-xs text-gray-500">
            Total terpilih:{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {selectedPermIds.size}
            </span>{" "}
            tindakan hak akses
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPermModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Batal
            </button>
            <Button size="sm" onClick={handleSavePermissions} disabled={isSavingPerms}>
              {isSavingPerms ? "Menyimpan..." : "Simpan Perubahan Hak Akses"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL CREATE / EDIT ROLE                                  */}
      {/* ========================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-lg p-4 sm:p-6"
      >
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {editingId ? "Edit Role" : "Tambah Role Baru"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Atur informasi identitas peran pengguna
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <Label>
              Kode Role <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Contoh: guru_piket, staff_tu"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                })
              }
              required
            />
          </div>

          <div>
            <Label>
              Nama Role <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Contoh: Guru Piket"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Input
              type="text"
              placeholder="Tulis deskripsi tugas dan wewenang role..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isSystem"
              checked={formData.isSystem}
              onChange={(e) =>
                setFormData({ ...formData, isSystem: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label
              htmlFor="isSystem"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Role Sistem (tidak bisa dihapus)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              Batal
            </button>
            <Button size="sm" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
