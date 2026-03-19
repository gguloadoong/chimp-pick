export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface User {
  id: string;
  email: string | null;
  nickname: string;
  password: string | null;
  avatarLevel: number;
  bananaCoins: number;
  isGuest: boolean;
  createdAt: string;
  lastDailyBonus: string | null;
}

export interface UserStats {
  userId: string;
  totalPredictions: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  profitLoss: number;
  totalBet: number;
}

export type PredictionDirection = 'UP' | 'DOWN';
export type PredictionStatus = 'PENDING' | 'WIN' | 'LOSE';
export type PredictionTimeframe = '1m' | '5m' | '1h' | '1d';

export interface Prediction {
  id: string;
  userId: string;
  symbol: string;
  direction: PredictionDirection;
  timeframe: PredictionTimeframe;
  betAmount: number;
  entryPrice: number;
  exitPrice: number | null;
  result: PredictionStatus;
  reward: number;
  createdAt: string;
  expiresAt: string;
  resolvedAt: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'BET' | 'WIN' | 'DAILY_BONUS' | 'INITIAL';
  amount: number;
  description: string;
  createdAt: string;
}

export const users: User[] = [
  {
    id: 'user-1',
    email: 'chimp1@test.com',
    nickname: '가즈아전사',
    password: 'test1234',
    avatarLevel: 3,
    bananaCoins: 850,
    isGuest: false,
    createdAt: new Date('2026-03-01').toISOString(),
    lastDailyBonus: null,
  },
  {
    id: 'user-2',
    email: 'chimp2@test.com',
    nickname: '떡상마스터',
    password: 'test1234',
    avatarLevel: 2,
    bananaCoins: 320,
    isGuest: false,
    createdAt: new Date('2026-03-05').toISOString(),
    lastDailyBonus: null,
  },
  {
    id: 'user-3',
    email: 'chimp3@test.com',
    nickname: '바나나헌터',
    password: 'test1234',
    avatarLevel: 1,
    bananaCoins: 150,
    isGuest: false,
    createdAt: new Date('2026-03-10').toISOString(),
    lastDailyBonus: null,
  },
  {
    id: 'user-4',
    email: 'chimp4@test.com',
    nickname: '킹콩트레이더',
    password: 'test1234',
    avatarLevel: 4,
    bananaCoins: 1200,
    isGuest: false,
    createdAt: new Date('2026-02-20').toISOString(),
    lastDailyBonus: null,
  },
  {
    id: 'user-5',
    email: 'chimp5@test.com',
    nickname: '손절장인',
    password: 'test1234',
    avatarLevel: 1,
    bananaCoins: 50,
    isGuest: false,
    createdAt: new Date('2026-03-15').toISOString(),
    lastDailyBonus: null,
  },
];

export const userStatsMap: Map<string, UserStats> = new Map([
  [
    'user-1',
    {
      userId: 'user-1',
      totalPredictions: 42,
      wins: 28,
      losses: 14,
      winRate: 66.67,
      currentStreak: 3,
      maxStreak: 7,
      profitLoss: 350,
      totalBet: 2100,
    },
  ],
  [
    'user-2',
    {
      userId: 'user-2',
      totalPredictions: 20,
      wins: 10,
      losses: 10,
      winRate: 50,
      currentStreak: 0,
      maxStreak: 4,
      profitLoss: 80,
      totalBet: 1000,
    },
  ],
  [
    'user-3',
    {
      userId: 'user-3',
      totalPredictions: 10,
      wins: 4,
      losses: 6,
      winRate: 40,
      currentStreak: -2,
      maxStreak: 3,
      profitLoss: -50,
      totalBet: 500,
    },
  ],
  [
    'user-4',
    {
      userId: 'user-4',
      totalPredictions: 85,
      wins: 60,
      losses: 25,
      winRate: 70.59,
      currentStreak: 5,
      maxStreak: 12,
      profitLoss: 1200,
      totalBet: 4250,
    },
  ],
  [
    'user-5',
    {
      userId: 'user-5',
      totalPredictions: 15,
      wins: 3,
      losses: 12,
      winRate: 20,
      currentStreak: -5,
      maxStreak: 2,
      profitLoss: -450,
      totalBet: 750,
    },
  ],
]);

export const predictions: Prediction[] = [];

export const transactions: Transaction[] = [];

export function findUser(userId: string): User | undefined {
  return users.find((u) => u.id === userId);
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserStats(userId: string): UserStats {
  let stats = userStatsMap.get(userId);
  if (!stats) {
    stats = {
      userId,
      totalPredictions: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
      profitLoss: 0,
      totalBet: 0,
    };
    userStatsMap.set(userId, stats);
  }
  return stats;
}

export function sanitizeUser(user: User): Omit<User, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return safe;
}

export const MOCK_PRICES: Record<string, number> = {
  'BTC-KRW': 95234000,
  'ETH-KRW': 4520000,
  'DOGE-KRW': 280,
  'SHIB-KRW': 0.015,
  'XRP-KRW': 890,
  '005930': 72500,
  '000660': 185000,
  '035420': 210000,
  '035720': 52000,
  '068270': 180000,
};
