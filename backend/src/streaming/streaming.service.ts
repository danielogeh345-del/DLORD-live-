import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream } from './entities/stream.entity';
import { StreamViewer } from './entities/stream-viewer.entity';
import { CreateStreamDto, UpdateStreamDto } from './dtos/stream.dto';
import { IPaginatedResponse, PaginationDto } from '@common/dtos/pagination.dto';
import { StreamStatus } from '@common/enums';

@Injectable()
export class StreamingService {
  constructor(
    @InjectRepository(Stream)
    private streamsRepository: Repository<Stream>,
    @InjectRepository(StreamViewer)
    private streamViewersRepository: Repository<StreamViewer>,
  ) {}

  async createStream(
    userId: string,
    createStreamDto: CreateStreamDto,
  ): Promise<Stream> {
    const stream = this.streamsRepository.create({
      ...createStreamDto,
      userId,
      status: StreamStatus.UPCOMING,
    });

    return this.streamsRepository.save(stream);
  }

  async startStream(streamId: string, userId: string): Promise<Stream> {
    const stream = await this.streamsRepository.findOne({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (stream.userId !== userId) {
      throw new BadRequestException('Not authorized to start this stream');
    }

    stream.status = StreamStatus.LIVE;
    stream.startedAt = new Date();
    return this.streamsRepository.save(stream);
  }

  async endStream(streamId: string, userId: string): Promise<Stream> {
    const stream = await this.streamsRepository.findOne({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (stream.userId !== userId) {
      throw new BadRequestException('Not authorized to end this stream');
    }

    stream.status = StreamStatus.ENDED;
    stream.endedAt = new Date();
    stream.duration = Math.floor(
      (stream.endedAt.getTime() - stream.startedAt.getTime()) / 1000,
    );

    return this.streamsRepository.save(stream);
  }

  async getStream(streamId: string): Promise<Stream> {
    const stream = await this.streamsRepository.findOne({
      where: { id: streamId },
      relations: ['user'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  async getLiveStreams(
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Stream>> {
    const [streams, total] = await this.streamsRepository.findAndCount({
      where: {
        status: StreamStatus.LIVE,
      },
      relations: ['user'],
      skip: pagination.skip,
      take: pagination.take,
      order: { viewers: 'DESC' },
    });

    return {
      data: streams,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async getUserStreams(
    userId: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Stream>> {
    const [streams, total] = await this.streamsRepository.findAndCount({
      where: { userId },
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: streams,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async joinStream(streamId: string, userId: string): Promise<void> {
    const stream = await this.streamsRepository.findOne({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    const existingViewer = await this.streamViewersRepository.findOne({
      where: {
        streamId,
        userId,
      },
    });

    if (!existingViewer) {
      const viewer = this.streamViewersRepository.create({
        streamId,
        userId,
      });

      await this.streamViewersRepository.save(viewer);
      stream.viewers += 1;

      if (stream.viewers > stream.peakViewers) {
        stream.peakViewers = stream.viewers;
      }

      await this.streamsRepository.save(stream);
    }
  }

  async leaveStream(streamId: string, userId: string): Promise<void> {
    const viewer = await this.streamViewersRepository.findOne({
      where: {
        streamId,
        userId,
      },
    });

    if (viewer) {
      await this.streamViewersRepository.remove(viewer);

      const stream = await this.streamsRepository.findOne({
        where: { id: streamId },
      });

      stream.viewers = Math.max(0, stream.viewers - 1);
      await this.streamsRepository.save(stream);
    }
  }
}
