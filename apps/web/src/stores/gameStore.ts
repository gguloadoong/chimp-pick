"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Round, RoundPick, RoundResult, Direction } from "@/types";
import {
  calculateScore,
  computeStats,
  generateDailyMissions,
  needsReset,
  updateMissionProgress,
  claimMission,
  adjustRatioForPick,
} from "@/lib/game-engine";
import type { DailyMissionState } from "@/lib/game-engine";

interface GameState {
  // Current round (not persisted — comes from engine)
  currentRound: Round | null;
  myPick: RoundPick | null;

  // Persisted
  roundHistory: RoundResult[];
  totalScore: number;
  dailyMissions: DailyMissionState | null;
  attendance: { lastDate: string; streak: number; totalDays: number };
  selectedTitle: string | null;
  challenge: { active: boolean; roundsLeft: number; wins: number } | null;

  // Actions
  setRound: (round: Round) => void;
  pickDirection: (direction: Direction) => void;
  resolveMyPick: () => RoundResult | null;
  clearPick: () => void;
  ensureDailyMissions: () => void;
  claimMissionReward: (missionId: string) => number;
  checkAttendance: () => { isNew: boolean; streak: number; bonus: number };
  setSelectedTitle: (titleId: string | null) => void;
  startChallenge: () => void;
  getTodayRounds: () => number;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentRound: null,
      myPick: null,
      roundHistory: [],
      totalScore: 0,
      dailyMissions: null,
      attendance: { lastDate: "", streak: 0, totalDays: 0 },
      selectedTitle: null,
      challenge: null,

      setRound: (round) => {
        const prev = get().currentRound;
        if (prev && prev.id !== round.id) {
          set({ currentRound: round, myPick: null });
        } else {
          set({ currentRound: round });
        }
      },

      pickDirection: (direction) => {
        const { currentRound, myPick } = get();
        if (!currentRound || currentRound.phase !== "OPEN" || myPick) return;

        adjustRatioForPick(direction);

        set({
          myPick: {
            roundId: currentRound.id,
            direction,
            pickedAt: new Date().toISOString(),
          },
        });
      },

      resolveMyPick: () => {
        const { currentRound, myPick, roundHistory } = get();
        if (!currentRound || !myPick || currentRound.phase !== "RESOLVED") return null;
        if (!currentRound.result || currentRound.exitPrice === null) return null;
        if (roundHistory.some((r) => r.roundId === currentRound.id)) return null;

        const isCorrect = myPick.direction === currentRound.result;
        const baseScore = calculateScore(
          myPick.direction,
          currentRound.result,
          currentRound.upRatio,
        );
        const score = currentRound.isSpeedRound ? Math.round(baseScore * 1.5) : baseScore;

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

        const newHistory = [result, ...roundHistory].slice(0, 200);
        const stats = computeStats(newHistory);

        // Filter today's results for mission progress
        const today = new Date().toDateString();
        const todayHistory = newHistory.filter(
          (r) => new Date(r.resolvedAt).toDateString() === today,
        );

        // Update missions
        let { dailyMissions } = get();
        if (dailyMissions && !needsReset(dailyMissions)) {
          dailyMissions = updateMissionProgress(
            dailyMissions,
            result,
            stats.currentStreak,
            todayHistory,
          );
        }

        // Update challenge
        let { challenge } = get();
        let challengeBonus = 0;
        if (challenge?.active) {
          const newWins = isCorrect ? challenge.wins + 1 : challenge.wins;
          const newLeft = challenge.roundsLeft - 1;
          if (newLeft <= 0) {
            // Challenge complete
            challengeBonus = newWins === 5 ? score * 2 : 0; // 5/5 perfect = 3x total (1x base + 2x bonus)
            challenge = null;
          } else if (!isCorrect) {
            challenge = null; // Failed
          } else {
            challenge = { active: true, roundsLeft: newLeft, wins: newWins };
          }
        }

        set({
          roundHistory: newHistory,
          totalScore: get().totalScore + score + challengeBonus,
          dailyMissions,
          challenge,
        });

        return result;
      },

      clearPick: () => set({ myPick: null }),

      ensureDailyMissions: () => {
        const { dailyMissions } = get();
        if (needsReset(dailyMissions)) {
          set({ dailyMissions: generateDailyMissions() });
        }
      },

      checkAttendance: () => {
        const { attendance } = get();
        const today = new Date().toISOString().slice(0, 10);
        if (attendance.lastDate === today) {
          return { isNew: false, streak: attendance.streak, bonus: 0 };
        }

        const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
        const isConsecutive = attendance.lastDate === yesterday;
        const newStreak = isConsecutive ? attendance.streak + 1 : 1;
        const bonus = newStreak >= 7 ? 200 : newStreak >= 3 ? 100 : 50;

        set({
          attendance: { lastDate: today, streak: newStreak, totalDays: attendance.totalDays + 1 },
          totalScore: get().totalScore + bonus,
        });

        return { isNew: true, streak: newStreak, bonus };
      },

      setSelectedTitle: (titleId) => set({ selectedTitle: titleId }),

      startChallenge: () => {
        set({ challenge: { active: true, roundsLeft: 5, wins: 0 } });
      },

      getTodayRounds: () => {
        const today = new Date().toDateString();
        return get().roundHistory.filter(
          (r) => new Date(r.resolvedAt).toDateString() === today,
        ).length;
      },

      claimMissionReward: (missionId) => {
        const { dailyMissions } = get();
        if (!dailyMissions) return 0;

        const { state: newState, reward } = claimMission(dailyMissions, missionId);
        if (reward > 0) {
          set((s) => ({
            dailyMissions: newState,
            totalScore: s.totalScore + reward,
          }));
        }
        return reward;
      },
    }),
    {
      name: "chimp-pick-game-v2",
      partialize: (state) => ({
        roundHistory: state.roundHistory,
        totalScore: state.totalScore,
        dailyMissions: state.dailyMissions,
        attendance: state.attendance,
        selectedTitle: state.selectedTitle,
        challenge: state.challenge,
      }),
    }
  )
);
