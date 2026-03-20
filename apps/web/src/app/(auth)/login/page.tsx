"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import ChimpCharacter from "@/components/character/ChimpCharacter";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="animate-float inline-block">
          <ChimpCharacter mood="idle" size={100} />
        </div>

        <div>
          <h1 className="text-4xl font-heading font-bold text-banana">
            침팬지픽
          </h1>
          <p className="mt-2 text-sm text-text-secondary font-sans">
            주식/코인 UP/DOWN 예측 배틀
          </p>
        </div>

        <button
          onClick={handleStart}
          className={[
            "w-full rounded-2xl bg-banana py-4 font-heading font-bold text-white text-lg",
            "border-2 border-banana/80 clay btn-clay",
            "transition-all active:scale-95",
          ].join(" ")}
          data-testid="start-button"
        >
          바나나 먹으러 가기 🍌
        </button>

        <p className="text-xs text-text-secondary font-sans">
          시작하면 바나나코인 100개를 드려요!
        </p>
      </div>
    </div>
  );
}
