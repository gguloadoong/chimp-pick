import { Injectable } from '@nestjs/common';

export interface EconomicEvent {
  id: string;
  date: string;
  time?: string;
  type: 'FOMC' | 'CPI' | 'NFP' | 'PCE' | 'KR_RATE' | 'EARNINGS' | 'OTHER';
  title: string;
  description?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  country: 'US' | 'KR' | 'GLOBAL';
}

const ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'ev-2026-03-28-pce',
    date: '2026-03-28',
    time: '22:30',
    type: 'PCE',
    title: 'PCE 물가지수 발표',
    description: '미국 연준이 선호하는 인플레이션 지표. 소비자 지출 기반 물가 변화율.',
    importance: 'HIGH',
    country: 'US',
  },
  {
    id: 'ev-2026-04-02-fomc-minutes',
    date: '2026-04-02',
    time: '03:00',
    type: 'FOMC',
    title: 'FOMC 의사록 공개',
    description: '3월 FOMC 회의 상세 논의 내용 공개. 금리 향방 힌트 포함.',
    importance: 'HIGH',
    country: 'US',
  },
  {
    id: 'ev-2026-04-10-cpi',
    date: '2026-04-10',
    time: '21:30',
    type: 'CPI',
    title: 'CPI 소비자물가지수',
    description: '3월 미국 소비자물가지수 발표. 인플레이션 추세 확인.',
    importance: 'HIGH',
    country: 'US',
  },
  {
    id: 'ev-2026-04-15-kr-rate',
    date: '2026-04-15',
    time: '10:00',
    type: 'KR_RATE',
    title: '한국 기준금리 결정',
    description: '한국은행 금융통화위원회 기준금리 결정. 국내 유동성 및 환율에 직접 영향.',
    importance: 'HIGH',
    country: 'KR',
  },
  {
    id: 'ev-2026-04-25-gdp',
    date: '2026-04-25',
    time: '21:30',
    type: 'OTHER',
    title: '1분기 GDP 성장률',
    description: '미국 2026년 1분기 GDP 속보치 발표. 경기 침체 여부 판단 기준.',
    importance: 'MEDIUM',
    country: 'US',
  },
  {
    id: 'ev-2026-05-02-nfp',
    date: '2026-05-02',
    time: '21:30',
    type: 'NFP',
    title: '실업률 발표',
    description: '4월 미국 비농업부문 고용지표 및 실업률 발표.',
    importance: 'MEDIUM',
    country: 'US',
  },
  {
    id: 'ev-2026-05-07-fomc',
    date: '2026-05-07',
    time: '03:00',
    type: 'FOMC',
    title: 'FOMC 금리결정',
    description: '5월 FOMC 회의 기준금리 결정 발표. 파월 의장 기자회견 예정.',
    importance: 'HIGH',
    country: 'US',
  },
  {
    id: 'ev-2026-05-13-cpi',
    date: '2026-05-13',
    time: '21:30',
    type: 'CPI',
    title: 'CPI 소비자물가지수',
    description: '4월 미국 소비자물가지수 발표.',
    importance: 'HIGH',
    country: 'US',
  },
  {
    id: 'ev-2026-05-22-kr-rate',
    date: '2026-05-22',
    time: '10:00',
    type: 'KR_RATE',
    title: '한국 기준금리 결정',
    description: '한국은행 5월 금융통화위원회 기준금리 결정.',
    importance: 'HIGH',
    country: 'KR',
  },
  {
    id: 'ev-2026-06-11-fomc',
    date: '2026-06-11',
    time: '03:00',
    type: 'FOMC',
    title: 'FOMC 금리결정',
    description: '6월 FOMC 회의 기준금리 결정 발표. 상반기 마지막 FOMC.',
    importance: 'HIGH',
    country: 'US',
  },
  {
    id: 'ev-2026-06-12-cpi',
    date: '2026-06-12',
    time: '21:30',
    type: 'CPI',
    title: 'CPI 소비자물가지수',
    description: '5월 미국 소비자물가지수 발표. FOMC 직후 인플레이션 추세 확인.',
    importance: 'HIGH',
    country: 'US',
  },
];

@Injectable()
export class CalendarService {
  private getTodayStringInSeoul(): string {
    const now = new Date();
    const seoulOffset = 9 * 60;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const seoulMs = utcMs + seoulOffset * 60 * 1000;
    const seoulDate = new Date(seoulMs);
    const y = seoulDate.getFullYear();
    const m = String(seoulDate.getMonth() + 1).padStart(2, '0');
    const d = String(seoulDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private addDaysToDateString(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  getUpcomingEvents(days = 30): EconomicEvent[] {
    const today = this.getTodayStringInSeoul();
    const limit = this.addDaysToDateString(today, days);

    return ECONOMIC_EVENTS.filter((event) => {
      return event.date >= today && event.date <= limit;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  getAllEvents(): EconomicEvent[] {
    return [...ECONOMIC_EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  }

  getEventsByType(type: string): EconomicEvent[] {
    const upperType = type.toUpperCase();
    return ECONOMIC_EVENTS.filter((event) => event.type === upperType).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }
}
