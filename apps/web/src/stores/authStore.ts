"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  ensureGuest: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setNickname: (nickname: string) => void;
  updateBananaCoins: (coins: number) => void;
  applyPredictionResult: (result: "WIN" | "LOSE", reward: number | null, betAmount: number) => void;
  referralCode: string;
  getInviteUrl: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      referralCode: "",

      ensureGuest: async () => {
        const { isAuthenticated, referralCode } = get();
        if (isAuthenticated) return;

        set({ isLoading: true });
        try {
          const tokens = await authApi.guest();
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", tokens.accessToken);
          }
          const code = referralCode || Math.random().toString(36).slice(2, 8).toUpperCase();
          set({
            user: { ...tokens.user, createdAt: new Date().toISOString(), bananaCoins: tokens.user.bananaCoins },
            isAuthenticated: true,
            isLoading: false,
            referralCode: code,
          });
        } catch {
          // API 실패 시 로컬 게스트로 폴백 — stale 토큰 제거
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
          }
          const code = referralCode || Math.random().toString(36).slice(2, 8).toUpperCase();
          set({
            user: {
              id: `local-${code}`,
              nickname: "침팬지유저",
              avatarLevel: 1,
              isGuest: true,
              createdAt: new Date().toISOString(),
              bananaCoins: 1000,
            },
            isAuthenticated: true,
            isLoading: false,
            referralCode: code,
          });
        }
      },

      getInviteUrl: () => {
        const { referralCode } = get();
        const base = typeof window !== "undefined" ? window.location.origin : "https://chimp-pick.vercel.app";
        return `${base}/?ref=${referralCode}`;
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => set({ user }),

      updateBananaCoins: (coins: number) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, bananaCoins: coins } });
      },

      applyPredictionResult: (result, reward, betAmount) => {
        const { user } = get();
        if (!user) return;
        const current = user.bananaCoins ?? 0;
        if (result === "WIN" && reward != null) {
          set({ user: { ...user, bananaCoins: current + reward - betAmount } });
        } else if (result === "LOSE") {
          set({ user: { ...user, bananaCoins: Math.max(0, current - betAmount) } });
        }
      },

      setNickname: (nickname: string) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, nickname: nickname.trim().slice(0, 12) || user.nickname } });
      },
    }),
    {
      name: "chimp-pick-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        referralCode: state.referralCode,
      }),
    }
  )
);
