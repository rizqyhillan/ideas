import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { Notification } from '../database/entities/entities/Notification';

export interface CreateNotificationInput {
  userIds: number[];
  title: string;
  description: string;
  category: string;
  link?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findForUser(userId: number, requestedLimit?: number) {
    const parsedLimit = Number(requestedLimit);
    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.isFinite(parsedLimit) && parsedLimit > 0
          ? Math.trunc(parsedLimit)
          : 10,
      ),
    );

    const [items, unreadCount] = await Promise.all([
      this.notificationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      this.notificationRepository.count({
        where: { userId, readAt: IsNull() },
      }),
    ]);

    return { success: true, data: { items, unreadCount } };
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return { success: true, data: notification };
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('user_id = :userId AND read_at IS NULL', { userId })
      .execute();

    return { success: true, data: { unreadCount: 0 } };
  }

  async createForUsers(
    input: CreateNotificationInput,
    manager?: EntityManager,
  ): Promise<Notification[]> {
    const userIds = [
      ...new Set(input.userIds.filter((id) => Number.isInteger(id) && id > 0)),
    ];
    if (userIds.length === 0) return [];

    const repository = manager
      ? manager.getRepository(Notification)
      : this.notificationRepository;
    const notifications = userIds.map((userId) =>
      repository.create({
        userId,
        title: input.title,
        description: input.description,
        category: input.category,
        link: input.link ?? null,
      }),
    );
    return repository.save(notifications);
  }
}
