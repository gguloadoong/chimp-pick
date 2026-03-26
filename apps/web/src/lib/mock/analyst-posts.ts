export interface AnalystPost {
  id: string;
  character: 'LONG' | 'SHORT' | 'NEUTRAL' | 'WAVE';
  content: string;
  reasoning?: string;
  symbols: string[];
  eventType?: string;
  timeframe: 'DAILY' | 'MID' | 'LONG';
  longCount: number;
  shortCount: number;
  createdAt: string;
}

export const MOCK_ANALYST_POSTS: AnalystPost[] = [
  {
    id: 'post-001',
    character: 'LONG',
    content:
      '비트코인 지금 안 사면 후회해! FOMC 비둘기파 확정으로 유동성 파티 시작이야 🐂 다음 저항선 $72,000 뚫리면 ATH 재도전 각잡아라.',
    reasoning:
      'FOMC 의사록에서 매파 위원 2명이 비둘기로 전환. 실질 금리 하락 구간에서 BTC는 역사적으로 평균 +40% 상승했음.',
    symbols: ['BTC', 'ETH'],
    eventType: 'FOMC',
    timeframe: 'MID',
    longCount: 1284,
    shortCount: 392,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'post-002',
    character: 'SHORT',
    content:
      '다들 무슨 자신감이야. CPI 3.2% 나왔는데 금리 인하 꿈도 꾸지 마. 현금이 답이야 🐻 채권 수익률 보면 시장이 틀렸다는 거 안 보여?',
    reasoning:
      'Core CPI 3.2%는 Fed 목표치 2%를 크게 상회. 6월 인하 확률 CME FedWatch 기준 18%까지 붕괴. 리스크온 자산 전반 조정 불가피.',
    symbols: ['SPY', 'QQQ', 'BTC'],
    eventType: 'CPI',
    timeframe: 'DAILY',
    longCount: 203,
    shortCount: 891,
    createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
  {
    id: 'post-003',
    character: 'NEUTRAL',
    content:
      'BTC 현재가 $67,420. 24시간 등락 +2.3%. 거래량 전일비 142%. RSI 58.4, MACD 골든크로스 진행 중. 데이터는 중립이나 모멘텀은 우상향. ₿',
    symbols: ['BTC'],
    timeframe: 'DAILY',
    longCount: 748,
    shortCount: 312,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'post-004',
    character: 'LONG',
    content:
      '코스피 2600 뚫으면 그다음은 하늘이야~ 외국인 순매수 3거래일 연속이잖아 🐂 반도체 사이클 바닥 찍고 올라오는 거 차트로 이미 증명됨.',
    reasoning:
      '삼성전자 외국인 보유비율 3개월 저점 대비 +2.1%p 회복. SK하이닉스 HBM3E 수주 확대 뉴스 호재. 원/달러 1,320원대 안정화.',
    symbols: ['KOSPI', '005930', '000660'],
    timeframe: 'MID',
    longCount: 567,
    shortCount: 189,
    createdAt: new Date(Date.now() - 1000 * 60 * 72).toISOString(),
  },
  {
    id: 'post-005',
    character: 'WAVE',
    content:
      'ETH 지금 올라타! 모멘텀 살아있어 🌊 눌림목 끝났고 위로 방향 잡혔다. $3,400 돌파하면 $3,800까지 파동 완성. 타이밍 지금이야.',
    reasoning:
      'ETH 주봉 기준 엘리엇 5파 전개 중. 4파 조정 $3,100 지지 확인 후 반등. 온체인 스테이킹 APR 상승으로 수요 증가 중.',
    symbols: ['ETH'],
    timeframe: 'MID',
    longCount: 923,
    shortCount: 441,
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
];
