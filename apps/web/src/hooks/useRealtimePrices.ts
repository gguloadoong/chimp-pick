"use client";

import { useCallback } from "react";
import { useWebSocket, type PriceTickEvent } from "./useWebSocket";
import { injectLivePrice } from "@/lib/game-engine";

/**
 * WebSocket price:tick 이벤트를 수신하여 게임 엔진 priceState에 실시간 주입.
 * 기존 getPrice() / onPriceUpdate() 기반 UI가 자동으로 실제 업비트 데이터를 사용하게 된다.
 */
export function useRealtimePrices(token?: string | null) {
  const onPriceTick = useCallback((data: PriceTickEvent) => {
    injectLivePrice(data.symbol, data.price, data.change, data.changePercent);
  }, []);

  const { subscribe, unsubscribe } = useWebSocket({ token, onPriceTick });

  return { subscribe, unsubscribe };
}
