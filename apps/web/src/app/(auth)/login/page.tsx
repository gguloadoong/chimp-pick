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
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden flex flex-col items-center scanlines">

      {/* 레이 버스트 배경 */}
      <div className="absolute inset-0 pixel-ray-burst pointer-events-none" />

      {/* 상단 컬러 밴드 */}
      <div className="w-full h-2 flex-shrink-0" style={{
        background: "linear-gradient(to right, #73eff7, #ffcd75, #ef7d57, #a7f070, #ffcd75, #73eff7)"
      }} />

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center flex-1 justify-center px-4 pt-4 pb-4 w-full max-w-sm gap-4">

        {/* 타이틀 카드 */}
        <div className="pixel-card-title bg-[var(--bg-secondary)] w-full p-6 text-center">
          {/* 픽셀 데코 */}
          <p className="pixel-font text-[var(--info)] text-[9px] tracking-[0.25em] mb-3">
            ★ PICK THE WINNER ★
          </p>

          {/* 침팬지 캐릭터 */}
          <div className="animate-bounce-chimp mb-3">
            <ChimpCharacter mood="idle" size={96} level={3} />
          </div>

          {/* 타이틀 */}
          <h1
            className="pixel-font text-[var(--brand-primary)] leading-tight mb-1"
            style={{ fontSize: "28px" }}
          >
            침팬지픽
          </h1>
          <p className="pixel-font text-[var(--fg-secondary)] text-[9px] tracking-[0.4em] mb-4">
            CHIMP  PICK
          </p>

          {/* 픽셀 구분선 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="text-[var(--brand-primary)] text-sm">🍌</span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          <p className="font-heading font-bold text-[var(--fg-primary)] text-lg leading-snug">
            UP일까 DOWN일까,
          </p>
          <p className="font-heading font-bold text-[var(--brand-primary)] text-lg">
            30초 안에 찍어!
          </p>
        </div>

        {/* LIVE 배지 */}
        <div
          className="pixel-badge flex items-center gap-2 px-3 py-1.5 text-[var(--positive)]"
        >
          <span
            className="w-2 h-2 bg-[var(--positive)] animate-pulse inline-block"
            style={{ borderRadius: 0 }}
          />
          <span className="pixel-font text-[9px] tracking-wide">
            {playerCount}명 LIVE
          </span>
        </div>
      </div>

      {/* CTA 영역 */}
      <div className="relative z-10 w-full max-w-sm px-4 pb-4 flex flex-col gap-3">
        <button
          onClick={() => void handleStart()}
          disabled={isLoading}
          className={[
            "w-full pixel-btn-cta py-5 font-heading font-bold text-2xl",
            isLoading ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
          data-testid="start-button"
        >
          {isLoading ? "LOADING... 🍌" : "🍌 GAME START"}
        </button>

        <p className="text-center pixel-font text-[8px] text-[var(--fg-tertiary)] tracking-widest">
          PRESS START — 로그인 없이 바로 플레이
        </p>

        {/* 특징 3개 */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: "⏱", label: "30SEC" },
            { emoji: "🎯", label: "x5 BONUS" },
            { emoji: "🏆", label: "RANKING" },
          ].map((f) => (
            <div
              key={f.label}
              className="pixel-card bg-[var(--bg-secondary)] p-3 text-center"
            >
              <p className="text-xl mb-1">{f.emoji}</p>
              <p className="pixel-font text-[8px] text-[var(--fg-secondary)] leading-snug">
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 컬러 밴드 */}
      <div className="w-full h-2 flex-shrink-0" style={{
        background: "linear-gradient(to right, #ef7d57, #ffcd75, #73eff7, #a7f070, #ffcd75, #ef7d57)"
      }} />
    </div>
  );
}
