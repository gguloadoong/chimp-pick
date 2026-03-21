"use client";

import { useEffect, useCallback, useState } from "react";
import { ArrowUp, ArrowDown, Trophy, Clock, Users } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { getPrice, onPriceUpdate } from "@/lib/game-engine";
import { formatPrice, formatChange } from "@/lib/format";
import { useCountdown } from "@/hooks/useCountdown";
import type { RoundResult } from "@/types";
import MiniChart from "@/components/game/MiniChart";
import ResultOverlay from "@/components/game/ResultOverlay";
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
    pickDirection,
    resolveMyPick,
  } = useGameStore();

  const [priceTicks, setPriceTicks] = useState<number[]>([]);
  const [resolvedResult, setResolvedResult] = useState<RoundResult | null>(null);

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

  // Auto-resolve when round resolves
  const roundPhase = currentRound?.phase;

  useEffect(() => {
    if (roundPhase !== "RESOLVED" || !myPick) return;

    // Use microtask to avoid synchronous setState in effect
    queueMicrotask(() => {
      const result = resolveMyPick();
      if (result) {
        setResolvedResult(result);
      }
    });
  }, [roundPhase, myPick, resolveMyPick]);

  const handlePick = useCallback((direction: "UP" | "DOWN") => {
    pickDirection(direction);
  }, [pickDirection]);

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
              className={myPick ? "animate-bounce" : "animate-float"}
            />
            <span className="text-lg font-heading font-bold text-text-primary">
              침팬지픽
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-banana/15 px-3 py-1.5 rounded-2xl border-2 border-banana/30">
            <Trophy size={14} className="text-banana" />
            <span className="font-mono font-bold text-banana tabular-nums text-sm">
              {totalScore.toLocaleString()}
            </span>
            <span className="text-xs text-banana/70">점</span>
          </div>
        </div>

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
                  {currentRound.phase === "OPEN" && "예측 진행 중"}
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

            {/* Symbol + Price */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-banana/10 text-banana font-semibold font-sans border border-banana/20">
                    {currentRound.category === "crypto" ? "🪙 코인" : "📈 주식"}
                  </span>
                  <span className="text-sm font-semibold text-text-primary font-sans">
                    {currentRound.symbolName}
                  </span>
                </div>
                {currentPrice && (
                  <>
                    <p className="text-2xl font-bold font-mono tabular-nums text-text-primary">
                      {formatPrice(currentPrice.price)}
                      <span className="text-xs text-text-secondary ml-1">원</span>
                    </p>
                    <p className={[
                      "text-xs font-semibold font-sans",
                      currentPrice.changePct24h >= 0 ? "text-up" : "text-down",
                    ].join(" ")}>
                      {formatChange(currentPrice.changePct24h)}
                    </p>
                  </>
                )}
              </div>
              <div className="text-right text-xs text-text-secondary font-sans">
                <p>진입가</p>
                <p className="font-mono tabular-nums font-semibold text-text-primary">
                  {formatPrice(currentRound.entryPrice)}
                </p>
              </div>
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

        {/* Ratio gauge */}
        {currentRound && (currentRound.phase === "OPEN" || currentRound.phase === "CLOSED") && (
          <div className="bg-white rounded-3xl p-4 border-2 border-card-border clay" data-testid="ratio-gauge">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-text-secondary" />
                <span className="text-xs text-text-secondary font-sans font-semibold">참여 비율</span>
              </div>
              <span className="text-xs text-banana font-sans font-semibold">
                소수파 보너스 적용!
              </span>
            </div>
            {/* Gauge bar */}
            <div className="flex rounded-2xl overflow-hidden h-10 border-2 border-card-border">
              <div
                className="bg-up/20 flex items-center justify-center transition-all duration-500"
                style={{ width: `${upPct}%` }}
              >
                <span className="text-up font-bold text-sm font-sans">
                  UP {upPct}%
                </span>
              </div>
              <div
                className="bg-down/20 flex items-center justify-center transition-all duration-500"
                style={{ width: `${downPct}%` }}
              >
                <span className="text-down font-bold text-sm font-sans">
                  DOWN {downPct}%
                </span>
              </div>
            </div>
            <p className="text-xs text-text-secondary text-center mt-2 font-sans">
              적은 쪽을 맞추면 더 높은 점수!
            </p>
          </div>
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
            <span className="text-base font-heading font-bold tracking-wide">UP 🚀</span>
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
            <span className="text-base font-heading font-bold tracking-wide">DOWN 💀</span>
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

        {/* Footer info */}
        <p className="text-center text-xs text-text-secondary font-sans">
          30초마다 새 라운드 · 소수파 보너스 최대 5배 · 적게 고른 쪽이 이기면 대박!
        </p>
      </div>

      {/* Result overlay */}
      {resolvedResult && (
        <ResultOverlay
          result={resolvedResult}
          onDismiss={handleResultDismiss}
        />
      )}
    </>
  );
}
