import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guru");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setError("Semua bidang bertanda bintang wajib diisi.");
      return;
    }
    if (!isChecked) {
      setError("Silakan setujui Syarat dan Ketentuan Sistem.");
      return;
    }

    setError("");
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Kembali ke Dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Pendaftaran Akun Civitas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sistem Informasi Manajemen Sekolah IdEaS Splasma.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-brand-50/60 border border-brand-200 text-center dark:bg-brand-950/20 dark:border-brand-900/40">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-500 text-white flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Permohonan Akun Terkirim
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Permohonan pembuatan akun dengan username <strong>{username}</strong> ({email}) untuk peran <strong>{role.toUpperCase()}</strong> telah dicatat. Administrator Sekolah akan memverifikasi dan mengaktifkan akun Anda.
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition"
              >
                Ke Halaman Masuk →
              </Link>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-xs font-medium dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="signup-username">
                      Nama Pengguna (Username)<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="signup-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan nama pengguna"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email">
                      Email Resmi<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="signup-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-role">
                      Peran Civitas<span className="text-error-500">*</span>
                    </Label>
                    <select
                      id="signup-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="guru">Guru Pengajar</option>
                      <option value="guru_bk">Guru Bimbingan Konseling (BK)</option>
                      <option value="staff_perpustakaan">Staf Perpustakaan</option>
                      <option value="staff_ekstrakurikuler">Staf Ekstrakurikuler</option>
                      <option value="siswa">Siswa Pelajar</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        placeholder="Buat password aman"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <Checkbox
                      className="w-5 h-5"
                      checked={isChecked}
                      onChange={setIsChecked}
                    />
                    <p className="inline-block text-xs font-normal text-gray-500 dark:text-gray-400">
                      Dengan mendaftar, Anda menyetujui kebijakan operasional dan keamanan data sekolah.
                    </p>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                    >
                      Kirim Permohonan Akun
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  Sudah memiliki akun aktif?{" "}
                  <Link
                    to="/signin"
                    className="text-brand-500 font-semibold hover:text-brand-600 dark:text-brand-400"
                  >
                    Masuk Sekarang
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
