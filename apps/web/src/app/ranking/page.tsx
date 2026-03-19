"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatWinRate } from "@/lib/format";
import type { RankingEntry, RankingPeriod } from "@/types";
import { AVATAR_LEVELS } from "@/types";
import BottomNav from "@/components/ui/BottomNav";

const PERIOD_TABS: { value: RankingPeriod; label: string }[] = [
  { value: "daily", label: "일간" },
  { value: "weekly", label: "주간" },
  { value: "monthly", label: "월간" },
  { value: "all", label: "전체" },
];

export default function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>("weekly");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [myRank, setMyRank] = useState<RankingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const [rankData, myData] = await Promise.all([
          api.get<RankingEntry[]>(`/rankings?period=${period}&limit=100`),
          api.get<RankingEntry>("/rankings/me").catch(() => null),
        ]);
        setRankings(rankData);
        setMyRank(myData);
      } catch {
        // 에러 시 빈 배열
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, [period]);

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getAvatarEmoji = (level: number) => {
    return AVATAR_LEVELS.find((a) => a.level === level)?.emoji || "🐒";
  };

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-bg-primary/90 px-4 pb-3 pt-6 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-text-primary">🏆 랭킹</h1>

        {/* 탭 */}
        <div className="mt-3 flex gap-1 rounded-xl bg-bg-secondary p-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPeriod(tab.value)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                period === tab.value
                  ? "bg-banana text-bg-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              data-testid={`ranking-tab-${tab.value}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 랭킹 리스트 */}
      <div className="flex-1 space-y-2 px-4 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-text-secondary">
              침팬지가 순위 계산 중... 🍌
            </span>
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <span className="text-4xl">🦍</span>
            <p className="mt-2">아직 랭킹 데이터가 없어요</p>
            <p className="text-sm">예측을 시작해보세요!</p>
          </div>
        ) : (
          rankings.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                entry.rank <= 3
                  ? "bg-banana/10 border border-banana/20"
                  : "bg-bg-secondary"
              }`}
              data-testid={`ranking-entry-${entry.rank}`}
            >
              <span className="w-10 text-center text-lg font-bold">
                {getRankEmoji(entry.rank)}
              </span>
              <span className="text-xl">{getAvatarEmoji(entry.avatarLevel)}</span>
              <div className="flex-1">
                <p className="font-medium text-text-primary">{entry.nickname}</p>
                <p className="text-xs text-text-secondary">
                  {entry.totalPredictions}전 | 승률 {formatWinRate(entry.winRate)}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-mono text-sm font-bold ${
                    entry.profit >= 0 ? "text-up" : "text-down"
                  }`}
                >
                  {entry.profit >= 0 ? "+" : ""}
                  {entry.profit} 🍌
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 내 순위 고정 바 */}
      {myRank && (
        <div className="fixed bottom-16 left-0 right-0 border-t border-banana/20 bg-bg-primary/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 text-center text-sm font-bold text-banana">
              #{myRank.rank}
            </span>
            <span className="text-xl">
              {getAvatarEmoji(myRank.avatarLevel)}
            </span>
            <div className="flex-1">
              <p className="font-medium text-banana">{myRank.nickname} (나)</p>
              <p className="text-xs text-text-secondary">
                승률 {formatWinRate(myRank.winRate)}
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-banana">
              {myRank.profit >= 0 ? "+" : ""}
              {myRank.profit} 🍌
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
