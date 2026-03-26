export type CharacterKey = 'LONG' | 'SHORT' | 'NEUTRAL' | 'WAVE';

export interface CharacterConfig {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CHARACTER_CONFIG: Record<CharacterKey, CharacterConfig> = {
  LONG: {
    name: '롱충이 박사',
    emoji: '🐂',
    color: '#63c74d',
    bgColor: '#1a3a1a',
    borderColor: '#2a6b25',
  },
  SHORT: {
    name: '숏충이 교수',
    emoji: '🐻',
    color: '#e43b44',
    bgColor: '#3a1a1a',
    borderColor: '#7a1520',
  },
  NEUTRAL: {
    name: '침팬지 AI',
    emoji: '🦧',
    color: '#feae34',
    bgColor: '#3a2a0a',
    borderColor: '#ab5236',
  },
  WAVE: {
    name: '파도타기 선생',
    emoji: '🌊',
    color: '#4fc3f7',
    bgColor: '#0a2a3a',
    borderColor: '#0a6a8a',
  },
} as const;

export type TimeframeKey = 'DAILY' | 'MID' | 'LONG';

export const TIMEFRAME_LABEL: Record<TimeframeKey, string> = {
  DAILY: '단기',
  MID: '중기',
  LONG: '장기',
} as const;
