"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { PriceUpdateEvent, PredictionResultEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

interface UseWebSocketOptions {
  token?: string | null;
  onPriceUpdate?: (data: PriceUpdateEvent) => void;
  onPredictionResult?: (data: PredictionResultEvent) => void;
}

export function useWebSocket({
  token,
  onPriceUpdate,
  onPredictionResult,
}: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(WS_URL, {
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    if (onPriceUpdate) {
      socket.on("price:update", onPriceUpdate);
    }
    if (onPredictionResult) {
      socket.on("prediction:result", onPredictionResult);
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const subscribePrice = useCallback((symbol: string) => {
    socketRef.current?.emit("subscribe:price", { symbol });
  }, []);

  const unsubscribePrice = useCallback((symbol: string) => {
    socketRef.current?.emit("unsubscribe:price", { symbol });
  }, []);

  return { isConnected, subscribePrice, unsubscribePrice };
}
