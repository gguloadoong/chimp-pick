// ===== User =====
export interface User {
  id: string;
  nickname: string;
  avatarLevel: number;
  isGuest: boolean;
  createdAt: string;
}

// ===== Round =====
export type RoundPhase = "WAITING" | "OPEN" | "CLOSED" | "RESOLVED";
export type Direction = "UP" | "DOWN";

export type QuestionCategory = "price" | "fun" | "trivia";

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

/** Demo round duration: 30s open + 5s resolution */
export const ROUND_OPEN_MS = 30_000;
export const ROUND_RESOLVE_DELAY_MS = 5_000;
export const ROUND_BREAK_MS = 8_000;
