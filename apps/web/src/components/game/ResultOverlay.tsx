"use client";

import { useEffect, useState } from "react";
import type { Prediction } from "@/types";
import { formatPrice, formatBanana } from "@/lib/format";
import { BET_MULTIPLIER } from "@/types";
import Button from "@/components/ui/Button";

const CONFETTI_ITEMS = ["🍌", "🎉", "⭐", "🎊", "✨", "💫", "🏆", "🎈"];

interface ConfettiParticle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
}

function generateConfetti(count = 16): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: CONFETTI_ITEMS[i % CONFETTI_ITEMS.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.2 + Math.random() * 0.8,
  }));
}

interface ResultOverlayProps {
  prediction: Prediction;
  onDismiss: () => void;
  "data-testid"?: string;
}

export default function ResultOverlay({
  prediction,
  onDismiss,
  "data-testid": testId,
}: ResultOverlayProps) {
  const [confetti] = useState<ConfettiParticle[]>(() => generateConfetti(20));
  const [visible, setVisible] = useState(false);

  const isWin = prediction.result === "WIN";
  const reward = prediction.reward ?? Math.round(prediction.betAmount * BET_MULTIPLIER);
  const entryPrice = prediction.entryPrice;
  const exitPrice = prediction.exitPrice;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 200);
  };

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes result-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes coin-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .confetti-particle {
          animation: confetti-fall var(--dur) var(--delay) ease-in forwards;
        }
        .result-icon {
          animation: result-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .coin-bounce {
          animation: coin-bounce 0.8s ease-in-out infinite;
        }
      `}</style>

      <div
        data-testid={testId ?? "result-overlay"}
        className={[
          "fixed inset-0 z-50 flex items-center justify-center",
          "transition-all duration-200",
          visible ? "opacity-100" : "opacity-0",
          isWin ? "bg-black/80" : "bg-black/85",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={isWin ? "예측 승리" : "예측 패배"}
        onClick={handleDismiss}
      >
        {/* Confetti (WIN only) */}
        {isWin && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((p) => (
              <span
                key={p.id}
                className="confetti-particle absolute text-xl"
                style={
                  {
                    left: `${p.x}%`,
                    top: "-24px",
                    "--dur": `${p.duration}s`,
                    "--delay": `${p.delay}s`,
                  } as React.CSSProperties
                }
              >
                {p.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Card */}
        <div
          className={[
            "relative mx-4 w-full max-w-sm rounded-3xl p-8 text-center",
            "shadow-2xl border",
            isWin
              ? "bg-bg-secondary border-up/30 shadow-[0_0_60px_rgba(0,214,143,0.2)]"
              : "bg-bg-secondary border-down/30 shadow-[0_0_60px_rgba(255,71,87,0.15)]",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Result icon */}
          <div className="result-icon text-7xl mb-4 leading-none">
            {isWin ? "🎉" : "💀"}
          </div>

          {/* Title */}
          <h2
            className={[
              "text-3xl font-bold mb-1",
              isWin ? "text-up" : "text-down",
            ].join(" ")}
            style={
              isWin
                ? { textShadow: "0 0 20px rgba(0,214,143,0.5)" }
                : { textShadow: "0 0 20px rgba(255,71,87,0.5)" }
            }
          >
            {isWin ? "승리!" : "패배..."}
          </h2>

          <p className="text-text-secondary text-sm mb-6">
            {isWin ? "침팬지의 예감이 적중했다! 🦍" : "다음엔 꼭 복수하자... 😤"}
          </p>

          {/* Price comparison */}
          {exitPrice !== null && (
            <div className="bg-white/5 rounded-2xl p-4 mb-4 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary">진입가</span>
                <span className="text-text-primary font-mono tabular-nums">
                  {formatPrice(entryPrice)}원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">청산가</span>
                <span
                  className={[
                    "font-mono tabular-nums font-semibold",
                    isWin ? "text-up" : "text-down",
                  ].join(" ")}
                >
                  {formatPrice(exitPrice)}원
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="text-text-secondary">예측 방향</span>
                <span
                  className={[
                    "font-semibold text-xs px-2 py-0.5 rounded-full",
                    prediction.direction === "UP"
                      ? "bg-up/20 text-up"
                      : "bg-down/20 text-down",
                  ].join(" ")}
                >
                  {prediction.direction === "UP" ? "UP 🚀" : "DOWN 💀"}
                </span>
              </div>
            </div>
          )}

          {/* Reward/loss display */}
          <div
            className={[
              "text-4xl font-bold mb-6 coin-bounce",
              isWin ? "text-banana" : "text-down",
            ].join(" ")}
          >
            {isWin ? `+${formatBanana(reward)} 🍌` : `-${formatBanana(prediction.betAmount)} 🍌`}
          </div>

          {/* Chimp emoji for lose */}
          {!isWin && (
            <div className="text-5xl mb-4">🦧</div>
          )}

          {/* Action button */}
          <Button
            variant={isWin ? "primary" : "down"}
            size="lg"
            className="w-full"
            data-testid="result-dismiss-btn"
            onClick={handleDismiss}
          >
            {isWin ? "다음 예측하기 🚀" : "복수하기 🔥"}
          </Button>
        </div>
      </div>
    </>
  );
}
