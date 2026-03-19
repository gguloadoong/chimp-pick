import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  getPrice,
  getAllPrices,
  generateCandles,
  startPriceUpdater,
  PriceData,
  Candle,
} from '../../mock/price-generator';

@Injectable()
export class PriceService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.timer = startPriceUpdater(2000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  getCurrentPrice(symbol: string): PriceData {
    return getPrice(symbol);
  }

  getAllPrices(): PriceData[] {
    return getAllPrices();
  }

  getCandles(symbol: string, timeframe: string, limit: number): Candle[] {
    return generateCandles(symbol, timeframe, limit);
  }
}
