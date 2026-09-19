export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gradient-to-b from-brand-50 to-indigo-50/40 p-4 text-center border border-brand-100 dark:from-brand-950/20 dark:to-indigo-950/20 dark:border-brand-900/30`}
    >
      <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
        🎓
      </div>
      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
        IdEaS Splasma
      </h3>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        Sistem Manajemen Akademik & Civitas Sekolah Terpadu
      </p>
      <div className="mt-3 pt-3 border-t border-brand-100/70 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
        <span>Versi 1.0.0</span>
        <span className="inline-flex items-center gap-1 font-medium text-success-600 dark:text-success-400">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
          Aktif
        </span>
      </div>
    </div>
  );
}
