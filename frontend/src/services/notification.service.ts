import { apiFetch, ApiResponse } from './api';

export interface SchoolNotification {
  id: number;
  title: string;
  description: string;
  category: 'Akademik' | 'Absensi' | 'Sistem' | string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationList {
  items: SchoolNotification[];
  unreadCount: number;
}

export const notificationService = {
  async getAll(limit = 10): Promise<NotificationList> {
    const response = await apiFetch<ApiResponse<NotificationList>>(
      `/notifications?limit=${limit}`,
    );
    return response.data ?? { items: [], unreadCount: 0 };
  },

  async markAsRead(id: number): Promise<SchoolNotification | null> {
    const response = await apiFetch<ApiResponse<SchoolNotification>>(
      `/notifications/${id}/read`,
      { method: 'PATCH' },
    );
    return response.data ?? null;
  },

  async markAllAsRead(): Promise<void> {
    await apiFetch('/notifications/read-all', { method: 'PATCH' });
  },
};
