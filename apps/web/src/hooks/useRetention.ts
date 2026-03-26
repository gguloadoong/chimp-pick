"use client";

import { useState, useEffect, useCallback } from "react";
import { retentionApi, ApiClientError } from "@/lib/api";
import type { StreakInfoResponse, DailyMissionResponse } from "@/lib/api";

export interface UseRetentionReturn {
  streak: StreakInfoResponse | null;
  missions: DailyMissionResponse[];
  checkin: () => Promise<void>;
  completeMission: (type: string) => Promise<void>;
  isLoading: boolean;
}

export function useRetention(isGuest = false): UseRetentionReturn {
  const [streak, setStreak] = useState<StreakInfoResponse | null>(null);
  const [missions, setMissions] = useState<DailyMissionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isGuest) return;

    let cancelled = false;
    setIsLoading(true);

    Promise.all([retentionApi.streak(), retentionApi.missions()])
      .then(([streakData, missionsData]) => {
        if (cancelled) return;
        setStreak(streakData);
        setMissions(missionsData);
      })
      .catch(() => {
        // API 실패 시 기본값 유지
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isGuest]);

  const checkin = useCallback(async () => {
    if (isGuest) return;
    try {
      await retentionApi.checkin();
      const updated = await retentionApi.streak();
      setStreak(updated);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        // 이미 체크인된 경우 — 무시
        return;
      }
    }
  }, [isGuest]);

  const completeMission = useCallback(
    async (type: string) => {
      if (isGuest) return;
      try {
        await retentionApi.completeMission(type);
        const updated = await retentionApi.missions();
        setMissions(updated);
      } catch {
        // 미션 완료 실패 무시 — 게임 플로우 차단 금지
      }
    },
    [isGuest],
  );

  return { streak, missions, checkin, completeMission, isLoading };
}
