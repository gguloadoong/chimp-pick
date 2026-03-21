"use client";

import { useMemo, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";
import { getRankings } from "@/lib/game-engine";
import { formatWinRate } from "@/lib/format";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={20} className="text-banana" />;
  if (rank === 2) return <Medal size={20} className="text-gray-400" />;
  if (rank === 3) return <Award size={20} className="text-amber-600" />;
  return <span className="w-5 text-center text-sm font-mono font-bold text-text-secondary">{rank}</span>;
}

export default function RankingPage() {
  const roundHistory = useGameStore((s) => s.roundHistory);
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<"all" | "today">("all");

  const todayHistory = useMemo(() => {
    const today = new Date().toDateString();
    return roundHistory.filter((r) => new Date(r.resolvedAt).toDateString() === today);
  }, [roundHistory]);

  const activeHistory = tab === "today" ? todayHistory : roundHistory;

  const rankings = useMemo(
    () => getRankings(activeHistory, user?.nickname ?? "나"),
    [activeHistory, user?.nickname],
  );

  const myRank = rankings.find((r) => r.userId === "local-user");

  return (
    <div className="flex flex-col flex-1 bg-bg-primary">
      <main className="flex-1 pb-20">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-banana" />
            <h1 className="text-xl font-heading font-bold text-text-primary">리더보드</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["all", "today"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "flex-1 py-2 rounded-2xl text-sm font-bold font-sans border-2 transition-all btn-clay",
                  tab === t
                    ? "border-banana text-banana bg-banana/12 clay-sm"
                    : "border-card-border text-text-secondary bg-white hover:border-banana/40",
                ].join(" ")}
              >
                {t === "all" ? "전체" : "오늘"}
              </button>
            ))}
          </div>

          {/* My rank card */}
          {myRank && (
            <div className="bg-banana/10 rounded-3xl p-4 border-2 border-banana/30 clay">
              <div className="flex items-center gap-3">
                <ChimpCharacter mood="idle" size={48} />
                <div className="flex-1">
                  <p className="font-heading font-bold text-text-primary">{myRank.nickname}</p>
                  <p className="text-xs text-text-secondary font-sans">
                    {myRank.wins}승 / {myRank.totalRounds}전 · 승률 {formatWinRate(myRank.winRate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold text-banana tabular-nums">{myRank.rank}위</p>
                  <p className="text-xs font-mono text-banana/70 tabular-nums">{myRank.totalScore.toLocaleString()}점</p>
                </div>
              </div>
            </div>
          )}

          {/* Ranking list */}
          <div className="bg-white rounded-3xl border-2 border-card-border clay overflow-hidden">
            {rankings.map((entry) => {
              const isMe = entry.userId === "local-user";
              return (
                <div
                  key={entry.userId}
                  className={[
                    "flex items-center gap-3 px-4 py-3 border-b border-card-border/50 last:border-b-0",
                    isMe ? "bg-banana/5" : "",
                  ].join(" ")}
                >
                  <RankIcon rank={entry.rank} />
                  <div className="flex-1 min-w-0">
                    <p className={[
                      "text-sm font-sans font-semibold truncate",
                      isMe ? "text-banana" : "text-text-primary",
                    ].join(" ")}>
                      {entry.nickname} {isMe && "👈"}
                    </p>
                    <p className="text-xs text-text-secondary font-sans">
                      {entry.wins}승 / {entry.totalRounds}전 · {formatWinRate(entry.winRate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={[
                      "font-mono font-bold tabular-nums text-sm",
                      isMe ? "text-banana" : "text-text-primary",
                    ].join(" ")}>
                      {entry.totalScore.toLocaleString()}
                    </p>
                    <p className="text-xs text-text-secondary font-sans">점</p>
                  </div>
                </div>
              );
            })}

            {rankings.length === 0 && (
              <div className="py-12 text-center">
                <ChimpCharacter mood="thinking" size={64} className="mx-auto mb-3" />
                <p className="text-text-secondary text-sm font-sans">
                  아직 참여자가 없어요. 첫 라운드에 참여해보세요!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
