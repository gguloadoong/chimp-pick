/**
 * Score Engine — minority bonus calculation
 *
 * Formula:
 *   base = 100
 *   if correct:
 *     score = base × (majorityRatio / minorityRatio)
 *     capped at 500
 *   if wrong:
 *     score = 0
 *
 * Example: UP 70% vs DOWN 30%
 *   DOWN correct → 100 × (0.7 / 0.3) = 233 pts
 *   UP correct   → 100 × (0.3 / 0.7) = 43 pts
 */

import type { Direction, RoundResult } from "@/types";

const BASE_SCORE = 100;
const MAX_SCORE = 500;
const MIN_SCORE = 10;

export function calculateScore(
  pick: Direction,
  result: Direction,
  upRatio: number,
): number {
  if (pick !== result) return 0;

  const upFrac = upRatio / 100;
  const downFrac = 1 - upFrac;

  const myFrac = pick === "UP" ? upFrac : downFrac;
  const otherFrac = pick === "UP" ? downFrac : upFrac;

  if (myFrac <= 0) return MAX_SCORE;
  if (otherFrac <= 0) return MIN_SCORE;

  const score = Math.round(BASE_SCORE * (otherFrac / myFrac));
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

/** Compute user stats from round history */
export function computeStats(history: RoundResult[]) {
  const total = history.length;
  const wins = history.filter((r) => r.isCorrect).length;
  const losses = total - wins;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalScore = history.reduce((sum, r) => sum + r.score, 0);

  // Current streak (from most recent)
  let currentStreak = 0;
  for (const r of history) {
    if (r.isCorrect) currentStreak++;
    else break;
  }

  // Max win streak
  let maxStreak = 0;
  let streak = 0;
  for (const r of [...history].reverse()) {
    if (r.isCorrect) {
      streak++;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 0;
    }
  }

  return {
    totalRounds: total,
    wins,
    losses,
    winRate,
    currentStreak,
    maxStreak,
    totalScore,
  };
}
