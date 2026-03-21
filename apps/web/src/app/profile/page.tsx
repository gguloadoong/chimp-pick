"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { computeStats } from "@/lib/game-engine";
import { formatWinRate, formatRelativeTime } from "@/lib/format";
import { AVATAR_LEVELS } from "@/types";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const roundHistory = useGameStore((s) => s.roundHistory);
  const totalScore = useGameStore((s) => s.totalScore);

  const stats = useMemo(() => computeStats(roundHistory), [roundHistory]);

  const avatarLevel = AVATAR_LEVELS.reduce((best, lvl) => {
    return stats.wins >= lvl.minWins ? lvl : best;
  }, AVATAR_LEVELS[0]);

  const recentHistory = roundHistory.slice(0, 20);

  return (
    <div className="flex flex-col flex-1 bg-bg-primary">
      <main className="flex-1 pb-20">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6 flex flex-col gap-4">
          {/* Profile card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-card-border clay text-center">
            <ChimpCharacter mood="idle" size={80} level={avatarLevel.level} className="mx-auto mb-3" />
            <h1 className="text-xl font-heading font-bold text-text-primary">
              {user?.nickname ?? "침팬지"}
            </h1>
            <p className="text-sm text-banana font-semibold font-sans mt-1">
              {avatarLevel.emoji} {avatarLevel.name} (Lv.{avatarLevel.level})
            </p>
          </div>

          {/* Score + Stats */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <div className="text-center mb-4">
              <p className="text-xs text-text-secondary font-sans mb-1">총 점수</p>
              <p className="text-3xl font-mono font-bold text-banana tabular-nums">
                {totalScore.toLocaleString()}
                <span className="text-sm text-banana/70 ml-1">점</span>
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="text-center py-2 rounded-2xl bg-bg-primary">
                <p className="text-lg font-bold font-mono tabular-nums text-text-primary">{stats.totalRounds}</p>
                <p className="text-xs text-text-secondary font-sans">참여</p>
              </div>
              <div className="text-center py-2 rounded-2xl bg-up/8">
                <p className="text-lg font-bold font-mono tabular-nums text-up">{stats.wins}</p>
                <p className="text-xs text-text-secondary font-sans">적중</p>
              </div>
              <div className="text-center py-2 rounded-2xl bg-bg-primary">
                <p className="text-lg font-bold font-mono tabular-nums text-text-primary">
                  {formatWinRate(stats.winRate)}
                </p>
                <p className="text-xs text-text-secondary font-sans">승률</p>
              </div>
              <div className="text-center py-2 rounded-2xl bg-banana/8">
                <p className="text-lg font-bold font-mono tabular-nums text-banana">{stats.maxStreak}</p>
                <p className="text-xs text-text-secondary font-sans">최고연승</p>
              </div>
            </div>
          </div>

          {/* Streak */}
          {stats.currentStreak > 0 && (
            <div className="bg-banana/10 rounded-2xl p-3 border-2 border-banana/30 text-center">
              <p className="font-heading font-bold text-banana text-sm">
                🔥 현재 {stats.currentStreak}연승 중!
              </p>
            </div>
          )}

          {/* History */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">라운드 히스토리</p>

            {recentHistory.length === 0 ? (
              <div className="py-8 text-center">
                <ChimpCharacter mood="thinking" size={56} className="mx-auto mb-2" />
                <p className="text-sm text-text-secondary font-sans">
                  아직 참여한 라운드가 없어요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentHistory.map((r) => (
                  <div
                    key={r.roundId}
                    className={[
                      "flex items-center gap-3 p-3 rounded-2xl border",
                      r.isCorrect ? "bg-up/5 border-up/15" : "bg-down/5 border-down/15",
                    ].join(" ")}
                  >
                    <span className="text-lg">{r.isCorrect ? "✅" : "❌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-semibold text-text-primary truncate">
                        {r.symbolName}
                        <span className="text-xs text-text-secondary ml-2">
                          {r.direction === "UP" ? "🚀 UP" : "💀 DOWN"}
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary font-sans">
                        {formatRelativeTime(r.resolvedAt)} · UP {r.upRatio}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={[
                        "font-mono font-bold tabular-nums text-sm",
                        r.isCorrect ? "text-up" : "text-down",
                      ].join(" ")}>
                        {r.isCorrect ? `+${r.score}` : "0"}
                      </p>
                      <p className="text-xs text-text-secondary font-sans">점</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
