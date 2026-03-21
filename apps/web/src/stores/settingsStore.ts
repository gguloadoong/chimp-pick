"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RoundDuration = 30 | 60 | 300;
export type ThemeMode = "light" | "dark" | "system";

interface SettingsState {
  roundDuration: RoundDuration;
  soundEnabled: boolean;
  hasSeenOnboarding: boolean;
  theme: ThemeMode;

  setRoundDuration: (duration: RoundDuration) => void;
  toggleSound: () => void;
  markOnboardingSeen: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const ROUND_DURATION_LABELS: Record<RoundDuration, string> = {
  30: "30초",
  60: "1분",
  300: "5분",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      roundDuration: 30,
      soundEnabled: true,
      hasSeenOnboarding: false,
      theme: "light" as ThemeMode,

      setRoundDuration: (duration) => set({ roundDuration: duration }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === "dark") {
          root.classList.add("dark");
        } else if (theme === "light") {
          root.classList.remove("dark");
        } else {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          root.classList.toggle("dark", prefersDark);
        }
      },
    }),
    {
      name: "chimp-pick-settings",
    }
  )
);
