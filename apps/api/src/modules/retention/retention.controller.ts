import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RetentionService } from './retention.service';
import { AuthGuard } from '../../guards/auth.guard';
import type { AuthenticatedRequest } from '../../guards/auth.guard';
import type { MissionType } from './dto/checkin.dto';
import { randomUUID } from 'crypto';

const VALID_MISSION_TYPES = new Set<string>([
  'FIRST_PREDICT',
  'THREE_PREDICTS',
  'SHARE',
]);

function buildResponse(data: unknown) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: randomUUID(),
    },
  };
}

@UseGuards(AuthGuard)
@Controller('retention')
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Post('checkin')
  async checkin(@Req() req: AuthenticatedRequest) {
    const result = await this.retentionService.checkin(req.user.id);
    return buildResponse(result);
  }

  @Get('streak')
  async getStreak(@Req() req: AuthenticatedRequest) {
    const result = await this.retentionService.getStreakInfo(req.user.id);
    return buildResponse(result);
  }

  @Get('missions')
  async getMissions(@Req() req: AuthenticatedRequest) {
    const result = await this.retentionService.getTodayMissions(req.user.id);
    return buildResponse(result);
  }

  @Post('missions/:type/complete')
  async completeMission(
    @Req() req: AuthenticatedRequest,
    @Param('type') type: string,
  ) {
    if (!VALID_MISSION_TYPES.has(type)) {
      return buildResponse({ error: '유효하지 않은 미션 타입입니다.' });
    }
    const result = await this.retentionService.completeMission(
      req.user.id,
      type as MissionType,
    );
    return buildResponse(result);
  }
}
