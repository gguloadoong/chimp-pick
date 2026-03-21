"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RoundDuration = 30 | 60 | 300;

interface SettingsState {
  roundDuration: RoundDuration;
  soundEnabled: boolean;
  hasSeenOnboarding: boolean;

  setRoundDuration: (duration: RoundDuration) => void;
  toggleSound: () => void;
  markOnboardingSeen: () => void;
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

      setRoundDuration: (duration) => set({ roundDuration: duration }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: "chimp-pick-settings",
    }
  )
);
