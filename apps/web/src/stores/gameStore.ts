"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Direction,
  Timeframe,
  Prediction,
  SymbolInfo,
} from "@/types";
import { SYMBOLS, BET_MULTIPLIER, INITIAL_BANANA_COINS } from "@/types";
import {
  getPrice,
  createPrediction,
  resolvePrediction,
  isPredictionExpired,
} from "@/lib/game-engine";
import type { PriceData } from "@/lib/game-engine";

interface GameState {
  // Selection
  selectedSymbol: SymbolInfo;
  selectedTimeframe: Timeframe;
  selectedDirection: Direction | null;
  betAmount: number;

  // Live state (not persisted)
  currentPrice: PriceData | null;
  isSubmitting: boolean;

  // Persisted game data
  activePrediction: Prediction | null;
  predictionHistory: Prediction[];
  bananaCoins: number;
  lastFreeBananaAt: string | null;

  // Actions
  setSymbol: (symbol: SymbolInfo) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setDirection: (direction: Direction | null) => void;
  setBetAmount: (amount: number) => void;
  refreshPrice: () => void;
  submitPrediction: () => Prediction | null;
  checkAndResolve: () => Prediction | null;
  claimFreeBanana: () => boolean;
  reset: () => void;
}

const FREE_BANANA_COOLDOWN_MS = 3600_000; // 1 hour
const FREE_BANANA_AMOUNT = 20;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      selectedSymbol: SYMBOLS[0],
      selectedTimeframe: "1m",
      selectedDirection: null,
      betAmount: 10,
      currentPrice: null,
      isSubmitting: false,
      activePrediction: null,
      predictionHistory: [],
      bananaCoins: INITIAL_BANANA_COINS,
      lastFreeBananaAt: null,

      setSymbol: (symbol) => set({ selectedSymbol: symbol }),
      setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
      setDirection: (direction) => set({ selectedDirection: direction }),
      setBetAmount: (amount) => set({ betAmount: Math.max(1, Math.min(50, amount)) }),

      refreshPrice: () => {
        const { selectedSymbol } = get();
        const price = getPrice(selectedSymbol.symbol);
        set({ currentPrice: price });
      },

      submitPrediction: () => {
        const { selectedSymbol, selectedDirection, selectedTimeframe, betAmount, bananaCoins, activePrediction } = get();
        if (!selectedDirection || activePrediction || bananaCoins < betAmount) return null;

        const prediction = createPrediction(
          selectedSymbol.symbol,
          selectedDirection,
          selectedTimeframe,
          betAmount,
        );

        set({
          activePrediction: prediction,
          bananaCoins: bananaCoins - betAmount,
          isSubmitting: false,
          selectedDirection: null,
        });

        return prediction;
      },

      checkAndResolve: () => {
        const { activePrediction } = get();
        if (!activePrediction || !isPredictionExpired(activePrediction)) return null;

        const resolved = resolvePrediction(activePrediction);
        const reward = resolved.result === "WIN"
          ? Math.floor(resolved.betAmount * BET_MULTIPLIER)
          : 0;

        set((state) => ({
          activePrediction: null,
          predictionHistory: [resolved, ...state.predictionHistory].slice(0, 100),
          bananaCoins: state.bananaCoins + reward,
        }));

        return resolved;
      },

      claimFreeBanana: () => {
        const { lastFreeBananaAt } = get();
        if (lastFreeBananaAt) {
          const elapsed = Date.now() - new Date(lastFreeBananaAt).getTime();
          if (elapsed < FREE_BANANA_COOLDOWN_MS) return false;
        }

        set((state) => ({
          bananaCoins: state.bananaCoins + FREE_BANANA_AMOUNT,
          lastFreeBananaAt: new Date().toISOString(),
        }));
        return true;
      },

      reset: () =>
        set({
          selectedDirection: null,
          betAmount: 10,
          isSubmitting: false,
        }),
    }),
    {
      name: "chimp-pick-game",
      partialize: (state) => ({
        activePrediction: state.activePrediction,
        predictionHistory: state.predictionHistory,
        bananaCoins: state.bananaCoins,
        lastFreeBananaAt: state.lastFreeBananaAt,
      }),
    }
  )
);
