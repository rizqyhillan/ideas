import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { jadwalService, JadwalItem } from "../../services/academic-extras.service";
import { classesService, ClassItem } from "../../services/academic.service";
import { guruService, GuruItem } from "../../services/master.service";
import { mataPelajaranService, MataPelajaranItem } from "../../services/academic-extras.service";
import { semesterService, SemesterItem } from "../../services/academic-extras.service";

type Hari = "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu";

const hariList: Hari[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

export default function JadwalPage() {
  const [data, setData] = useState<JadwalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState<number | "">("");
  const [filterHari, setFilterHari] = useState<Hari | "">("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    semesterId: "",
    kelasId: "",
    mataPelajaranId: "",
    guruId: "",
    hari: "senin" as Hari,
    jamMulai: "07:00",
    jamSelesai: "08:30",
    ruang: "",
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [kelasList, setKelasList] = useState<ClassItem[]>([]);
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaranItem[]>([]);
  const [semesterList, setSemesterList] = useState<SemesterItem[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (search) params.search = search;
      if (filterKelas) params.kelasId = filterKelas;
      if (filterHari) params.hari = filterHari;

      const [jadwalRes, kelasRes, guruRes, mapelRes, semesterRes] = await Promise.all([
        jadwalService.getAll(params),
        classesService.getAll({ limit: 100 }),
        guruService.getAll({ limit: 100 }),
        mataPelajaranService.getAll({ limit: 100 }),
        semesterService.getAll({ limit: 100 }),
      ]);

      setData(jadwalRes.data);
      setKelasList(kelasRes.data);
      setGuruList(guruRes.data);
      setMapelList(mapelRes.data);
      setSemesterList(semesterRes.data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, filterKelas, filterHari]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.semesterId || !formData.kelasId || !formData.mataPelajaranId || !formData.guruId || !formData.jamMulai || !formData.jamSelesai) {
      setFormError("Semua bidang wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError("");
      const payload = {
        semesterId: Number(formData.semesterId),
        kelasId: Number(formData.kelasId),
        mataPelajaranId: Number(formData.mataPelajaranId),
        guruId: Number(formData.guruId),
        hari: formData.hari,
        jamMulai: formData.jamMulai,
        jamSelesai: formData.jamSelesai,
        ruang: formData.ruang,
        isActive: formData.isActive,
      };
      if (editingId) {
        await jadwalService.update(editingId, payload);
        setSuccessMsg("Jadwal berhasil diperbarui");
      } else {
        await jadwalService.create(payload);
        setSuccessMsg("Jadwal berhasil ditambahkan");
      }
      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await jadwalService.delete(id);
      setSuccessMsg("Jadwal dihapus");
      loadData();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus");
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      semesterId: "",
      kelasId: "",
      mataPelajaranId: "",
      guruId: "",
      hari: "senin",
      jamMulai: "07:00",
      jamSelesai: "08:30",
      ruang: "",
      isActive: true,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(item: JadwalItem) {
    setEditingId(item.id);
    setFormData({
      semesterId: String(item.semesterId),
      kelasId: String(item.kelasId),
      mataPelajaranId: String(item.mataPelajaranId),
      guruId: String(item.guruId),
      hari: item.hari,
      jamMulai: item.jamMulai?.split("T")[1]?.slice(0, 5) || "07:00",
      jamSelesai: item.jamSelesai?.split("T")[1]?.slice(0, 5) || "08:30",
      ruang: item.ruang || "",
      isActive: item.isActive,
    });
    setFormError("");
    setIsModalOpen(true);
  }

  const formatJam = (time: string | undefined) => {
    if (!time) return "-";
    return time.split("T")[1]?.slice(0, 5) || time;
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Jadwal Pelajaran" />
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">{errorMsg}</div>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Daftar Jadwal Pelajaran</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Kelola jadwal mengajar per kelas dan guru</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={openCreateModal}>+ Tambah Jadwal</Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <Input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
          <select value={filterKelas} onChange={(e) => setFilterKelas(Number(e.target.value) || "")} className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
          </select>
          <select value={filterHari} onChange={(e) => setFilterHari(e.target.value as Hari || "")} className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <option value="">Semua Hari</option>
            {hariList.map((h) => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Hari</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Mata Pelajaran</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3">Ruang</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Belum ada jadwal</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <Badge color="primary" size="sm">{item.hari?.charAt(0).toUpperCase() + item.hari?.slice(1)}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {kelasList.find((k) => k.id === item.kelasId)?.nama || "Kelas ..."}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-800 dark:text-white">{mapelList.find((m) => m.id === item.mataPelajaranId)?.nama || "-"}</span>
                      <span className="text-xs text-gray-400 ml-1">({mapelList.find((m) => m.id === item.mataPelajaranId)?.kode})</span>
                    </td>
                    <td className="px-4 py-3.5">{guruList.find((g) => g.id === item.guruId)?.pegawai?.namaLengkap || "-"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs">
                      {formatJam(item.jamMulai)} - {formatJam(item.jamSelesai)}
                    </td>
                    <td className="px-4 py-3.5">{item.ruang || "-"}</td>
                    <td className="px-4 py-3.5 text-center">
                      {item.isActive ? <Badge color="success" size="sm">Aktif</Badge> : <Badge color="light" size="sm">Nonaktif</Badge>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="px-2.5 py-1 text-xs font-medium text-brand-600 bg-brand-50 rounded hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 text-xs font-medium text-error-600 bg-error-50 rounded hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {loading ? <div className="py-8 text-center text-gray-400">Memuat...</div> : data.length === 0 ? <div className="py-8 text-center text-gray-400">Belum ada jadwal</div> : data.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color="primary" size="sm">{item.hari?.charAt(0).toUpperCase() + item.hari?.slice(1)}</Badge>
                    <span className="font-semibold text-gray-900 dark:text-white">{kelasList.find((k) => k.id === item.kelasId)?.nama || "Kelas ..."}</span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-white">{mapelList.find((m) => m.id === item.mataPelajaranId)?.nama || "-"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Guru: {guruList.find((g) => g.id === item.guruId)?.pegawai?.namaLengkap || "-"}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>⏰ {formatJam(item.jamMulai)} - {formatJam(item.jamSelesai)}</span>
                    {item.ruang && <span>📍 {item.ruang}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEditModal(item)} className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-medium text-error-600 bg-error-50 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg p-6 max-h-screen overflow-y-auto">
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? "Edit Jadwal" : "Tambah Jadwal Pelajaran"}</h3>
        </div>
        {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium dark:bg-red-500/10">{formError}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Semester *</Label>
              <select value={formData.semesterId} onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Pilih Semester</option>
                {semesterList.map((s) => <option key={s.id} value={String(s.id)}>{s.tahunAjaranId} - {s.jenis}</option>)}
              </select>
            </div>
            <div>
              <Label>Kelas *</Label>
              <select value={formData.kelasId} onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Pilih Kelas</option>
                {kelasList.map((k) => <option key={k.id} value={String(k.id)}>Kelas {k.nama} (Tingkat {k.tingkat})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Mata Pelajaran *</Label>
              <select value={formData.mataPelajaranId} onChange={(e) => setFormData({ ...formData, mataPelajaranId: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Pilih Mapel</option>
                {mapelList.map((m) => <option key={m.id} value={String(m.id)}>{m.nama} ({m.kode})</option>)}
              </select>
            </div>
            <div>
              <Label>Guru *</Label>
              <select value={formData.guruId} onChange={(e) => setFormData({ ...formData, guruId: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Pilih Guru</option>
                {guruList.map((g) => <option key={g.id} value={String(g.id)}>{g.pegawai?.namaLengkap || `Guru #${g.id}`}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Hari *</Label>
              <select value={formData.hari} onChange={(e) => setFormData({ ...formData, hari: e.target.value as Hari })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                {hariList.map((h) => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label>Jam Mulai *</Label>
              <Input type="time" value={formData.jamMulai} onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })} />
            </div>
            <div>
              <Label>Jam Selesai *</Label>
              <Input type="time" value={formData.jamSelesai} onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Ruang</Label>
              <Input type="text" placeholder="Contoh: Ruang 101" value={formData.ruang} onChange={(e) => setFormData({ ...formData, ruang: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <select value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">Batal</button>
            <Button size="sm" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
