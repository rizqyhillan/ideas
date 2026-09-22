export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          Kembali ke Dashboard
        </a>
      </div>
    </div>
  );
}
