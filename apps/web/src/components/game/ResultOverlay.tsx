"use client";

import { useEffect, useState } from "react";
import type { RoundResult } from "@/types";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import ChimpCharacter from "@/components/character/ChimpCharacter";
import AdSlot from "@/components/ui/AdSlot";

const CONFETTI_ITEMS = ["🍌", "🎉", "⭐", "🎊", "✨", "💫", "🏆", "🎈"];

const WIN_LOSE_COPY = {
  win: [
    "침팬지의 예감이 적중했다! 가즈아! 🚀",
    "바나나 수확 완료! 🍌",
    "침팬지 직감은 과학이다! 🧪",
    "월급보다 정확한 예측! 💰",
    "당신, 혹시 미래를 보십니까? 👁️",
    "전설이 탄생했다 🏆",
    "AI도 당신 앞엔 무릎 꿇는다 🤖",
  ],
  lose: [
    "바나나 미끄러졌다 🍌",
    "침팬지도 가끔 틀린다... 😅",
    "다음 판에 복수하자 🔥",
    "바나나 증발... 다시 가즈아! 😤",
    "오늘도 침팬지한테 졌다 🦍",
    "AI도 틀릴 때 있어요. 당신은 더. 🤖",
    "워렌 버핏도 이 종목은 몰랐을 거예요 📉",
    "다음엔 진짜 올라가요 (보장 없음) ❓",
    "침팬지가 당신보다 낫다는 과학적 연구가... 🔬",
    "이쯤 되면 반대로 하면 되는 거 아닐까요? 🔄",
    "틀린 게 아니라 시장이 잘못된 겁니다 📊",
    "전 재산 날린 기분? 바나나 몇 개인데요 ㅋ 🍌",
    "주식의 신도 50% 확률은 못 이깁니다 🎲",
    "괜찮아요, 다음엔 전략을 바꿔봐요 🧠",
    "역사 속 모든 투자자도 틀린 날이 있었습니다 📜",
  ],
  loseSub: [
    "틀려도 괜찮아, 원래 확률은 50%야",
    "소수파를 노려보면 점수가 더 높아요!",
    "직감을 믿어보세요! 다수파가 항상 옳진 않아요!",
    "다음 라운드 파이팅! 🦍",
    "오늘의 패배는 내일의 승리를 위한 데이터입니다",
    "침팬지도 처음엔 바나나를 자주 놓쳤어요",
    "실패는 성공의 어머니, 바나나의 형제",
    "반대로 찍어보는 것도 전략입니다 (이건 진지한 조언)",
    "지금 이 순간을 기억하세요. 반면교사로요.",
  ],
};

