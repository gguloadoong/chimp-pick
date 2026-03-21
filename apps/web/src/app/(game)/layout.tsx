"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import { startPriceEngine, startRoundEngine, onRoundUpdate } from "@/lib/game-engine";
import { useGameStore } from "@/stores/gameStore";
import { BottomNav } from "@/components/ui";
import ToastContainer from "@/components/ui/ToastContainer";
import ChimpCharacter from "@/components/character/ChimpCharacter";

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ensureGuest = useAuthStore((s) => s.ensureGuest);
  const setRound = useGameStore((s) => s.setRound);

  // Auto-login as guest
  useEffect(() => {
    ensureGuest();
  }, [ensureGuest]);

  // Start price engine + round engine
  useEffect(() => {
    const stopPrice = startPriceEngine(2000);
    const stopRound = startRoundEngine();
    const unsubRound = onRoundUpdate((round) => {
      setRound(round);
    });

    return () => {
      stopPrice();
      stopRound();
      unsubRound();
    };
  }, [setRound]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-bg-primary">
        <ChimpCharacter mood="idle" size={80} className="animate-float" />
        <p className="mt-4 text-text-secondary text-sm font-heading font-semibold">
          침팬지 깨우는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-bg-primary">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
