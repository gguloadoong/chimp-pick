"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Trophy } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { getPrice, onPriceUpdate, computeStats, setRoundDuration, getCurrentSeason, getSeasonTimeRemaining } from "@/lib/game-engine";
import { playPickSound, playDrumroll, playWinSound, playLoseSound } from "@/lib/sound";
import { useToastStore } from "@/stores/toastStore";
import { formatPrice, formatChange } from "@/lib/format";
import { useCountdown } from "@/hooks/useCountdown";
import { useRealtimePrices } from "@/hooks/useRealtimePrices";
import { usePrediction } from "@/hooks/usePrediction";
import { AVATAR_LEVELS } from "@/types";
import type { RoundResult } from "@/types";
import type { QuestionCategory } from "@/types";
import MiniChart from "@/components/game/MiniChart";
import BetSlider from "@/components/game/BetSlider";
import CrowdGauge from "@/components/game/CrowdGauge";
import ResultOverlay from "@/components/game/ResultOverlay";
import ShareCard from "@/components/game/ShareCard";
import Onboarding from "@/components/game/Onboarding";
import ChimpCharacter from "@/components/character/ChimpCharacter";

const MAX_CHART_TICKS = 20;

// ── 카테고리 테마 (색상 + 이모지) ──────────────────────────────────
const CATEGORY_THEME: Record<QuestionCategory, { color: string; bg: string }> = {
  price:  { color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
  fun:    { color: "#FF6B9D", bg: "rgba(255,107,157,0.08)" },
  trivia: { color: "#4ECDC4", bg: "rgba(78,205,196,0.08)" },
  sports: { color: "#45B7D1", bg: "rgba(69,183,209,0.08)" },
  trend:  { color: "#96CEB4", bg: "rgba(150,206,180,0.08)" },
};

// ── 원형 카운트다운 타이머 (SVG) ──────────────────────────────────
function CircularTimer({
  pct,
  timeLeft,
  catColor,
}: {
  pct: number;
  timeLeft: number;
  catColor: string;
}) {
  const r = 40;
  const circ = 2 * Math.PI * r; // 251.33
  const offset = circ * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const urgent = timeLeft < 10_000;
  const danger = timeLeft < 5_000;
  const strokeColor = danger
    ? "var(--negative)"
    : urgent
    ? "var(--warning)"
    : catColor;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="6"
        />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={[
            "pixel-font text-[16px] tabular-nums",
            danger
              ? "text-[var(--negative)] animate-urgent"
              : urgent
              ? "text-[var(--warning)] animate-urgent"
              : "text-[var(--fg-primary)]",
          ].join(" ")}
        >
          {Math.ceil(timeLeft / 1000)}
        </span>
      </div>
    </div>
  );
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
  } = useGameStore();

  const { roundDuration, soundEnabled, hasSeenOnboarding, markOnboardingSeen, theme, setTheme, accentColor, setAccentColor } = useSettingsStore();

  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => { ensureDailyMissions(); }, [ensureDailyMissions]);
  useEffect(() => { setRoundDuration(roundDuration); }, [roundDuration]);
  useEffect(() => { setTheme("dark"); setAccentColor(accentColor); }, []);

  const stats = useMemo(() => computeStats(roundHistory), [roundHistory]);
  const avatarLevel = useMemo(() => {
    return AVATAR_LEVELS.reduce((best, lvl) => {
      return stats.wins >= lvl.minWins ? lvl : best;
    }, AVATAR_LEVELS[0]);
  }, [stats.wins]);

  const [priceTicks, setPriceTicks] = useState<number[]>([]);
  const [priceBTicks, setPriceBTicks] = useState<number[]>([]);
  const [resolvedResult, setResolvedResult] = useState<RoundResult | null>(null);
  const [shareResult, setShareResult] = useState<RoundResult | null>(null);
  const [currentPriceBData, setCurrentPriceBData] = useState<ReturnType<typeof getPrice> | null>(null);
  const [showExtras, setShowExtras] = useState(false);

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
    if (!roundSymbolB || !isComparison) return;
    let first = true;
    const update = () => {
      const price = getPrice(roundSymbolB);
      setCurrentPriceBData(price);
      setPriceBTicks((prev) => {
        if (first) { first = false; return [price.price]; }
        const next = [...prev, price.price];
        return next.length > MAX_CHART_TICKS ? next.slice(-MAX_CHART_TICKS) : next;
      });
    };
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

  const { user, applyPredictionResult } = useAuthStore();

  const [betAmount, setBetAmount] = useState(50);

  const { submitPrediction, isSubmitting, activePrediction } = usePrediction({
    onSuccess: () => addToast("예측 등록 완료! 🍌", "✅", "success"),
    onError: (msg) => addToast(msg, "❌", "warning"),
  });

  useEffect(() => {
    if (!activePrediction || activePrediction.result === "PENDING") return;
    applyPredictionResult(activePrediction.result, activePrediction.reward, activePrediction.betAmount);
  }, [activePrediction?.id, activePrediction?.result, applyPredictionResult]);

  const handlePick = useCallback((direction: "UP" | "DOWN") => {
    if (isSubmitting) return;
    pickDirection(direction);
    if (soundEnabled) playPickSound();
    if (currentRound?.symbol) {
      void submitPrediction(currentRound.symbol, direction, roundDuration, betAmount);
    }
  }, [isSubmitting, pickDirection, soundEnabled, currentRound, roundDuration, betAmount, submitPrediction]);

  const handleResultDismiss = useCallback(() => setResolvedResult(null), []);

  const canPick = currentRound?.phase === "OPEN" && !myPick;
  const currentPrice = currentRound ? getPrice(currentRound.symbol) : null;

  // 마지막 5초 햅틱 피드백
  const timeLeftSec = Math.ceil(countdown.timeLeft / 1000);
  useEffect(() => {
    if (timeLeftSec > 5 || timeLeftSec <= 0 || myPick || currentRound?.phase !== "OPEN") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(80);
    }
  }, [timeLeftSec, myPick, currentRound?.phase]);

  const upPct = currentRound?.upRatio ?? 50;
  const downPct = 100 - upPct;
  const upScore = upPct > 0 && downPct > 0 ? Math.round(100 * (downPct / upPct)) : 100;
  const downScore = upPct > 0 && downPct > 0 ? Math.round(100 * (upPct / downPct)) : 100;

  const recentResults = roundHistory.slice(0, 5);

  // 카테고리 테마 주입
  const catTheme = currentRound
    ? (CATEGORY_THEME[currentRound.questionCategory] ?? CATEGORY_THEME.trivia)
    : CATEGORY_THEME.trivia;

  // 소수파 보너스 계산 (선택 후만 의미 있음)
  const minorityBonus = myPick
    ? (() => {
        const myRatio = myPick.direction === "UP" ? upPct : downPct;
        const minorityRatio = Math.min(upPct, downPct);
        const isMinority = myRatio === minorityRatio;
        const bonus = minorityRatio > 0
          ? Math.min(2.0, 1.0 + (1.0 - (minorityRatio * 2) / 100))
          : 1.0;
        return { isMinority, bonus };
      })()
    : null;

  return (
    <>
      <div
        className="max-w-lg mx-auto px-4 pt-4 pb-40 flex flex-col gap-4 dot-grid"
        style={{ "--cat-color": catTheme.color, "--cat-bg": catTheme.bg } as React.CSSProperties}
        data-testid="game-root"
      >
        {/* ── 최소화 헤더 ── */}
        <div className="flex items-center justify-between" data-testid="game-header">
          {/* 카테고리 뱃지 */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-sans transition-all duration-500 pixel-badge pixel-font"
            style={{ color: catTheme.color, background: catTheme.bg }}
          >
            <span>{currentRound?.questionEmoji ?? "🦍"}</span>
            <span>{currentRound?.questionLabel ?? "침팬지픽"}</span>
            {currentRound?.isSpeedRound && <span className="text-xs">⚡</span>}
          </div>

          {/* 잔고 + 점수 */}
          <div className="flex items-center gap-2">
            {user != null && (
              <div className="flex items-center gap-1 bg-[var(--brand-secondary)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
                <span className="text-xs">🍌</span>
                <span className="font-mono font-bold text-[var(--brand-primary)] tabular-nums text-sm" data-testid="banana-balance">
                  {(user.bananaCoins ?? 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-[var(--brand-secondary)] px-2.5 py-1.5 rounded-[var(--radius-sm)]">
              <Trophy size={12} className="text-[var(--brand-primary)]" />
              <span className="font-mono font-bold text-[var(--brand-primary)] tabular-nums text-sm">
                {totalScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── 메인 게임 카드 ── */}
        {currentRound ? (
          <div
            className="bg-[var(--bg-secondary)] pixel-card overflow-hidden scanlines"
            data-testid="round-card"
          >
            {/* 카테고리 컬러 상단 줄 */}
            <div className="h-1 w-full transition-all duration-500" style={{ background: catTheme.color }} />

            <div className="p-5">
              {/* ROUND N */}
              <p
                className="pixel-font text-[9px] tracking-[0.2em] mb-3 transition-colors duration-500"
                style={{ color: catTheme.color }}
              >
                ROUND {currentRound.id?.slice(-3) ?? "—"}
              </p>

              {/* 질문 카드 (주인공) */}
              <div
                className="p-4 mb-4 border-l-4 transition-all duration-500"
                style={{ borderColor: catTheme.color, background: catTheme.bg }}
              >
                <p className="text-xl font-heading font-bold text-[var(--fg-primary)] leading-snug mb-2">
                  {currentRound.questionTitle}
                </p>
                {currentRound.questionCategory !== "price" && currentRound.questionDesc && (
                  <p className="text-sm text-[var(--fg-secondary)] font-sans">
                    {currentRound.questionDesc}
                  </p>
                )}

                {/* 시세 카테고리: VS 배틀 레이아웃 */}
                {currentRound.questionCategory === "price" && currentPrice && (
                  <div className="mt-3">
                    {currentRound.isComparison ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[var(--bg-primary)] rounded-[var(--radius-sm)] p-2.5 text-center">
                          <p className="text-[11px] text-[var(--fg-secondary)] font-sans mb-1">{currentRound.symbolName}</p>
                          <p className="text-lg font-mono font-bold tabular-nums text-[var(--fg-primary)] leading-none">
                            {formatPrice(currentPrice.price)}
                            <span className="text-[10px] text-[var(--fg-tertiary)] ml-0.5">원</span>
                          </p>
                          {(() => {
                            const pct = currentRound.entryPrice > 0
                              ? ((currentPrice.price - currentRound.entryPrice) / currentRound.entryPrice) * 100 : 0;
                            return (
                              <p className={["text-[11px] font-mono font-bold tabular-nums mt-0.5", pct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                                {pct >= 0 ? "+" : ""}{formatChange(pct)}
                              </p>
                            );
                          })()}
                          <MiniChart prices={priceTicks} height={32} className="mt-1 opacity-70" />
                        </div>
                        <div className="bg-[var(--bg-primary)] rounded-[var(--radius-sm)] p-2.5 text-center">
                          <p className="text-[11px] text-[var(--fg-secondary)] font-sans mb-1">{currentRound.symbolNameB}</p>
                          <p className="text-lg font-mono font-bold tabular-nums text-[var(--fg-primary)] leading-none">
                            {currentPriceBData ? formatPrice(currentPriceBData.price) : "—"}
                            <span className="text-[10px] text-[var(--fg-tertiary)] ml-0.5">원</span>
                          </p>
                          {currentPriceBData && currentRound.entryPriceB && (() => {
                            const pct = currentRound.entryPriceB > 0
                              ? ((currentPriceBData.price - currentRound.entryPriceB) / currentRound.entryPriceB) * 100 : 0;
                            return (
                              <p className={["text-[11px] font-mono font-bold tabular-nums mt-0.5", pct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                                {pct >= 0 ? "+" : ""}{formatChange(pct)}
                              </p>
                            );
                          })()}
                          <MiniChart prices={priceBTicks} height={32} className="mt-1 opacity-70" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[11px] text-[var(--fg-secondary)] font-sans">시작가</p>
                          <p className="text-sm font-mono tabular-nums text-[var(--fg-secondary)]">
                            {formatPrice(currentRound.entryPrice)}원
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-[var(--fg-secondary)] font-sans">현재가</p>
                          <p className="text-2xl font-bold font-mono tabular-nums text-[var(--fg-primary)] leading-none">
                            {formatPrice(currentPrice.price)}
                            <span className="text-[11px] text-[var(--fg-tertiary)] ml-0.5">원</span>
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
                          <MiniChart prices={priceTicks} height={36} className="mt-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 원형 카운트다운 타이머 (OPEN) */}
              {currentRound.phase === "OPEN" && (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <CircularTimer
                    pct={countdown.percentage}
                    timeLeft={countdown.timeLeft}
                    catColor={catTheme.color}
                  />
                  {countdown.timeLeft < 10_000 && (
                    <p className="text-xs font-sans font-semibold text-[var(--warning)] animate-urgent">
                      {countdown.timeLeft < 5_000 ? "마지막 찬스!" : "서둘러!"}
                    </p>
                  )}
                </div>
              )}

              {/* CLOSED: 드럼롤 */}
              {currentRound.phase === "CLOSED" && (
                <div className="text-center py-4 mb-4">
                  <div className="animate-heartbeat inline-block mb-2">
                    <span className="text-4xl">🥁</span>
                  </div>
                  <p className="text-sm font-heading font-bold text-[var(--fg-primary)] animate-urgent">
                    두근두근... 결과 발표 중!
                  </p>
                </div>
              )}

              {/* RESOLVED: 결과 요약 */}
              {currentRound.phase === "RESOLVED" && currentRound.result && (
                <div className={[
                  "mb-4 p-3 rounded-[var(--radius-md)] text-center border",
                  currentRound.result === "UP"
                    ? "bg-[var(--positive-bg)] border-[var(--positive)]/30"
                    : "bg-[var(--negative-bg)] border-[var(--negative)]/30",
                ].join(" ")}>
                  <p className="text-base font-bold font-heading text-[var(--fg-primary)]">
                    정답: {currentRound.result === "UP" ? "📈 UP" : "📉 DOWN"}
                  </p>
                  {currentRound.questionCategory === "price" && (
                    <p className="text-xs text-[var(--fg-secondary)] font-mono mt-1">
                      {formatPrice(currentRound.entryPrice)} → {formatPrice(currentRound.exitPrice ?? 0)}원
                    </p>
                  )}
                </div>
              )}

              {/* 소수파 비율: 선택 후에만 공개 */}
              {myPick && (currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (
                <div className="mb-4">
                  <CrowdGauge upPct={upPct} picked={myPick.direction} upScore={upScore} downScore={downScore} />
                  {minorityBonus && minorityBonus.bonus > 1.05 && (
                    <div className="mt-2 text-center">
                      <span className={[
                        "inline-flex items-center gap-1 px-3 py-1 text-xs font-bold font-sans pixel-badge",
                        minorityBonus.isMinority
                          ? "bg-[var(--brand-secondary)] text-[var(--brand-primary)]"
                          : "bg-[var(--bg-tertiary)] text-[var(--fg-secondary)]",
                      ].join(" ")}>
                        {minorityBonus.isMinority
                          ? `⚡ 소수파! 역배 x${minorityBonus.bonus.toFixed(1)} 적용 중`
                          : `다수파 — 소수파 역배 x${minorityBonus.bonus.toFixed(1)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 베팅 슬라이더 (선택 전만) */}
              {canPick && (
                <div
                  className="bg-[var(--bg-tertiary)] p-3 pixel-card"
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

            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] p-8 text-center">
            <div className="animate-bounce-chimp inline-block mb-3">
              <ChimpCharacter mood="idle" size={64} className="mx-auto" />
            </div>
            <p className="text-[var(--fg-secondary)] font-sans text-sm">라운드 준비 중...</p>
          </div>
        )}

        {/* 챌린지 배너 */}
        {challenge?.active ? (
          <div className="bg-[var(--brand-secondary)] rounded-[var(--radius-md)] p-3 border border-[var(--brand-primary)]/30 text-center">
            <p className="font-heading font-bold text-[var(--brand-primary)] text-sm">
              🎯 챌린지 {challenge.wins}/{5 - challenge.roundsLeft + challenge.wins} 적중 · 남은 {challenge.roundsLeft}라운드
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

        {/* 기록 더보기 토글 */}
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="w-full py-2 text-xs text-[var(--fg-tertiary)] font-sans font-semibold"
        >
          {showExtras ? "▲ 접기" : `▼ 미션 · 기록 · 시즌${stats.currentStreak >= 2 ? ` · 🔥${stats.currentStreak}연승` : ""}`}
        </button>

        {showExtras && (
          <>
            {/* 연승 배너 */}
            {stats.currentStreak >= 2 && (
              <div className={[
                "rounded-[var(--radius-md)] p-3 border text-center",
                stats.currentStreak >= 5
                  ? "bg-[var(--brand-secondary)] border-[var(--brand-primary)]/40"
                  : "bg-[var(--positive-bg)] border-[var(--positive)]/20",
              ].join(" ")}>
                <p className={[
                  "font-heading font-bold text-sm",
                  stats.currentStreak >= 5 ? "text-[var(--brand-primary)]" : "text-[var(--positive)]",
                ].join(" ")}>
                  🔥 {stats.currentStreak}연승 중!{stats.currentStreak >= 5 && " 🔥🔥🔥"}
                </p>
              </div>
            )}

            {/* 최근 결과 */}
            {recentResults.length > 0 && (
              <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-4">
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
                      <p className={["text-xs font-mono font-bold tabular-nums", r.isCorrect ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                        {r.isCorrect ? `+${r.score}` : "0"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 데일리 미션 */}
            {dailyMissions && (
              <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-4">
                <p className="text-sm font-semibold text-[var(--fg-primary)] font-sans mb-3">⭐ 오늘의 미션</p>
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
                          <span className="text-xs font-semibold text-[var(--fg-primary)] font-sans">{mission.title}</span>
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
                            <span className="text-xs text-[var(--fg-secondary)] font-mono tabular-nums">{progress.current}/{mission.target}</span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--fg-secondary)] font-sans mb-1.5">{mission.description}</p>
                        <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={["h-full rounded-full transition-all duration-300", progress.completed ? "bg-[var(--brand-primary)]" : "bg-[var(--positive)]"].join(" ")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 시즌 정보 */}
            <div className="bg-[var(--bg-secondary)] rounded-[var(--radius-md)] p-3 text-center">
              <p className="text-xs text-[var(--fg-secondary)] font-sans">
                🏆 {getCurrentSeason().label} 시즌 · 남은 시간 {getSeasonTimeRemaining().days}일 {getSeasonTimeRemaining().hours}시간
              </p>
            </div>
          </>
        )}

        <p className="text-center text-xs text-[var(--fg-tertiary)] font-sans">
          소수파 보너스 최대 5배 · ⚡ 스피드 라운드 1.5배!
        </p>
      </div>

      {/* ── 하단 고정 A/B 선택 버튼 ── */}
      {currentRound && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-t-2 border-[rgba(255,255,255,0.1)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            {/* 선택 완료 상태 */}
            {myPick && (currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (
              <div
                className={[
                  "rounded-[var(--radius-sm)] py-2 text-center text-sm font-semibold font-sans",
                  myPick.direction === "UP" ? "text-[var(--positive)]" : "text-[var(--negative)]",
                ].join(" ")}
                role="status"
                aria-live="polite"
              >
                {currentRound.phase === "CLOSED"
                  ? `${myPick.direction === "UP" ? "🚀" : "💀"} 예측 완료 — 🥁 판정 중...`
                  : `✓ ${myPick.direction === "UP" ? (currentRound.optionA ?? "UP") : (currentRound.optionB ?? "DOWN")} 선택 완료!`}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3" data-testid="pick-buttons">
              <button
                data-testid="btn-up"
                disabled={!canPick}
                onClick={() => handlePick("UP")}
                className={[
                  "flex flex-col items-center justify-center gap-1.5 py-[18px] pixel-btn-up",
                  "bg-[var(--positive)] text-white font-semibold text-base font-sans transition-all duration-150 select-none",
                  myPick?.direction === "UP" ? "ring-2 ring-white/40 scale-[1.02] pixel-btn-chosen" : "",
                  myPick && myPick.direction !== "UP" ? "pixel-btn-unchosen" : "",
                  !canPick && !myPick ? "opacity-40 cursor-not-allowed pointer-events-none"
                    : myPick && myPick.direction !== "UP" ? "pointer-events-none"
                    : "cursor-pointer",
                ].join(" ")}
                aria-label="UP 예측"
              >
                <ArrowUp size={24} strokeWidth={3} />
                <span className="font-heading font-bold tracking-wide text-sm">
                  {currentRound?.optionA ?? "UP 🚀"}
                </span>
                {canPick && (
                  <span className="text-[11px] opacity-80">
                    {upPct < 50 ? `🔥 ${upScore}점` : `${upScore}점`}
                  </span>
                )}
              </button>

              <button
                data-testid="btn-down"
                disabled={!canPick}
                onClick={() => handlePick("DOWN")}
                className={[
                  "flex flex-col items-center justify-center gap-1.5 py-[18px] pixel-btn-down",
                  "bg-[var(--negative)] text-white font-semibold text-base font-sans transition-all duration-150 select-none",
                  myPick?.direction === "DOWN" ? "ring-2 ring-white/40 scale-[1.02] pixel-btn-chosen" : "",
                  myPick && myPick.direction !== "DOWN" ? "pixel-btn-unchosen" : "",
                  !canPick && !myPick ? "opacity-40 cursor-not-allowed pointer-events-none"
                    : myPick && myPick.direction !== "DOWN" ? "pointer-events-none"
                    : "cursor-pointer",
                ].join(" ")}
                aria-label="DOWN 예측"
              >
                <ArrowDown size={24} strokeWidth={3} />
                <span className="font-heading font-bold tracking-wide text-sm">
                  {currentRound?.optionB ?? "DOWN 💀"}
                </span>
                {canPick && (
                  <span className="text-[11px] opacity-80">
                    {downPct < 50 ? `🔥 ${downScore}점` : `${downScore}점`}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
