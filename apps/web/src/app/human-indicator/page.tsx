'use client';

import { useMemo } from 'react';
import { MOCK_HUMAN_INDICATORS, type HumanIndicatorData } from '@/lib/mock/human-indicators';

function formatVotes(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k표`;
  }
  return `${count}표`;
}

function ContrarianBanner({ items }: { items: HumanIndicatorData[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="역발상 시그널 알림"
      className="mx-4 mt-3 mb-1 flex flex-col gap-2"
    >
      {items.map((item) => {
        const dominantSide = item.longPct >= item.shortPct ? '롱' : '숏';
        const dominantPct = item.longPct >= item.shortPct ? item.longPct : item.shortPct;
        return (
          <div
            key={item.symbol}
            role="alert"
            className={[
              'flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
              'bg-[var(--warning-bg)] border border-[var(--warning)]',
              'text-xs font-bold text-[var(--fg-primary)]',
            ].join(' ')}
          >
            <span aria-hidden="true">⚠️</span>
            <span>
              {item.symbol} {dominantSide} 쏠림 {dominantPct}% — 역발상 시그널?
            </span>
          </div>
        );
      })}
    </section>
  );
}

function IndicatorBar({ longPct, shortPct }: { longPct: number; shortPct: number }) {
  return (
    <div
      className="relative flex h-3 rounded-[var(--radius-full)] overflow-hidden bg-[var(--bg-tertiary)]"
      role="img"
      aria-label={`롱 ${longPct}% 숏 ${shortPct}%`}
    >
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${longPct}%`, backgroundColor: '#63c74d' }}
      />
      <div
        className="h-full flex-1 transition-all duration-500"
        style={{ backgroundColor: '#e43b44' }}
      />
    </div>
  );
}

function IndicatorCard({ item }: { item: HumanIndicatorData }) {
  return (
    <article
      aria-label={`${item.symbol} 인간지표`}
      className={[
        'rounded-[var(--radius-lg)] border border-[var(--border-primary)]',
        'bg-[var(--bg-elevated)] p-4 flex flex-col gap-3',
        'shadow-[var(--shadow-1)]',
      ].join(' ')}
    >
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-base font-bold text-[var(--fg-primary)]">
            {item.symbol}
          </span>
          <span className="text-[10px] text-[var(--fg-tertiary)] font-mono">
            {formatVotes(item.totalVotes)}
          </span>
        </div>
        {item.contrarian && (
          <span
            className={[
              'px-2 py-0.5 rounded-[var(--radius-sm)]',
              'text-[10px] font-bold font-pixel',
              'bg-[var(--warning)] text-[var(--bg-primary)]',
              'border border-[var(--border-primary)]',
            ].join(' ')}
            aria-label="역발상 시그널"
          >
            역발상?
          </span>
        )}
      </div>

      {/* 비율 바 */}
      <IndicatorBar longPct={item.longPct} shortPct={item.shortPct} />

      {/* 롱/숏 레이블 */}
      <div className="flex items-center justify-between text-xs font-bold">
        <span style={{ color: '#63c74d' }}>
          <span aria-hidden="true">🐂</span>{' '}
          <span>롱충이 진영 {item.longPct}%</span>
        </span>
        <span style={{ color: '#e43b44' }}>
          <span>숏충이 진영 {item.shortPct}%</span>{' '}
          <span aria-hidden="true">🐻</span>
        </span>
      </div>
    </article>
  );
}

export default function HumanIndicatorPage() {
  const contrarianItems = useMemo(
    () => MOCK_HUMAN_INDICATORS.filter((item) => item.contrarian),
    [],
  );

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold text-[var(--fg-primary)]">
              <span aria-hidden="true">🦧</span>{' '}
              <span>인간지표</span>
            </h1>
            <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
              쏠리면 반대로 봐라
            </p>
          </div>
          <span
            className="pixel-badge text-[9px] px-2 py-0.5 text-[var(--warning)] retro-label"
            aria-hidden="true"
          >
            SIGNAL
          </span>
        </div>
      </header>

      {/* 극단 쏠림 알림 배너 */}
      <ContrarianBanner items={contrarianItems} />

      {/* 종목별 카드 목록 */}
      <section
        aria-label="종목별 인간지표"
        className="px-4 py-3 flex flex-col gap-3"
      >
        {MOCK_HUMAN_INDICATORS.map((item) => (
          <IndicatorCard key={item.symbol} item={item} />
        ))}
      </section>

      {/* 하단 설명 */}
      <footer className="px-4 pb-4">
        <p
          className={[
            'text-xs text-[var(--fg-tertiary)] text-center',
            'px-3 py-2 rounded-[var(--radius-md)]',
            'bg-[var(--bg-secondary)] border border-[var(--border-secondary)]',
          ].join(' ')}
        >
          <span aria-hidden="true">💡</span>{' '}
          인간지표는 역발상 지표입니다. 모두가 롱이면 조심하세요.
        </p>
      </footer>

      {/* 하단 여백 (BottomNav 높이 보정) */}
      <div className="h-4" aria-hidden="true" />
    </div>
  );
}
