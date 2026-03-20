"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { computeStats } from "@/lib/game-engine";
import { formatWinRate, formatBanana, formatRelativeTime } from "@/lib/format";
import { AVATAR_LEVELS } from "@/types";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { predictionHistory, bananaCoins } = useGameStore();

  const stats = useMemo(
    () => computeStats(predictionHistory),
    [predictionHistory],
  );

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
      {/* Profile card */}
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
            {formatBanana(bananaCoins)}
          </span>
        </div>

        {/* Evolution progress */}
        {nextAvatar && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-secondary font-sans mb-1">
              <span>다음 진화: {nextAvatar.name}</span>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="총 예측" value={`${stats.totalPredictions}전`} />
        <StatCard label="승/패" value={`${stats.wins}/${stats.losses}`} />
        <StatCard
          label="승률"
          value={formatWinRate(stats.winRate)}
          color={stats.winRate >= 50 ? "up" : stats.totalPredictions > 0 ? "down" : "default"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="현재 연승"
          value={stats.currentStreak > 0 ? `${stats.currentStreak}연승` : stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}연패` : "-"}
          color={stats.currentStreak >= 3 ? "up" : stats.currentStreak <= -3 ? "down" : "default"}
        />
        <StatCard label="최고 연승" value={stats.maxStreak > 0 ? `${stats.maxStreak}연승` : "-"} />
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

      {/* Prediction history */}
      {predictionHistory.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-heading font-bold text-text-primary px-1">
            최근 예측 기록
          </h3>
          {predictionHistory.slice(0, 20).map((pred) => (
            <div
              key={pred.id}
              className={[
                "rounded-2xl p-3 flex items-center gap-3 border-2 bg-white clay-sm",
                pred.result === "WIN" ? "border-up/30" : "border-down/30",
              ].join(" ")}
            >
              <ChimpCharacter
                mood={pred.result === "WIN" ? "win" : "lose"}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={[
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    pred.direction === "UP"
                      ? "bg-up/10 text-up"
                      : "bg-down/10 text-down",
                  ].join(" ")}>
                    {pred.direction}
                  </span>
                  <span className="text-xs text-text-secondary font-sans truncate">
                    {pred.symbol}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary font-sans mt-0.5">
                  {formatRelativeTime(pred.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className={[
                  "font-mono text-sm font-bold tabular-nums",
                  pred.result === "WIN" ? "text-up" : "text-down",
                ].join(" ")}>
                  {pred.result === "WIN"
                    ? `+${formatBanana(pred.reward ?? 0)}`
                    : `-${formatBanana(pred.betAmount)}`}
                </p>
                <p className="text-[10px] text-text-secondary">🍌</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {predictionHistory.length === 0 && (
        <div className="rounded-3xl bg-white p-8 border-2 border-card-border clay text-center">
          <ChimpCharacter mood="thinking" size={64} className="mx-auto" />
          <p className="mt-3 text-sm text-text-secondary font-sans">
            아직 예측 기록이 없어요
          </p>
          <p className="text-xs text-text-secondary font-sans mt-1">
            첫 예측을 해보세요!
          </p>
        </div>
      )}

      {/* Logout */}
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
}: {
  label: string;
  value: string;
  color?: "default" | "up" | "down";
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
        {value}
      </p>
    </div>
  );
}
