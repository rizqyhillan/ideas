import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { useAuth } from "../context/AuthContext";
import { usersService } from "../services/master.service";

export default function UserProfiles() {
  const { user, refreshUser } = useAuth();

  // Edit Profile Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!username.trim() || !email.trim()) {
      setErrorMsg("Nama pengguna dan email wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");
      await usersService.update(user.id, {
        username: username.trim(),
        email: email.trim(),
      });

      await refreshUser();
      setSuccessMsg("Profil akun berhasil diperbarui!");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  const roleName = user?.userRoles2?.[0]?.role?.name || "Civitas Sekolah";
  const roleCode = user?.userRoles2?.[0]?.role?.code || "user";

  return (
    <>
      <PageMeta
        title="Profil Pengguna | IdEaS - School Management System"
        description="Kelola informasi akun dan profil pengguna sistem IdEaS"
      />
      <PageBreadcrumb pageTitle="Profil Saya" />

      {/* Notifications */}
      {successMsg && (
        <div className="mb-4 p-4 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium dark:bg-success-500/10 dark:border-success-500/30 dark:text-success-400">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-4 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
          ✕ {errorMsg}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-theme-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shrink-0">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.username || "Pengguna"}
                </h2>
                <Badge color="primary" size="sm">
                  {roleName}
                </Badge>
                <Badge
                  color={user?.status === "aktif" ? "success" : "light"}
                  size="sm"
                >
                  {user?.status === "aktif" ? "Akun Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email || "-"}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-400">
                <span>ID Pengguna: #{user?.id || "-"}</span>
                <span>•</span>
                <span>Sistem: IdEaS Splasma</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Button
              variant={isEditing ? "outline" : "primary"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Batal Edit" : "✏️ Edit Profil"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Informasi Akun */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-theme-xs">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>👤</span> Informasi Akun Utama
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-username">Nama Pengguna (Username)</Label>
                <Input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing || isSaving}
                  placeholder="Masukkan username"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profile-email">Alamat Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing || isSaving}
                  placeholder="Masukkan alamat email"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Peran / Role Pengguna</Label>
                  <div className="mt-1 p-2.5 rounded-lg border border-gray-100 bg-gray-50/80 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-300 uppercase">
                    {roleCode} ({roleName})
                  </div>
                </div>

                <div>
                  <Label>Status Akun</Label>
                  <div className="mt-1 p-2.5 rounded-lg border border-gray-100 bg-gray-50/80 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-300 capitalize">
                    {user?.status || "aktif"}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving}
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user?.username || "");
                      setEmail(user?.email || "");
                    }}
                  >
                    Batal
                  </Button>
                  <Button size="sm" disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Civitas & Info Sistem Sidebar Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-theme-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🏫</span> Lingkup Civitas
            </h3>
            <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                <span className="font-semibold text-gray-800 dark:text-white block mb-0.5">
                  Institusi Sekolah
                </span>
                <span>SPLASMA - IdEaS School Management</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                <span className="font-semibold text-gray-800 dark:text-white block mb-0.5">
                  Hak Akses Modul
                </span>
                <span>
                  Akses penuh dashboard, master data civitas, rombel kelas, dan presensi akademik.
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Bantuan & Keamanan
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              Untuk pergantian password terenkripsi atau mutasi data pegawai/siswa terkait akun ini, hubungi Administrator Utama Sekolah.
            </p>
            <div className="p-3 rounded-xl bg-brand-50/60 text-brand-700 text-xs font-medium dark:bg-brand-950/20 dark:text-brand-300">
              🔒 Sesi login Anda diamankan dengan autentikasi JWT token standar industri.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
