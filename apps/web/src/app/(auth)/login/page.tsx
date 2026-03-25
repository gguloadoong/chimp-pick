"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import ChimpCharacter from "@/components/character/ChimpCharacter";

export default function LoginPage() {
  const router = useRouter();
  const { ensureGuest, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [playerCount] = useState(() => 100 + Math.floor(Math.random() * 200));

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const handleStart = async () => {
    setIsLoading(true);
    await ensureGuest();
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] dot-grid flex flex-col items-center justify-between px-4 pt-10 pb-8 scanlines">

      {/* 상단: 캐릭터 + 로고 */}
      <div className="flex flex-col items-center gap-6 flex-1 justify-center w-full max-w-sm">

        {/* 침팬지 캐릭터 */}
        <div className="animate-bounce-chimp">
          <ChimpCharacter mood="idle" size={120} level={3} />
        </div>

        {/* 로고 */}
        <div className="text-center">
          <h1
            className="pixel-font text-[var(--brand-primary)] mb-2 leading-relaxed"
            style={{ fontSize: "clamp(18px, 5vw, 26px)" }}
          >
            침팬지픽
          </h1>
          <p className="pixel-font text-[var(--fg-secondary)] text-[10px] tracking-widest mb-4">
            CHIMP  PICK
          </p>
          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-0.5 bg-[var(--border-primary)]" />
            <span className="text-[var(--brand-primary)] text-lg">🍌</span>
            <div className="flex-1 h-0.5 bg-[var(--border-primary)]" />
          </div>
          <p className="text-[var(--fg-primary)] font-heading font-bold text-lg leading-snug">
            UP일까 DOWN일까,
          </p>
          <p className="text-[var(--brand-primary)] font-heading font-bold text-lg">
            30초 안에 찍어!
          </p>
        </div>

        {/* LIVE 접속자 */}
        <div className="flex items-center gap-2 pixel-badge px-3 py-1.5 text-[var(--positive)]">
          <span className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse inline-block" />
          <span className="pixel-font text-[9px] tracking-wide">
            {playerCount}명 게임 중
          </span>
        </div>
      </div>

      {/* 하단: CTA */}
      <div className="w-full max-w-sm flex flex-col gap-3">

        {/* 메인 CTA */}
        <button
          onClick={() => void handleStart()}
          disabled={isLoading}
          className={[
            "w-full bg-[var(--brand-primary)] text-[var(--brand-on-primary)]",
            "pixel-btn-cta py-5 font-heading font-bold text-xl",
            isLoading ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
          data-testid="start-button"
        >
          {isLoading ? "로딩 중... 🍌" : "🍌 게임 시작하기"}
        </button>

        <p className="text-center pixel-font text-[8px] text-[var(--fg-tertiary)] tracking-wide">
          로그인 없이 바로 플레이!
        </p>

        {/* 특징 3가지 */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { emoji: "⏱️", label: "30초" },
            { emoji: "🎯", label: "역배 5배" },
            { emoji: "🏆", label: "실시간 랭킹" },
          ].map((f) => (
            <div
              key={f.label}
              className="pixel-card bg-[var(--bg-secondary)] p-3 text-center"
            >
              <p className="text-2xl mb-1">{f.emoji}</p>
              <p className="pixel-font text-[8px] text-[var(--fg-secondary)] leading-snug">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
