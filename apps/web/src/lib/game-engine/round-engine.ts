/**
 * Round Engine — manages the round lifecycle
 * WAITING → OPEN → CLOSED → RESOLVED → WAITING ...
 */

import {
  ROUND_RESOLVE_DELAY_MS,
  ROUND_BREAK_MS,
  type Round,
  type RoundPhase,
  type Direction,
} from "@/types";
import { getPrice } from "./price-engine";
import { generateQuestion, resolveQuestion } from "./question-provider";

let currentRound: Round | null = null;
let roundTimer: ReturnType<typeof setTimeout> | null = null;
const listeners: Set<(round: Round) => void> = new Set();
let configuredOpenMs = 30_000;

function generateId(): string {
  return crypto.randomUUID();
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
const SPEED_ROUND_CHANCE = 0.1;
const SPEED_ROUND_MS = 10_000;

function startNewRound() {
  const question = generateQuestion();
  const now = Date.now();
  const isSpeed = Math.random() < SPEED_ROUND_CHANCE;
  const roundMs = isSpeed ? SPEED_ROUND_MS : configuredOpenMs;

  const entryPrice = question.symbol
    ? getPrice(question.symbol).price
    : 0;

  currentRound = {
    id: generateId(),
    symbol: question.symbol ?? "",
    symbolName: question.symbolName ?? "",
    category: question.symbol ? (question.symbol.includes("-") ? "crypto" : "stock") : "crypto",
    entryPrice,
    exitPrice: null,
    result: null,
    phase: "OPEN",
    opensAt: new Date(now).toISOString(),
    closesAt: new Date(now + roundMs).toISOString(),
    resolvesAt: new Date(now + roundMs + ROUND_RESOLVE_DELAY_MS).toISOString(),
    upRatio: generateNpcRatio(),
    questionCategory: question.category,
    questionEmoji: question.categoryEmoji,
    questionLabel: question.categoryLabel,
    questionTitle: isSpeed ? `⚡ ${question.title}` : question.title,
    questionDesc: isSpeed ? "스피드 라운드! 10초 안에 선택하세요!" : question.description,
    optionA: question.optionA,
    optionB: question.optionB,
    isSpeedRound: isSpeed,
  };

  notify(currentRound);

  // Schedule close
  roundTimer = setTimeout(() => {
    closeRound();
  }, roundMs);
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

  let exitPrice: number;
  let result: Direction;

  if (currentRound.questionCategory === "price" && currentRound.symbol) {
    const price = getPrice(currentRound.symbol);
    exitPrice = price.price;
    result = exitPrice >= currentRound.entryPrice ? "UP" : "DOWN";
  } else {
    // Fun/trivia: resolve via question provider (random)
    const qResult = resolveQuestion({
      id: currentRound.id,
      category: currentRound.questionCategory,
      categoryLabel: currentRound.questionLabel,
      categoryEmoji: currentRound.questionEmoji,
      title: currentRound.questionTitle,
      description: currentRound.questionDesc,
      optionA: currentRound.optionA,
      optionB: currentRound.optionB,
    });
    exitPrice = 0;
    result = qResult.answer === "A" ? "UP" : "DOWN";
  }

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

/** Set round duration in seconds */
export function setRoundDuration(seconds: number) {
  configuredOpenMs = seconds * 1000;
}

/** Start the round engine loop */
export function startRoundEngine(durationSeconds?: number): () => void {
  if (durationSeconds) configuredOpenMs = durationSeconds * 1000;
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
