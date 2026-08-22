import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError("Silakan isi email dan password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await signIn(email, password, isChecked);
      const from =
        (location.state as { from?: { pathname?: string } } | null)?.from
          ?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Gagal masuk. Silakan periksa kredensial Anda.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleQuickFillAdmin() {
    setEmail("admin@ideas.id");
    setPassword("admin123");
    setError("");
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
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
              Masuk
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan email dan password Anda untuk masuk ke sistem!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    disabled={isSubmitting}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@ideas.id"
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      disabled={isSubmitting}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Masukkan password Anda"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Ingat saya
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Lupa password?
                  </Link>
                </div>

                {error && (
                  <div className="p-3 text-sm rounded-lg text-error-700 bg-error-50 border border-error-200 dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400">
                    {error}
                  </div>
                )}

                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Memproses Masuk..." : "Masuk"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 p-3 rounded-lg border border-brand-100 bg-brand-50/70 text-xs text-gray-700 dark:border-brand-900/50 dark:bg-brand-500/10 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-brand-700 dark:text-brand-400">
                  Akun Default Seeder
                </span>
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="text-xs font-medium underline text-brand-600 hover:text-brand-800 dark:text-brand-400"
                >
                  Gunakan Akun Ini
                </button>
              </div>
              <p className="mt-1">Email: <code className="font-mono bg-white/70 dark:bg-gray-800 px-1 py-0.5 rounded">admin@ideas.id</code></p>
              <p className="mt-0.5">Password: <code className="font-mono bg-white/70 dark:bg-gray-800 px-1 py-0.5 rounded">admin123</code></p>
            </div>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Tidak punya akun?{" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Mendaftar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
