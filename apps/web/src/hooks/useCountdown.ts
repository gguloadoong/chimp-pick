"use client";

import { useState, useEffect, useCallback } from "react";

function calcTimeLeft(targetDate: string | null): number {
  if (!targetDate) return 0;
  return Math.max(0, new Date(targetDate).getTime() - Date.now());
}

export function useCountdown(
  targetDate: string | null,
  startDate?: string | null,
) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));
  const [isExpired, setIsExpired] = useState(
    () => !!targetDate && calcTimeLeft(targetDate) <= 0,
  );

  const totalDuration =
    targetDate && startDate
      ? new Date(targetDate).getTime() - new Date(startDate).getTime()
      : 0;

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();

    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft(diff);
      if (diff <= 0) {
        setIsExpired(true);
      }
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = useCallback((ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeLeft,
    isExpired,
    formatted: formatTime(timeLeft),
    percentage:
      targetDate && totalDuration > 0 && timeLeft > 0
        ? Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100))
        : 0,
  };
}