/** 시간대·날짜 기반 특별 패배 메시지 */
function getContextualLoseMessage(): { main: string; sub: string } | null {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    return {
      main: "새벽에 주식하면 이렇게 됩니다 🌙",
      sub: "수면이 최고의 투자 전략입니다",
    };
  }
  if (hour >= 9 && hour < 10) {
    return {
      main: "장 시작하자마자 이러시면 안 됩니다 ⏰",
      sub: "아직 오전이에요. 기회는 많아요.",
    };
  }
  const day = new Date().getDay();
  if (day === 1) {
    return {
      main: "월요병이 예측에도 왔군요 😴",
      sub: "월요일은 원래 다들 틀려요 (거짓말)",
    };
  }
  if (day === 5) {
    return {
      main: "불금에 이러시면 안 되죠 🍻",
      sub: "주말 전에 만회할 기회가 있어요!",
    };
  }
  return null;
}

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
  const [copyIdx] = useState(() => Math.floor(Math.random() * Math.max(WIN_LOSE_COPY.win.length, WIN_LOSE_COPY.lose.length)));
  const [contextualLose] = useState(() => getContextualLoseMessage());

  const isWin = result.isCorrect;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 1200);
    const t2 = setTimeout(() => setPhase("show"), 2000);
    const t3 = setTimeout(() => setCanDismiss(true), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

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
            : isWin ? "bg-[var(--positive)]/10 backdrop-blur-sm" : "bg-[var(--negative)]/10 backdrop-blur-sm",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label={isWin ? "예측 성공" : "예측 실패"}
        onClick={canDismiss ? onDismiss : undefined}
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
            <p className={["text-3xl font-heading font-bold", isWin ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
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
        {phase === "show" && (
          <div
            className={[
              "relative mx-4 w-full max-w-sm rounded-[var(--radius-lg)] p-8 text-center",
              "border-2 animate-pop-in shadow-[var(--shadow-3)]",
              isWin
                ? "bg-[var(--bg-secondary)] border-[var(--positive)]"
                : "bg-[var(--bg-secondary)] border-[var(--negative)]",
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
                isWin ? "text-4xl" : "text-3xl",
                "font-heading font-bold mb-1",
                isWin ? "text-[var(--positive)]" : "text-[var(--negative)]",
              ].join(" ")}
            >
              {isWin
                ? result.score >= 200 ? "역배 적중! 🔥🔥" : result.score >= 100 ? "가즈아! 적중! 🎉" : "맞았다! ✨"
                : (contextualLose?.main ?? WIN_LOSE_COPY.lose[copyIdx % WIN_LOSE_COPY.lose.length])}
            </h2>

            <p className={[
              "text-sm mb-5 font-sans",
              isWin ? "text-[var(--positive)] font-bold" : "text-[var(--fg-secondary)]",
            ].join(" ")}>
              {isWin
                ? result.score >= 200
                  ? "소수파의 반란! 침팬지 역전승! 🧠"
                  : WIN_LOSE_COPY.win[copyIdx % WIN_LOSE_COPY.win.length]
                : (contextualLose?.sub ?? WIN_LOSE_COPY.loseSub[copyIdx % WIN_LOSE_COPY.loseSub.length])}
            </p>

            {/* Result details */}
            <div
              className={[
                "rounded-[var(--radius-md)] p-4 mb-4 text-sm border",
                isWin ? "bg-[var(--positive-bg)] border-[var(--positive)]/20" : "bg-[var(--negative-bg)] border-[var(--negative)]/20",
              ].join(" ")}
            >
              <p className="text-center text-[var(--fg-primary)] font-sans font-semibold mb-3">
                {result.questionTitle || result.symbolName || "예측"}
              </p>

              {result.questionCategory === "price" && result.isComparison && result.entryPriceB != null ? (
                <div className="mb-2 space-y-2">
                  {(() => {
                    const pctA = result.entryPrice > 0 ? ((result.exitPrice - result.entryPrice) / result.entryPrice) * 100 : 0;
                    const pctB = result.entryPriceB > 0 ? (((result.exitPriceB ?? 0) - result.entryPriceB) / result.entryPriceB) * 100 : 0;
                    return (
                      <>
                        <div className={["rounded-[var(--radius-sm)] p-2 border", result.result === "UP" ? "border-[var(--positive)]/40 bg-[var(--positive-bg)]" : "border-[var(--border-primary)]"].join(" ")}>
                          <div className="flex justify-between items-center text-xs">
                            <span className={["font-semibold font-sans", result.result === "UP" ? "text-[var(--positive)]" : "text-[var(--fg-secondary)]"].join(" ")}>
                              {result.symbolName} {result.result === "UP" ? "🏆" : ""}
                            </span>
                            <span className={["font-mono tabular-nums font-bold", result.result === "UP" ? "text-[var(--positive)]" : "text-[var(--fg-secondary)]"].join(" ")}>
                              {pctA >= 0 ? "+" : ""}{pctA.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs text-[var(--fg-secondary)] font-mono mt-0.5">
                            {formatPrice(result.entryPrice)} → {formatPrice(result.exitPrice)}원
                          </p>
                        </div>
                        <div className={["rounded-[var(--radius-sm)] p-2 border", result.result === "DOWN" ? "border-[var(--positive)]/40 bg-[var(--positive-bg)]" : "border-[var(--border-primary)]"].join(" ")}>
                          <div className="flex justify-between items-center text-xs">
                            <span className={["font-semibold font-sans", result.result === "DOWN" ? "text-[var(--positive)]" : "text-[var(--fg-secondary)]"].join(" ")}>
                              {result.symbolNameB} {result.result === "DOWN" ? "🏆" : ""}
                            </span>
                            <span className={["font-mono tabular-nums font-bold", result.result === "DOWN" ? "text-[var(--positive)]" : "text-[var(--fg-secondary)]"].join(" ")}>
                              {pctB >= 0 ? "+" : ""}{pctB.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs text-[var(--fg-secondary)] font-mono mt-0.5">
                            {formatPrice(result.entryPriceB)} → {formatPrice(result.exitPriceB ?? 0)}원
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : result.questionCategory === "price" && result.entryPrice > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[var(--fg-secondary)] font-sans">시작가</span>
                    <span className="text-[var(--fg-primary)] font-mono tabular-nums font-semibold">
                      {formatPrice(result.entryPrice)}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[var(--fg-secondary)] font-sans">결과가</span>
                    <span className={["font-mono tabular-nums font-bold", result.result === "UP" ? "text-[var(--positive)]" : "text-[var(--negative)]"].join(" ")}>
                      {formatPrice(result.exitPrice)}원
                    </span>
                  </div>
                </>
              ) : null}

              <div className={[
                "flex justify-between items-center",
                result.questionCategory === "price" ? "mt-3 pt-3 border-t border-[var(--border-primary)]" : "",
              ].join(" ")}>
                <span className="text-[var(--fg-secondary)] font-sans">내 선택</span>
                <span
                  className={[
                    "font-semibold text-xs px-3 py-1 rounded-full border",
                    result.direction === "UP"
                      ? "bg-[var(--positive-bg)] text-[var(--positive)] border-[var(--positive)]/30"
                      : "bg-[var(--negative-bg)] text-[var(--negative)] border-[var(--negative)]/30",
                  ].join(" ")}
                >
                  {result.direction === "UP"
                    ? (result.optionA || "UP 🚀")
                    : (result.optionB || "DOWN 💀")}
                </span>
              </div>

              {result.questionCategory !== "price" && (
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[var(--fg-secondary)] font-sans">정답</span>
                  <span className="text-xs font-semibold text-[var(--fg-primary)] font-sans">
                    {result.result === "UP" ? (result.optionA || "A") : (result.optionB || "B")}
                  </span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-[var(--fg-secondary)] font-sans">참여 비율</span>
                  <span className="text-xs text-[var(--fg-secondary)] font-sans tabular-nums">
                    UP {result.upRatio}% · DOWN {100 - result.upRatio}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden flex" style={{ borderRadius: 0 }}>
                  <div
                    className="h-full bg-[var(--positive)] transition-all duration-500"
                    style={{ width: `${Number.isFinite(result.upRatio) ? Math.max(0, Math.min(100, result.upRatio)) : 0}%` }}
                  />
                  <div
                    className="h-full bg-[var(--negative)] transition-all duration-500"
                    style={{ width: `${100 - (Number.isFinite(result.upRatio) ? Math.max(0, Math.min(100, result.upRatio)) : 0)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Score */}
            <div
              className={[
                "text-4xl font-bold mb-6 score-bounce font-mono",
                isWin ? "text-[var(--brand-primary)]" : "text-[var(--negative)]",
              ].join(" ")}
            >
              {isWin ? `+${countScore}점 🏆` : "0점"}
            </div>

            {/* Ad slot (패배 시만 노출) */}
            {!isWin && (
              <AdSlot placement="result-lose" className="mb-4" />
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {onShare && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => { onDismiss(); onShare(); }}
                >
                  공유 📤
                </Button>
              )}
              <Button
                variant={isWin ? "positive" : "negative"}
                size="lg"
                className="flex-1"
                data-testid="result-dismiss-btn"
                onClick={onDismiss}
              >
                {isWin ? "다음 라운드! 🚀" : "복수하기 🔥"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
