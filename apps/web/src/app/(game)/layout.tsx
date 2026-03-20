"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import { BottomNav } from "@/components/ui";

interface GameLayoutProps {
  children: ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);

  // Auto-login as guest if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginAsGuest().catch(() => {
        // API not available - set a local-only default user
        useAuthStore.setState({
          user: {
            id: "local-user",
            nickname: "침팬지유저",
            avatarLevel: 1,
            bananaCoins: 100,
            isGuest: true,
            createdAt: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
        });
      });
    }
  }, [isAuthenticated, isLoading, loginAsGuest]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-bg-primary">
        <span className="text-6xl animate-float">🦍</span>
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
    </div>
  );
}
