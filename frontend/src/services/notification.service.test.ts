import { afterEach, describe, expect, it, vi } from 'vitest';
import { setStoredToken, clearStoredAuth } from './api';
import { notificationService } from './notification.service';

describe('notificationService', () => {
  afterEach(() => {
    clearStoredAuth();
    vi.unstubAllGlobals();
  });

  it('loads persisted notifications and unread count from the authenticated API', async () => {
    setStoredToken('test-token', true);
    const response = { items: [{ id: 4, title: 'Jadwal piket' }], unreadCount: 1 };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, data: response }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(notificationService.getAll()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/notifications?limit=10',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('persists mark-all-read requests on the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, data: { unreadCount: 0 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await notificationService.markAllAsRead();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/notifications/read-all',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
