"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateBananaCoins: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await api.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>("/auth/login", { email, password });

          api.setToken(data.accessToken);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
          throw new Error("로그인에 실패했습니다");
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true });
        try {
          const data = await api.post<{
            accessToken: string;
            refreshToken: string;
            user: User;
          }>("/auth/guest");

          api.setToken(data.accessToken);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
          throw new Error("게스트 로그인에 실패했습니다");
        }
      },

      logout: () => {
        api.setToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => set({ user }),

      updateBananaCoins: (amount: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, bananaCoins: user.bananaCoins + amount } });
        }
      },
    }),
    {
      name: "chimp-pick-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          api.setToken(state.accessToken);
        }
      },
    }
  )
);
