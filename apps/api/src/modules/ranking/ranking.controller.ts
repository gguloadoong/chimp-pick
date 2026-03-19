import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { AuthGuard } from '../../guards/auth.guard';
import type { AuthenticatedRequest } from '../../guards/auth.guard';
import { generateId } from '../../mock/data';

function buildResponse(data: unknown) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
    },
  };
}

@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  getRankings(
    @Query('period') period = 'weekly',
    @Query('limit') limit = '100',
  ) {
    const rankings = this.rankingService.getRankings(
      period,
      parseInt(limit, 10),
    );
    return buildResponse(rankings);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMyRank(
    @Req() req: AuthenticatedRequest,
    @Query('period') period = 'weekly',
  ) {
    const rank = this.rankingService.getMyRank(req.user.id, period);
    return buildResponse(rank);
  }
}
