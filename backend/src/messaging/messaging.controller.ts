import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dtos/message.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@ApiTags('messaging')
@Controller('api/messages')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post(':receiverId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  async sendMessage(
    @CurrentUser() user: IAuthPayload,
    @Param('receiverId') receiverId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messagingService.sendMessage(
      user.id,
      receiverId,
      createMessageDto,
    );
    return {
      statusCode: 201,
      message: 'Message sent',
      data: message,
    };
  }

  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getConversation(
    @CurrentUser() user: IAuthPayload,
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.messagingService.getConversation(
      user.id,
      userId,
      pagination,
    );
    return {
      statusCode: 200,
      message: 'Conversation retrieved',
      data: result,
    };
  }

  @Post(':messageId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async markAsRead(
    @CurrentUser() user: IAuthPayload,
    @Param('messageId') messageId: string,
  ) {
    const message = await this.messagingService.markAsRead(
      messageId,
      user.id,
    );
    return {
      statusCode: 200,
      message: 'Message marked as read',
      data: message,
    };
  }

  @Delete(':messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteMessage(
    @CurrentUser() user: IAuthPayload,
    @Param('messageId') messageId: string,
  ) {
    await this.messagingService.deleteMessage(messageId, user.id);
    return {
      statusCode: 204,
      message: 'Message deleted',
    };
  }
}
