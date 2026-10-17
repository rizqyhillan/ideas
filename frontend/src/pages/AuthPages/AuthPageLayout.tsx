import React from "react";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row-reverse dark:bg-gray-900 sm:p-0">
        {children}
        <div className="auth-visual-panel items-center hidden w-full h-full lg:w-1/2 lg:grid">
          <div aria-hidden="true" className="auth-visual-shape auth-visual-shape--top" />
          <div aria-hidden="true" className="auth-visual-shape auth-visual-shape--bottom" />
          <div aria-hidden="true" className="auth-visual-orbit" />
          <div className="relative z-1 flex items-center justify-center px-8">
            <div className="flex max-w-sm flex-col items-center">
              <Link to="/" className="block mb-4">
                <img
                  width={600}
                  height={79}
                  src="/images/logo/Logo-Splasma-Website.png"
                  alt="Logo"
                />
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                SMP Negeri 1 Plaosan, Magetan
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
// lane 13 ubah jadi flex-row-reverse kalau mau ganti posisi form dan gambarnya
