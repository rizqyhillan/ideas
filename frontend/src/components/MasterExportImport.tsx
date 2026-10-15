import { useState, ReactNode, ChangeEvent } from "react";
import Button from "./ui/button/Button";
import { Icon } from "./icons/ideas-icon";
import { getStoredToken } from "../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface MasterExportImportProps {
  masterName: string;
  title?: string;
  children?: ReactNode;
  onImportSuccess?: () => void;
}

/**
 * Reusable export/import component for master data pages.
 * Exposes:
 *   - Export XLSX (download)
 *   - Export PDF (download)
 *   - Import (upload XLSX or JSON)
 */
export function MasterExportImport({
  masterName,
  title,
  children,
  onImportSuccess,
}: MasterExportImportProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const getHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // ------------------------------------------------------------------
  // Export XLSX
  // ------------------------------------------------------------------
  const handleExportXlsx = async () => {
    try {
      setExporting(true);
      setMessage("");
      setIsError(false);
      const res = await fetch(`${API_BASE_URL}/api/export/${masterName}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Gagal mengunduh file Excel");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${masterName}-export-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setMessage(`Berhasil mengunduh ${masterName}.xlsx`);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || "Gagal mengunduh file");
    } finally {
      setExporting(false);
    }
  };

  // ------------------------------------------------------------------
  // Export PDF
  // ------------------------------------------------------------------
  const handleExportPdf = async () => {
    try {
      setExporting(true);
      setMessage("");
      setIsError(false);
      const res = await fetch(`${API_BASE_URL}/api/export/${masterName}/pdf`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Gagal mengunduh PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${masterName}-laporan.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setMessage(`Berhasil mengunduh ${masterName}-laporan.pdf`);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || "Gagal mengunduh PDF");
    } finally {
      setExporting(false);
    }
  };

  // ------------------------------------------------------------------
  // Import
  // ------------------------------------------------------------------
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    try {
      setImporting(true);
      setMessage(`Mengunggah & mengimpor ${selected.name}...`);
      setIsError(false);

      const formData = new FormData();
      formData.append("file", selected, selected.name);

      const res = await fetch(
        `${API_BASE_URL}/api/export/${masterName}/import`,
        {
          method: "POST",
          headers: getHeaders(),
          body: formData,
        },
      );

      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.message || "Import gagal");
      }

      setMessage(result?.message || `Berhasil mengimpor data ${masterName}`);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || "Gagal import data");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {title ? (
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h4>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportXlsx}
            disabled={exporting}
            size="sm"
            startIcon={<Icon name="download" size={15} />}
          >
            {exporting ? "Mengunduh..." : "Export Excel"}
          </Button>

          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={exporting}
            size="sm"
            startIcon={<Icon name="file" size={15} />}
          >
            Export PDF
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              document.getElementById(`import-file-${masterName}`)?.click()
            }
            disabled={importing}
            size="sm"
            startIcon={<Icon name="upload" size={15} />}
          >
            {importing ? "Mengimpor..." : "Import Excel"}
          </Button>

          <input
            type="file"
            id={`import-file-${masterName}`}
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 px-3 py-2 text-xs rounded-lg ${
            isError
              ? "bg-error-50 text-error-700 border border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/30"
              : "bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/30"
          }`}
        >
          {message}
        </div>
      )}

      {/* Render children table/content */}
      {children}
    </div>
  );
}
