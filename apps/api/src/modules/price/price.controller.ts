import { Controller, Get, Param, Query } from '@nestjs/common';
import { PriceService } from './price.service';
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

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  getAllPrices() {
    return buildResponse(this.priceService.getAllPrices());
  }

  @Get(':symbol')
  getPrice(@Param('symbol') symbol: string) {
    return buildResponse(this.priceService.getCurrentPrice(symbol));
  }

  @Get(':symbol/candles')
  getCandles(
    @Param('symbol') symbol: string,
    @Query('timeframe') timeframe = '1m',
    @Query('limit') limit = '60',
  ) {
    const candles = this.priceService.getCandles(
      symbol,
      timeframe,
      parseInt(limit, 10),
    );
    return buildResponse(candles);
  }
}
