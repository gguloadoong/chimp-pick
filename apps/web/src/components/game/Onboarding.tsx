"use client";

import { useState } from "react";
import ChimpCharacter from "@/components/character/ChimpCharacter";
import Button from "@/components/ui/Button";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    mood: "idle" as const,
    title: "종목을 선택하세요",
    description: "시스템이 랜덤 종목을 출제해요. 주식·코인·퀴즈 등 다양한 카테고리가 있어요.",
    emoji: "🦍",
    hint: "화면 중앙의 라운드 카드를 확인하세요",
    arrow: "down" as const,
  },
  {
    mood: "up" as const,
    title: "UP 또는 DOWN을 예측하세요",
    description: "화면 하단의 UP / DOWN 버튼을 눌러 예측을 등록하세요. 타이머가 끝나기 전에 선택해야 해요!",
    emoji: "⏱️",
    hint: "하단 버튼으로 예측 등록",
    arrow: "down" as const,
  },
  {
    mood: "win" as const,
    title: "결과를 확인하고 바나나코인을 모으세요",
    description: "소수파를 맞추면 최대 5배 점수! 역발상이 승리의 열쇠에요. 🍌 바나나코인을 모아 랭킹에 도전하세요.",
    emoji: "🏆",
    hint: "오른쪽 상단 🍌 잔고를 확인하세요",
    arrow: "up" as const,
  },
];

function Arrow({ direction }: { direction: "up" | "down" }) {
  const isDown = direction === "down";
  return (
    <div
      className={[
        "flex justify-center animate-bounce",
        isDown ? "mt-2" : "mb-2 rotate-180",
      ].join(" ")}
      aria-hidden="true"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 4 L14 22 M6 14 L14 22 L22 14"
          stroke="#FFB800"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="게임 튜토리얼"
    >
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-[var(--bg-primary)] p-8 text-center border-4 border-[var(--brand-primary)] shadow-2xl animate-pop-in">
        {/* 건너뛰기 */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onComplete}
            className="text-xs text-[var(--fg-tertiary)] font-sans hover:text-[var(--fg-secondary)] transition-colors px-2 py-1"
            aria-label="튜토리얼 건너뛰기"
          >
            건너뛰기
          </button>
        </div>

        {/* 상단 화살표 (step 2: 보상 아이콘 → 위를 가리킴) */}
        {current.arrow === "up" && <Arrow direction="up" />}

        <div className="mb-2 text-4xl" aria-hidden="true">
          {current.emoji}
        </div>

        <ChimpCharacter mood={current.mood} size={80} className="mx-auto mb-4" />

        <h2 className="text-xl font-heading font-bold text-[var(--fg-primary)] mb-2">
          {current.title}
        </h2>

        <p className="text-sm text-[var(--fg-secondary)] font-sans mb-3">
          {current.description}
        </p>

        {/* 힌트 라벨 */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 rounded-full bg-[var(--brand-secondary)] border border-[var(--brand-primary)]/30">
          <span className="text-[11px] text-[var(--brand-primary)] font-semibold font-sans">
            {current.hint}
          </span>
        </div>

        {/* 하단 화살표 (step 0, 1: 아래를 가리킴) */}
        {current.arrow === "down" && <Arrow direction="down" />}

        {/* 스텝 인디케이터 */}
        <div className="flex justify-center gap-2 mb-5 mt-2" role="group" aria-label={`${step + 1}단계 / ${STEPS.length}단계`}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={[
                "h-2 rounded-full transition-all duration-300",
                i === step
                  ? "bg-[var(--brand-primary)] w-6"
                  : "bg-[var(--border-primary)] w-2",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => setStep(step - 1)}
            >
              이전
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => {
              if (isLast) onComplete();
              else setStep(step + 1);
            }}
          >
            {isLast ? "시작하기! 🍌" : "다음"}
          </Button>
        </div>
      </div>
    </div>
  );
}
