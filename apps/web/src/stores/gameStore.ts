"use client";

import { create } from "zustand";
import type {
  Direction,
  Timeframe,
  Prediction,
  PriceData,
  SymbolInfo,
} from "@/types";
import { SYMBOLS } from "@/types";

interface GameState {
  selectedSymbol: SymbolInfo;
  selectedTimeframe: Timeframe;
  selectedDirection: Direction | null;
  betAmount: number;
  currentPrice: PriceData | null;
  activePrediction: Prediction | null;
  isSubmitting: boolean;

  setSymbol: (symbol: SymbolInfo) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setDirection: (direction: Direction | null) => void;
  setBetAmount: (amount: number) => void;
  setCurrentPrice: (price: PriceData) => void;
  setActivePrediction: (prediction: Prediction | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  selectedSymbol: SYMBOLS[0],
  selectedTimeframe: "1m",
  selectedDirection: null,
  betAmount: 10,
  currentPrice: null,
  activePrediction: null,
  isSubmitting: false,

  setSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setDirection: (direction) => set({ selectedDirection: direction }),
  setBetAmount: (amount) => set({ betAmount: Math.max(1, Math.min(50, amount)) }),
  setCurrentPrice: (price) => set({ currentPrice: price }),
  setActivePrediction: (prediction) => set({ activePrediction: prediction }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () =>
    set({
      selectedDirection: null,
      betAmount: 10,
      activePrediction: null,
      isSubmitting: false,
    }),
}));
