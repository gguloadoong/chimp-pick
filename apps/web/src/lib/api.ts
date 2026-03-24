/**
 * ChimpPick API Client
 * fetch 기반 typed HTTP 클라이언트 — JWT 자동 주입, 표준 응답 래핑
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { timestamp: string };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
  meta: { timestamp: string };
}

class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers,
  });

  const body = (await res.json()) as ApiResponse<T> | ApiError;

  if (!res.ok || !body.success) {
    const err = body as ApiError;
    throw new ApiClientError(
      err.error?.code ?? "UNKNOWN_ERROR",
      err.error?.message ?? "알 수 없는 오류가 발생했습니다.",
      res.status,
    );
  }

  return (body as ApiResponse<T>).data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    nickname: string;
    avatarLevel: number;
    bananaCoins: number;
    isGuest: boolean;
  };
}

export const authApi = {
  register: (email: string, password: string, nickname: string) =>
    request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nickname }),
    }),

  login: (email: string, password: string) =>
    request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  guest: () =>
    request<AuthTokens>("/auth/guest", { method: "POST" }),

  profile: () => request<AuthTokens["user"]>("/auth/profile"),
};

// ─── Users ─────────────────────────────────────────────────────────────────

export interface UserStats {
  userId: string;
  totalPredictions: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
}

export const userApi = {
  me: () => request<AuthTokens["user"]>("/users/me"),
  stats: () => request<UserStats>("/users/me/stats"),
};

// ─── Prices ────────────────────────────────────────────────────────────────

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const priceApi = {
  all: () => request<PriceData[]>("/prices"),
  get: (symbol: string) => request<PriceData>(`/prices/${symbol}`),
  candles: (symbol: string, timeframe = "1m", limit = 60) =>
    request<Candle[]>(`/prices/${symbol}/candles?timeframe=${timeframe}&limit=${limit}`),
};

// ─── Predictions ───────────────────────────────────────────────────────────

export type PredictionDirection = "UP" | "DOWN";
export type PredictionTimeframe = "1m" | "5m" | "1h" | "1d";
export type PredictionResult = "PENDING" | "WIN" | "LOSE";

export interface Prediction {
  id: string;
  userId: string;
  symbol: string;
  direction: PredictionDirection;
  timeframe: PredictionTimeframe;
  betAmount: number;
  entryPrice: number;
  exitPrice: number | null;
  result: PredictionResult;
  reward: number | null;
  createdAt: string;
  expiresAt: string;
  resolvedAt: string | null;
}

export const predictionApi = {
  create: (body: {
    symbol: string;
    direction: PredictionDirection;
    timeframe: PredictionTimeframe;
    betAmount: number;
  }) => request<Prediction>("/predictions", { method: "POST", body: JSON.stringify(body) }),

  active: () => request<Prediction | null>("/predictions/active"),

  history: (page = 1, limit = 20) =>
    request<{ items: Prediction[]; total: number; page: number }>(`/predictions/history?page=${page}&limit=${limit}`),

  get: (id: string) => request<Prediction>(`/predictions/${id}`),
};

// ─── Rankings ──────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatarLevel: number;
  bananaCoins: number;
  totalPredictions: number;
  wins: number;
  winRate: number;
  profit: number;
  currentStreak: number;
}

export const rankingApi = {
  list: (period = "weekly", limit = 100) =>
    request<RankingEntry[]>(`/rankings?period=${period}&limit=${limit}`),
  me: (period = "weekly") =>
    request<{ rank: number }>(`/rankings/me?period=${period}`),
};

// ─── Rewards ───────────────────────────────────────────────────────────────

export const rewardApi = {
  claimDaily: () =>
    request<{ reward: number; newBalance: number }>("/rewards/daily", { method: "POST" }),
  transactions: (page = 1, limit = 20) =>
    request<{ items: unknown[]; total: number }>(`/rewards/transactions?page=${page}&limit=${limit}`),
};

export { ApiClientError };
