/**
 * Title Engine — achievement-based titles
 */

import type { RoundResult } from "@/types";

export interface Title {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (stats: TitleStats) => boolean;
}

interface TitleStats {
  totalRounds: number;
  wins: number;
  maxStreak: number;
  totalScore: number;
  minorityWins: number;
  categoryWins: { price: number; fun: number; trivia: number };
}

const TITLES: Title[] = [
  { id: "first-win", name: "첫 적중", description: "첫 번째 예측 성공", emoji: "🎯", condition: (s) => s.wins >= 1 },
  { id: "10-rounds", name: "단골 침팬지", description: "10라운드 참여", emoji: "🦍", condition: (s) => s.totalRounds >= 10 },
  { id: "50-rounds", name: "예측 중독자", description: "50라운드 참여", emoji: "🔥", condition: (s) => s.totalRounds >= 50 },
  { id: "streak-3", name: "연승 입문", description: "3연승 달성", emoji: "⚡", condition: (s) => s.maxStreak >= 3 },
  { id: "streak-5", name: "연승의 달인", description: "5연승 달성", emoji: "💫", condition: (s) => s.maxStreak >= 5 },
  { id: "streak-10", name: "무적 침팬지", description: "10연승 달성", emoji: "👑", condition: (s) => s.maxStreak >= 10 },
  { id: "score-1000", name: "천점 돌파", description: "누적 1,000점 달성", emoji: "🏅", condition: (s) => s.totalScore >= 1000 },
  { id: "score-5000", name: "만점 사냥꾼", description: "누적 5,000점 달성", emoji: "🏆", condition: (s) => s.totalScore >= 5000 },
  { id: "score-10000", name: "전설의 예측가", description: "누적 10,000점 달성", emoji: "✨", condition: (s) => s.totalScore >= 10000 },
  { id: "minority-5", name: "역배 도전자", description: "소수파로 5회 적중", emoji: "🎲", condition: (s) => s.minorityWins >= 5 },
  { id: "minority-20", name: "소수파의 왕", description: "소수파로 20회 적중", emoji: "💎", condition: (s) => s.minorityWins >= 20 },
  { id: "trivia-master", name: "상식왕 침팬지", description: "상식 퀴즈 10회 적중", emoji: "🧠", condition: (s) => s.categoryWins.trivia >= 10 },
  { id: "fun-master", name: "재미 예측왕", description: "재미 예측 10회 적중", emoji: "🎪", condition: (s) => s.categoryWins.fun >= 10 },
  { id: "price-master", name: "시세 분석가", description: "시세 예측 20회 적중", emoji: "📈", condition: (s) => s.categoryWins.price >= 20 },
];

export function computeTitleStats(history: RoundResult[], totalScore: number): TitleStats {
  const wins = history.filter((r) => r.isCorrect);

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

  const minorityWins = wins.filter((r) => {
    const isMinority =
      (r.direction === "UP" && r.upRatio < 50) ||
      (r.direction === "DOWN" && r.upRatio >= 50);
    return isMinority;
  }).length;

  const categoryWins = { price: 0, fun: 0, trivia: 0 };
  for (const r of wins) {
    // Determine category from symbol: price questions have symbols
    if (r.symbol) categoryWins.price++;
    else categoryWins.fun++; // Can't distinguish fun/trivia from history, count as fun
  }

  return {
    totalRounds: history.length,
    wins: wins.length,
    maxStreak,
    totalScore,
    minorityWins,
    categoryWins,
  };
}

export function getEarnedTitles(stats: TitleStats): Title[] {
  return TITLES.filter((t) => t.condition(stats));
}

export function getAllTitles(): Title[] {
  return TITLES;
}
