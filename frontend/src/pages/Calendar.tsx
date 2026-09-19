import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import { tahunAjaranService } from "../services/academic.service";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    isSystem?: boolean;
  };
}

const STORAGE_KEY = "ideas_school_calendar_events";

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Akademik");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents: Record<string, string> = {
    Akademik: "primary",
    Kegiatan: "success",
    Ujian: "warning",
    Libur: "danger",
  };

  useEffect(() => {
    async function loadAcademicAndSavedEvents() {
      try {
        setLoading(true);
        // 1. Fetch real Tahun Ajaran from backend
        const taRes = await tahunAjaranService.getAll({ sort: "id", order: "DESC" });
        const academicEvents: CalendarEvent[] = [];

        taRes.data.forEach((ta) => {
          if (ta.tanggalMulai) {
            academicEvents.push({
              id: `ta-start-${ta.id}`,
              title: `📅 Mulai TA ${ta.nama}`,
              start: ta.tanggalMulai.split("T")[0],
              allDay: true,
              extendedProps: {
                calendar: "Akademik",
                isSystem: true,
              },
            });
          }
          if (ta.tanggalSelesai) {
            academicEvents.push({
              id: `ta-end-${ta.id}`,
              title: `🏁 Akhir TA ${ta.nama}`,
              start: ta.tanggalSelesai.split("T")[0],
              allDay: true,
              extendedProps: {
                calendar: "Akademik",
                isSystem: true,
              },
            });
          }
        });

        // 2. Load stored custom events
        const storedStr = localStorage.getItem(STORAGE_KEY);
        let customEvents: CalendarEvent[] = [];
        if (storedStr) {
          try {
            customEvents = JSON.parse(storedStr);
          } catch {
            customEvents = [];
          }
        } else {
          // Default initial school events
          const today = new Date().toISOString().split("T")[0];
          customEvents = [
            {
              id: "evt-1",
              title: "Rapat Koordinasi Dewan Guru",
              start: today,
              allDay: true,
              extendedProps: { calendar: "Kegiatan" },
            },
          ];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(customEvents));
        }

        setEvents([...academicEvents, ...customEvents]);
      } catch (err) {
        console.error("Failed to load academic calendar events:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAcademicAndSavedEvents();
  }, []);

  const saveCustomEvents = (allEvents: CalendarEvent[]) => {
    const onlyCustom = allEvents.filter((e) => !e.extendedProps?.isSystem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyCustom));
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    setEventLevel("Kegiatan");
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const isSystem = Boolean(event.extendedProps?.isSystem);
    if (isSystem) {
      alert(`Event Sistem (${event.title}): Dikelola otomatis dari modul Tahun Ajaran.`);
      return;
    }

    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps?.calendar || "Akademik");
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (!eventTitle.trim() || !eventStartDate) {
      alert("Judul agenda dan tanggal mulai wajib diisi.");
      return;
    }

    if (selectedEvent) {
      // Update existing event
      const updated = events.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...event,
              title: eventTitle.trim(),
              start: eventStartDate,
              end: eventEndDate || eventStartDate,
              extendedProps: { calendar: eventLevel },
            }
          : event
      );
      setEvents(updated);
      saveCustomEvents(updated);
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: `custom-${Date.now()}`,
        title: eventTitle.trim(),
        start: eventStartDate,
        end: eventEndDate || eventStartDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      const updated = [...events, newEvent];
      setEvents(updated);
      saveCustomEvents(updated);
    }

    closeModal();
    resetModalFields();
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    if (!confirm("Hapus agenda ini dari kalender?")) return;

    const updated = events.filter((e) => e.id !== selectedEvent.id);
    setEvents(updated);
    saveCustomEvents(updated);
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("Akademik");
    setSelectedEvent(null);
  };

  return (
    <>
      <PageMeta
        title="Kalender Akademik & Agenda | IdEaS"
        description="Jadwal kegiatan akademik, ujian, dan agenda sekolah IdEaS Splasma"
      />
      <PageBreadcrumb pageTitle="Kalender Akademik" />

      {/* Legend Card */}
      <div className="mb-4 flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] text-xs">
        <span className="font-semibold text-gray-700 dark:text-gray-300">Kategori Agenda:</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 font-medium dark:bg-brand-950/40 dark:text-brand-300">
          <span className="w-2 h-2 rounded-full bg-brand-500"></span> Akademik (TA)
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Kegiatan
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium dark:bg-amber-950/40 dark:text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ujian
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-medium dark:bg-rose-950/40 dark:text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span> Libur
        </span>
        <span className="ml-auto text-[11px] text-gray-400">
          {loading ? "Memuat agenda..." : "Klik tanggal di kalender untuk menambah agenda"}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar overflow-x-auto">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridDay",
            }}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            customButtons={{
              addEventButton: {
                text: "+ Tambah Agenda",
                click: () => {
                  resetModalFields();
                  const today = new Date().toISOString().split("T")[0];
                  setEventStartDate(today);
                  openModal();
                },
              },
            }}
          />
        </div>

        {/* Modal Add / Edit Event */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[550px] p-4 sm:p-6">
          <div className="flex flex-col">
            <div className="mb-4">
              <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedEvent ? "Ubah Agenda Sekolah" : "Tambah Agenda Sekolah"}
              </h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Jadwalkan kegiatan akademik, ujian, atau pertemuan sekolah.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Judul Agenda <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Penilaian Tengah Semester"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Kategori Agenda
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(calendarsEvents).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEventLevel(cat)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                        eventLevel === cat
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal Mulai <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tanggal Selesai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              {selectedEvent ? (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="text-xs font-semibold text-error-600 hover:underline"
                >
                  Hapus Agenda
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Batal
                </Button>
                <Button size="sm" onClick={handleAddOrUpdateEvent}>
                  {selectedEvent ? "Perbarui" : "Simpan Agenda"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const category = eventInfo.event.extendedProps?.calendar || "Akademik";
  let bgClass = "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300";

  if (category === "Kegiatan") {
    bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300";
  } else if (category === "Ujian") {
    bgClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300";
  } else if (category === "Libur") {
    bgClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300";
  }

  return (
    <div className={`flex items-center gap-1 p-1 rounded border text-[11px] font-medium truncate w-full ${bgClass}`}>
      <span className="truncate">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;
