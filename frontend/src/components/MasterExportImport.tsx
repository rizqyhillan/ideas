import { useState, ReactNode } from "react";
import Button from "./ui/button/Button";
import Icon from "./icons/ideas-icon";
import * as XLSX from "xlsx";

interface MasterExportImportProps {
  masterName: string;
  title: string;
  children: ReactNode;
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
}: MasterExportImportProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  // ------------------------------------------------------------------
  // Export XLSX
  // ------------------------------------------------------------------
  const handleExportXlsx = async () => {
    try {
      setExporting(true);
      setMessage("");
      const res = await fetch(`/api/export/${masterName}`);
      if (!res.ok) throw new Error("Gagal mengunduh file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${masterName}-export-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage(`Berhasil mengunduh ${masterName}.xlsx`);
    } catch (err: any) {
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
      const res = await fetch(`/api/export/${masterName}/pdf`);
      if (!res.ok) throw new Error("Gagal mengunduh PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${masterName}-laporan.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage(`Berhasil mengunduh ${masterName}-laporan.pdf`);
    } catch (err: any) {
      setMessage(err.message || "Gagal mengunduh PDF");
    } finally {
      setExporting(false);
    }
  };

  // ------------------------------------------------------------------
  // Import
  // ------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setImportFile(selected);
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      setImporting(true);
      setMessage("");

      // Read the file as array buffer
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      // Build FormData with the file
      const formData = new FormData();
      formData.append("file", importFile, importFile.name);

      const res = await fetch(`/api/export/${masterName}/import`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Import gagal");
      setMessage(result.message || "Berhasil import data");
    } catch (err: any) {
      setMessage(err.message || "Gagal import data");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleExportXlsx}
          disabled={exporting}
          size="sm"
          startIcon={<Icon name="download" size={15} />}
        >
          Export XLSX
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
          onClick={() => document.getElementById("import-file")?.click()}
          disabled={importing}
          size="sm"
          startIcon={<Icon name="upload" size={15} />}
        >
          Import
        </Button>
        {importFile && (
          <span className="text-xs text-gray-500 truncate max-w-[180px]">
            {importFile.name}
          </span>
        )}
        <input
          type="file"
          id="import-file"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept=".xlsx,.xls"
        />
      </div>
      {message && (
        <span className="text-xs text-gray-600">{message}</span>
      )}
    </div>
  );
}
