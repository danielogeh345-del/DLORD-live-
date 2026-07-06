import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StreamingService } from './streaming.service';
import { CreateStreamDto, UpdateStreamDto } from './dtos/stream.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { PaginationDto } from '@common/dtos/pagination.dto';

@ApiTags('streaming')
@Controller('api/streams')
export class StreamingController {
  constructor(private streamingService: StreamingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  async createStream(
    @CurrentUser() user: IAuthPayload,
    @Body() createStreamDto: CreateStreamDto,
  ) {
    const stream = await this.streamingService.createStream(
      user.id,
      createStreamDto,
    );
    return {
      statusCode: 201,
      message: 'Stream created',
      data: stream,
    };
  }

  @Post(':streamId/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async startStream(
    @CurrentUser() user: IAuthPayload,
    @Param('streamId') streamId: string,
  ) {
    const stream = await this.streamingService.startStream(streamId, user.id);
    return {
      statusCode: 200,
      message: 'Stream started',
      data: stream,
    };
  }

  @Post(':streamId/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async endStream(
    @CurrentUser() user: IAuthPayload,
    @Param('streamId') streamId: string,
  ) {
    const stream = await this.streamingService.endStream(streamId, user.id);
    return {
      statusCode: 200,
      message: 'Stream ended',
      data: stream,
    };
  }

  @Get('live')
  async getLiveStreams(@Query() pagination: PaginationDto) {
    const result = await this.streamingService.getLiveStreams(pagination);
    return {
      statusCode: 200,
      message: 'Live streams retrieved',
      data: result,
    };
  }

  @Get(':streamId')
  async getStream(@Param('streamId') streamId: string) {
    const stream = await this.streamingService.getStream(streamId);
    return {
      statusCode: 200,
      message: 'Stream retrieved',
      data: stream,
    };
  }

  @Post(':streamId/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async joinStream(
    @CurrentUser() user: IAuthPayload,
    @Param('streamId') streamId: string,
  ) {
    await this.streamingService.joinStream(streamId, user.id);
    return {
      statusCode: 200,
      message: 'Joined stream',
    };
  }

  @Post(':streamId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async leaveStream(
    @CurrentUser() user: IAuthPayload,
    @Param('streamId') streamId: string,
  ) {
    await this.streamingService.leaveStream(streamId, user.id);
    return {
      statusCode: 200,
      message: 'Left stream',
    };
  }
}
