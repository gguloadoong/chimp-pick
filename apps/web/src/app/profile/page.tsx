"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { formatWinRate, formatBanana } from "@/lib/format";
import type { UserStats } from "@/types";
import { AVATAR_LEVELS } from "@/types";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<UserStats>("/users/me/stats");
        setStats(data);
      } catch {
        // 에러 시 null 유지
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const currentAvatar = AVATAR_LEVELS.find(
    (a) => a.level === (user?.avatarLevel || 1)
  );
  const nextAvatar = AVATAR_LEVELS.find(
    (a) => a.level === (user?.avatarLevel || 1) + 1
  );

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <ChimpCharacter mood="idle" size={80} className="animate-float" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary space-y-4 px-4 pb-20 pt-6">
      {/* 프로필 카드 */}
      <div className="rounded-3xl bg-white p-6 text-center border-2 border-card-border clay">
        <div className="animate-float inline-block">
          <ChimpCharacter mood="idle" size={80} />
        </div>
        <p className="mt-2 text-sm text-banana font-heading font-semibold">
          Lv.{user.avatarLevel} {currentAvatar?.name}
        </p>
        <h2 className="mt-1 text-xl font-heading font-bold text-text-primary">
          {user.nickname}
        </h2>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-banana/12 border-2 border-banana/30 px-5 py-2 clay-sm">
          <span className="text-lg">🍌</span>
          <span className="font-mono text-xl font-bold text-banana">
            {formatBanana(user.bananaCoins)}
          </span>
        </div>

        {/* 다음 진화까지 */}
        {nextAvatar && stats && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-secondary font-sans mb-1">
              <span>다음 진화: {nextAvatar.emoji} {nextAvatar.name}</span>
              <span className="font-semibold">{stats.wins}/{nextAvatar.minWins}승</span>
            </div>
            <div className="h-3 rounded-full bg-banana/12 border border-card-border overflow-hidden">
              <div
                className="h-full rounded-full bg-banana transition-all"
                style={{
                  width: `${Math.min(100, (stats.wins / nextAvatar.minWins) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 전적 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-text-secondary font-sans animate-pulse">
            전적 불러오는 중... 🍌
          </span>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="총 예측" value={`${stats.totalPredictions}전`} />
            <StatCard label="승/패" value={`${stats.wins}/${stats.losses}`} color="default" />
            <StatCard
              label="승률"
              value={formatWinRate(stats.winRate)}
              color={stats.winRate >= 50 ? "up" : "down"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="현재 연승"
              value={`${stats.currentStreak}연승`}
              color={stats.currentStreak >= 3 ? "up" : "default"}
              emoji={stats.currentStreak >= 3 ? "🔥" : undefined}
            />
            <StatCard label="최고 연승" value={`${stats.maxStreak}연승`} emoji="👑" />
          </div>

          <div className="rounded-3xl bg-white p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-secondary font-sans">총 수익</p>
            <p
              className={`mt-1 font-mono text-2xl font-bold ${
                stats.profitLoss >= 0 ? "text-up" : "text-down"
              }`}
            >
              {stats.profitLoss >= 0 ? "+" : ""}
              {formatBanana(stats.profitLoss)} 🍌
            </p>
          </div>
        </>
      ) : null}

      {/* 로그아웃 */}
      <button
        onClick={logout}
        className={[
          "w-full rounded-2xl border-2 border-card-border bg-white py-3",
          "text-sm text-text-secondary font-sans font-semibold",
          "transition-all hover:border-down/40 hover:text-down clay-sm btn-clay",
        ].join(" ")}
        data-testid="logout-button"
      >
        로그아웃
      </button>

      <BottomNav />
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "default",
  emoji,
}: {
  label: string;
  value: string;
  color?: "default" | "up" | "down";
  emoji?: string;
}) {
  const colorClass =
    color === "up"
      ? "text-up"
      : color === "down"
        ? "text-down"
        : "text-text-primary";

  return (
    <div className="rounded-2xl bg-white p-3 text-center border-2 border-card-border clay-sm">
      <p className="text-xs text-text-secondary font-sans font-medium">{label}</p>
      <p className={`mt-1 font-mono text-lg font-bold ${colorClass}`}>
        {emoji && <span className="mr-1">{emoji}</span>}
        {value}
      </p>
    </div>
  );
}
