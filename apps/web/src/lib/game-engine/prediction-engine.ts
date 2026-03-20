/**
 * Client-side prediction engine
 * Handles prediction creation, resolution, and history
 */

import { getCurrentPrice } from "./price-engine";
import type { Direction, Timeframe, Prediction } from "@/types";
import { BET_MULTIPLIER } from "@/types";

/** Actual wait time per timeframe (shortened for game feel) */
const TIMEFRAME_DELAY_MS: Record<Timeframe, number> = {
  "1m": 10_000,
  "5m": 30_000,
  "1h": 60_000,
  "1d": 120_000,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createPrediction(
  symbol: string,
  direction: Direction,
  timeframe: Timeframe,
  betAmount: number,
): Prediction {
  const entryPrice = getCurrentPrice(symbol);
  const delayMs = TIMEFRAME_DELAY_MS[timeframe];
  const expiresAt = new Date(Date.now() + delayMs).toISOString();

  return {
    id: generateId(),
    userId: "local-user",
    symbol,
    direction,
    timeframe,
    betAmount,
    entryPrice,
    exitPrice: null,
    result: "PENDING",
    reward: null,
    createdAt: new Date().toISOString(),
    expiresAt,
    resolvedAt: null,
  };
}

export function resolvePrediction(prediction: Prediction): Prediction {
  if (prediction.result !== "PENDING") return prediction;

  const exitPrice = getCurrentPrice(prediction.symbol);
  const isUp = exitPrice >= prediction.entryPrice;
  const won =
    (prediction.direction === "UP" && isUp) ||
    (prediction.direction === "DOWN" && !isUp);

  const result = won ? "WIN" : "LOSE";
  const reward = won ? Math.floor(prediction.betAmount * BET_MULTIPLIER) : 0;

  return {
    ...prediction,
    exitPrice,
    result,
    reward,
    resolvedAt: new Date().toISOString(),
  };
}

export function isPredictionExpired(prediction: Prediction): boolean {
  if (prediction.result !== "PENDING") return false;
  return Date.now() >= new Date(prediction.expiresAt).getTime();
}

export function getTimeRemaining(prediction: Prediction): number {
  const expiresAt = new Date(prediction.expiresAt).getTime();
  return Math.max(0, expiresAt - Date.now());
}
