"use client";

import { useEffect, useState } from "react";
import type { RoundResult } from "@/types";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import ChimpCharacter from "@/components/character/ChimpCharacter";

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
  result: RoundResult;
  onDismiss: () => void;
}

export default function ResultOverlay({
  result,
  onDismiss,
}: ResultOverlayProps) {
  const [confetti] = useState<ConfettiParticle[]>(() => generateConfetti(20));
  const [visible, setVisible] = useState(false);

  const isWin = result.isCorrect;

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
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes score-bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .confetti-particle {
          animation: confetti-fall var(--dur) var(--delay) ease-in forwards;
        }
        .result-icon {
          animation: result-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .score-bounce {
          animation: score-bounce 0.8s ease-in-out infinite;
        }
      `}</style>

      <div
        data-testid="result-overlay"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center",
          "transition-all duration-200",
          visible ? "opacity-100" : "opacity-0",
          isWin ? "bg-up/10 backdrop-blur-sm" : "bg-down/10 backdrop-blur-sm",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={isWin ? "예측 성공" : "예측 실패"}
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
            "border-4 animate-pop-in",
            isWin
              ? "bg-white border-up clay-up"
              : "bg-white border-down clay-down",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Result icon */}
          <div className="result-icon mb-3">
            <ChimpCharacter
              mood={isWin ? "win" : "lose"}
              size={100}
              className="mx-auto"
            />
          </div>

          {/* Title */}
          <h2
            className={[
              "text-3xl font-heading font-bold mb-1",
              isWin ? "text-up" : "text-down",
            ].join(" ")}
          >
            {isWin ? "적중!" : "빗나감..."}
          </h2>

          <p className="text-text-secondary text-sm mb-5 font-sans">
            {isWin
              ? "침팬지의 예감이 적중했다! 가즈아! 🚀"
              : "존버하면 언젠간 된다... 다시 도전! 🔥"}
          </p>

          {/* Price comparison */}
          <div
            className={[
              "rounded-2xl p-4 mb-4 text-sm border-2",
              isWin ? "bg-up/8 border-up/20" : "bg-down/8 border-down/20",
            ].join(" ")}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary font-sans">종목</span>
              <span className="text-text-primary font-sans font-semibold">
                {result.symbolName}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary font-sans">진입가</span>
              <span className="text-text-primary font-mono tabular-nums font-semibold">
                {formatPrice(result.entryPrice)}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary font-sans">결과가</span>
              <span
                className={[
                  "font-mono tabular-nums font-bold",
                  isWin ? "text-up" : "text-down",
                ].join(" ")}
              >
                {formatPrice(result.exitPrice)}원
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-card-border flex justify-between items-center">
              <span className="text-text-secondary font-sans">내 예측</span>
              <span
                className={[
                  "font-semibold text-xs px-3 py-1 rounded-full border-2",
                  result.direction === "UP"
                    ? "bg-up/10 text-up border-up/30"
                    : "bg-down/10 text-down border-down/30",
                ].join(" ")}
              >
                {result.direction === "UP" ? "UP 🚀" : "DOWN 💀"}
              </span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-text-secondary font-sans">참여 비율</span>
              <span className="text-xs text-text-secondary font-sans">
                UP {result.upRatio}% / DOWN {100 - result.upRatio}%
              </span>
            </div>
          </div>

          {/* Score display */}
          <div
            className={[
              "text-4xl font-bold mb-6 score-bounce font-mono",
              isWin ? "text-banana" : "text-down",
            ].join(" ")}
          >
            {isWin ? `+${result.score}점 🏆` : "0점"}
          </div>

          {/* Action button */}
          <Button
            variant={isWin ? "primary" : "down"}
            size="lg"
            className="w-full btn-clay"
            data-testid="result-dismiss-btn"
            onClick={handleDismiss}
          >
            {isWin ? "다음 라운드 가즈아! 🚀" : "복수하기 🔥"}
          </Button>
        </div>
      </div>
    </>
  );
}
