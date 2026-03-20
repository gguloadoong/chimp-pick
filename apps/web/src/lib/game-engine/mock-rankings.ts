/**
 * Mock NPC ranking data for client-side display
 */

import type { RankingEntry, UserStats } from "@/types";

const NPC_RANKINGS: RankingEntry[] = [
  { rank: 1, userId: "npc-1", nickname: "킹콩트레이더", avatarLevel: 4, winRate: 70.59, totalPredictions: 85, profit: 1200 },
  { rank: 2, userId: "npc-2", nickname: "가즈아전사", avatarLevel: 3, winRate: 66.67, totalPredictions: 42, profit: 350 },
  { rank: 3, userId: "npc-3", nickname: "비트코인마스터", avatarLevel: 3, winRate: 63.16, totalPredictions: 38, profit: 280 },
  { rank: 4, userId: "npc-4", nickname: "떡상마스터", avatarLevel: 2, winRate: 55.0, totalPredictions: 20, profit: 80 },
  { rank: 5, userId: "npc-5", nickname: "코인원숭이", avatarLevel: 2, winRate: 53.33, totalPredictions: 30, profit: 60 },
  { rank: 6, userId: "npc-6", nickname: "침착한침팬지", avatarLevel: 2, winRate: 52.0, totalPredictions: 25, profit: 40 },
  { rank: 7, userId: "npc-7", nickname: "바나나수집가", avatarLevel: 1, winRate: 48.0, totalPredictions: 50, profit: -20 },
  { rank: 8, userId: "npc-8", nickname: "존버의달인", avatarLevel: 1, winRate: 45.0, totalPredictions: 40, profit: -80 },
  { rank: 9, userId: "npc-9", nickname: "물타기장인", avatarLevel: 1, winRate: 40.0, totalPredictions: 10, profit: -50 },
  { rank: 10, userId: "npc-10", nickname: "손절장인", avatarLevel: 1, winRate: 20.0, totalPredictions: 15, profit: -450 },
];

export function getRankings(localStats: UserStats | null): RankingEntry[] {
  const rankings = [...NPC_RANKINGS];

  if (localStats && localStats.totalPredictions > 0) {
    const localEntry: RankingEntry = {
      rank: 0,
      userId: "local-user",
      nickname: "나",
      avatarLevel: 1,
      winRate: localStats.winRate,
      totalPredictions: localStats.totalPredictions,
      profit: localStats.profitLoss,
    };
    rankings.push(localEntry);
  }

  rankings.sort((a, b) => b.profit - a.profit);
  rankings.forEach((r, i) => (r.rank = i + 1));

  return rankings;
}

export function computeStats(predictions: Array<{ result: string; betAmount: number; reward: number | null }>): UserStats {
  const resolved = predictions.filter((p) => p.result !== "PENDING");
  const wins = resolved.filter((p) => p.result === "WIN").length;
  const losses = resolved.filter((p) => p.result === "LOSE").length;
  const totalPredictions = resolved.length;
  const winRate = totalPredictions > 0 ? parseFloat(((wins / totalPredictions) * 100).toFixed(2)) : 0;

  let currentStreak = 0;
  for (let i = resolved.length - 1; i >= 0; i--) {
    const r = resolved[i];
    if (i === resolved.length - 1) {
      currentStreak = r.result === "WIN" ? 1 : -1;
    } else {
      if (r.result === "WIN" && currentStreak > 0) currentStreak++;
      else if (r.result === "LOSE" && currentStreak < 0) currentStreak--;
      else break;
    }
  }

  let maxStreak = 0;
  let winStreak = 0;
  for (const r of resolved) {
    if (r.result === "WIN") {
      winStreak++;
      if (winStreak > maxStreak) maxStreak = winStreak;
    } else {
      winStreak = 0;
    }
  }

  const profitLoss = resolved.reduce((sum, p) => {
    if (p.result === "WIN") return sum + ((p.reward ?? 0) - p.betAmount);
    return sum - p.betAmount;
  }, 0);

  return {
    totalPredictions,
    wins,
    losses,
    winRate,
    currentStreak,
    maxStreak,
    profitLoss,
  };
}
