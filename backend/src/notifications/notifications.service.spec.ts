import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/entities/Notification';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;
  let findMock: jest.Mock;
  let countMock: jest.Mock;
  let findOneMock: jest.Mock;
  let saveMock: jest.Mock;
  let createMock: jest.Mock;
  let createQueryBuilderMock: jest.Mock;
  let queryBuilder: {
    update: jest.Mock;
    set: jest.Mock;
    where: jest.Mock;
    execute: jest.Mock;
  };

  beforeEach(() => {
    queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    findMock = jest.fn().mockResolvedValue([]);
    countMock = jest.fn().mockResolvedValue(0);
    findOneMock = jest.fn();
    saveMock = jest.fn();
    createMock = jest
      .fn()
      .mockImplementation((value: Partial<Notification>) => value);
    createQueryBuilderMock = jest.fn().mockReturnValue(queryBuilder);
    repository = {
      find: findMock,
      count: countMock,
      findOne: findOneMock,
      save: saveMock,
      create: createMock,
      createQueryBuilder: createQueryBuilderMock,
    } as unknown as Repository<Notification>;
    service = new NotificationsService(repository);
  });

  it('lists only the current user notifications and returns their unread count', async () => {
    const items = [{ id: 2, userId: 7, title: 'Jadwal piket' }];
    findMock.mockResolvedValue(items);
    countMock.mockResolvedValue(1);

    await expect(service.findForUser(7, 12)).resolves.toEqual({
      success: true,
      data: { items, unreadCount: 1 },
    });
    expect(findMock).toHaveBeenCalledWith({
      where: { userId: 7 },
      order: { createdAt: 'DESC' },
      take: 12,
    });
  });

  it('marks a notification read only when it belongs to the current user', async () => {
    const notification = { id: 5, userId: 7, readAt: null };
    findOneMock.mockResolvedValue(notification);

    const result = await service.markAsRead(7, 5);

    expect(result.data.readAt).toBeInstanceOf(Date);
    expect(saveMock).toHaveBeenCalledWith(notification);
    expect(findOneMock).toHaveBeenCalledWith({
      where: { id: 5, userId: 7 },
    });
  });

  it('does not disclose another user notification', async () => {
    findOneMock.mockResolvedValue(null);

    await expect(service.markAsRead(7, 99)).rejects.toThrow(NotFoundException);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('marks only unread notifications for the current user', async () => {
    await service.markAllAsRead(7);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'user_id = :userId AND read_at IS NULL',
      { userId: 7 },
    );
  });

  it('deduplicates recipients before creating notifications', async () => {
    await service.createForUsers({
      userIds: [7, 7, 0, -1, 8],
      title: 'Piket',
      description: 'Jadwal baru',
      category: 'Akademik',
    });

    expect(saveMock).toHaveBeenCalledWith([
      expect.objectContaining({ userId: 7, title: 'Piket' }),
      expect.objectContaining({ userId: 8, title: 'Piket' }),
    ]);
  });
});
