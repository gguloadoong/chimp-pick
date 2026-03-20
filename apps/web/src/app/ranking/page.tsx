"use client";

import { useMemo } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { getRankings, computeStats } from "@/lib/game-engine";
import { formatWinRate, formatBanana } from "@/lib/format";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

const RANK_ICONS = [
  { icon: Trophy, color: "text-banana" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
];

export default function RankingPage() {
  const predictionHistory = useGameStore((s) => s.predictionHistory);

  const localStats = useMemo(
    () => computeStats(predictionHistory),
    [predictionHistory],
  );

  const rankings = useMemo(
    () => getRankings(localStats.totalPredictions > 0 ? localStats : null),
    [localStats],
  );

  const myRank = rankings.find((r) => r.userId === "local-user");

  return (
    <div className="min-h-screen bg-bg-primary px-4 pb-20 pt-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          랭킹 🏆
        </h1>
        <p className="text-sm text-text-secondary font-sans mt-1">
          침팬지들의 예측 실력 대결
        </p>
      </div>

      {/* My rank card */}
      {myRank && (
        <div className="rounded-3xl bg-banana/10 border-2 border-banana/30 p-4 clay">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ChimpCharacter
                mood={localStats.winRate >= 50 ? "win" : "idle"}
                size={56}
              />
              <span className="absolute -top-1 -right-1 bg-banana text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {myRank.rank}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-text-primary">내 순위</p>
              <p className="text-sm text-text-secondary font-sans">
                {localStats.totalPredictions}전 {localStats.wins}승 {localStats.losses}패
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-banana text-lg">
                {formatBanana(myRank.profit)} 🍌
              </p>
              <p className="text-xs text-text-secondary font-sans">
                승률 {formatWinRate(myRank.winRate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rankings list */}
      <div className="space-y-2">
        {rankings.map((entry) => {
          const isMe = entry.userId === "local-user";
          const RankIcon = entry.rank <= 3 ? RANK_ICONS[entry.rank - 1] : null;

          return (
            <div
              key={entry.userId}
              className={[
                "rounded-2xl p-3 flex items-center gap-3 border-2",
                isMe
                  ? "bg-banana/8 border-banana/30 clay"
                  : "bg-white border-card-border clay-sm",
              ].join(" ")}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {RankIcon ? (
                  <RankIcon.icon
                    size={22}
                    className={RankIcon.color}
                    aria-label={`${entry.rank}위`}
                  />
                ) : (
                  <span className="text-sm font-mono font-bold text-text-secondary">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={[
                  "font-sans font-semibold text-sm truncate",
                  isMe ? "text-banana" : "text-text-primary",
                ].join(" ")}>
                  {isMe ? `${entry.nickname} (나)` : entry.nickname}
                </p>
                <p className="text-xs text-text-secondary font-sans">
                  {entry.totalPredictions}전 · 승률 {formatWinRate(entry.winRate)}
                </p>
              </div>

              {/* Profit */}
              <div className="text-right">
                <p className={[
                  "font-mono text-sm font-bold tabular-nums",
                  entry.profit >= 0 ? "text-up" : "text-down",
                ].join(" ")}>
                  {entry.profit >= 0 ? "+" : ""}{formatBanana(entry.profit)}
                </p>
                <p className="text-[10px] text-text-secondary font-sans">🍌</p>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
