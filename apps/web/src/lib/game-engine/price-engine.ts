/**
 * Client-side mock price engine
 * Generates realistic-looking price movements in the browser
 */

import { SYMBOLS } from "@/types";

const MOCK_PRICES: Record<string, number> = {
  "BTC-KRW": 95234000,
  "ETH-KRW": 4520000,
  "DOGE-KRW": 280,
  "SHIB-KRW": 0.015,
  "XRP-KRW": 890,
  "005930": 72500,
  "000660": 185000,
  "035420": 210000,
  "035720": 52000,
  "068270": 180000,
};

interface PriceState {
  current: number;
  open24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updatedAt: string;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Round price to appropriate precision based on magnitude */
function roundPrice(price: number): number {
  if (price < 1) return Math.round(price * 10000) / 10000; // 0.0150
  if (price < 100) return Math.round(price * 10) / 10;      // 280.5
  return Math.round(price);                                   // 185000
}

const priceStates: Map<string, PriceState> = new Map();
// 실시간 WS 데이터가 있는 심볼 — mock tick 생성 제외
const liveSymbols: Set<string> = new Set();
let tickInterval: ReturnType<typeof setInterval> | null = null;
const listeners: Set<() => void> = new Set();

function initPrices() {
  if (priceStates.size > 0) return;
  for (const [symbol, price] of Object.entries(MOCK_PRICES)) {
    const spread = price * 0.01;
    priceStates.set(symbol, {
      current: price,
      open24h: price - spread * (Math.random() - 0.5) * 2,
      high24h: price + spread * Math.random(),
      low24h: price - spread * Math.random(),
      volume24h: price * (Math.random() * 1000 + 500),
    });
  }
}

function generateTick(symbol: string): number {
  const state = priceStates.get(symbol);
  if (!state) return 0;

  const changeRatio = (Math.random() - 0.5) * 0.002; // ±0.1% per tick (realistic)
  state.current = state.current * (1 + changeRatio);

  if (state.current > state.high24h) state.high24h = state.current;
  if (state.current < state.low24h) state.low24h = state.current;
  state.volume24h += state.current * (Math.random() * 10 + 1);

  return state.current;
}

export function getPrice(symbol: string): PriceData {
  initPrices();
  const state = priceStates.get(symbol);
  if (!state) {
    return {
      symbol,
      price: 0,
      change24h: 0,
      changePct24h: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const change24h = state.current - state.open24h;
  const changePct24h = (change24h / state.open24h) * 100;

  return {
    symbol,
    price: roundPrice(state.current),
    change24h: roundPrice(change24h),
    changePct24h,
    high24h: roundPrice(state.high24h),
    low24h: roundPrice(state.low24h),
    volume24h: Math.round(state.volume24h),
    updatedAt: new Date().toISOString(),
  };
}

export function getCurrentPrice(symbol: string): number {
  initPrices();
  return priceStates.get(symbol)?.current ?? 0;
}

export function generateCandles(
  symbol: string,
  timeframe: string,
  count: number,
): Candle[] {
  initPrices();
  const state = priceStates.get(symbol);
  const basePrice = state?.current ?? (MOCK_PRICES[symbol] ?? 100);

  const msPerCandle: Record<string, number> = {
    "1m": 60_000,
    "5m": 300_000,
    "15m": 900_000,
    "1h": 3_600_000,
    "4h": 14_400_000,
    "1d": 86_400_000,
  };

  const interval = msPerCandle[timeframe] ?? msPerCandle["1m"];
  const candles: Candle[] = [];
  let price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const changeRatio = (Math.random() - 0.5) * 0.02;
    const close = open * (1 + changeRatio);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = basePrice * (Math.random() * 100 + 10);

    candles.push({
      time: Math.floor((now - i * interval) / 1000),
      open,
      high,
      low,
      close,
      volume,
    });

    price = close;
  }

  return candles;
}

export function startPriceEngine(intervalMs = 2000): () => void {
  initPrices();
  if (!tickInterval) {
    tickInterval = setInterval(() => {
      for (const symbol of priceStates.keys()) {
        // 실시간 WS 데이터가 있는 심볼은 mock tick 생략
        if (!liveSymbols.has(symbol)) generateTick(symbol);
      }
      for (const listener of listeners) {
        listener();
      }
    }, intervalMs);
  }

  return () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };
}

export function onPriceUpdate(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// WS 심볼("BTC") → 엔진 심볼("BTC-KRW") 매핑
const WS_TO_ENGINE: Record<string, string> = {
  BTC: "BTC-KRW",
  ETH: "ETH-KRW",
  XRP: "XRP-KRW",
  DOGE: "DOGE-KRW",
  SOL: "SOL-KRW",
};

/**
 * WebSocket price:tick 이벤트 수신 시 호출.
 * 엔진의 priceState를 실제 업비트 데이터로 덮어쓴다.
 */
export function injectLivePrice(
  wsSymbol: string,
  price: number,
  change: number,
  _changePercent: number, // changePct24h는 getPrice()에서 재계산
): void {
  initPrices();
  // 매핑 테이블에 없는 심볼은 "BTC-KRW" 형식으로 자동 변환
  const engineSymbol =
    WS_TO_ENGINE[wsSymbol] ??
    (wsSymbol.includes("-") ? wsSymbol : `${wsSymbol}-KRW`);

  liveSymbols.add(engineSymbol); // mock tick 제외 등록

  let state = priceStates.get(engineSymbol);
  if (!state) {
    state = {
      current: price,
      open24h: price - change,
      high24h: price,
      low24h: price,
      volume24h: 0,
    };
    priceStates.set(engineSymbol, state);
  } else {
    state.current = price;
    state.open24h = price - change;
    // 현재 세션 내 최고/최저가 (실제 24h 데이터가 없으므로 세션 기준)
    if (price > state.high24h) state.high24h = price;
    if (price < state.low24h) state.low24h = price;
  }
  for (const listener of listeners) listener();
}

export function getSymbolName(symbol: string): string {
  return SYMBOLS.find((s) => s.symbol === symbol)?.nameKr ?? symbol;
}

export type { PriceData, Candle };
