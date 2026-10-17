import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import { Icon } from "../components/icons/ideas-icon";
import { authService } from "../services/auth.service";

export default function ProfilePage() {
  const { user, signOut, refreshUser } = useAuth();

  // Tab State: 'info' | 'edit-profile' | 'change-password'
  const [activeTab, setActiveTab] = useState<"info" | "edit-profile" | "change-password">("info");

  // Edit Profile Form State
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    namaLengkap: user?.namaLengkap || user?.username || "",
    noTelepon: user?.noTelepon || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (!user) return null;

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileData.username.trim()) {
      setProfileError("Username wajib diisi.");
      return;
    }
    try {
      setProfileSaving(true);
      setProfileError("");
      setProfileSuccess("");
      await authService.updateProfile({
        username: profileData.username.trim(),
        email: profileData.email.trim(),
        namaLengkap: profileData.namaLengkap.trim(),
        noTelepon: profileData.noTelepon.trim(),
      });
      await refreshUser();
      setProfileSuccess("Profil berhasil diperbarui!");
      setTimeout(() => {
        setProfileSuccess("");
        setActiveTab("info");
      }, 1500);
    } catch (err: any) {
      setProfileError(err?.message || "Gagal memperbarui profil.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      setPasswordError("Password saat ini wajib diisi.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password baru harus memiliki minimal 6 karakter.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Konfirmasi password tidak sesuai.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError("");
      setPasswordSuccess("");
      const res = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      setPasswordSuccess(res.message || "Password berhasil diubah!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setPasswordSuccess("");
        setActiveTab("info");
      }, 2000);
    } catch (err: any) {
      setPasswordError(err?.message || "Gagal mengganti password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  const roleLabels = user.roles?.map((r: any) => (typeof r === "string" ? r : r.name || r.code)).join(", ") || "User";

  return (
    <>
      <PageMeta
        title="Profil Saya | IdEaS"
        description="Informasi profil dan pengaturan keamanan akun"
      />
      <PageBreadcrumb pageTitle="Profil Saya" />

      <div className="max-w-4xl space-y-6">
        {/* Profile Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-brand-500 text-white flex items-center justify-center text-3xl font-bold shadow-sm shrink-0">
              {user.namaLengkap?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {user.namaLengkap || user.username}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {user.email || user.username}
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 uppercase tracking-wider">
                    {roleLabels}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === "aktif"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                    }`}
                  >
                    {user.status === "aktif" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "info"
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon name="user" size={16} />
                  Informasi Akun
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileData({
                      username: user.username || "",
                      email: user.email || "",
                      namaLengkap: user.namaLengkap || user.username || "",
                      noTelepon: user.noTelepon || "",
                    });
                    setActiveTab("edit-profile");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "edit-profile"
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon name="edit" size={16} />
                  Edit Profil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("change-password")}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    activeTab === "change-password"
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon name="shield" size={16} />
                  Ganti Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Info Akun */}
        {activeTab === "info" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Rincian Informasi Akun
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Data identitas dan informasi akun Anda yang terdaftar pada sistem
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Nama Lengkap
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.namaLengkap || user.username}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Username
                </span>
                <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                  {user.username}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Email
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email || "-"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  No. Telepon / WhatsApp
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.noTelepon || "-"}
                </span>
              </div>

              {user.nip && (
                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    NIP Pegawai / Guru
                  </span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    {user.nip}
                  </span>
                </div>
              )}

              {user.nisn && (
                <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    NISN Siswa
                  </span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    {user.nisn}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Terakhir Login
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("id-ID") : "Sesi saat ini"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition-colors"
              >
                <Icon name="close" size={16} />
                Keluar dari Akun
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Edit Profil */}
        {activeTab === "edit-profile" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Edit Informasi Profil
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Perbarui data nama, username, email, dan kontak Anda
              </p>
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium dark:bg-success-500/10 dark:border-success-500/30 dark:text-success-400">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>
                    Nama Lengkap <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={profileData.namaLengkap}
                    onChange={(e) =>
                      setProfileData({ ...profileData, namaLengkap: e.target.value })
                    }
                    placeholder="Nama lengkap Anda..."
                    required
                  />
                </div>
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({ ...profileData, username: e.target.value })
                    }
                    placeholder="Username login..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    placeholder="alamat@email.com"
                  />
                </div>
                <div>
                  <Label>No. Telepon / WhatsApp</Label>
                  <Input
                    type="text"
                    value={profileData.noTelepon}
                    onChange={(e) =>
                      setProfileData({ ...profileData, noTelepon: e.target.value })
                    }
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                >
                  Batal
                </button>
                <Button size="sm" disabled={profileSaving}>
                  {profileSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Ganti Password */}
        {activeTab === "change-password" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Ganti Password Akun
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Pastikan gunakan kombinasi password yang kuat untuk menjaga keamanan akun Anda
              </p>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-success-50 border border-success-200 text-success-700 text-sm font-medium dark:bg-success-500/10 dark:border-success-500/30 dark:text-success-400">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <Label>
                  Password Saat Ini <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPass ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Masukkan password saat ini..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Icon name={showCurrentPass ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div>
                <Label>
                  Password Baru <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Minimal 6 karakter..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Icon name={showNewPass ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div>
                <Label>
                  Konfirmasi Password Baru <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPass ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Ketik ulang password baru..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Icon name={showConfirmPass ? "eyeOff" : "eye"} size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 transition-colors"
                >
                  Batal
                </button>
                <Button size="sm" disabled={passwordSaving}>
                  {passwordSaving ? "Memproses..." : "Ganti Password"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
