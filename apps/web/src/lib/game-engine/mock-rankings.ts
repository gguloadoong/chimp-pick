/**
 * Mock NPC rankings for client-side leaderboard
 */

import type { RankingEntry, RoundResult } from "@/types";
import { computeStats } from "./score-engine";

interface NpcPlayer {
  userId: string;
  nickname: string;
  avatarLevel: number;
  baseScore: number;
  baseWins: number;
  baseTotal: number;
}

const NPC_PLAYERS: NpcPlayer[] = [
  { userId: "npc-1", nickname: "코인킹침팬지", avatarLevel: 4, baseScore: 4200, baseWins: 38, baseTotal: 52 },
  { userId: "npc-2", nickname: "풀매수원숭이", avatarLevel: 3, baseScore: 3800, baseWins: 35, baseTotal: 50 },
  { userId: "npc-3", nickname: "다이아핸드", avatarLevel: 3, baseScore: 3500, baseWins: 30, baseTotal: 48 },
  { userId: "npc-4", nickname: "떡상기원사", avatarLevel: 2, baseScore: 3100, baseWins: 28, baseTotal: 45 },
  { userId: "npc-5", nickname: "비트맥시멀", avatarLevel: 2, baseScore: 2800, baseWins: 25, baseTotal: 42 },
  { userId: "npc-6", nickname: "가즈아침팬지", avatarLevel: 2, baseScore: 2400, baseWins: 22, baseTotal: 40 },
  { userId: "npc-7", nickname: "역배의달인", avatarLevel: 1, baseScore: 2100, baseWins: 20, baseTotal: 38 },
  { userId: "npc-8", nickname: "물타기장인", avatarLevel: 1, baseScore: 1800, baseWins: 18, baseTotal: 36 },
  { userId: "npc-9", nickname: "손절못하는숭", avatarLevel: 1, baseScore: 1400, baseWins: 15, baseTotal: 34 },
  { userId: "npc-10", nickname: "바나나수집가", avatarLevel: 1, baseScore: 1000, baseWins: 12, baseTotal: 30 },
];

export function getRankings(localHistory: RoundResult[], userNickname: string): RankingEntry[] {
  const stats = computeStats(localHistory);

  const entries: RankingEntry[] = NPC_PLAYERS.map((npc) => ({
    rank: 0,
    userId: npc.userId,
    nickname: npc.nickname,
    avatarLevel: npc.avatarLevel,
    totalScore: npc.baseScore,
    wins: npc.baseWins,
    totalRounds: npc.baseTotal,
    winRate: Math.round((npc.baseWins / npc.baseTotal) * 100),
  }));

  // Add local user
  if (localHistory.length > 0) {
    entries.push({
      rank: 0,
      userId: "local-user",
      nickname: userNickname,
      avatarLevel: 1,
      totalScore: stats.totalScore,
      wins: stats.wins,
      totalRounds: stats.totalRounds,
      winRate: stats.winRate,
    });
  }

  // Sort by total score descending
  entries.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}
