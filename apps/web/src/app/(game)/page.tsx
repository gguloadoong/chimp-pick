"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Trophy, Clock, Users, Flame, Star, Settings, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore, ROUND_DURATION_LABELS, ACCENT_COLORS, type RoundDuration, type ThemeMode, type AccentColor } from "@/stores/settingsStore";
import { getPrice, onPriceUpdate, computeStats, setRoundDuration, getCurrentSeason, getSeasonTimeRemaining } from "@/lib/game-engine";
import { playPickSound, playDrumroll, playWinSound, playLoseSound } from "@/lib/sound";
import { useToastStore } from "@/stores/toastStore";
import { formatPrice, formatChange } from "@/lib/format";
import { useCountdown } from "@/hooks/useCountdown";
import { AVATAR_LEVELS } from "@/types";
import type { RoundResult } from "@/types";
import MiniChart from "@/components/game/MiniChart";
import CrowdGauge from "@/components/game/CrowdGauge";
import ResultOverlay from "@/components/game/ResultOverlay";
import ShareCard from "@/components/game/ShareCard";
import Onboarding from "@/components/game/Onboarding";
import ChimpCharacter from "@/components/character/ChimpCharacter";

const MAX_CHART_TICKS = 20;

type ChimpMood = "idle" | "thinking" | "up" | "down" | "win" | "lose";

function getChimpMood(
  pick: { direction: string } | null,
  phase: string | undefined,
): ChimpMood {
  if (phase === "RESOLVED") return "thinking";
  if (pick?.direction === "UP") return "up";
  if (pick?.direction === "DOWN") return "down";
  return "idle";
}

