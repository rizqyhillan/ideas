import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from '../icons/ideas-icon';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { useAuth } from '../../context/AuthContext';
import {
  notificationService,
  SchoolNotification,
} from '../../services/notification.service';

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (elapsedMinutes < 1) return 'Baru saja';
  if (elapsedMinutes < 60) return `${elapsedMinutes} menit lalu`;
  if (elapsedMinutes < 24 * 60) return `${Math.floor(elapsedMinutes / 60)} jam lalu`;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

function iconForCategory(category: string) {
  if (category === 'Absensi') return 'clipboard';
  if (category === 'Akademik') return 'calendar';
  return 'bell';
}

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SchoolNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const result = await notificationService.getAll();
      setNotifications(result.items);
      setUnreadCount(result.unreadCount);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
    setIsLoading(Boolean(user?.id));
    setLoadError(false);
    if (!user?.id) return;

    let isActive = true;
    const refresh = async () => {
      try {
        const result = await notificationService.getAll();
        if (!isActive) return;
        setNotifications(result.items);
        setUnreadCount(result.unreadCount);
        setLoadError(false);
      } catch {
        if (isActive) setLoadError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void refresh();
    const intervalId = window.setInterval(() => void refresh(), 30_000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

  function toggleDropdown() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) void loadNotifications();
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function markNotificationAsRead(item: SchoolNotification) {
    if (item.readAt) return;
    try {
      const updated = await notificationService.markAsRead(item.id);
      const readAt = updated?.readAt ?? new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id ? { ...notification, readAt } : notification,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      setLoadError(true);
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })),
      );
      setUnreadCount(0);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Notifikasi Sistem"
        aria-expanded={isOpen}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <Icon name="bell" size={20} className="text-gray-500 dark:text-gray-400" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="fixed left-1/2 top-[136px] z-50 mt-0 flex max-h-[min(70vh,480px)] w-[calc(100vw-2rem)] max-w-[360px] -translate-x-1/2 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[360px] sm:translate-x-0"
      >
        <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h5 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Pemberitahuan Sistem
            </h5>
            <span className="text-[11px] text-gray-400">
              Aktivitas terbaru sistem sekolah
            </span>
          </div>
          <button
            type="button"
            onClick={() => void markAllAsRead()}
            disabled={unreadCount === 0 || isMarkingAll}
            className="text-[11px] font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-400"
          >
            {isMarkingAll ? 'Menyimpan...' : 'Tandai Dibaca'}
          </button>
        </div>

        {loadError && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <span>Notifikasi gagal dimuat atau disimpan.</span>
            <button
              type="button"
              onClick={() => void loadNotifications()}
              className="shrink-0 font-semibold underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        <ul className="custom-scrollbar flex max-h-[300px] flex-col gap-1 overflow-y-auto">
          {isLoading ? (
            <li className="py-8 text-center text-xs text-gray-400">Memuat notifikasi...</li>
          ) : notifications.length === 0 ? (
            <li className="py-8 text-center">
              <Icon name="bell" size={22} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Belum ada notifikasi
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                Pemberitahuan baru akan muncul di sini.
              </p>
            </li>
          ) : (
            notifications.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.link || '/'}
                  onClick={() => {
                    closeDropdown();
                    void markNotificationAsRead(item);
                  }}
                  className={`flex gap-2.5 rounded-xl p-2.5 transition-colors sm:gap-3 sm:p-3 ${
                    !item.readAt
                      ? 'bg-brand-50/40 hover:bg-brand-50/80 dark:bg-brand-950/20 dark:hover:bg-brand-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 shadow-xs dark:border-gray-700 dark:bg-gray-800">
                    <Icon
                      name={iconForCategory(item.category)}
                      size={18}
                      className="text-brand-500 dark:text-brand-400"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                      <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="hidden text-[11px] leading-snug text-gray-600 line-clamp-2 dark:text-gray-300 sm:block">
                      {item.description}
                    </p>
                    <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 sm:inline-block">
                      {item.category}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>

        <div className="mt-2 border-t border-gray-100 pt-2 text-center text-[10px] text-gray-400 dark:border-gray-800">
          Notifikasi diperbarui otomatis
        </div>
      </Dropdown>
    </div>
  );
}
