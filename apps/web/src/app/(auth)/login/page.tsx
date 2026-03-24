"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import ChimpCharacter from "@/components/character/ChimpCharacter";

const FEATURES = [
  {
    emoji: "⏱️",
    title: "30초 라운드",
    desc: "짧고 빠른 예측 게임. 매 라운드 새로운 질문!",
  },
  {
    emoji: "🧠",
    title: "3종 카테고리",
    desc: "시세 예측, 재미 예측, 상식 퀴즈까지!",
  },
  {
    emoji: "🏆",
    title: "소수파 보너스",
    desc: "남들과 다르게 맞추면 최대 5배 점수!",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { ensureGuest, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const handleStart = () => {
    ensureGuest();
    router.push("/");
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-8">
        <div className="animate-bounce-chimp mb-6">
          <ChimpCharacter mood="idle" size={120} level={3} />
        </div>

        <h1 className="text-5xl font-heading font-bold text-banana mb-2">
          침팬지픽
        </h1>
        <p className="text-base text-text-secondary font-sans mb-1">
          UP or DOWN? 예측하고 점수를 쌓아보세요!
        </p>
        <p className="text-xs text-text-secondary/70 font-sans mb-8">
          주식 · 코인 · 상식 · 재미 예측 배틀 게임
        </p>

        {/* CTA */}
        <button
          onClick={handleStart}
          className={[
            "w-full max-w-xs rounded-2xl bg-banana py-4 font-heading font-bold text-white text-lg",
            "border-2 border-banana/80 btn-press",
            "transition-all active:scale-95 hover:shadow-lg",
          ].join(" ")}
          data-testid="start-button"
        >
          바로 시작하기 🍌
        </button>

        <p className="text-xs text-text-secondary/60 font-sans mt-3">
          가입 없이 바로 플레이!
        </p>
      </div>

      {/* Features */}
      <div className="px-4 pb-12 max-w-lg mx-auto w-full">
        <div className="space-y-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-card-border clay-sm"
            >
              <span className="text-3xl">{f.emoji}</span>
              <div>
                <p className="text-sm font-heading font-bold text-text-primary">{f.title}</p>
                <p className="text-xs text-text-secondary font-sans">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-text-secondary/50 font-sans mt-8">
          ⚡ 스피드 라운드 · 🏅 14종 칭호 · 📊 통계 대시보드 · 🌙 다크모드
        </p>
      </div>
    </div>
  );
}
