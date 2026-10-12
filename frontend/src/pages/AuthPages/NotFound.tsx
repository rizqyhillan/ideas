import { Link } from "react-router";
import { Icon } from "../../components/icons/ideas-icon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center px-4 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10 flex items-center justify-center">
          <Icon name="search" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
