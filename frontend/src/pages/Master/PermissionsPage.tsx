import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  permissionService,
  PermissionItem,
} from "../../services/master.service";

export default function PermissionsPage() {
  const [data, setData] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      let res;
      if (moduleFilter) {
        res = await permissionService.getByModule(moduleFilter);
      } else {
        res = await permissionService.getAll();
      }
      setData(res.data);
    } catch (err: any) {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [moduleFilter]);

  useEffect(() => {
    const modules = [...new Set(data.map((p) => p.module))];
    if (modules.length > 0 && !moduleFilter) {
      // could show filter UI
    }
  }, [data]);

  const uniqueModules = [...new Set(data.map((p) => p.module))];

  return (
    <>
      <PageMeta title="Permissions | IdEaS" description="Daftar hak akses sistem" />
      <PageBreadcrumb pageTitle="Permissions (Hak Akses)" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daftar Permissions</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hak akses yang tersedia dalam sistem</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="h-10 px-3 text-sm rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 w-full sm:w-auto"
            >
              <option value="">Semua Module</option>
              {uniqueModules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-900 dark:text-white">{item.code}</td>
                    <td className="px-4 py-3.5">
                      <Badge color="info" size="sm">{item.module}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-800 dark:text-white">{item.action}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 truncate max-w-xs">{item.description || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-3 mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Memuat data...</div>
          ) : data.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Tidak ada data ditemukan.</div>
          ) : (
            data.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-mono text-xs text-gray-900 dark:text-white">{item.code}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge color="info" size="sm">{item.module}</Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{item.action}</span>
                    </div>
                  </div>
                </div>
                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
