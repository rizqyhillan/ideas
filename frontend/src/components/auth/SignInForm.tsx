import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Silakan isi username/email dan password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await signIn(identifier, password, isChecked);
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

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-8 mx-auto lg:hidden">
        <Link to="/" className="inline-flex items-center">
          <img
            src="/images/logo/Logo-Splasma-Website.png"
            alt="SPLASMA"
            width={600}
            height={79}
            className="h-auto w-56 max-w-full object-contain sm:w-64"
          />
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
                    Username atau email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="text"
                    value={identifier}
                    disabled={isSubmitting}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="username, email atau NUPTK/NISN"
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
                    to="/forgot-password"
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
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Memproses Masuk..." : "Masuk"}
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Tidak punya akun?{" "}
                <Link
                  to="/register"
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
