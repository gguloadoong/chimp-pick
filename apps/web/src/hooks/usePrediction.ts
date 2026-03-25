"use client";

import { useState, useCallback, useEffect } from "react";
import { predictionApi, ApiClientError, type Prediction, type PredictionDirection, type PredictionTimeframe } from "@/lib/api";

// 게임 엔진 심볼("BTC-KRW") → API 심볼("BTC")
const ENGINE_TO_API: Record<string, string> = {
  "BTC-KRW": "BTC",
  "ETH-KRW": "ETH",
  "XRP-KRW": "XRP",
  "DOGE-KRW": "DOGE",
  "SOL-KRW": "SOL",
};

// 라운드 길이(초) → 타임프레임 문자열
const DURATION_TO_TIMEFRAME: Record<number, string> = {
  60: "1m",
  300: "5m",
  3600: "1h",
  86400: "1d",
};

interface UsePredictionOptions {
  onSuccess?: (prediction: Prediction) => void;
  onError?: (message: string) => void;
}

export function usePrediction({ onSuccess, onError }: UsePredictionOptions = {}) {
  const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 앱 시작 시 기존 PENDING 예측 복원
  useEffect(() => {
    predictionApi.active().then(setActivePrediction).catch(() => null);
  }, []);

  // PENDING 예측 결과 폴링 (10초 간격)
  useEffect(() => {
    if (!activePrediction || activePrediction.result !== "PENDING") return;

    const timer = setInterval(async () => {
      try {
        const updated = await predictionApi.get(activePrediction.id);
        if (updated.result !== "PENDING") {
          setActivePrediction(updated);
          clearInterval(timer);
        }
      } catch {
        // ignore poll errors
      }
    }, 10_000);

    return () => clearInterval(timer);
  }, [activePrediction?.id, activePrediction?.result]);

  const submitPrediction = useCallback(
    async (
      engineSymbol: string,
      direction: PredictionDirection,
      roundDurationSec: number,
      betAmount: number,
    ) => {
      const apiSymbol = ENGINE_TO_API[engineSymbol] ?? engineSymbol;
      const timeframe = (DURATION_TO_TIMEFRAME[roundDurationSec] ?? "1m") as PredictionTimeframe;

      setIsSubmitting(true);
      try {
        const prediction = await predictionApi.create({
          symbol: apiSymbol,
          direction,
          timeframe,
          betAmount,
        });
        setActivePrediction(prediction);
        onSuccess?.(prediction);
      } catch (err) {
        const msg =
          err instanceof ApiClientError ? err.message : "예측 제출에 실패했습니다.";
        onError?.(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSuccess, onError],
  );

  return { activePrediction, isSubmitting, submitPrediction };
}
