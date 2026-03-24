"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RoundDuration = 60 | 300 | 3600;
export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "banana" | "mint" | "purple" | "pink";

export const ACCENT_COLORS: Record<AccentColor, { label: string; hex: string; emoji: string }> = {
  banana: { label: "바나나", hex: "#FFB800", emoji: "🍌" },
  mint: { label: "민트", hex: "#10B981", emoji: "🌿" },
  purple: { label: "퍼플", hex: "#8B5CF6", emoji: "💜" },
  pink: { label: "핑크", hex: "#EC4899", emoji: "🌸" },
};

interface SettingsState {
  roundDuration: RoundDuration;
  soundEnabled: boolean;
  hasSeenOnboarding: boolean;
  theme: ThemeMode;
  accentColor: AccentColor;

  setRoundDuration: (duration: RoundDuration) => void;
  toggleSound: () => void;
  markOnboardingSeen: () => void;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
}

export const ROUND_DURATION_LABELS: Record<RoundDuration, string> = {
  60: "1분 (퀴즈)",
  300: "5분 (기본)",
  3600: "1시간 (시세)",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      roundDuration: 300,
      soundEnabled: true,
      hasSeenOnboarding: false,
      theme: "light" as ThemeMode,
      accentColor: "banana" as AccentColor,

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

      setAccentColor: (color) => {
        set({ accentColor: color });
        const hex = ACCENT_COLORS[color].hex;
        document.documentElement.style.setProperty("--color-banana", hex);
      },
    }),
    {
      name: "chimp-pick-settings",
    }
  )
);
