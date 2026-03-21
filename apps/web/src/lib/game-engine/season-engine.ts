/**
 * Season Engine — weekly seasons with rankings and rewards
 * Season: Monday 00:00 → Sunday 23:59
 */

export interface Season {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
}

export interface SeasonRecord {
  seasonId: string;
  label: string;
  score: number;
  rank: number;
  rounds: number;
  badge: string | null;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getSunday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getCurrentSeason(): Season {
  const now = new Date();
  const monday = getMonday(now);
  const sunday = getSunday(monday);

  const weekNum = Math.ceil(
    (monday.getTime() - new Date(monday.getFullYear(), 0, 1).getTime()) / (7 * 86400_000)
  );

  return {
    id: `${monday.getFullYear()}-W${String(weekNum).padStart(2, "0")}`,
    startDate: monday.toISOString(),
    endDate: sunday.toISOString(),
    label: `${monday.getMonth() + 1}월 ${weekNum}주차`,
  };
}

export function getSeasonTimeRemaining(): { days: number; hours: number } {
  const season = getCurrentSeason();
  const end = new Date(season.endDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  return {
    days: Math.floor(diff / 86400_000),
    hours: Math.floor((diff % 86400_000) / 3600_000),
  };
}

export function getSeasonBadge(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

export function getSeasonBonus(rank: number): number {
  if (rank === 1) return 500;
  if (rank === 2) return 300;
  if (rank === 3) return 200;
  if (rank <= 5) return 100;
  if (rank <= 10) return 50;
  return 0;
}
