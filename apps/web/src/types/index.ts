// ===== User =====
export interface User {
  id: string;
  nickname: string;
  avatarLevel: number;
  isGuest: boolean;
  createdAt: string;
  bananaCoins?: number;
}

// ===== Round =====
export type RoundPhase = "WAITING" | "OPEN" | "CLOSED" | "RESOLVED";
export type Direction = "UP" | "DOWN";

export type QuestionCategory = "price" | "fun" | "trivia" | "sports" | "trend";

export interface Round {
  id: string;
  symbol: string;
  symbolName: string;
  category: SymbolCategory;
  entryPrice: number;
  exitPrice: number | null;
  result: Direction | null;
  phase: RoundPhase;
  opensAt: string;
  closesAt: string;
  resolvesAt: string;
  /** NPC simulated ratio: percentage that picked UP (0-100) */
  upRatio: number;
  /** Question metadata for diverse categories */
  questionCategory: QuestionCategory;
  questionEmoji: string;
  questionLabel: string;
  questionTitle: string;
  questionDesc: string;
  optionA: string;
  optionB: string;
  /** Speed round: shorter duration, bonus multiplier */
  isSpeedRound: boolean;
  /** Comparison round: A vs B (which one rises more?) */
  isComparison?: boolean;
  symbolB?: string;
  symbolNameB?: string;
  entryPriceB?: number;
  exitPriceB?: number | null;
}

export interface RoundPick {
  roundId: string;
  direction: Direction;
  pickedAt: string;
}

export interface RoundResult {
  roundId: string;
  symbol: string;
  symbolName: string;
  direction: Direction;
  result: Direction;
  isCorrect: boolean;
  score: number;
  upRatio: number;
  entryPrice: number;
  exitPrice: number;
  resolvedAt: string;
  /** Question metadata for display */
  questionCategory: QuestionCategory;
  questionTitle: string;
  optionA: string;
  optionB: string;
  /** Comparison round fields */
  isComparison?: boolean;
  symbolB?: string;
  symbolNameB?: string;
  entryPriceB?: number;
  exitPriceB?: number;
}

// ===== Score =====
export interface UserStats {
  totalRounds: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  totalScore: number;
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

// ===== Symbol =====
export type SymbolCategory = "crypto" | "stock";

export interface SymbolInfo {
  symbol: string;
  name: string;
  nameKr: string;
  category: SymbolCategory;
}

// ===== Ranking =====
export interface RankingEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatarLevel: number;
  totalScore: number;
  wins: number;
  totalRounds: number;
  winRate: number;
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

/** Round timing */
export const ROUND_OPEN_MS = 30_000;
export const ROUND_RESOLVE_DELAY_MS = 3_000;
export const ROUND_BREAK_MS = 3_000;
/** Category-specific durations (seconds) */
export const CATEGORY_DURATION: Record<string, number> = {
  price: 300,  // 5분 최소 — 비교 예측은 분석 시간 필요
  fun: 15,
  trivia: 20,
  sports: 15,
  trend: 20,
};
