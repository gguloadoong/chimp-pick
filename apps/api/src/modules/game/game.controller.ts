import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
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

@Controller('predictions')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createPrediction(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      symbol: string;
      direction: string;
      timeframe: string;
      betAmount: number;
    },
  ) {
    const prediction = await this.gameService.createPrediction(req.user.id, body);
    return buildResponse(prediction);
  }

  @UseGuards(AuthGuard)
  @Get('active')
  async getActivePrediction(@Req() req: AuthenticatedRequest) {
    const prediction = await this.gameService.getActivePrediction(req.user.id);
    return buildResponse(prediction);
  }

  @UseGuards(AuthGuard)
  @Get('history')
  async getPredictionHistory(
    @Req() req: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.gameService.getUserPredictions(
      req.user.id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
    return buildResponse(result);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getPrediction(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const prediction = await this.gameService.getPrediction(req.user.id, id);
    return buildResponse(prediction ?? null);
  }
}
