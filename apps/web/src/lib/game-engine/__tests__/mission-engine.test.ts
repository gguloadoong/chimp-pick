import { describe, it, expect } from "vitest";
import {
  generateDailyMissions,
  needsReset,
  updateMissionProgress,
  claimMission,
} from "../mission-engine";
import type { RoundResult } from "@/types";

const makeResult = (overrides?: Partial<RoundResult>): RoundResult => ({
  roundId: crypto.randomUUID(),
  symbol: "BTC-KRW",
  symbolName: "비트코인",
  direction: "UP",
  result: "UP",
  isCorrect: true,
  score: 100,
  upRatio: 60,
  entryPrice: 100,
  exitPrice: 101,
  resolvedAt: new Date().toISOString(),
  ...overrides,
});

describe("generateDailyMissions", () => {
  it("generates 3 missions", () => {
    const state = generateDailyMissions();
    expect(state.missions).toHaveLength(3);
    expect(state.progress).toHaveLength(3);
  });

  it("sets today's date", () => {
    const state = generateDailyMissions();
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(state.date).toBe(expected);
  });

  it("includes one mission per type", () => {
    const state = generateDailyMissions();
    const types = state.missions.map((m) => m.type);
    expect(types).toContain("rounds_played");
    expect(types).toContain("win_streak");
    expect(types).toContain("minority_picks");
  });
});

describe("needsReset", () => {
  it("returns true for null state", () => {
    expect(needsReset(null)).toBe(true);
  });

  it("returns true for yesterday's state", () => {
    const state = generateDailyMissions();
    state.date = "2020-01-01";
    expect(needsReset(state)).toBe(true);
  });

  it("returns false for today's state", () => {
    const state = generateDailyMissions();
    expect(needsReset(state)).toBe(false);
  });
});

describe("updateMissionProgress", () => {
  it("increments rounds_played mission", () => {
    const state = generateDailyMissions();
    const result = makeResult();
    const updated = updateMissionProgress(state, result, 0, [result]);

    const rpProgress = updated.progress.find((p) =>
      state.missions.find((m) => m.id === p.missionId && m.type === "rounds_played"),
    );
    expect(rpProgress?.current).toBeGreaterThanOrEqual(1);
  });
});

describe("claimMission", () => {
  it("returns 0 for incomplete mission", () => {
    const state = generateDailyMissions();
    const { reward } = claimMission(state, state.missions[0].id);
    expect(reward).toBe(0);
  });

  it("returns reward for completed mission", () => {
    const state = generateDailyMissions();
    // Force complete
    state.progress[0].completed = true;
    const { reward, state: newState } = claimMission(state, state.missions[0].id);
    expect(reward).toBeGreaterThan(0);
    expect(newState.progress[0].claimed).toBe(true);
  });

  it("returns 0 for already claimed", () => {
    const state = generateDailyMissions();
    state.progress[0].completed = true;
    state.progress[0].claimed = true;
    const { reward } = claimMission(state, state.missions[0].id);
    expect(reward).toBe(0);
  });
});
