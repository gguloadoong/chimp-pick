import { Injectable } from '@nestjs/common';
import { users, findUserStats } from '../../mock/data';

export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatarLevel: number;
  bananaCoins: number;
  totalPredictions: number;
  wins: number;
  winRate: number;
  profit: number;
  currentStreak: number;
}

@Injectable()
export class RankingService {
  getRankings(period: string, limit: number): RankingEntry[] {
    const entries: RankingEntry[] = users.map((user) => {
      const stats = findUserStats(user.id);
      return {
        rank: 0,
        userId: user.id,
        nickname: user.nickname,
        avatarLevel: user.avatarLevel,
        bananaCoins: user.bananaCoins,
        totalPredictions: stats.totalPredictions,
        wins: stats.wins,
        winRate: stats.winRate,
        profit: stats.profitLoss,
        currentStreak: stats.currentStreak,
      };
    });

    entries.sort((a, b) => b.profit - a.profit);

    return entries.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  getMyRank(userId: string, period: string): RankingEntry | null {
    const rankings = this.getRankings(period, users.length);
    return rankings.find((r) => r.userId === userId) ?? null;
  }
}
