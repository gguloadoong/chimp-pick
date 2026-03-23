"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { computeStats, computeTitleStats, getEarnedTitles, getAllTitles } from "@/lib/game-engine";
import { formatWinRate, formatRelativeTime } from "@/lib/format";
import { AVATAR_LEVELS } from "@/types";
import BottomNav from "@/components/ui/BottomNav";
import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setNickname = useAuthStore((s) => s.setNickname);
  const getInviteUrl = useAuthStore((s) => s.getInviteUrl);
  const [copied, setCopied] = useState("");
  const [editingNick, setEditingNick] = useState(false);
  const [nickInput, setNickInput] = useState("");
  const roundHistory = useGameStore((s) => s.roundHistory);
  const totalScore = useGameStore((s) => s.totalScore);
  const attendance = useGameStore((s) => s.attendance);
  const selectedTitle = useGameStore((s) => s.selectedTitle);
  const setSelectedTitle = useGameStore((s) => s.setSelectedTitle);

  const stats = useMemo(() => computeStats(roundHistory), [roundHistory]);

  const avatarLevel = AVATAR_LEVELS.reduce((best, lvl) => {
    return stats.wins >= lvl.minWins ? lvl : best;
  }, AVATAR_LEVELS[0]);

  const nextLevel = AVATAR_LEVELS.find((l) => l.level === avatarLevel.level + 1);
  const xpProgress = nextLevel
    ? Math.min(100, Math.round(((stats.wins - avatarLevel.minWins) / (nextLevel.minWins - avatarLevel.minWins)) * 100))
    : 100;

  const titleStats = useMemo(() => computeTitleStats(roundHistory, totalScore), [roundHistory, totalScore]);
  const earnedTitles = useMemo(() => getEarnedTitles(titleStats), [titleStats]);
  const allTitles = getAllTitles();
  const activeTitleObj = earnedTitles.find((t) => t.id === selectedTitle);

  // Recent performance: last 20 results as win/loss dots
  const recentResults = roundHistory.slice(0, 20);

  return (
    <div className="flex flex-col flex-1 bg-bg-primary">
      <main className="flex-1 pb-20">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-6 flex flex-col gap-4">
          {/* Profile card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-card-border clay text-center">
            <ChimpCharacter mood="idle" size={80} level={avatarLevel.level} className="mx-auto mb-3" />
            {editingNick ? (
              <div className="flex items-center gap-2 justify-center">
                <input
                  value={nickInput}
                  onChange={(e) => setNickInput(e.target.value)}
                  maxLength={12}
                  className="text-center text-lg font-heading font-bold bg-bg-primary border-2 border-banana rounded-xl px-3 py-1 w-36 outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { setNickname(nickInput); setEditingNick(false); }
                    if (e.key === "Escape") setEditingNick(false);
                  }}
                />
                <button
                  onClick={() => { setNickname(nickInput); setEditingNick(false); }}
                  className="text-xs text-banana font-bold"
                >✓</button>
              </div>
            ) : (
              <button
                onClick={() => { setNickInput(user?.nickname ?? ""); setEditingNick(true); }}
                className="text-xl font-heading font-bold text-text-primary hover:text-banana transition-colors"
              >
                {user?.nickname ?? "침팬지"} ✏️
              </button>
            )}
            <p className="text-sm text-banana font-semibold font-sans mt-1">
              {avatarLevel.emoji} {avatarLevel.name} (Lv.{avatarLevel.level})
            </p>
            {activeTitleObj && (
              <p className="text-xs text-text-secondary font-sans mt-1">
                {activeTitleObj.emoji} {activeTitleObj.name}
              </p>
            )}

            {/* XP Progress bar */}
            {nextLevel && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-text-secondary font-sans mb-1">
                  <span>다음 레벨까지</span>
                  <span>{stats.wins - avatarLevel.minWins} / {nextLevel.minWins - avatarLevel.minWins}승</span>
                </div>
                <div className="w-full bg-card-border rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full bg-banana transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary font-sans">📅 출석</p>
                <p className="text-xs text-text-secondary font-sans">
                  총 {attendance.totalDays}일 · {attendance.streak}일 연속
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={[
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                      i < attendance.streak
                        ? "bg-banana text-white font-bold"
                        : "bg-card-border text-text-secondary",
                    ].join(" ")}
                  >
                    {i < attendance.streak ? "✓" : (i + 1)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invite + Share */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">🔗 친구 초대</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try { await navigator.clipboard.writeText(getInviteUrl()); setCopied("invite"); setTimeout(() => setCopied(""), 2000); } catch {}
                }}
                className="flex-1 py-2.5 rounded-2xl bg-banana/10 border-2 border-banana/30 text-banana text-sm font-bold font-sans btn-clay"
              >
                {copied === "invite" ? "복사됨! ✅" : "초대 링크 복사 📋"}
              </button>
              <button
                onClick={async () => {
                  const text = [
                    `🦍 ${user?.nickname ?? "침팬지"}의 침팬지픽 전적!`,
                    `🏆 ${totalScore.toLocaleString()}점 · ${formatWinRate(stats.winRate)} 승률`,
                    `${avatarLevel.emoji} ${avatarLevel.name} Lv.${avatarLevel.level}`,
                    `🔥 최고 ${stats.maxStreak}연승`,
                    "",
                    "나도 도전하기 👉 " + getInviteUrl(),
                  ].join("\n");
                  try { await navigator.clipboard.writeText(text); setCopied("profile"); setTimeout(() => setCopied(""), 2000); } catch {}
                }}
                className="flex-1 py-2.5 rounded-2xl bg-white border-2 border-card-border text-text-primary text-sm font-bold font-sans btn-clay"
              >
                {copied === "profile" ? "복사됨! ✅" : "전적 공유 📤"}
              </button>
            </div>
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

          {/* Recent performance mini graph */}
          {recentResults.length > 0 && (
            <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
              <p className="text-sm font-semibold text-text-primary font-sans mb-2">최근 성적</p>
              <div className="flex gap-1 flex-wrap">
                {recentResults.map((r) => (
                  <div
                    key={r.roundId}
                    className={[
                      "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                      r.isCorrect ? "bg-up/15 text-up" : "bg-down/15 text-down",
                    ].join(" ")}
                    title={`${r.symbolName || "예측"} ${r.isCorrect ? "적중" : "실패"} +${r.score}점`}
                  >
                    {r.isCorrect ? "O" : "X"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Titles */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">
              🏅 칭호 ({earnedTitles.length}/{allTitles.length})
            </p>
            <div className="space-y-2">
              {allTitles.map((title) => {
                const earned = earnedTitles.some((t) => t.id === title.id);
                const isSelected = selectedTitle === title.id;
                return (
                  <button
                    key={title.id}
                    disabled={!earned}
                    onClick={() => earned && setSelectedTitle(isSelected ? null : title.id)}
                    className={[
                      "w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all",
                      earned
                        ? isSelected
                          ? "bg-banana/10 border-banana/30"
                          : "bg-white border-card-border hover:border-banana/30"
                        : "bg-bg-primary border-card-border/50 opacity-50",
                    ].join(" ")}
                  >
                    <span className="text-xl">{earned ? title.emoji : "🔒"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={["text-xs font-semibold font-sans", earned ? "text-text-primary" : "text-text-secondary"].join(" ")}>
                        {title.name}
                      </p>
                      <p className="text-xs text-text-secondary font-sans">{title.description}</p>
                    </div>
                    {isSelected && <span className="text-xs text-banana font-bold font-sans">대표</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">라운드 히스토리</p>

            {recentResults.length === 0 ? (
              <div className="py-8 text-center">
                <ChimpCharacter mood="thinking" size={56} className="mx-auto mb-2" />
                <p className="text-sm text-text-secondary font-sans">
                  아직 참여한 라운드가 없어요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentResults.map((r) => (
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
                        {r.questionTitle || r.symbolName || "예측"}
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
