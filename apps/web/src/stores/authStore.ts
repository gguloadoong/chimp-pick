"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  ensureGuest: () => void;
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

      ensureGuest: () => {
        const { isAuthenticated, referralCode } = get();
        if (isAuthenticated) return;

        const code = referralCode || Math.random().toString(36).slice(2, 8).toUpperCase();
        set({
          user: {
            id: "local-user",
            nickname: "침팬지유저",
            avatarLevel: 1,
            isGuest: true,
            createdAt: new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          referralCode: code,
        });
      },

      getInviteUrl: () => {
        const { referralCode } = get();
        const base = typeof window !== "undefined" ? window.location.origin : "https://chimp-pick.vercel.app";
        return `${base}/?ref=${referralCode}`;
      },

      logout: () => {
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
