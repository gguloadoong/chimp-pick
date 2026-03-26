export interface HumanIndicatorData {
  symbol: string;
  longPct: number;
  shortPct: number;
  totalVotes: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  contrarian: boolean;
}

export const MOCK_HUMAN_INDICATORS: HumanIndicatorData[] = [
  {
    symbol: 'BTC',
    longPct: 73,
    shortPct: 27,
    totalVotes: 1247,
    trend: 'BULLISH',
    contrarian: true,
  },
  {
    symbol: 'ETH',
    longPct: 61,
    shortPct: 39,
    totalVotes: 834,
    trend: 'BULLISH',
    contrarian: false,
  },
  {
    symbol: 'KOSPI',
    longPct: 38,
    shortPct: 62,
    totalVotes: 521,
    trend: 'BEARISH',
    contrarian: false,
  },
  {
    symbol: 'GOLD',
    longPct: 52,
    shortPct: 48,
    totalVotes: 289,
    trend: 'NEUTRAL',
    contrarian: false,
  },
  {
    symbol: '나스닥',
    longPct: 82,
    shortPct: 18,
    totalVotes: 1891,
    trend: 'BULLISH',
    contrarian: true,
  },
];
