"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

// ─── Event types ───────────────────────────────────────────────────────────

export interface PriceTickEvent {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface RoundUpdateEvent {
  roundId: string;
  phase: "OPEN" | "CLOSED" | "RESULT";
  symbol: string;
  timeframe: string;
  endsAt: string;
}

export interface PredictionResultEvent {
  predictionId: string;
  result: "WIN" | "LOSE";
  reward: number;
  newBalance: number;
}

export interface PositionUpdateEvent {
  postId: string;
  longCount: number;
  shortCount: number;
  longPct: number;
  shortPct: number;
  totalVotes: number;
}

export interface ServerToClientEvents {
  "price:tick": (data: PriceTickEvent) => void;
  "round:update": (data: RoundUpdateEvent) => void;
  "prediction:result": (data: PredictionResultEvent) => void;
  "position:update": (data: PositionUpdateEvent) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
}

export interface ClientToServerEvents {
  "subscribe:symbol": (symbol: string) => void;
  "unsubscribe:symbol": (symbol: string) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ─── Hook ──────────────────────────────────────────────────────────────────

interface UseWebSocketOptions {
  token?: string | null;
  autoConnect?: boolean;
  onPriceTick?: (data: PriceTickEvent) => void;
  onRoundUpdate?: (data: RoundUpdateEvent) => void;
  onPredictionResult?: (data: PredictionResultEvent) => void;
  onPositionUpdate?: (data: PositionUpdateEvent) => void;
}

export function useWebSocket({
  token,
  autoConnect = true,
  onPriceTick,
  onRoundUpdate,
  onPredictionResult,
  onPositionUpdate,
}: UseWebSocketOptions = {}) {
  const socketRef = useRef<TypedSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket: TypedSocket = io(WS_URL, {
      auth: token ? { token } : undefined,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;
  }, [token]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const subscribe = useCallback((symbol: string) => {
    socketRef.current?.emit("subscribe:symbol", symbol);
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    socketRef.current?.emit("unsubscribe:symbol", symbol);
  }, []);

  useEffect(() => {
    if (!autoConnect) return;
    connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !onPriceTick) return;
    socket.on("price:tick", onPriceTick);
    return () => { socket.off("price:tick", onPriceTick); };
  }, [onPriceTick]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !onRoundUpdate) return;
    socket.on("round:update", onRoundUpdate);
    return () => { socket.off("round:update", onRoundUpdate); };
  }, [onRoundUpdate]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !onPredictionResult) return;
    socket.on("prediction:result", onPredictionResult);
    return () => { socket.off("prediction:result", onPredictionResult); };
  }, [onPredictionResult]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !onPositionUpdate) return;
    socket.on("position:update", onPositionUpdate);
    return () => { socket.off("position:update", onPositionUpdate); };
  }, [onPositionUpdate]);

  return { connect, disconnect, subscribe, unsubscribe };
}
