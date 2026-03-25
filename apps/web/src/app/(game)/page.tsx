"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Trophy, Clock, Users, Flame, Star, Settings, Volume2, VolumeX, ChevronDown, ChevronUp } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore, ROUND_DURATION_LABELS, ACCENT_COLORS, type RoundDuration, type ThemeMode, type AccentColor } from "@/stores/settingsStore";
import { getPrice, onPriceUpdate, computeStats, setRoundDuration, getCurrentSeason, getSeasonTimeRemaining } from "@/lib/game-engine";
import { playPickSound, playDrumroll, playWinSound, playLoseSound } from "@/lib/sound";
import { useToastStore } from "@/stores/toastStore";
import { formatPrice, formatChange } from "@/lib/format";
import { useCountdown } from "@/hooks/useCountdown";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { usePrediction } from "@/hooks/usePrediction";
import { AVATAR_LEVELS } from "@/types";
import type { RoundResult } from "@/types";
import dynamic from "next/dynamic";
import MiniChart from "@/components/game/MiniChart";

const CandleChart = dynamic(() => import("@/components/game/CandleChart"), { ssr: false });
import BetSlider from "@/components/game/BetSlider";
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

  useEffect(() => { ensureDailyMissions(); }, [ensureDailyMissions]);
  useEffect(() => { setRoundDuration(roundDuration); }, [roundDuration]);
  useEffect(() => { setTheme(theme); setAccentColor(accentColor); }, []);

  const stats = useMemo(() => computeStats(roundHistory), [roundHistory]);
  const avatarLevel = useMemo(() => {
    return AVATAR_LEVELS.reduce((best, lvl) => {
      return stats.wins >= lvl.minWins ? lvl : best;
    }, AVATAR_LEVELS[0]);
  }, [stats.wins]);

  const [priceTicks, setPriceTicks] = useState<number[]>([]);
  const [resolvedResult, setResolvedResult] = useState<RoundResult | null>(null);
  const [shareResult, setShareResult] = useState<RoundResult | null>(null);
  const [currentPriceBData, setCurrentPriceBData] = useState<ReturnType<typeof getPrice> | null>(null);

  // 실시간 업비트 시세 — price:tick 이벤트를 게임 엔진 priceState에 주입
  useRealtimePrices();

  const checkAttendance = useGameStore((s) => s.checkAttendance);
  useEffect(() => { checkAttendance(); }, [checkAttendance]);

  const countdown = useCountdown(
    currentRound?.closesAt ?? null,
    currentRound?.opensAt ?? null,
  );

  const roundId = currentRound?.id;
  const roundSymbol = currentRound?.symbol;
  const roundSymbolB = currentRound?.symbolB;
  const isComparison = currentRound?.isComparison;

  useEffect(() => {
    if (!roundSymbol) return;
    let first = true;
    const update = () => {
      const price = getPrice(roundSymbol);
      setPriceTicks((prev) => {
        if (first) { first = false; return [price.price]; }
        const next = [...prev, price.price];
        return next.length > MAX_CHART_TICKS ? next.slice(-MAX_CHART_TICKS) : next;
      });
    };
    update();
    const unsub = onPriceUpdate(update);
    return unsub;
  }, [roundId, roundSymbol]);

  useEffect(() => {
    if (!roundSymbolB || !isComparison) { setCurrentPriceBData(null); return; }
    const update = () => setCurrentPriceBData(getPrice(roundSymbolB));
    update();
    const unsub = onPriceUpdate(update);
    return unsub;
  }, [roundId, roundSymbolB, isComparison]);

  const roundPhase = currentRound?.phase;

  useEffect(() => {
    if (roundPhase === "CLOSED" && myPick && soundEnabled) playDrumroll();
  }, [roundPhase, myPick, soundEnabled]);

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

  const { user, updateBananaCoins } = useAuthStore();

  const [betAmount, setBetAmount] = useState(50);

  const { submitPrediction, isSubmitting, activePrediction } = usePrediction({
    onSuccess: () => addToast("예측 등록 완료! 🍌", "✅", "success"),
    onError: (msg) => addToast(msg, "❌", "warning"),
  });

  // 예측 결과 확정 시 바나나코인 잔액 갱신 (낙관적 업데이트)
  useEffect(() => {
    if (!activePrediction || activePrediction.result === "PENDING") return;
    if (activePrediction.result === "WIN" && activePrediction.reward != null) {
      const current = user?.bananaCoins ?? 1000;
      updateBananaCoins(current + activePrediction.reward - activePrediction.betAmount);
    } else if (activePrediction.result === "LOSE") {
      const current = user?.bananaCoins ?? 1000;
      updateBananaCoins(Math.max(0, current - activePrediction.betAmount));
    }
  // activePrediction.id + result 조합 변경 시에만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePrediction?.id, activePrediction?.result]);

  const handlePick = useCallback((direction: "UP" | "DOWN") => {
    if (isSubmitting) return; // 중복 제출 방지
    pickDirection(direction);
    if (soundEnabled) playPickSound();
    if (currentRound?.symbol) {
      void submitPrediction(currentRound.symbol, direction, roundDuration, betAmount);
    }
  }, [isSubmitting, pickDirection, soundEnabled, currentRound?.symbol, roundDuration, betAmount, submitPrediction]);

  const handleResultDismiss = useCallback(() => setResolvedResult(null), []);

  const canPick = currentRound?.phase === "OPEN" && !myPick;
  const chimpMood = getChimpMood(myPick, currentRound?.phase);
  const currentPrice = currentRound ? getPrice(currentRound.symbol) : null;

  const upPct = currentRound?.upRatio ?? 50;
  const downPct = 100 - upPct;
  const upScore = upPct > 0 && downPct > 0 ? Math.round(100 * (downPct / upPct)) : 100;
  const downScore = upPct > 0 && downPct > 0 ? Math.round(100 * (upPct / downPct)) : 100;

  const recentResults = roundHistory.slice(0, 5);

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24 flex flex-col gap-4">

        {/* ── COMPACT HEADER ── */}
        <div className="flex items-center justify-between" data-testid="game-header">
          <div className="flex items-center gap-2">
            <ChimpCharacter
              mood={chimpMood}
              size={36}
              level={avatarLevel.level}
              className={myPick ? "animate-bounce-chimp" : ""}
            />
            <div>
              <span className="text-base font-heading font-bold text-[var(--fg-primary)]">
                침팬지픽
              </span>
              <span className="text-xs text-[var(--brand-primary)] font-sans font-semibold ml-1.5">
                {avatarLevel.emoji} Lv.{avatarLevel.level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--fg-secondary)] font-sans bg-[var(--bg-tertiary)] px-2 py-1 rounded-[var(--radius-sm)]">
              오늘 {getTodayRounds()}R
            </span>
            {user?.bananaCoins != null && (
              <div className="flex items-center gap-1 bg-[var(--brand-secondary)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
                <span className="text-xs">🍌</span>
                <span className="font-mono font-bold text-[var(--brand-primary)] tabular-nums text-sm" data-testid="banana-balance">
                  {user.bananaCoins.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-[var(--brand-secondary)] px-3 py-1.5 rounded-[var(--radius-sm)]">
              <Trophy size={13} className="text-[var(--brand-primary)]" />
              <span className="font-mono font-bold text-[var(--brand-primary)] tabular-nums text-sm">
                {totalScore.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--brand-primary)]/70">점</span>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--fg-secondary)] hover:text-[var(--brand-primary)] transition-colors btn-press"
              aria-label="설정"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* ── SETTINGS PANEL ── */}
        {showSettings && (
          <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-4 border border-[var(--border-primary)] shadow-[var(--shadow-1)]">
            <p className="text-sm font-semibold text-[var(--fg-primary)] font-sans mb-3">설정</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[var(--fg-secondary)] font-sans mb-1.5">라운드 시간</p>
                <div className="flex gap-2">
                  {([60, 300, 3600] as RoundDuration[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={[
                        "flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-bold font-sans border transition-all btn-press",
                        roundDuration === d
                          ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-secondary)]"
                          : "border-[var(--border-primary)] text-[var(--fg-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--brand-primary)]/40",
                      ].join(" ")}
                    >
                      {ROUND_DURATION_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--fg-secondary)] font-sans mb-1.5">테마</p>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={[
                        "flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-bold font-sans border transition-all btn-press",
                        theme === t
                          ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-secondary)]"
                          : "border-[var(--border-primary)] text-[var(--fg-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--brand-primary)]/40",
                      ].join(" ")}
                    >
                      {t === "light" ? "☀️ 라이트" : t === "dark" ? "🌙 다크" : "🖥️ 시스템"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--fg-secondary)] font-sans mb-1.5">액센트 컬러</p>
                <div className="flex gap-2">
                  {(Object.entries(ACCENT_COLORS) as [AccentColor, typeof ACCENT_COLORS[AccentColor]][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      className={[
                        "flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-bold font-sans border transition-all btn-press",
                        accentColor === key
                          ? "border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-secondary)]"
                          : "border-[var(--border-primary)] text-[var(--fg-secondary)] bg-[var(--bg-tertiary)] hover:border-[var(--brand-primary)]/40",
                      ].join(" ")}
                    >
                      {val.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--fg-secondary)] font-sans">사운드</span>
                <button
                  onClick={toggleSound}
                  className={[
                    "flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-bold border transition-all btn-press",
                    soundEnabled
                      ? "border-[var(--positive)]/30 text-[var(--positive)] bg-[var(--positive-bg)]"
                      : "border-[var(--border-primary)] text-[var(--fg-secondary)] bg-[var(--bg-tertiary)]",
                  ].join(" ")}
                >
                  {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                  {soundEnabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ZONE 1: HERO ── */}
        {currentRound ? (
          <div
            className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-2)]"
            data-testid="round-card"
          >
            {/* Phase indicator + timer */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={[
                  "w-2 h-2 rounded-full",
                  currentRound.phase === "OPEN" ? "bg-[var(--positive)] animate-pulse" :
                  currentRound.phase === "CLOSED" ? "bg-[var(--warning)] animate-pulse" :
                  currentRound.phase === "RESOLVED" ? "bg-[var(--negative)]" : "bg-[var(--fg-tertiary)]",
                ].join(" ")} />
                <span className="text-xs font-semibold font-sans text-[var(--fg-secondary)]">
                  {currentRound.phase === "OPEN" && (currentRound.isSpeedRound ? "⚡ 스피드 라운드!" : "예측 진행 중")}
                  {currentRound.phase === "CLOSED" && "결과 계산 중"}
                  {currentRound.phase === "RESOLVED" && "결과 발표!"}
                  {currentRound.phase === "WAITING" && "다음 라운드 준비 중"}
                </span>
              </div>
              {currentRound.phase === "OPEN" && (
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-[var(--fg-tertiary)]" />
                  <span className={[
                    "font-mono tabular-nums text-sm font-bold",
                    countdown.timeLeft < 10_000 ? "text-[var(--negative)] animate-urgent" : "text-[var(--fg-primary)]",
                  ].join(" ")}>
                    {countdown.formatted}
                  </span>
                </div>
              )}
            </div>

            {/* Category badge + question */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center h-5 px-2 rounded-full bg-[var(--brand-secondary)] text-[var(--brand-primary)] text-[12px] font-semibold font-sans">
                  {currentRound.questionEmoji} {currentRound.questionLabel}
                </span>
                {currentRound.questionCategory === "price" && (
                  <span className="inline-flex items-center h-5 px-2 rounded-full bg-[var(--bg-tertiary)] text-[var(--fg-secondary)] text-[12px] font-semibold font-sans">
                    모의 시세
                  </span>
                )}
              </div>
              <p className="text-lg font-heading font-bold text-[var(--fg-primary)] leading-snug">
                {currentRound.questionTitle}
              </p>
            </div>

            {/* Price display (price category) */}
            {currentRound.questionCategory === "price" && currentPrice && (
              <div className="mb-3">
                {currentRound.isComparison ? (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Symbol A */}
                    <div className="bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-3">
                      <p className="text-[12px] text-[var(--fg-secondary)] font-sans mb-1">{currentRound.symbolName}</p>
                      <p className="text-[20px] font-mono font-bold tabular-nums text-[var(--fg-primary)] leading-none">
                        {formatPrice(currentPrice.price)}
                        <span className="text-[11px] font-sans text-[var(--fg-tertiary)] ml-0.5">원</span>
                      </p>
                      {(() => {
                        const diff = currentPrice.price - currentRound.entryPrice;
                        const pct = currentRound.entryPrice > 0 ? (diff / currentRound.entryPrice) * 100 : 0;
                        return (
                          <p className={["text-[12px] font-mono font-bold tabular-nums mt-0.5", pct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                            {pct >= 0 ? "+" : ""}{formatChange(pct)}
                          </p>
                        );
                      })()}
                    </div>
                    {/* Symbol B */}
                    <div className="bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-3">
                      <p className="text-[12px] text-[var(--fg-secondary)] font-sans mb-1">{currentRound.symbolNameB}</p>
                      <p className="text-[20px] font-mono font-bold tabular-nums text-[var(--fg-primary)] leading-none">
                        {currentPriceBData ? formatPrice(currentPriceBData.price) : "—"}
                        <span className="text-[11px] font-sans text-[var(--fg-tertiary)] ml-0.5">원</span>
                      </p>
                      {currentPriceBData && currentRound.entryPriceB && (() => {
                        const diff = currentPriceBData.price - currentRound.entryPriceB;
                        const pct = currentRound.entryPriceB > 0 ? (diff / currentRound.entryPriceB) * 100 : 0;
                        return (
                          <p className={["text-[12px] font-mono font-bold tabular-nums mt-0.5", pct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                            {pct >= 0 ? "+" : ""}{formatChange(pct)}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[12px] text-[var(--fg-secondary)] font-sans">시작가</p>
                      <p className="text-sm font-mono tabular-nums text-[var(--fg-secondary)]">
                        {formatPrice(currentRound.entryPrice)}원
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[var(--fg-secondary)] font-sans">현재가</p>
                      <p className="text-[28px] font-bold font-mono tabular-nums text-[var(--fg-primary)] leading-none">
                        {formatPrice(currentPrice.price)}
                        <span className="text-[13px] text-[var(--fg-tertiary)] ml-0.5">원</span>
                      </p>
                      {(() => {
                        const diff = currentPrice.price - currentRound.entryPrice;
                        const pct = currentRound.entryPrice > 0 ? (diff / currentRound.entryPrice) * 100 : 0;
                        return (
                          <p className={["text-sm font-mono font-bold tabular-nums", pct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                            {pct >= 0 ? "+" : ""}{formatChange(pct)}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Question desc (non-price) */}
            {currentRound.questionCategory !== "price" && (
              <p className="text-sm text-[var(--fg-secondary)] font-sans mb-3">
                {currentRound.questionDesc}
              </p>
            )}

            {/* Chart — price 카테고리는 캔들차트, 나머지는 라인차트 */}
            {currentRound?.questionCategory === "price" && currentRound.symbol ? (
              <CandleChart
                symbol={currentRound.symbol}
                timeframe="5m"
                height={160}
                className="mb-3"
              />
            ) : (
              <MiniChart prices={priceTicks} height={56} className="mb-3" />
            )}

            {/* Progress bar (time) */}
            {currentRound.phase === "OPEN" && (
              <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden mb-4">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-100",
                    countdown.timeLeft < 10_000 ? "bg-[var(--warning)] animate-urgent" : "bg-[var(--brand-primary)]",
                  ].join(" ")}
                  style={{ width: `${Math.max(0, Math.min(100, countdown.percentage))}%` }}
                />
              </div>
            )}

            {/* CLOSED: drumroll UX */}
            {currentRound.phase === "CLOSED" && (
              <div className="text-center py-4 mb-4">
                <div className="animate-heartbeat inline-block mb-2">
                  <span className="text-4xl">🥁</span>
                </div>
                <p className="text-sm font-heading font-bold text-[var(--fg-primary)] animate-urgent">
                  두근두근... 결과 발표 중!
                </p>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-[var(--warning)] animate-urgent w-full" />
                </div>
              </div>
            )}

            {/* RESOLVED: result summary */}
            {currentRound.phase === "RESOLVED" && currentRound.result && (
              <div className={[
                "mb-4 p-3 rounded-[var(--radius-md)] text-center border",
                currentRound.result === "UP"
                  ? "bg-[var(--positive-bg)] border-[var(--positive)]/30"
                  : "bg-[var(--negative-bg)] border-[var(--negative)]/30",
              ].join(" ")}>
                <p className="text-base font-bold font-heading text-[var(--fg-primary)]">
                  결과: {currentRound.result === "UP" ? "📈 UP" : "📉 DOWN"}
                </p>
                {currentRound.questionCategory === "price" && (
                  <p className="text-xs text-[var(--fg-secondary)] font-mono mt-1">
                    {formatPrice(currentRound.entryPrice)} → {formatPrice(currentRound.exitPrice ?? 0)}원
                  </p>
                )}
              </div>
            )}

            {/* Crowd gauge inline */}
            {(currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (
              <CrowdGauge upPct={upPct} picked={myPick?.direction ?? null} />
            )}

            {/* 베팅 금액 슬라이더 */}
            {canPick && (
              <div
                className="mt-4 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-3 border border-[var(--border-primary)]"
                data-testid="bet-panel"
              >
                <BetSlider
                  value={betAmount}
                  min={10}
                  max={1000}
                  step={10}
                  onChange={setBetAmount}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* UP/DOWN pick buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4" data-testid="pick-buttons">
              <button
                data-testid="btn-up"
                disabled={!canPick}
                onClick={() => handlePick("UP")}
                className={[
                  "flex flex-col items-center justify-center gap-2 py-5 rounded-[var(--radius-md)]",
                  "border-2 font-bold text-xl font-sans transition-all duration-150 select-none btn-press",
                  myPick?.direction === "UP"
                    ? "border-[var(--positive)] bg-[var(--positive-bg)] text-[var(--positive)] shadow-[var(--shadow-glow-positive)] scale-[1.02]"
                    : "border-[var(--positive)] bg-[var(--bg-secondary)] text-[var(--positive)] hover:bg-[var(--positive-bg)]",
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
                  <span className="text-xs font-sans text-[var(--positive)]/70">
                    {upPct < 50 ? `🔥 ${upScore}점` : `${upScore}점`}
                  </span>
                )}
              </button>

              <button
                data-testid="btn-down"
                disabled={!canPick}
                onClick={() => handlePick("DOWN")}
                className={[
                  "flex flex-col items-center justify-center gap-2 py-5 rounded-[var(--radius-md)]",
                  "border-2 font-bold text-xl font-sans transition-all duration-150 select-none btn-press",
                  myPick?.direction === "DOWN"
                    ? "border-[var(--negative)] bg-[var(--negative-bg)] text-[var(--negative)] shadow-[var(--shadow-glow-negative)] scale-[1.02]"
                    : "border-[var(--negative)] bg-[var(--bg-secondary)] text-[var(--negative)] hover:bg-[var(--negative-bg)]",
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
                  <span className="text-xs font-sans text-[var(--negative)]/70">
                    {downPct < 50 ? `🔥 ${downScore}점` : `${downScore}점`}
                  </span>
                )}
              </button>
            </div>

            {/* My pick status */}
            {myPick && (currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (
              <div
                className={[
                  "mt-3 rounded-[var(--radius-sm)] p-2.5 border text-center",
                  myPick.direction === "UP"
                    ? "bg-[var(--positive-bg)] border-[var(--positive)]/30 text-[var(--positive)]"
                    : "bg-[var(--negative-bg)] border-[var(--negative)]/30 text-[var(--negative)]",
                ].join(" ")}
                role="status"
                aria-live="polite"
              >
                <p className="font-bold font-sans text-sm">
                  {currentRound.phase === "CLOSED"
                    ? `${myPick.direction === "UP" ? "🚀" : "💀"} 베팅 완료 — 🥁 판정 중...`
                    : `${myPick.direction === "UP" ? "🚀" : "💀"} ${myPick.direction === "UP" ? (currentRound.optionA ?? "UP") : (currentRound.optionB ?? "DOWN")} 선택 완료!`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-1)] text-center">
            <div className="animate-bounce-chimp inline-block mb-3">
              <ChimpCharacter mood="idle" size={64} className="mx-auto" />
            </div>
            <p className="text-[var(--fg-secondary)] font-sans text-sm">라운드 준비 중...</p>
          </div>
        )}

        {/* Comparison race card */}
        {currentRound?.isComparison && myPick && currentPriceBData && currentPrice &&
          (currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (() => {
            const changeA = currentRound.entryPrice > 0
              ? ((currentPrice.price - currentRound.entryPrice) / currentRound.entryPrice) * 100 : 0;
            const changeB = currentRound.entryPriceB && currentRound.entryPriceB > 0
              ? ((currentPriceBData.price - currentRound.entryPriceB) / currentRound.entryPriceB) * 100 : 0;
            const maxAbs = Math.max(Math.abs(changeA), Math.abs(changeB), 0.01);
            const barA = 50 + (changeA - changeB) / (2 * maxAbs) * 45;
            const barB = 100 - barA;
            const EPSILON = 0.005;
            const isTie = Math.abs(changeA - changeB) < EPSILON;
            const aWinning = !isTie && changeA > changeB;
            const myPickWinning = !isTie && ((myPick.direction === "UP" && aWinning) || (myPick.direction === "DOWN" && !aWinning));
            return (
              <div className={[
                "bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-4 border shadow-[var(--shadow-1)]",
                isTie ? "border-[var(--border-primary)]" : myPickWinning ? "border-[var(--positive)]/40" : "border-[var(--negative)]/40",
              ].join(" ")}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--fg-secondary)] font-sans">⚡ 실시간 현황</span>
                  <span className={[
                    "inline-flex items-center h-5 px-2 rounded-full text-[12px] font-bold font-sans",
                    isTie ? "bg-[var(--bg-tertiary)] text-[var(--fg-secondary)]"
                          : myPickWinning ? "bg-[var(--positive-bg)] text-[var(--positive)]"
                          : "bg-[var(--negative-bg)] text-[var(--negative)]",
                  ].join(" ")}>
                    {isTie ? "🤝 동률" : myPickWinning ? "🎯 맞는 중!" : "😬 틀린 중..."}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono w-16 truncate text-[var(--fg-primary)] font-semibold">
                      {aWinning && "🏆 "}{currentRound.symbolName}
                    </span>
                    <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--positive)] transition-all duration-500" style={{ width: `${Math.max(4, barA)}%` }} />
                    </div>
                    <span className={["text-xs font-mono tabular-nums w-14 text-right font-bold", changeA >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                      {changeA >= 0 ? "+" : ""}{changeA.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono w-16 truncate text-[var(--fg-primary)] font-semibold">
                      {!isTie && !aWinning && "🏆 "}{currentRound.symbolNameB}
                    </span>
                    <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500" style={{ width: `${Math.max(4, barB)}%` }} />
                    </div>
                    <span className={["text-xs font-mono tabular-nums w-14 text-right font-bold", changeB >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                      {changeB >= 0 ? "+" : ""}{changeB.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--fg-secondary)] font-sans mt-2 text-center">
                  내 선택: <span className="font-bold text-[var(--fg-primary)]">
                    {myPick.direction === "UP" ? currentRound.optionA : currentRound.optionB}
                  </span>이 더 많이 오르면 승리
                </p>
              </div>
            );
          })()}

        {/* ── ZONE 2: CONTEXT ── */}

        {/* Challenge */}
        {challenge?.active ? (
          <div className="bg-[var(--brand-secondary)] rounded-[var(--radius-md)] p-3 border border-[var(--brand-primary)]/30 text-center">
            <p className="font-heading font-bold text-[var(--brand-primary)] text-sm">
              🎯 챌린지 진행 중! {challenge.wins}/{5 - challenge.roundsLeft + challenge.wins} 적중 · 남은 {challenge.roundsLeft}라운드
            </p>
            <p className="text-xs text-[var(--brand-primary)]/70 font-sans mt-1">5연속 적중 시 점수 3배!</p>
          </div>
        ) : (
          <button
            onClick={startChallenge}
            className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--brand-primary)]/30 bg-[var(--brand-secondary)] text-[var(--brand-primary)] text-sm font-bold font-sans transition-all hover:bg-[var(--brand-primary)]/15 btn-press"
          >
            🎯 챌린지 시작 (5라운드 연속 적중 → 3배!)
          </button>
        )}

        {/* Extras toggle */}
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--fg-secondary)] text-xs font-sans font-semibold transition-all hover:border-[var(--brand-primary)]/40 btn-press flex items-center justify-center gap-1.5"
        >
          {showExtras ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showExtras ? "접기" : `미션 · 기록 · 시즌${stats.currentStreak >= 2 ? ` · 🔥${stats.currentStreak}연승` : ""}`}
        </button>

        {showExtras && (
          <>
            {/* Streak banner */}
            {stats.currentStreak >= 2 && (
              <div className={[
                "rounded-[var(--radius-md)] p-3 border text-center",
                stats.currentStreak >= 5
                  ? "bg-[var(--brand-secondary)] border-[var(--brand-primary)]/40"
                  : "bg-[var(--positive-bg)] border-[var(--positive)]/20",
              ].join(" ")}>
                <div className="flex items-center justify-center gap-1.5">
                  <Flame size={15} className={stats.currentStreak >= 5 ? "text-[var(--brand-primary)]" : "text-[var(--positive)]"} />
                  <span className={[
                    "font-heading font-bold text-sm",
                    stats.currentStreak >= 5 ? "text-[var(--brand-primary)]" : "text-[var(--positive)]",
                  ].join(" ")}>
                    {stats.currentStreak}연승 중!
                    {stats.currentStreak >= 5 && " 🔥🔥🔥"}
                    {stats.currentStreak >= 3 && stats.currentStreak < 5 && " 🔥"}
                  </span>
                </div>
              </div>
            )}

            {/* Recent results */}
            {recentResults.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-1)]">
                <p className="text-xs font-semibold text-[var(--fg-secondary)] font-sans mb-3">최근 결과</p>
                <div className="flex gap-2">
                  {recentResults.map((r) => (
                    <div
                      key={r.roundId}
                      className={[
                        "flex-1 py-2 px-1 rounded-[var(--radius-sm)] text-center border",
                        r.isCorrect
                          ? "bg-[var(--positive-bg)] border-[var(--positive)]/20"
                          : "bg-[var(--negative-bg)] border-[var(--negative)]/20",
                      ].join(" ")}
                    >
                      <p className="text-sm font-bold">{r.isCorrect ? "✅" : "❌"}</p>
                      <p className={[
                        "text-xs font-mono font-bold tabular-nums",
                        r.isCorrect ? "text-[var(--positive)]" : "text-[var(--negative)]",
                      ].join(" ")}>
                        {r.isCorrect ? `+${r.score}` : "0"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Missions */}
            {dailyMissions && (
              <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-1)]">
                <div className="flex items-center gap-1.5 mb-3">
                  <Star size={13} className="text-[var(--brand-primary)]" />
                  <span className="text-sm font-semibold text-[var(--fg-primary)] font-sans">오늘의 미션</span>
                </div>
                <div className="space-y-2">
                  {dailyMissions.missions.map((mission, idx) => {
                    const progress = dailyMissions.progress[idx];
                    const pct = Math.min(100, Math.round((progress.current / mission.target) * 100));
                    return (
                      <div key={mission.id} className={[
                        "p-3 rounded-[var(--radius-sm)] border",
                        progress.claimed ? "bg-[var(--bg-primary)] border-[var(--border-secondary)] opacity-60" :
                        progress.completed ? "bg-[var(--brand-secondary)] border-[var(--brand-primary)]/30" :
                        "bg-[var(--bg-primary)] border-[var(--border-primary)]",
                      ].join(" ")}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-[var(--fg-primary)] font-sans">
                            {mission.title}
                          </span>
                          {progress.completed && !progress.claimed ? (
                            <button
                              onClick={() => claimMissionReward(mission.id)}
                              className="text-xs font-bold text-[var(--brand-primary)] bg-[var(--brand-secondary)] px-2 py-0.5 rounded-full border border-[var(--brand-primary)]/30 btn-press"
                            >
                              +{mission.reward}점 받기
                            </button>
                          ) : progress.claimed ? (
                            <span className="text-xs text-[var(--fg-secondary)] font-sans">완료 ✅</span>
                          ) : (
                            <span className="text-xs text-[var(--fg-secondary)] font-mono tabular-nums">
                              {progress.current}/{mission.target}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--fg-secondary)] font-sans mb-1.5">{mission.description}</p>
                        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={[
                              "h-full rounded-full transition-all duration-300",
                              progress.completed ? "bg-[var(--brand-primary)]" : "bg-[var(--positive)]",
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
            <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-3 border border-[var(--border-primary)] text-center">
              <p className="text-xs text-[var(--fg-secondary)] font-sans">
                🏆 {getCurrentSeason().label} 시즌 · 남은 시간 {getSeasonTimeRemaining().days}일 {getSeasonTimeRemaining().hours}시간
              </p>
            </div>

            {/* Tomorrow bonus teaser */}
            {stats.totalRounds > 0 && (
              <div className="bg-[var(--brand-secondary)] rounded-[var(--radius-md)] p-3 border border-[var(--brand-primary)]/20 text-center">
                <p className="text-xs text-[var(--brand-primary)] font-sans font-semibold">
                  🍌 내일 다시 오면 출석 보너스! ({Math.min(7, (useGameStore.getState().attendance.streak || 0) + 1)}일차 보상 대기중)
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[var(--fg-tertiary)] font-sans">
          소수파 보너스 최대 5배 · ⚡ 스피드 라운드 1.5배!
        </p>
      </div>

      {resolvedResult && (
        <ResultOverlay
          result={resolvedResult}
          onDismiss={handleResultDismiss}
          onShare={() => setShareResult(resolvedResult)}
        />
      )}

      {shareResult && (
        <ShareCard
          result={shareResult}
          totalScore={totalScore}
          level={avatarLevel.level}
          onClose={() => setShareResult(null)}
        />
      )}

      {!hasSeenOnboarding && (
        <Onboarding onComplete={markOnboardingSeen} />
      )}
    </>
  );
}
