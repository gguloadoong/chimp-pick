// ===== User =====
export interface User {
  id: string;
  nickname: string;
  avatarLevel: number;
  bananaCoins: number;
  isGuest: boolean;
  createdAt: string;
}

export interface UserStats {
  totalPredictions: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  profitLoss: number;
}

// ===== Auth =====
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ===== Prediction =====
export type Direction = "UP" | "DOWN";
export type Timeframe = "1m" | "5m" | "1h" | "1d";
export type PredictionResult = "PENDING" | "WIN" | "LOSE";

export interface Prediction {
  id: string;
  userId: string;
  symbol: string;
  direction: Direction;
  timeframe: Timeframe;
  entryPrice: number;
  exitPrice: number | null;
  betAmount: number;
  result: PredictionResult;
  reward: number | null;
  createdAt: string;
  resolvedAt: string | null;
  expiresAt: string;
}

export interface CreatePredictionRequest {
  symbol: string;
  direction: Direction;
  timeframe: Timeframe;
  betAmount: number;
}

// ===== Price =====
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  updatedAt: string;
}

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

// ===== Symbol =====
export type SymbolCategory = "crypto" | "stock";

export interface SymbolInfo {
  symbol: string;
  name: string;
  nameKr: string;
  category: SymbolCategory;
  price?: number;
  change24h?: number;
}

// ===== Ranking =====
export type RankingPeriod = "daily" | "weekly" | "monthly" | "all";

export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatarLevel: number;
  winRate: number;
  totalPredictions: number;
  profit: number;
}

// ===== Transaction =====
export type TransactionType = "BET" | "WIN" | "LOSE" | "BONUS" | "DAILY";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ===== WebSocket Events =====
export interface PriceUpdateEvent {
  symbol: string;
  price: number;
  change: number;
  timestamp: string;
}

export interface PredictionResultEvent {
  predictionId: string;
  result: PredictionResult;
  exitPrice: number;
  reward: number;
  balanceAfter: number;
}

// ===== Constants =====
export const SYMBOLS: SymbolInfo[] = [
  { symbol: "BTC-KRW", name: "Bitcoin", nameKr: "비트코인", category: "crypto" },
  { symbol: "ETH-KRW", name: "Ethereum", nameKr: "이더리움", category: "crypto" },
  { symbol: "DOGE-KRW", name: "Dogecoin", nameKr: "도지코인", category: "crypto" },
  { symbol: "SHIB-KRW", name: "Shiba Inu", nameKr: "시바이누", category: "crypto" },
  { symbol: "XRP-KRW", name: "Ripple", nameKr: "리플", category: "crypto" },
  { symbol: "005930", name: "Samsung", nameKr: "삼성전자", category: "stock" },
  { symbol: "000660", name: "SK Hynix", nameKr: "SK하이닉스", category: "stock" },
  { symbol: "035420", name: "NAVER", nameKr: "네이버", category: "stock" },
  { symbol: "035720", name: "Kakao", nameKr: "카카오", category: "stock" },
  { symbol: "068270", name: "Celltrion", nameKr: "셀트리온", category: "stock" },
];

export const AVATAR_LEVELS = [
  { level: 1, name: "아기원숭이", emoji: "🐒", minWins: 0 },
  { level: 2, name: "침팬지", emoji: "🦧", minWins: 50 },
  { level: 3, name: "고릴라", emoji: "🦍", minWins: 200 },
  { level: 4, name: "킹콩", emoji: "👑", minWins: 500 },
  { level: 5, name: "전설의침팬지", emoji: "✨", minWins: 1000 },
];

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1m": "1분",
  "5m": "5분",
  "1h": "1시간",
  "1d": "1일",
};

export const TIMEFRAME_MS: Record<Timeframe, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "1h": 3_600_000,
  "1d": 86_400_000,
};

export const BET_MULTIPLIER = 1.8;
export const MIN_BET = 1;
export const MAX_BET = 50;
export const INITIAL_BANANA_COINS = 100;
export const DAILY_BONUS = 10;
export const GUEST_MAX_PREDICTIONS = 3;
