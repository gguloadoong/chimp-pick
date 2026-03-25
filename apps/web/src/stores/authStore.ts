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
        const { isAuthenticated } = get();
        if (isAuthenticated) return;

        set({ isLoading: true });
        try {
          const tokens = await authApi.guest();
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", tokens.accessToken);
          }
          set({
            user: {
              id: tokens.user.id,
              nickname: tokens.user.nickname,
              avatarLevel: tokens.user.avatarLevel,
              isGuest: tokens.user.isGuest,
              createdAt: new Date().toISOString(),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // API 실패 시 로컬 게스트로 폴백
          const code = Math.random().toString(36).slice(2, 8).toUpperCase();
          set({
            user: {
              id: `local-${code}`,
              nickname: "침팬지유저",
              avatarLevel: 1,
              isGuest: true,
              createdAt: new Date().toISOString(),
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
