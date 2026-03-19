import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RewardService } from './reward.service';
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

@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @UseGuards(AuthGuard)
  @Post('daily')
  claimDailyBonus(@Req() req: AuthenticatedRequest) {
    const result = this.rewardService.claimDailyBonus(req.user.id);
    return buildResponse(result);
  }

  @UseGuards(AuthGuard)
  @Get('transactions')
  getTransactions(
    @Req() req: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = this.rewardService.getTransactions(
      req.user.id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return buildResponse(result);
  }
}
