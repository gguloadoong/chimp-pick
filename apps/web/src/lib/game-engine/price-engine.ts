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

const priceStates: Map<string, PriceState> = new Map();
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

  const changeRatio = (Math.random() - 0.5) * 0.01;
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
    price: state.current,
    change24h,
    changePct24h,
    high24h: state.high24h,
    low24h: state.low24h,
    volume24h: state.volume24h,
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
  if (tickInterval) return () => {};

  tickInterval = setInterval(() => {
    for (const symbol of priceStates.keys()) {
      generateTick(symbol);
    }
    for (const listener of listeners) {
      listener();
    }
  }, intervalMs);

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

export function getSymbolName(symbol: string): string {
  return SYMBOLS.find((s) => s.symbol === symbol)?.nameKr ?? symbol;
}

export type { PriceData, Candle };
