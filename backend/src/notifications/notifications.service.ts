import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { IPaginatedResponse, PaginationDto } from '@common/dtos/pagination.dto';
import { NotificationType } from '@common/enums';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message?: string,
    fromUserId?: string,
    relatedId?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      title,
      message,
      fromUserId,
      relatedId,
    });

    return this.notificationsRepository.save(notification);
  }

  async getNotifications(
    userId: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Notification>> {
    const [notifications, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      relations: ['fromUser'],
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: notifications,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
    });

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationsRepository.delete(notificationId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
