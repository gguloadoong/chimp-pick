"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { onPriceUpdate, getPrice } from "@/lib/game-engine";
import { formatPrice, formatBanana, formatChange } from "@/lib/format";
import { useCountdown } from "@/hooks/useCountdown";
import {
  SYMBOLS,
  TIMEFRAME_LABELS,
  BET_MULTIPLIER,
  MIN_BET,
  MAX_BET,
  type Prediction,
} from "@/types";
import { BananaCounter } from "@/components/ui";
import SymbolSelector from "@/components/game/SymbolSelector";
import MiniChart from "@/components/game/MiniChart";
import ResultOverlay from "@/components/game/ResultOverlay";
import ChimpCharacter from "@/components/character/ChimpCharacter";

const MAX_CHART_TICKS = 20;
const FREE_BANANA_COOLDOWN_MS = 3600_000;

function getChimpMood(
  activePrediction: { direction: string } | null,
  isSubmitting: boolean,
): "idle" | "thinking" | "up" | "down" {
  if (isSubmitting) return "thinking";
  if (activePrediction?.direction === "UP") return "up";
  if (activePrediction?.direction === "DOWN") return "down";
  return "idle";
}

export default function GamePage() {
  const {
    selectedSymbol,
    selectedTimeframe,
    betAmount,
    currentPrice,
    activePrediction,
    isSubmitting,
    bananaCoins,
    lastFreeBananaAt,
    setSymbol,
    setTimeframe,
    setBetAmount,
    refreshPrice,
    submitPrediction,
    checkAndResolve,
    claimFreeBanana,
    reset,
  } = useGameStore();

  const [priceTicks, setPriceTicks] = useState<number[]>([]);
  const [resolvedPrediction, setResolvedPrediction] = useState<Prediction | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, ReturnType<typeof getPrice>>>({});

  const countdown = useCountdown(
    activePrediction?.expiresAt ?? null,
    activePrediction?.createdAt ?? null,
  );

  // Subscribe to price updates from engine
  useEffect(() => {
    const update = () => {
      refreshPrice();
      const price = getPrice(selectedSymbol.symbol);
      setPriceTicks((prev) => {
        const next = [...prev, price.price];
        return next.length > MAX_CHART_TICKS ? next.slice(-MAX_CHART_TICKS) : next;
      });
      // Update all symbol prices for selector
      const map: Record<string, ReturnType<typeof getPrice>> = {};
      for (const s of SYMBOLS) {
        map[s.symbol] = getPrice(s.symbol);
      }
      setPriceMap(map);
    };

    update(); // initial
    const unsub = onPriceUpdate(update);
    return unsub;
  }, [selectedSymbol.symbol, refreshPrice]);

  // Check and resolve active prediction
  useEffect(() => {
    if (!activePrediction) return;

    const id = setInterval(() => {
      const resolved = checkAndResolve();
      if (resolved) {
        setResolvedPrediction(resolved);
      }
    }, 500);

    return () => clearInterval(id);
  }, [activePrediction, checkAndResolve]);

  const handleSymbolSelect = useCallback((sym: typeof SYMBOLS[0]) => {
    setSymbol(sym);
    setPriceTicks([]);
  }, [setSymbol]);

  const handlePredict = useCallback((direction: "UP" | "DOWN") => {
    if (isSubmitting || activePrediction || bananaCoins < betAmount) return;

    useGameStore.setState({ selectedDirection: direction, isSubmitting: true });
    // Small delay for UI feedback
    requestAnimationFrame(() => {
      submitPrediction();
    });
  }, [isSubmitting, activePrediction, bananaCoins, betAmount, submitPrediction]);

  const handleResultDismiss = useCallback(() => {
    setResolvedPrediction(null);
    reset();
  }, [reset]);

  // Free banana cooldown
  const canClaimFree = useMemo(() => {
    if (bananaCoins > 0) return false;
    if (!lastFreeBananaAt) return true;
    return new Date().getTime() - new Date(lastFreeBananaAt).getTime() >= FREE_BANANA_COOLDOWN_MS;
  }, [bananaCoins, lastFreeBananaAt]);

  const canPredict = !activePrediction && !isSubmitting && bananaCoins >= betAmount;
  const potentialWin = Math.round(betAmount * BET_MULTIPLIER);
  const chimpMood = getChimpMood(activePrediction, isSubmitting);

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between" data-testid="game-header">
          <div className="flex items-center gap-1">
            <ChimpCharacter
              mood={chimpMood}
              size={44}
              className={activePrediction ? "animate-bounce" : "animate-float"}
            />
            <span className="text-xl font-heading font-bold text-text-primary">
              침팬지픽
            </span>
          </div>
          <BananaCounter balance={bananaCoins} data-testid="banana-counter" />
        </div>

        {/* Free banana button */}
        {canClaimFree && (
          <button
            onClick={claimFreeBanana}
            className="w-full py-3 rounded-2xl border-2 border-banana bg-banana/10 text-banana font-bold text-sm font-sans clay-sm btn-clay animate-pulse"
          >
            무료 바나나 받기 (+20) 🍌
          </button>
        )}

        {/* Symbol selector */}
        <SymbolSelector
          symbols={SYMBOLS}
          selected={selectedSymbol}
          priceMap={priceMap}
          onSelect={handleSymbolSelect}
          data-testid="symbol-selector"
        />

        {/* Price display area */}
        <div
          className="bg-white rounded-3xl p-4 flex flex-col gap-3 border-2 border-card-border clay"
          data-testid="price-area"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-xs mb-1 font-sans">
                {selectedSymbol.nameKr}
              </p>
              {currentPrice ? (
                <>
                  <p className="text-3xl font-bold font-mono tabular-nums text-text-primary">
                    {formatPrice(currentPrice.price)}
                    <span className="text-sm text-text-secondary ml-1">원</span>
                  </p>
                  <p
                    className={[
                      "text-sm font-semibold mt-0.5 font-sans",
                      currentPrice.changePct24h >= 0 ? "text-up" : "text-down",
                    ].join(" ")}
                  >
                    {formatChange(currentPrice.changePct24h)} (24h)
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Loader2 size={16} className="animate-spin text-banana" />
                  <span className="text-sm font-sans">가격 로딩 중...</span>
                </div>
              )}
            </div>

            {currentPrice && (
              <div className="text-right text-xs text-text-secondary space-y-1 font-sans">
                <p>
                  고가{" "}
                  <span className="text-up font-mono tabular-nums font-semibold">
                    {formatPrice(currentPrice.high24h)}
                  </span>
                </p>
                <p>
                  저가{" "}
                  <span className="text-down font-mono tabular-nums font-semibold">
                    {formatPrice(currentPrice.low24h)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Mini chart */}
          <MiniChart
            prices={priceTicks}
            height={72}
            className="mt-1"
            data-testid="mini-chart"
          />
        </div>

        {/* Timeframe selector */}
        <div
          className="flex gap-2"
          role="group"
          aria-label="예측 시간대 선택"
          data-testid="timeframe-selector"
        >
          {(Object.entries(TIMEFRAME_LABELS) as [keyof typeof TIMEFRAME_LABELS, string][]).map(
            ([tf, label]) => {
              const isActive = selectedTimeframe === tf;
              return (
                <button
                  key={tf}
                  data-testid={`timeframe-${tf}`}
                  disabled={!!activePrediction}
                  onClick={() => setTimeframe(tf)}
                  className={[
                    "flex-1 py-2 rounded-2xl text-sm font-semibold font-sans transition-all duration-150",
                    "border-2 cursor-pointer select-none btn-clay",
                    isActive
                      ? "border-banana bg-banana/15 text-banana clay"
                      : "border-card-border bg-white text-text-secondary hover:border-banana/40 hover:text-text-primary",
                    activePrediction ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            }
          )}
        </div>

        {/* Bet controls */}
        <div
          className="bg-white rounded-3xl p-4 flex flex-col gap-3 border-2 border-card-border clay"
          data-testid="bet-controls"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary font-sans font-semibold">베팅액</span>
            <span className="text-sm text-banana font-bold font-sans">
              이기면 +{formatBanana(potentialWin)} 🍌
            </span>
          </div>

          {/* Amount display + quick buttons */}
          <div className="flex items-center gap-2">
            <button
              data-testid="bet-decrease"
              onClick={() => setBetAmount(betAmount - 5)}
              disabled={betAmount <= MIN_BET || !!activePrediction}
              className={[
                "w-10 h-10 rounded-2xl border-2 border-card-border bg-white text-text-primary",
                "flex items-center justify-center text-xl font-bold clay-sm btn-clay",
                "transition-all hover:border-banana hover:text-banana",
                betAmount <= MIN_BET || activePrediction
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer",
              ].join(" ")}
            >
              −
            </button>

            <div className="flex-1 text-center">
              <span
                className="text-3xl font-bold font-mono text-banana tabular-nums"
                data-testid="bet-amount-display"
              >
                {betAmount}
              </span>
              <span className="text-base text-text-secondary ml-1">🍌</span>
            </div>

            <button
              data-testid="bet-increase"
              onClick={() => setBetAmount(betAmount + 5)}
              disabled={betAmount >= MAX_BET || !!activePrediction}
              className={[
                "w-10 h-10 rounded-2xl border-2 border-card-border bg-white text-text-primary",
                "flex items-center justify-center text-xl font-bold clay-sm btn-clay",
                "transition-all hover:border-banana hover:text-banana",
                betAmount >= MAX_BET || activePrediction
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer",
              ].join(" ")}
            >
              +
            </button>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={MIN_BET}
            max={MAX_BET}
            step={1}
            value={betAmount}
            disabled={!!activePrediction}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            data-testid="bet-slider"
            className="w-full accent-banana cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="베팅액 슬라이더"
          />

          {/* Quick bet buttons */}
          <div className="flex gap-1.5">
            {[1, 5, 10, 25, 50].map((val) => (
              <button
                key={val}
                onClick={() => setBetAmount(val)}
                disabled={!!activePrediction}
                className={[
                  "flex-1 py-1.5 rounded-xl text-xs font-bold font-sans border-2 transition-all btn-clay",
                  betAmount === val
                    ? "border-banana text-banana bg-banana/12 clay-sm"
                    : "border-card-border text-text-secondary bg-white hover:border-banana/40",
                  activePrediction ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
                ].join(" ")}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Insufficient balance warning */}
          {bananaCoins < betAmount && (
            <p className="text-xs text-down text-center font-sans font-semibold" role="alert">
              바나나코인이 부족해요 🍌
            </p>
          )}
        </div>

        {/* Active prediction banner */}
        {activePrediction && (
          <div
            className={[
              "rounded-3xl p-4 border-2",
              activePrediction.direction === "UP"
                ? "bg-white border-up/40 clay-up"
                : "bg-white border-down/40 clay-down",
            ].join(" ")}
            data-testid="active-prediction-banner"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">
                  {activePrediction.direction === "UP" ? "🚀" : "💀"}
                </span>
                <span
                  className={[
                    "font-bold text-sm font-sans",
                    activePrediction.direction === "UP" ? "text-up" : "text-down",
                  ].join(" ")}
                >
                  {activePrediction.direction} 예측 진행 중
                </span>
              </div>
              <Loader2 size={16} className="animate-spin text-text-secondary" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
              <div>
                <p className="text-text-secondary mb-0.5 font-sans">진입가</p>
                <p className="font-mono text-text-primary tabular-nums font-semibold">
                  {formatPrice(activePrediction.entryPrice)}
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-0.5 font-sans">베팅</p>
                <p className="font-mono text-banana tabular-nums font-bold">
                  {activePrediction.betAmount} 🍌
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-0.5 font-sans">남은 시간</p>
                <p
                  className={[
                    "font-mono tabular-nums font-bold",
                    countdown.timeLeft < 10_000 ? "text-down animate-pulse" : "text-text-primary",
                  ].join(" ")}
                >
                  {countdown.formatted}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-card-border rounded-full h-2 overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-100",
                  activePrediction.direction === "UP" ? "bg-up" : "bg-down",
                ].join(" ")}
                style={{ width: `${Math.max(0, Math.min(100, countdown.percentage))}%` }}
                role="progressbar"
                aria-valuenow={Math.round(countdown.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* UP / DOWN buttons */}
        <div className="grid grid-cols-2 gap-3" data-testid="prediction-buttons">
          <button
            data-testid="btn-up"
            disabled={!canPredict || isSubmitting}
            onClick={() => handlePredict("UP")}
            className={[
              "flex flex-col items-center justify-center gap-2 py-6 rounded-3xl",
              "border-4 border-up bg-white text-up font-bold text-xl font-sans",
              "transition-all duration-150 select-none clay-up btn-clay",
              "hover:bg-up/8",
              !canPredict || isSubmitting
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "cursor-pointer",
            ].join(" ")}
            aria-label="UP 예측"
          >
            {isSubmitting ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <ArrowUp size={32} strokeWidth={3} aria-hidden="true" />
            )}
            <span className="text-lg font-heading font-bold tracking-wide">UP 🚀</span>
          </button>

          <button
            data-testid="btn-down"
            disabled={!canPredict || isSubmitting}
            onClick={() => handlePredict("DOWN")}
            className={[
              "flex flex-col items-center justify-center gap-2 py-6 rounded-3xl",
              "border-4 border-down bg-white text-down font-bold text-xl font-sans",
              "transition-all duration-150 select-none clay-down btn-clay",
              "hover:bg-down/8",
              !canPredict || isSubmitting
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "cursor-pointer",
            ].join(" ")}
            aria-label="DOWN 예측"
          >
            {isSubmitting ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <ArrowDown size={32} strokeWidth={3} aria-hidden="true" />
            )}
            <span className="text-lg font-heading font-bold tracking-wide">DOWN 💀</span>
          </button>
        </div>

        {/* Current symbol info footer */}
        <p className="text-center text-xs text-text-secondary font-sans">
          {selectedSymbol.nameKr} ({selectedSymbol.symbol}) ·{" "}
          {TIMEFRAME_LABELS[selectedTimeframe]} 예측 ·{" "}
          배당률 {BET_MULTIPLIER}x
        </p>
      </div>

      {/* Result overlay */}
      {resolvedPrediction && resolvedPrediction.result !== "PENDING" && (
        <ResultOverlay
          prediction={resolvedPrediction}
          onDismiss={handleResultDismiss}
          data-testid="result-overlay"
        />
      )}
    </>
  );
}
