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
  onShare?: () => void;
}

export default function ResultOverlay({
  result,
  onDismiss,
  onShare,
}: ResultOverlayProps) {
  const [confetti] = useState<ConfettiParticle[]>(() => generateConfetti(20));
  const [phase, setPhase] = useState<"drumroll" | "reveal" | "show">("drumroll");
  const [countScore, setCountScore] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);

  const isWin = result.isCorrect;

  // Drumroll → reveal → show sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1200);
    const t2 = setTimeout(() => setPhase("show"), 2000);
    const t3 = setTimeout(() => setCanDismiss(true), 3500); // 2초 후 닫기 활성화
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Score count-up animation
  useEffect(() => {
    if (phase !== "show" || !isWin) return;
    const target = result.score;
    const step = Math.max(1, Math.ceil(target / 20));
    const id = setInterval(() => {
      setCountScore((prev) => {
        const next = prev + step;
        if (next >= target) { clearInterval(id); return target; }
        return next;
      });
    }, 30);
    return () => clearInterval(id);
  }, [phase, isWin, result.score]);

  const handleDismiss = () => {
    onDismiss();
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
        @keyframes drumroll-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes reveal-zoom {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
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
        .drumroll-shake {
          animation: drumroll-shake 0.1s ease-in-out infinite;
        }
        .reveal-zoom {
          animation: reveal-zoom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div
        data-testid="result-overlay"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center",
          "transition-all duration-200 opacity-100",
          phase === "drumroll"
            ? "bg-black/40 backdrop-blur-sm"
            : isWin ? "bg-up/10 backdrop-blur-sm" : "bg-down/10 backdrop-blur-sm",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={isWin ? "예측 성공" : "예측 실패"}
        onClick={canDismiss ? handleDismiss : undefined}
      >
        {/* Drumroll phase */}
        {phase === "drumroll" && (
          <div className="text-center drumroll-shake">
            <p className="text-6xl mb-4">🥁</p>
            <p className="text-2xl font-heading font-bold text-white animate-pulse">
              두구두구...
            </p>
          </div>
        )}

        {/* Reveal phase */}
        {phase === "reveal" && (
          <div className="text-center reveal-zoom">
            <p className="text-7xl mb-4">{isWin ? "🎉" : "😵"}</p>
            <p className={["text-3xl font-heading font-bold", isWin ? "text-up" : "text-down"].join(" ")}>
              {isWin ? "적중!" : "빗나감!"}
            </p>
          </div>
        )}

        {/* Confetti (WIN only) */}
        {phase === "show" && isWin && (
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

        {/* Card (show phase only) */}
        {phase === "show" && <div
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

          {/* Title — emotionally amplified */}
          <h2
            className={[
              isWin ? "text-4xl" : "text-3xl",
              "font-heading font-bold mb-1",
              isWin ? "text-up" : "text-down",
            ].join(" ")}
          >
            {isWin
              ? result.score >= 200 ? "대박!! 🎉🎉" : result.score >= 100 ? "적중! 🎉" : "맞았다! ✨"
              : "으악... 😵"}
          </h2>

          <p className={[
            "text-sm mb-5 font-sans",
            isWin ? "text-up font-bold" : "text-text-secondary",
          ].join(" ")}>
            {isWin
              ? result.score >= 200
                ? "소수파 역배 성공! 침팬지 천재! 🧠🚀"
                : "침팬지의 예감이 적중했다! 가즈아! 🚀"
              : result.upRatio > 60
                ? "💡 소수파를 노려보세요! 적은 쪽이 더 높은 점수!"
                : result.upRatio < 40
                  ? "💡 직감을 믿어보세요! 다수파가 항상 옳진 않아요!"
                  : "🍌 바나나 껍질에 미끄러졌다... 다시 도전!"}
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
            {isWin ? `+${countScore}점 🏆` : "0점"}
          </div>

          {/* Action button */}
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="outline"
                size="lg"
                className="flex-1 btn-clay"
                onClick={() => { handleDismiss(); onShare(); }}
              >
                공유 📤
              </Button>
            )}
            <Button
              variant={isWin ? "primary" : "down"}
              size="lg"
              className="flex-1 btn-clay"
              data-testid="result-dismiss-btn"
              onClick={handleDismiss}
            >
              {isWin ? "다음 라운드! 🚀" : "복수하기 🔥"}
            </Button>
          </div>
        </div>}
      </div>
    </>
  );
}
