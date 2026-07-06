import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { Video } from './entities/video.entity';
import { VideoLike } from './entities/video-like.entity';
import { VideoComment } from './entities/video-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, VideoLike, VideoComment])],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
