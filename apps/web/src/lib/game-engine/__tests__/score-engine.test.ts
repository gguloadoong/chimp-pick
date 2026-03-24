import { describe, it, expect } from "vitest";
import { calculateScore, computeStats } from "../score-engine";
import type { RoundResult } from "@/types";

describe("calculateScore", () => {
  it("returns 0 for wrong pick", () => {
    expect(calculateScore("UP", "DOWN", 60)).toBe(0);
    expect(calculateScore("DOWN", "UP", 40)).toBe(0);
  });

  it("gives higher score for minority pick", () => {
    // UP 70% vs DOWN 30% → DOWN correct = high score
    const minorityScore = calculateScore("DOWN", "DOWN", 70);
    const majorityScore = calculateScore("UP", "UP", 70);
    expect(minorityScore).toBeGreaterThan(majorityScore);
  });

  it("calculates correct minority bonus", () => {
    // UP 70% vs DOWN 30% → DOWN correct: 100 * (0.7/0.3) = 233
    expect(calculateScore("DOWN", "DOWN", 70)).toBe(233);
    // UP correct: 100 * (0.3/0.7) = 43
    expect(calculateScore("UP", "UP", 70)).toBe(43);
  });

  it("caps at MAX_SCORE (500)", () => {
    // UP 95% vs DOWN 5% → DOWN correct: 100 * (0.95/0.05) = 1900 → capped at 500
    expect(calculateScore("DOWN", "DOWN", 95)).toBe(500);
  });

  it("floors at MIN_SCORE (10) for correct picks", () => {
    // UP 5% vs DOWN 95% → DOWN correct: 100 * (0.05/0.95) = 5 → floored at 10
    expect(calculateScore("DOWN", "DOWN", 5)).toBe(10);
  });

  it("handles 50/50 ratio", () => {
    expect(calculateScore("UP", "UP", 50)).toBe(100);
    expect(calculateScore("DOWN", "DOWN", 50)).toBe(100);
  });
});

describe("computeStats", () => {
  const makeResult = (isCorrect: boolean, score: number): RoundResult => ({
    roundId: crypto.randomUUID(),
    symbol: "BTC-KRW",
    symbolName: "비트코인",
    direction: "UP",
    result: isCorrect ? "UP" : "DOWN",
    isCorrect,
    score,
    upRatio: 50,
    entryPrice: 100,
    exitPrice: 101,
    resolvedAt: new Date().toISOString(),
    questionCategory: "price",
    questionTitle: "BTC 테스트",
    optionA: "UP 🚀",
    optionB: "DOWN 💀",
  });

  it("returns zero stats for empty history", () => {
    const stats = computeStats([]);
    expect(stats.totalRounds).toBe(0);
    expect(stats.wins).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.totalScore).toBe(0);
  });

  it("calculates win rate correctly", () => {
    const history = [makeResult(true, 100), makeResult(false, 0), makeResult(true, 100)];
    const stats = computeStats(history);
    expect(stats.totalRounds).toBe(3);
    expect(stats.wins).toBe(2);
    expect(stats.winRate).toBe(67);
  });

  it("tracks current streak from most recent", () => {
    // Most recent first: W, W, L, W
    const history = [
      makeResult(true, 100),
      makeResult(true, 100),
      makeResult(false, 0),
      makeResult(true, 100),
    ];
    expect(computeStats(history).currentStreak).toBe(2);
  });

  it("tracks max streak (win only)", () => {
    // Chronological: W, W, W, L, W, W (reversed in history array)
    const history = [
      makeResult(true, 100),
      makeResult(true, 100),
      makeResult(false, 0),
      makeResult(true, 100),
      makeResult(true, 100),
      makeResult(true, 100),
    ];
    expect(computeStats(history).maxStreak).toBe(3);
  });

  it("sums total score", () => {
    const history = [makeResult(true, 150), makeResult(true, 200), makeResult(false, 0)];
    expect(computeStats(history).totalScore).toBe(350);
  });
});
