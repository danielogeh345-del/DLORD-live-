import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto, CreateCommentDto } from './dtos/video.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@ApiTags('videos')
@Controller('api/videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  async createVideo(
    @CurrentUser() user: IAuthPayload,
    @Body() createVideoDto: CreateVideoDto,
  ) {
    const video = await this.videosService.createVideo(
      user.id,
      createVideoDto,
    );
    return {
      statusCode: 201,
      message: 'Video created',
      data: video,
    };
  }

  @Post(':videoId/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async publishVideo(
    @CurrentUser() user: IAuthPayload,
    @Param('videoId') videoId: string,
  ) {
    const video = await this.videosService.publishVideo(videoId, user.id);
    return {
      statusCode: 200,
      message: 'Video published',
      data: video,
    };
  }

  @Put(':videoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateVideo(
    @CurrentUser() user: IAuthPayload,
    @Param('videoId') videoId: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    const video = await this.videosService.updateVideo(
      videoId,
      user.id,
      updateVideoDto,
    );
    return {
      statusCode: 200,
      message: 'Video updated',
      data: video,
    };
  }

  @Delete(':videoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteVideo(
    @CurrentUser() user: IAuthPayload,
    @Param('videoId') videoId: string,
  ) {
    await this.videosService.deleteVideo(videoId, user.id);
    return {
      statusCode: 204,
      message: 'Video deleted',
    };
  }

  @Get('feed')
  async getFeed(@Query() pagination: PaginationDto) {
    const result = await this.videosService.getFeed(
      'system',
      pagination,
    );
    return {
      statusCode: 200,
      message: 'Feed retrieved',
      data: result,
    };
  }

  @Get(':videoId')
  async getVideo(@Param('videoId') videoId: string) {
    const video = await this.videosService.getVideo(videoId);
    return {
      statusCode: 200,
      message: 'Video retrieved',
      data: video,
    };
  }

  @Post(':videoId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async likeVideo(
    @CurrentUser() user: IAuthPayload,
    @Param('videoId') videoId: string,
  ) {
    await this.videosService.likeVideo(videoId, user.id);
    return {
      statusCode: 200,
      message: 'Video liked',
    };
  }

  @Post(':videoId/unlike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async unlikeVideo(
    @CurrentUser() user: IAuthPayload,
    @Param('videoId') videoId: string,
  ) {
    await this.videosService.unlikeVideo(videoId, user.id);
    return {
      statusCode: 200,
      message: 'Video unliked',
    };
  }

  @Post(':videoId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  async addComment(
    @CurrentUser() user: IAuthPayload,
    @Param('videoId') videoId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.videosService.addComment(
      videoId,
      user.id,
      createCommentDto,
    );
    return {
      statusCode: 201,
      message: 'Comment added',
      data: comment,
    };
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteComment(
    @CurrentUser() user: IAuthPayload,
    @Param('commentId') commentId: string,
  ) {
    await this.videosService.deleteComment(commentId, user.id);
    return {
      statusCode: 204,
      message: 'Comment deleted',
    };
  }

  @Get(':videoId/comments')
  async getComments(
    @Param('videoId') videoId: string,
    @Query() pagination: PaginationDto,
  ) {
    const comments = await this.videosService.getComments(videoId, pagination);
    return {
      statusCode: 200,
      message: 'Comments retrieved',
      data: comments,
    };
  }

  @Get('search')
  async searchVideos(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    const results = await this.videosService.searchVideos(query, pagination);
    return {
      statusCode: 200,
      message: 'Search results',
      data: results,
    };
  }
}
