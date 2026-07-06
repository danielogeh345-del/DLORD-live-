import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { Stream } from './entities/stream.entity';
import { StreamViewer } from './entities/stream-viewer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, StreamViewer])],
  controllers: [StreamingController],
  providers: [StreamingService],
  exports: [StreamingService],
})
export class StreamingModule {}
