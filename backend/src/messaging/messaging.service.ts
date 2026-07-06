import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dtos/message.dto';
import { IPaginatedResponse, PaginationDto } from '@common/dtos/pagination.dto';
import { MessageType } from '@common/enums';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId,
      receiverId,
      type: createMessageDto.type || MessageType.TEXT,
    });

    return this.messagesRepository.save(message);
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Message>> {
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: [
        {
          senderId: userId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: userId,
        },
      ],
      relations: ['sender', 'receiver'],
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: messages,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new Error('Not authorized');
    }

    message.isRead = true;
    message.readAt = new Date();
    return this.messagesRepository.save(message);
  }

  async deleteMessage(
    messageId: string,
    userId: string,
  ): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('Not authorized');
    }

    await this.messagesRepository.remove(message);
  }
}
