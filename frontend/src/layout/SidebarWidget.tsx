export default function SidebarWidget() {
  return (
    <div className="mx-2 mb-6 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
          IDEAS SPLASMA
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          v1.0.0
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
        Sistem Informasi Sekolah Terpadu
      </p>
    </div>
  );
}
