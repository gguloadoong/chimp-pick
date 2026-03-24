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
    title: "침팬지픽에 오신 걸 환영해요!",
    description: "주식과 코인 가격이 오를지 내릴지 예측하는 게임이에요.",
    emoji: "🦍",
  },
  {
    mood: "up" as const,
    title: "30초마다 새 라운드!",
    description: "시스템이 랜덤 종목을 출제해요. UP 또는 DOWN을 선택하세요!",
    emoji: "⏱️",
  },
  {
    mood: "win" as const,
    title: "소수파가 이기면 대박!",
    description: "적은 쪽을 맞추면 최대 5배 점수! 역발상이 승리의 열쇠에요.",
    emoji: "🏆",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 text-center border-4 border-banana clay animate-pop-in">
        <div className="mb-2 text-4xl">{current.emoji}</div>

        <ChimpCharacter mood={current.mood} size={80} className="mx-auto mb-4" />

        <h2 className="text-xl font-heading font-bold text-text-primary mb-2">
          {current.title}
        </h2>

        <p className="text-sm text-text-secondary font-sans mb-6">
          {current.description}
        </p>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={[
                "w-2 h-2 rounded-full transition-all",
                i === step ? "bg-banana w-6" : "bg-card-border",
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
            className="flex-1 btn-press"
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
