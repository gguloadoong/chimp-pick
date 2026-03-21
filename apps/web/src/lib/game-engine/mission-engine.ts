/**
 * Mission Engine — daily missions with auto-reset
 *
 * Mission types:
 * - rounds_played: Participate in N rounds
 * - win_streak: Achieve N consecutive wins
 * - minority_picks: Pick the minority side N times
 */

import type { RoundResult } from "@/types";

export type MissionType = "rounds_played" | "win_streak" | "minority_picks";

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  reward: number;
}

export interface MissionProgress {
  missionId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface DailyMissionState {
  date: string; // "YYYY-MM-DD"
  missions: Mission[];
  progress: MissionProgress[];
}

const MISSION_POOL: Omit<Mission, "id">[] = [
  // rounds_played
  { type: "rounds_played", title: "라운드 참여왕", description: "라운드 3회 참여", target: 3, reward: 50 },
  { type: "rounds_played", title: "열정 침팬지", description: "라운드 5회 참여", target: 5, reward: 100 },
  { type: "rounds_played", title: "예측 중독자", description: "라운드 10회 참여", target: 10, reward: 200 },
  // win_streak
  { type: "win_streak", title: "연승 시작", description: "2연승 달성", target: 2, reward: 80 },
  { type: "win_streak", title: "연승의 달인", description: "3연승 달성", target: 3, reward: 150 },
  { type: "win_streak", title: "무적 침팬지", description: "5연승 달성", target: 5, reward: 300 },
  // minority_picks
  { type: "minority_picks", title: "역배 도전", description: "소수파 2회 선택", target: 2, reward: 60 },
  { type: "minority_picks", title: "역발상 침팬지", description: "소수파 3회 선택", target: 3, reward: 120 },
  { type: "minority_picks", title: "소수파의 왕", description: "소수파 5회 선택", target: 5, reward: 250 },
];

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Generate 3 daily missions (one per type) */
export function generateDailyMissions(): DailyMissionState {
  const today = getTodayString();

  // Pick one mission per type
  const byType: Record<MissionType, Omit<Mission, "id">[]> = {
    rounds_played: MISSION_POOL.filter((m) => m.type === "rounds_played"),
    win_streak: MISSION_POOL.filter((m) => m.type === "win_streak"),
    minority_picks: MISSION_POOL.filter((m) => m.type === "minority_picks"),
  };

  const selected: Mission[] = [];
  for (const type of ["rounds_played", "win_streak", "minority_picks"] as MissionType[]) {
    const pool = byType[type];
    const pick = pickRandom(pool, 1)[0];
    selected.push({ ...pick, id: `${today}-${type}` });
  }

  return {
    date: today,
    missions: selected,
    progress: selected.map((m) => ({
      missionId: m.id,
      current: 0,
      completed: false,
      claimed: false,
    })),
  };
}

/** Check if missions need daily reset */
export function needsReset(state: DailyMissionState | null): boolean {
  if (!state) return true;
  return state.date !== getTodayString();
}

/** Update mission progress based on a new round result */
export function updateMissionProgress(
  state: DailyMissionState,
  result: RoundResult,
  currentStreak: number,
  todayHistory: RoundResult[],
): DailyMissionState {
  const newProgress = state.progress.map((p) => {
    if (p.completed) return p;

    const mission = state.missions.find((m) => m.id === p.missionId);
    if (!mission) return p;

    let current = p.current;

    switch (mission.type) {
      case "rounds_played":
        current = todayHistory.length;
        break;
      case "win_streak":
        current = Math.max(p.current, currentStreak);
        break;
      case "minority_picks": {
        const isMinority =
          (result.direction === "UP" && result.upRatio < 50) ||
          (result.direction === "DOWN" && result.upRatio >= 50);
        if (isMinority) current = p.current + 1;
        break;
      }
    }

    return {
      ...p,
      current: Math.min(current, mission.target),
      completed: current >= mission.target,
    };
  });

  return { ...state, progress: newProgress };
}

/** Claim a completed mission reward, returns the reward amount or 0 */
export function claimMission(
  state: DailyMissionState,
  missionId: string,
): { state: DailyMissionState; reward: number } {
  const progress = state.progress.find((p) => p.missionId === missionId);
  const mission = state.missions.find((m) => m.id === missionId);

  if (!progress || !mission || !progress.completed || progress.claimed) {
    return { state, reward: 0 };
  }

  const newProgress = state.progress.map((p) =>
    p.missionId === missionId ? { ...p, claimed: true } : p,
  );

  return {
    state: { ...state, progress: newProgress },
    reward: mission.reward,
  };
}
