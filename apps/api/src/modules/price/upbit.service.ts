import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { SocketGateway, PriceUpdatePayload } from '../../gateway/socket.gateway';

const UPBIT_WS_URL = 'wss://api.upbit.com/websocket/v1';

const SYMBOLS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-SOL', 'KRW-DOGE'];

// Map Upbit codes to our symbol names
const CODE_TO_SYMBOL: Record<string, string> = {
  'KRW-BTC': 'BTC',
  'KRW-ETH': 'ETH',
  'KRW-XRP': 'XRP',
  'KRW-SOL': 'SOL',
  'KRW-DOGE': 'DOGE',
};

interface UpbitTicker {
  type: string;
  code: string;
  trade_price: number;
  signed_change_price: number;
  signed_change_rate: number;
  timestamp: number;
}

@Injectable()
export class UpbitService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(UpbitService.name);
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnects = 5;

  // In-memory latest price cache
  private priceCache = new Map<string, PriceUpdatePayload>();

  constructor(private readonly gateway: SocketGateway) {}

  onApplicationBootstrap() {
    this.connect();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  getLatestPrice(symbol: string): PriceUpdatePayload | null {
    return this.priceCache.get(symbol) ?? null;
  }

  getAllLatestPrices(): PriceUpdatePayload[] {
    return Array.from(this.priceCache.values());
  }

  private connect() {
    this.logger.log('Connecting to Upbit WebSocket...');
    const ws = new WebSocket(UPBIT_WS_URL);
    this.ws = ws;

    ws.on('open', () => {
      this.logger.log('Upbit WS connected');
      this.reconnectAttempts = 0;
      this.subscribe();
    });

    ws.on('message', (data: WebSocket.RawData) => {
      this.handleMessage(data);
    });

    ws.on('error', (err) => {
      this.logger.error(`Upbit WS error: ${err.message}`);
    });

    ws.on('close', () => {
      this.logger.warn('Upbit WS disconnected');
      this.scheduleReconnect();
    });
  }

  private subscribe() {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const payload = JSON.stringify([
      { ticket: `chimppick-${Date.now()}` },
      { type: 'ticker', codes: SYMBOLS },
    ]);

    ws.send(payload);
    this.logger.log(`Subscribed to: ${SYMBOLS.join(', ')}`);
  }

  private handleMessage(raw: WebSocket.RawData) {
    try {
      const text = raw.toString();
      const ticker: UpbitTicker = JSON.parse(text) as UpbitTicker;

      if (ticker.type !== 'ticker') return;

      const symbol = CODE_TO_SYMBOL[ticker.code];
      if (!symbol) return;

      const payload: PriceUpdatePayload = {
        symbol,
        price: ticker.trade_price,
        change: ticker.signed_change_price,
        changePercent: Math.round(ticker.signed_change_rate * 10000) / 100,
        timestamp: new Date(ticker.timestamp).toISOString(),
      };

      this.priceCache.set(symbol, payload);
      this.gateway.broadcastPrice(payload);
    } catch (err) {
      this.logger.debug(`Failed to handle Upbit WS message: ${err}`);
    }
  }

  private scheduleReconnect() {
    const isFastPhase = this.reconnectAttempts < this.maxReconnects;
    const delay = isFastPhase
      ? Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
      : 60_000; // 5회 초과 후 60초 주기 무한 재시도

    this.reconnectAttempts++;

    if (isFastPhase) {
      this.logger.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnects})`);
    } else {
      this.logger.warn(`Max fast-reconnects exceeded. Retrying every 60s (attempt ${this.reconnectAttempts})`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private cleanup() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.terminate();
    }
  }
}
