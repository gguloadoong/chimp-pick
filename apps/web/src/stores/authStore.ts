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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      ensureGuest: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) return;

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
        });
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
      }),
    }
  )
);
