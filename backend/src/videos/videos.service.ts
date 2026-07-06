import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { VideoLike } from './entities/video-like.entity';
import { VideoComment } from './entities/video-comment.entity';
import { CreateVideoDto, UpdateVideoDto, CreateCommentDto } from './dtos/video.dto';
import { IPaginatedResponse, PaginationDto } from '@common/dtos/pagination.dto';
import { VideoStatus } from '@common/enums';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    @InjectRepository(VideoLike)
    private videoLikesRepository: Repository<VideoLike>,
    @InjectRepository(VideoComment)
    private videoCommentsRepository: Repository<VideoComment>,
  ) {}

  async createVideo(
    userId: string,
    createVideoDto: CreateVideoDto,
  ): Promise<Video> {
    const video = this.videosRepository.create({
      ...createVideoDto,
      userId,
      status: VideoStatus.DRAFT,
    });

    return this.videosRepository.save(video);
  }

  async publishVideo(videoId: string, userId: string): Promise<Video> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException('Not authorized to publish this video');
    }

    video.status = VideoStatus.PUBLISHED;
    return this.videosRepository.save(video);
  }

  async updateVideo(
    videoId: string,
    userId: string,
    updateVideoDto: UpdateVideoDto,
  ): Promise<Video> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this video');
    }

    Object.assign(video, updateVideoDto);
    return this.videosRepository.save(video);
  }

  async deleteVideo(videoId: string, userId: string): Promise<void> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this video');
    }

    video.status = VideoStatus.DELETED;
    await this.videosRepository.save(video);
  }

  async getVideo(videoId: string): Promise<Video> {
    const video = await this.videosRepository.findOne({
      where: {
        id: videoId,
        status: VideoStatus.PUBLISHED,
      },
      relations: ['user'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Increment view count
    video.views += 1;
    await this.videosRepository.save(video);

    return video;
  }

  async getFeed(
    userId: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Video>> {
    const [videos, total] = await this.videosRepository.findAndCount({
      where: {
        status: VideoStatus.PUBLISHED,
      },
      relations: ['user'],
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: videos,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async getUserVideos(
    userId: string,
    pagination: PaginationDto,
    currentUserId?: string,
  ): Promise<IPaginatedResponse<Video>> {
    let query = this.videosRepository
      .createQueryBuilder('video')
      .where('video.userId = :userId', { userId })
      .relations('user')
      .orderBy('video.createdAt', 'DESC')
      .skip(pagination.skip)
      .take(pagination.take);

    // If not the video owner, only show published videos
    if (userId !== currentUserId) {
      query = query.andWhere('video.status = :status', {
        status: VideoStatus.PUBLISHED,
      });
    }

    const [videos, total] = await query.getManyAndCount();

    return {
      data: videos,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async likeVideo(videoId: string, userId: string): Promise<void> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const existingLike = await this.videoLikesRepository.findOne({
      where: {
        videoId,
        userId,
      },
    });

    if (existingLike) {
      throw new BadRequestException('Already liked this video');
    }

    const like = this.videoLikesRepository.create({
      videoId,
      userId,
    });

    await this.videoLikesRepository.save(like);
    video.likes += 1;
    await this.videosRepository.save(video);
  }

  async unlikeVideo(videoId: string, userId: string): Promise<void> {
    const like = await this.videoLikesRepository.findOne({
      where: {
        videoId,
        userId,
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.videoLikesRepository.remove(like);

    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    video.likes = Math.max(0, video.likes - 1);
    await this.videosRepository.save(video);
  }

  async isLiked(videoId: string, userId: string): Promise<boolean> {
    const like = await this.videoLikesRepository.findOne({
      where: {
        videoId,
        userId,
      },
    });

    return !!like;
  }

  async addComment(
    videoId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<VideoComment> {
    const video = await this.videosRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const comment = this.videoCommentsRepository.create({
      videoId,
      userId,
      ...createCommentDto,
    });

    await this.videoCommentsRepository.save(comment);
    video.comments += 1;
    await this.videosRepository.save(video);

    return comment;
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.videoCommentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    const video = await this.videosRepository.findOne({
      where: { id: comment.videoId },
    });

    await this.videoCommentsRepository.remove(comment);
    video.comments = Math.max(0, video.comments - 1);
    await this.videosRepository.save(video);
  }

  async getComments(
    videoId: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<VideoComment>> {
    const [comments, total] = await this.videoCommentsRepository.findAndCount({
      where: {
        videoId,
        parentCommentId: null,
      },
      relations: ['user'],
      skip: pagination.skip,
      take: pagination.take,
      order: { createdAt: 'DESC' },
    });

    return {
      data: comments,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }

  async searchVideos(
    query: string,
    pagination: PaginationDto,
  ): Promise<IPaginatedResponse<Video>> {
    const [videos, total] = await this.videosRepository
      .createQueryBuilder('video')
      .where('video.status = :status', { status: VideoStatus.PUBLISHED })
      .andWhere(
        '(video.title ILIKE :query OR video.description ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('video.views', 'DESC')
      .skip(pagination.skip)
      .take(pagination.take)
      .getManyAndCount();

    return {
      data: videos,
      total,
      page: pagination.page,
      limit: pagination.take,
      hasMore: pagination.skip + pagination.take < total,
    };
  }
}
