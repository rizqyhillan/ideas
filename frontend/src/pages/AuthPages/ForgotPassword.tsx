import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import { Icon } from "../../components/icons/ideas-icon";

const WHATSAPP_ADMIN_URL = "https://wa.me/6285704963537?text=Halo%20Admin%2C%20saya%20lupa%20password%20akun%20IdEaS%20saya.";

export default function ForgotPassword() {
  return (
    <>
      <PageMeta
        title="SPLASMA - Lupa Password | IdEaS - Indonesian Education Management System"
        description="Hubungi admin untuk mereset password akun IdEaS Anda."
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="w-full max-w-md pt-10 mx-auto">
            <Link
              to="/signin"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon className="size-5" />
              Kembali ke Masuk
            </Link>
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Lupa Password?
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Untuk mereset password, silakan hubungi admin melalui WhatsApp.
                  Admin akan membantu Anda dalam proses pemulihan akun.
                </p>
              </div>

              <a
                href={WHATSAPP_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-medium text-white transition-colors rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
              >
                <Icon name="MessageCircle" className="size-5" />
                Chat Admin via WhatsApp
              </a>

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Sudah ingat password?{" "}
                  <Link
                    to="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
