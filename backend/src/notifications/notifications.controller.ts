import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@ApiTags('notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getNotifications(
    @CurrentUser() user: IAuthPayload,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.notificationsService.getNotifications(
      user.id,
      pagination,
    );
    return {
      statusCode: 200,
      message: 'Notifications retrieved',
      data: result,
    };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUnreadCount(@CurrentUser() user: IAuthPayload) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return {
      statusCode: 200,
      message: 'Unread count',
      data: { count },
    };
  }

  @Post(':notificationId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async markAsRead(@Param('notificationId') notificationId: string) {
    const notification = await this.notificationsService.markAsRead(
      notificationId,
    );
    return {
      statusCode: 200,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  @Post('mark-all-as-read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async markAllAsRead(@CurrentUser() user: IAuthPayload) {
    await this.notificationsService.markAllAsRead(user.id);
    return {
      statusCode: 200,
      message: 'All notifications marked as read',
    };
  }

  @Delete(':notificationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteNotification(@Param('notificationId') notificationId: string) {
    await this.notificationsService.deleteNotification(notificationId);
    return {
      statusCode: 204,
      message: 'Notification deleted',
    };
  }
}
