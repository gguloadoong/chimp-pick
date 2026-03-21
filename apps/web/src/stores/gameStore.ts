"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Round, RoundPick, RoundResult, Direction } from "@/types";
import { calculateScore } from "@/lib/game-engine";

interface GameState {
  // Current round (not persisted — comes from engine)
  currentRound: Round | null;
  myPick: RoundPick | null;

  // Persisted
  roundHistory: RoundResult[];
  totalScore: number;

  // Actions
  setRound: (round: Round) => void;
  pickDirection: (direction: Direction) => void;
  resolveMyPick: () => RoundResult | null;
  clearPick: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentRound: null,
      myPick: null,
      roundHistory: [],
      totalScore: 0,

      setRound: (round) => {
        const prev = get().currentRound;
        // If new round started, clear old pick
        if (prev && prev.id !== round.id) {
          set({ currentRound: round, myPick: null });
        } else {
          set({ currentRound: round });
        }
      },

      pickDirection: (direction) => {
        const { currentRound, myPick } = get();
        if (!currentRound || currentRound.phase !== "OPEN" || myPick) return;

        set({
          myPick: {
            roundId: currentRound.id,
            direction,
            pickedAt: new Date().toISOString(),
          },
        });
      },

      resolveMyPick: () => {
        const { currentRound, myPick } = get();
        if (!currentRound || !myPick || currentRound.phase !== "RESOLVED") return null;
        if (!currentRound.result || currentRound.exitPrice === null) return null;

        const isCorrect = myPick.direction === currentRound.result;
        const score = calculateScore(
          myPick.direction,
          currentRound.result,
          currentRound.upRatio,
        );

        const result: RoundResult = {
          roundId: currentRound.id,
          symbol: currentRound.symbol,
          symbolName: currentRound.symbolName,
          direction: myPick.direction,
          result: currentRound.result,
          isCorrect,
          score,
          upRatio: currentRound.upRatio,
          entryPrice: currentRound.entryPrice,
          exitPrice: currentRound.exitPrice,
          resolvedAt: new Date().toISOString(),
        };

        set((state) => ({
          roundHistory: [result, ...state.roundHistory].slice(0, 200),
          totalScore: state.totalScore + score,
        }));

        return result;
      },

      clearPick: () => set({ myPick: null }),
    }),
    {
      name: "chimp-pick-game-v2",
      partialize: (state) => ({
        roundHistory: state.roundHistory,
        totalScore: state.totalScore,
      }),
    }
  )
);
