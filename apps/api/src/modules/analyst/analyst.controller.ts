import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AnalystService } from './analyst.service';

interface ReactBody {
  direction: 'LONG' | 'SHORT';
}

interface GenerateBody {
  character: string;
  eventType?: string;
}

@ApiTags('analyst')
@Controller('analyst')
export class AnalystController {
  private readonly logger = new Logger(AnalystController.name);

  constructor(private readonly analystService: AnalystService) {}

  @Get('posts')
  @ApiOperation({ summary: 'AI 시황 포스트 목록 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '조회 개수 (기본 20)' })
  async getPosts(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('limit은 1~100 사이 정수여야 합니다.');
    }
    const posts = await this.analystService.getPosts(parsedLimit);
    return {
      success: true,
      data: posts,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    };
  }

  @Post('posts/:id/react')
  @ApiOperation({ summary: '포스트 동조/반박 반응 (LONG/SHORT)' })
  @ApiHeader({ name: 'x-user-id', description: 'Sprint 3 Mock — 임시 유저 식별자', required: true })
  @ApiBody({ schema: { properties: { direction: { type: 'string', enum: ['LONG', 'SHORT'] } } } })
  async reactToPost(
    @Param('id') postId: string,
    @Body() body: ReactBody,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id 헤더가 필요합니다.');
    }
    if (body.direction !== 'LONG' && body.direction !== 'SHORT') {
      throw new BadRequestException('direction은 LONG 또는 SHORT이어야 합니다.');
    }

    const result = await this.analystService.reactToPost(userId, postId, body.direction);
    return {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    };
  }

  @Post('generate')
  @ApiOperation({ summary: '[개발용] AI 시황 포스트 생성 트리거' })
  @ApiBody({
    schema: {
      properties: {
        character: { type: 'string', enum: ['LONG', 'SHORT', 'NEUTRAL', 'WAVE'] },
        eventType: { type: 'string', example: 'FOMC' },
      },
    },
  })
  async generatePost(@Body() body: GenerateBody) {
    if (!body.character) {
      throw new BadRequestException('character는 필수입니다.');
    }

    this.logger.log(`generatePost 트리거 — character=${body.character}, eventType=${body.eventType}`);
    const post = await this.analystService.generatePost(body.character, body.eventType);
    return {
      success: true,
      data: post,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
    };
  }
}
