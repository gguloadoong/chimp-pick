import { Injectable } from '@nestjs/common';
import { UpbitService } from './upbit.service';
import { PriceUpdatePayload } from '../../gateway/socket.gateway';
import { generateCandles, Candle } from '../../mock/price-generator';

@Injectable()
export class PriceService {
  constructor(private readonly upbit: UpbitService) {}

  getCurrentPrice(symbol: string): PriceUpdatePayload | null {
    return this.upbit.getLatestPrice(symbol);
  }

  getAllPrices(): PriceUpdatePayload[] {
    return this.upbit.getAllLatestPrices();
  }

  // Candle history: mock until TimescaleDB aggregation is implemented (Sprint 2)
  getCandles(symbol: string, timeframe: string, limit: number): Candle[] {
    return generateCandles(symbol, timeframe, limit);
  }
}