export default function GamePage() {
  const {
    currentRound,
    myPick,
    totalScore,
    roundHistory,
    dailyMissions,
    pickDirection,
    resolveMyPick,
    ensureDailyMissions,
    claimMissionReward,
    challenge,
    startChallenge,
    getTodayRounds,
  } = useGameStore();

  const {
    roundDuration,
    soundEnabled,
    hasSeenOnboarding,
    setRoundDuration: setDuration,
    toggleSound,
    markOnboardingSeen,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
  } = useSettingsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Ensure daily missions exist
  useEffect(() => {
    ensureDailyMissions();
  }, [ensureDailyMissions]);

  // Sync round duration setting with engine
  useEffect(() => {
    setRoundDuration(roundDuration);
  }, [roundDuration]);

  // Apply theme + accent on mount
  useEffect(() => {
    setTheme(theme);
    setAccentColor(accentColor);
  }, []);

  const stats = useMemo(() => computeStats(roundHistory), [roundHistory]);

  const avatarLevel = useMemo(() => {
    return AVATAR_LEVELS.reduce((best, lvl) => {
      return stats.wins >= lvl.minWins ? lvl : best;
    }, AVATAR_LEVELS[0]);
  }, [stats.wins]);

  const [priceTicks, setPriceTicks] = useState<number[]>([]);
  const [resolvedResult, setResolvedResult] = useState<RoundResult | null>(null);
  const [shareResult, setShareResult] = useState<RoundResult | null>(null);

  const checkAttendance = useGameStore((s) => s.checkAttendance);

  // Check daily attendance on mount
  useEffect(() => {
    checkAttendance();
  }, [checkAttendance]);

  const countdown = useCountdown(
    currentRound?.closesAt ?? null,
    currentRound?.opensAt ?? null,
  );

  // Track price ticks for current round's symbol
  const roundId = currentRound?.id;
  const roundSymbol = currentRound?.symbol;

  useEffect(() => {
    if (!roundSymbol) return;

    let first = true;

    const update = () => {
      const price = getPrice(roundSymbol);
      setPriceTicks((prev) => {
        if (first) {
          first = false;
          return [price.price];
        }
        const next = [...prev, price.price];
        return next.length > MAX_CHART_TICKS ? next.slice(-MAX_CHART_TICKS) : next;
      });
    };

    update();
    const unsub = onPriceUpdate(update);
    return unsub;
  }, [roundId, roundSymbol]);

  // Play drumroll when round closes
  const roundPhase = currentRound?.phase;

  useEffect(() => {
    if (roundPhase === "CLOSED" && myPick && soundEnabled) {
      playDrumroll();
    }
  }, [roundPhase, myPick, soundEnabled]);

  // Auto-resolve when round resolves
  useEffect(() => {
    if (roundPhase !== "RESOLVED" || !myPick) return;

    queueMicrotask(() => {
      const result = resolveMyPick();
      if (result) {
        setResolvedResult(result);
        if (soundEnabled) {
          if (result.isCorrect) {
            playWinSound();
            if (result.score >= 200) addToast(`대박! +${result.score}점 🔥`, "🏆", "success");
          } else playLoseSound();
        }
      }
    });
  }, [roundPhase, myPick, resolveMyPick, soundEnabled]);

  const handlePick = useCallback((direction: "UP" | "DOWN") => {
    pickDirection(direction);
    if (soundEnabled) playPickSound();
  }, [pickDirection, soundEnabled]);

  const handleResultDismiss = useCallback(() => {
    setResolvedResult(null);
  }, []);

  const canPick = currentRound?.phase === "OPEN" && !myPick;
  const chimpMood = getChimpMood(myPick, currentRound?.phase);
  const currentPrice = currentRound ? getPrice(currentRound.symbol) : null;

  // UP/DOWN ratio display
  const upPct = currentRound?.upRatio ?? 50;
  const downPct = 100 - upPct;
  const upScore = upPct > 0 && downPct > 0 ? Math.round(100 * (downPct / upPct)) : 100;
  const downScore = upPct > 0 && downPct > 0 ? Math.round(100 * (upPct / downPct)) : 100;

  // Last 5 results for mini history
  const recentResults = roundHistory.slice(0, 5);

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between" data-testid="game-header">
          <div className="flex items-center gap-1.5">
            <ChimpCharacter
              mood={chimpMood}
              size={40}
              level={avatarLevel.level}
              className={myPick ? "animate-bounce" : "animate-float"}
            />
            <div>
              <span className="text-lg font-heading font-bold text-text-primary">
                침팬지픽
              </span>
              <span className="text-xs text-banana font-sans font-semibold ml-1">
                {avatarLevel.emoji} Lv.{avatarLevel.level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary font-sans bg-bg-primary px-2 py-1 rounded-xl border border-card-border">
              오늘 {getTodayRounds()}R
            </span>
            <div className="flex items-center gap-1.5 bg-banana/15 px-3 py-1.5 rounded-2xl border-2 border-banana/30">
              <Trophy size={14} className="text-banana" />
              <span className="font-mono font-bold text-banana tabular-nums text-sm">
                {totalScore.toLocaleString()}
              </span>
              <span className="text-xs text-banana/70">점</span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-2xl border-2 border-card-border bg-white text-text-secondary hover:text-banana transition-colors"
              aria-label="설정"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-sm font-semibold text-text-primary font-sans mb-3">설정</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary font-sans mb-1.5">라운드 시간</p>
                <div className="flex gap-2">
                  {([30, 60, 300] as RoundDuration[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={[
                        "flex-1 py-2 rounded-2xl text-xs font-bold font-sans border-2 transition-all btn-clay",
                        roundDuration === d
                          ? "border-banana text-banana bg-banana/12 clay-sm"
                          : "border-card-border text-text-secondary bg-white hover:border-banana/40",
                      ].join(" ")}
                    >
                      {ROUND_DURATION_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-sans mb-1.5">테마</p>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={[
                        "flex-1 py-2 rounded-2xl text-xs font-bold font-sans border-2 transition-all btn-clay",
                        theme === t
                          ? "border-banana text-banana bg-banana/12 clay-sm"
                          : "border-card-border text-text-secondary bg-white hover:border-banana/40",
                      ].join(" ")}
                    >
                      {t === "light" ? "☀️ 라이트" : t === "dark" ? "🌙 다크" : "🖥️ 시스템"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-sans mb-1.5">액센트 컬러</p>
                <div className="flex gap-2">
                  {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      className={[
                        "flex-1 py-2 rounded-2xl text-xs font-bold font-sans border-2 transition-all btn-clay",
                        accentColor === key
                          ? "border-banana text-banana bg-banana/12 clay-sm"
                          : "border-card-border text-text-secondary bg-white hover:border-banana/40",
                      ].join(" ")}
                    >
                      {val.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary font-sans">사운드</span>
                <button
                  onClick={toggleSound}
                  className={[
                    "flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold border-2 transition-all",
                    soundEnabled
                      ? "border-up/30 text-up bg-up/8"
                      : "border-card-border text-text-secondary bg-white",
                  ].join(" ")}
                >
                  {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                  {soundEnabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Challenge */}
        {challenge?.active ? (
          <div className="bg-banana/10 rounded-2xl p-3 border-2 border-banana/30 text-center">
            <p className="font-heading font-bold text-banana text-sm">
              🎯 챌린지 진행 중! {challenge.wins}/{5 - challenge.roundsLeft + challenge.wins} 적중 · 남은 {challenge.roundsLeft}라운드
            </p>
            <p className="text-xs text-banana/70 font-sans mt-1">5연속 적중 시 점수 3배!</p>
          </div>
        ) : (
          <button
            onClick={startChallenge}
            className="w-full py-2.5 rounded-2xl border-2 border-banana/30 bg-banana/5 text-banana text-sm font-bold font-sans transition-all hover:bg-banana/15 btn-clay"
          >
            🎯 챌린지 시작 (5라운드 연속 적중 → 3배!)
          </button>
        )}

        {/* Round Status Card */}
        {currentRound && (
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay" data-testid="round-card">
            {/* Round phase indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={[
                  "w-2 h-2 rounded-full",
                  currentRound.phase === "OPEN" ? "bg-up animate-pulse" :
                  currentRound.phase === "CLOSED" ? "bg-banana animate-pulse" :
                  currentRound.phase === "RESOLVED" ? "bg-down" : "bg-text-secondary",
                ].join(" ")} />
                <span className="text-xs font-semibold font-sans text-text-secondary">
                  {currentRound.phase === "OPEN" && (currentRound.isSpeedRound ? "⚡ 스피드 라운드!" : "예측 진행 중")}
                  {currentRound.phase === "CLOSED" && "결과 계산 중..."}
                  {currentRound.phase === "RESOLVED" && "결과 발표!"}
                  {currentRound.phase === "WAITING" && "다음 라운드 준비 중"}
                </span>
              </div>
              {currentRound.phase === "OPEN" && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <Clock size={12} />
                  <span className={[
                    "font-mono tabular-nums text-sm font-bold",
                    countdown.timeLeft < 10_000 ? "text-down animate-pulse" : "text-text-primary",
                  ].join(" ")}>
                    {countdown.formatted}
                  </span>
                </div>
              )}
            </div>

            {/* Question display */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-banana/10 text-banana font-semibold font-sans border border-banana/20">
                  {currentRound.questionEmoji} {currentRound.questionLabel}
                </span>
                {currentRound.questionCategory === "price" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-text-secondary/10 text-text-secondary font-sans border border-text-secondary/20">
                    모의 시세
                  </span>
                )}
              </div>
              <p className="text-lg font-heading font-bold text-text-primary mb-1">
                {currentRound.questionTitle}
              </p>
              {currentRound.questionCategory === "price" && currentPrice ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-xs text-text-secondary font-sans">시작가</p>
                      <p className="text-sm font-mono tabular-nums text-text-secondary font-semibold">
                        {formatPrice(currentRound.entryPrice)}원
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary font-sans">현재가</p>
                      <p className="text-2xl font-bold font-mono tabular-nums text-text-primary">
                        {formatPrice(currentPrice.price)}
                        <span className="text-xs text-text-secondary ml-1">원</span>
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const diff = currentPrice.price - currentRound.entryPrice;
                    const pct = currentRound.entryPrice > 0 ? (diff / currentRound.entryPrice) * 100 : 0;
                    return (
                      <p className={["text-xs font-semibold font-sans text-right", pct >= 0 ? "text-up" : "text-down"].join(" ")}>
                        {pct >= 0 ? "+" : ""}{formatPrice(diff)}원 ({formatChange(pct)})
                      </p>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs text-text-secondary font-sans">
                  {currentRound.questionDesc}
                </p>
              )}
            </div>

            {/* Mini chart */}
            <MiniChart prices={priceTicks} height={64} className="mb-3" />

            {/* Progress bar (time remaining) */}
            {currentRound.phase === "OPEN" && (
              <div className="w-full bg-card-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-banana transition-all duration-100"
                  style={{ width: `${Math.max(0, Math.min(100, countdown.percentage))}%` }}
                />
              </div>
            )}

            {/* Resolved result display */}
            {currentRound.phase === "RESOLVED" && currentRound.result && (
              <div className={[
                "mt-2 p-3 rounded-2xl text-center border-2",
                currentRound.result === "UP"
                  ? "bg-up/8 border-up/30"
                  : "bg-down/8 border-down/30",
              ].join(" ")}>
                <p className="text-lg font-bold font-heading">
                  결과: {currentRound.result === "UP" ? "📈 UP" : "📉 DOWN"}
                </p>
                <p className="text-xs text-text-secondary font-sans mt-1">
                  {formatPrice(currentRound.entryPrice)} → {formatPrice(currentRound.exitPrice ?? 0)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Crowd gauge — monkeys rushing! */}
        {currentRound && (currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (
          <CrowdGauge upPct={upPct} picked={myPick?.direction ?? null} />
        )}

        {/* Pick buttons */}
        <div className="grid grid-cols-2 gap-3" data-testid="pick-buttons">
          <button
            data-testid="btn-up"
            disabled={!canPick}
            onClick={() => handlePick("UP")}
            className={[
              "flex flex-col items-center justify-center gap-2 py-5 rounded-3xl",
              "border-4 font-bold text-xl font-sans transition-all duration-150 select-none btn-clay",
              myPick?.direction === "UP"
                ? "border-up bg-up/15 text-up clay-up scale-105"
                : "border-up bg-white text-up clay-up hover:bg-up/8",
              !canPick && !myPick
                ? "opacity-40 cursor-not-allowed pointer-events-none"
                : myPick && myPick.direction !== "UP"
                  ? "opacity-30 pointer-events-none"
                  : "cursor-pointer",
            ].join(" ")}
            aria-label="UP 예측"
          >
            <ArrowUp size={28} strokeWidth={3} />
            <span className="text-base font-heading font-bold tracking-wide">
              {currentRound?.optionA ?? "UP 🚀"}
            </span>
            {canPick && (
              <span className="text-xs font-sans text-up/70">
                {upPct < 50 ? `🔥 ${upScore}점` : `${upScore}점`}
              </span>
            )}
          </button>

          <button
            data-testid="btn-down"
            disabled={!canPick}
            onClick={() => handlePick("DOWN")}
            className={[
              "flex flex-col items-center justify-center gap-2 py-5 rounded-3xl",
              "border-4 font-bold text-xl font-sans transition-all duration-150 select-none btn-clay",
              myPick?.direction === "DOWN"
                ? "border-down bg-down/15 text-down clay-down scale-105"
                : "border-down bg-white text-down clay-down hover:bg-down/8",
              !canPick && !myPick
                ? "opacity-40 cursor-not-allowed pointer-events-none"
                : myPick && myPick.direction !== "DOWN"
                  ? "opacity-30 pointer-events-none"
                  : "cursor-pointer",
            ].join(" ")}
            aria-label="DOWN 예측"
          >
            <ArrowDown size={28} strokeWidth={3} />
            <span className="text-base font-heading font-bold tracking-wide">
              {currentRound?.optionB ?? "DOWN 💀"}
            </span>
            {canPick && (
              <span className="text-xs font-sans text-down/70">
                {downPct < 50 ? `🔥 ${downScore}점` : `${downScore}점`}
              </span>
            )}
          </button>
        </div>

        {/* My pick banner */}
        {myPick && currentRound?.phase === "OPEN" && (
          <div
            className={[
              "rounded-2xl p-3 border-2 text-center",
              myPick.direction === "UP"
                ? "bg-up/8 border-up/30 text-up"
                : "bg-down/8 border-down/30 text-down",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <p className="font-bold font-sans text-sm">
              {myPick.direction === "UP" ? "🚀" : "💀"} {myPick.direction} 선택 완료! 결과를 기다리는 중...
            </p>
          </div>
        )}

        {/* Extras toggle */}
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="w-full py-2 rounded-2xl border border-card-border bg-white text-text-secondary text-xs font-sans font-semibold transition-all hover:border-banana/40"
        >
          {showExtras ? "접기 ▲" : `미션 · 기록 · 시즌 ▼${stats.currentStreak >= 2 ? ` · 🔥${stats.currentStreak}연승` : ""}`}
        </button>

        {showExtras && <>
        {/* Recent results */}
        {recentResults.length > 0 && (
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <p className="text-xs font-semibold text-text-secondary font-sans mb-2">최근 결과</p>
            <div className="flex gap-2">
              {recentResults.map((r) => (
                <div
                  key={r.roundId}
                  className={[
                    "flex-1 py-2 px-1 rounded-xl text-center border",
                    r.isCorrect
                      ? "bg-up/8 border-up/20"
                      : "bg-down/8 border-down/20",
                  ].join(" ")}
                >
                  <p className="text-sm font-bold font-sans">
                    {r.isCorrect ? "✅" : "❌"}
                  </p>
                  <p className={[
                    "text-xs font-mono font-bold tabular-nums",
                    r.isCorrect ? "text-up" : "text-down",
                  ].join(" ")}>
                    {r.isCorrect ? `+${r.score}` : "0"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak banner */}
        {stats.currentStreak >= 2 && (
          <div className={[
            "rounded-2xl p-3 border-2 text-center",
            stats.currentStreak >= 5
              ? "bg-banana/15 border-banana/40"
              : "bg-up/8 border-up/20",
          ].join(" ")}>
            <div className="flex items-center justify-center gap-1.5">
              <Flame size={16} className={stats.currentStreak >= 5 ? "text-banana" : "text-up"} />
              <span className={[
                "font-heading font-bold text-sm",
                stats.currentStreak >= 5 ? "text-banana" : "text-up",
              ].join(" ")}>
                {stats.currentStreak}연승 중!
                {stats.currentStreak >= 5 && " 🔥🔥🔥"}
                {stats.currentStreak >= 3 && stats.currentStreak < 5 && " 🔥"}
              </span>
            </div>
          </div>
        )}

        {/* Daily Missions */}
        {dailyMissions && (
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay">
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={14} className="text-banana" />
              <span className="text-sm font-semibold text-text-primary font-sans">오늘의 미션</span>
            </div>
            <div className="space-y-2">
              {dailyMissions.missions.map((mission, idx) => {
                const progress = dailyMissions.progress[idx];
                const pct = Math.min(100, Math.round((progress.current / mission.target) * 100));
                return (
                  <div key={mission.id} className={[
                    "p-3 rounded-2xl border",
                    progress.claimed ? "bg-bg-primary border-card-border/50 opacity-60" :
                    progress.completed ? "bg-banana/8 border-banana/30" :
                    "bg-bg-primary border-card-border",
                  ].join(" ")}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-text-primary font-sans">
                        {mission.title}
                      </span>
                      {progress.completed && !progress.claimed ? (
                        <button
                          onClick={() => claimMissionReward(mission.id)}
                          className="text-xs font-bold text-banana bg-banana/15 px-2 py-0.5 rounded-full border border-banana/30 btn-clay"
                        >
                          +{mission.reward}점 받기
                        </button>
                      ) : progress.claimed ? (
                        <span className="text-xs text-text-secondary font-sans">완료 ✅</span>
                      ) : (
                        <span className="text-xs text-text-secondary font-mono tabular-nums">
                          {progress.current}/{mission.target}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary font-sans mb-1.5">{mission.description}</p>
                    <div className="w-full bg-card-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className={[
                          "h-full rounded-full transition-all duration-300",
                          progress.completed ? "bg-banana" : "bg-up",
                        ].join(" ")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Season info */}
        <div className="bg-white rounded-2xl p-3 border border-card-border clay-sm text-center">
          <p className="text-xs text-text-secondary font-sans">
            🏆 {getCurrentSeason().label} 시즌 · 남은 시간 {getSeasonTimeRemaining().days}일 {getSeasonTimeRemaining().hours}시간
          </p>
        </div>

        {/* Tomorrow bonus teaser */}
        {stats.totalRounds > 0 && (
          <div className="bg-banana/5 rounded-2xl p-3 border border-banana/20 text-center">
            <p className="text-xs text-banana font-sans font-semibold">
              🍌 내일 다시 오면 출석 보너스! ({Math.min(7, (useGameStore.getState().attendance.streak || 0) + 1)}일차 보상 대기중)
            </p>
          </div>
        )}
        </>}

        {/* Footer info */}
        <p className="text-center text-xs text-text-secondary font-sans">
          소수파 보너스 최대 5배 · ⚡ 스피드 라운드 1.5배!
        </p>
      </div>

      {/* Result overlay */}
      {resolvedResult && (
        <ResultOverlay
          result={resolvedResult}
          onDismiss={handleResultDismiss}
          onShare={() => setShareResult(resolvedResult)}
        />
      )}

      {/* Share card */}
      {shareResult && (
        <ShareCard
          result={shareResult}
          totalScore={totalScore}
          level={avatarLevel.level}
          onClose={() => setShareResult(null)}
        />
      )}

      {/* Onboarding */}
      {!hasSeenOnboarding && (
        <Onboarding onComplete={markOnboardingSeen} />
      )}
    </>
  );
}
