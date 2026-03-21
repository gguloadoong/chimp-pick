/**
 * Round Engine — manages the round lifecycle
 * WAITING → OPEN → CLOSED → RESOLVED → WAITING ...
 */

import {
  SYMBOLS,
  ROUND_OPEN_MS,
  ROUND_RESOLVE_DELAY_MS,
  ROUND_BREAK_MS,
  type Round,
  type RoundPhase,
  type Direction,
} from "@/types";
import { getPrice } from "./price-engine";

let currentRound: Round | null = null;
let roundTimer: ReturnType<typeof setTimeout> | null = null;
const listeners: Set<(round: Round) => void> = new Set();

function generateId(): string {
  return crypto.randomUUID();
}

/** Pick a random symbol for the next round */
function pickRandomSymbol() {
  const idx = Math.floor(Math.random() * SYMBOLS.length);
  return SYMBOLS[idx];
}

/** Generate NPC up ratio (40-75% range, slight bias toward 55%) */
function generateNpcRatio(): number {
  const base = 45 + Math.random() * 25; // 45-70
  const noise = (Math.random() - 0.5) * 10;
  return Math.round(Math.max(25, Math.min(75, base + noise)));
}

function notify(round: Round) {
  for (const fn of listeners) {
    fn(round);
  }
}

function transitionTo(phase: RoundPhase) {
  if (!currentRound) return;
  currentRound = { ...currentRound, phase };
  notify(currentRound);
}

/** Start a new round */
function startNewRound() {
  const symbol = pickRandomSymbol();
  const price = getPrice(symbol.symbol);
  const now = Date.now();

  currentRound = {
    id: generateId(),
    symbol: symbol.symbol,
    symbolName: symbol.nameKr,
    category: symbol.category,
    entryPrice: price.price,
    exitPrice: null,
    result: null,
    phase: "OPEN",
    opensAt: new Date(now).toISOString(),
    closesAt: new Date(now + ROUND_OPEN_MS).toISOString(),
    resolvesAt: new Date(now + ROUND_OPEN_MS + ROUND_RESOLVE_DELAY_MS).toISOString(),
    upRatio: generateNpcRatio(),
  };

  notify(currentRound);

  // Schedule close
  roundTimer = setTimeout(() => {
    closeRound();
  }, ROUND_OPEN_MS);
}

/** Close predictions and resolve */
function closeRound() {
  if (!currentRound || currentRound.phase !== "OPEN") return;

  transitionTo("CLOSED");

  // Resolve after delay
  roundTimer = setTimeout(() => {
    resolveRound();
  }, ROUND_RESOLVE_DELAY_MS);
}

/** Resolve round: determine result */
function resolveRound() {
  if (!currentRound || currentRound.phase !== "CLOSED") return;

  const price = getPrice(currentRound.symbol);
  const exitPrice = price.price;
  const result: Direction = exitPrice >= currentRound.entryPrice ? "UP" : "DOWN";

  currentRound = {
    ...currentRound,
    phase: "RESOLVED",
    exitPrice,
    result,
  };

  notify(currentRound);

  // Schedule next round after break
  roundTimer = setTimeout(() => {
    transitionTo("WAITING");
    roundTimer = setTimeout(() => {
      startNewRound();
    }, 500);
  }, ROUND_BREAK_MS);
}

/** Start the round engine loop */
export function startRoundEngine(): () => void {
  if (currentRound) {
    return () => {
      if (roundTimer) {
        clearTimeout(roundTimer);
        roundTimer = null;
      }
    };
  }

  startNewRound();

  return () => {
    if (roundTimer) {
      clearTimeout(roundTimer);
      roundTimer = null;
    }
    currentRound = null;
    listeners.clear();
  };
}

/** Subscribe to round state changes */
export function onRoundUpdate(listener: (round: Round) => void): () => void {
  listeners.add(listener);
  // Send current state immediately
  if (currentRound) {
    listener(currentRound);
  }
  return () => listeners.delete(listener);
}

/** Get current round */
export function getCurrentRound(): Round | null {
  return currentRound;
}
