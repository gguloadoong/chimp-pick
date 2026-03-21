"use client";

import { useMemo, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { computeStats } from "@/lib/game-engine";
import { formatWinRate } from "@/lib/format";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function StatsPage() {
  const roundHistory = useGameStore((s) => s.roundHistory);
  const totalScore = useGameStore((s) => s.totalScore);
  const stats = useMemo(() => computeStats(roundHistory), [roundHistory]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const cats = { price: { total: 0, wins: 0 }, fun: { total: 0, wins: 0 }, trivia: { total: 0, wins: 0 } };
    for (const r of roundHistory) {
      const cat = r.symbol ? "price" : "fun"; // simplified categorization
      cats[cat].total++;
      if (r.isCorrect) cats[cat].wins++;
    }
    return cats;
  }, [roundHistory]);

  // Daily scores (last 7 days)
  const [now] = useState(() => Date.now());
  const dailyScores = useMemo(() => {
    const days: { label: string; score: number; rounds: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400_000);
      const dateStr = d.toDateString();
      const dayResults = roundHistory.filter((r) => new Date(r.resolvedAt).toDateString() === dateStr);
      const score = dayResults.reduce((s, r) => s + r.score, 0);
      days.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        score,
        rounds: dayResults.length,
      });
    }
    return days;
  }, [roundHistory, now]);

  const maxDailyScore = Math.max(1, ...dailyScores.map((d) => d.score));

  // Speed round stats
  const speedStats = useMemo(() => {
    const speed = roundHistory.filter((r) => r.score > 0 && r.isCorrect);
    return { total: speed.length };
  }, [roundHistory]);

  return (
    <div className="flex flex-col flex-1 bg-bg-primary">
      <main className="flex-1 pb-20">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h1 className="text-xl font-heading font-bold text-text-primary">통계</h1>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-mono font-bold text-banana tabular-nums">{totalScore.toLocaleString()}</p>
                <p className="text-xs text-text-secondary font-sans">총 점수</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-text-primary tabular-nums">{stats.totalRounds}</p>
                <p className="text-xs text-text-secondary font-sans">총 라운드</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-up tabular-nums">{formatWinRate(stats.winRate)}</p>
                <p className="text-xs text-text-secondary font-sans">승률</p>
              </div>
            </div>
          </div>

          {/* Daily chart */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">일별 점수 (최근 7일)</p>
            <div className="flex items-end gap-2 h-24">
              {dailyScores.map((d) => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-mono text-banana font-bold tabular-nums">
                    {d.score > 0 ? d.score : ""}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-banana/20 transition-all duration-300 min-h-[4px]"
                    style={{ height: `${Math.max(4, (d.score / maxDailyScore) * 80)}px` }}
                  >
                    <div
                      className="w-full rounded-t-lg bg-banana transition-all duration-300"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary font-sans">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">카테고리별 승률</p>
            <div className="space-y-3">
              {([
                { key: "price", label: "📈 시세 예측", stats: categoryStats.price },
                { key: "fun", label: "🎲 재미 예측", stats: categoryStats.fun },
                { key: "trivia", label: "🧠 상식 퀴즈", stats: categoryStats.trivia },
              ] as const).map(({ key, label, stats: cs }) => {
                const rate = cs.total > 0 ? Math.round((cs.wins / cs.total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-text-primary font-sans">{label}</span>
                      <span className="text-xs text-text-secondary font-sans">
                        {cs.wins}/{cs.total} ({rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-card-border rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-banana transition-all duration-300"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Records */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">기록</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-bg-primary text-center">
                <p className="text-lg font-bold font-mono text-banana tabular-nums">{stats.maxStreak}</p>
                <p className="text-xs text-text-secondary font-sans">최고 연승</p>
              </div>
              <div className="p-3 rounded-2xl bg-bg-primary text-center">
                <p className="text-lg font-bold font-mono text-up tabular-nums">{speedStats.total}</p>
                <p className="text-xs text-text-secondary font-sans">총 적중</p>
              </div>
              <div className="p-3 rounded-2xl bg-bg-primary text-center">
                <p className="text-lg font-bold font-mono text-text-primary tabular-nums">{stats.currentStreak}</p>
                <p className="text-xs text-text-secondary font-sans">현재 연승</p>
              </div>
              <div className="p-3 rounded-2xl bg-bg-primary text-center">
                <p className="text-lg font-bold font-mono text-text-primary tabular-nums">
                  {stats.totalRounds > 0 ? Math.round(totalScore / stats.totalRounds) : 0}
                </p>
                <p className="text-xs text-text-secondary font-sans">평균 점수</p>
              </div>
            </div>
          </div>

          {roundHistory.length === 0 && (
            <div className="py-8 text-center">
              <ChimpCharacter mood="thinking" size={64} className="mx-auto mb-3" />
              <p className="text-sm text-text-secondary font-sans">
                라운드에 참여하면 통계가 쌓여요!
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
