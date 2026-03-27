'use client';

import { useState } from 'react';
import { type AnalystPostFromApi } from '@/lib/api/analyst';
import { CHARACTER_CONFIG, TIMEFRAME_LABEL } from '@/lib/characters';

interface PostCardProps {
  post: AnalystPostFromApi;
  userReaction?: 'LONG' | 'SHORT' | null;
  onReact: (postId: string, direction: 'LONG' | 'SHORT') => void;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function PostCard({ post, userReaction, onReact }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = CHARACTER_CONFIG[post.character];
  const total = post.longCount + post.shortCount;
  const longPct = total === 0 ? 50 : Math.round((post.longCount / total) * 100);
  const shortPct = 100 - longPct;

  const timeframeLabel = TIMEFRAME_LABEL[post.timeframe];

  return (
    <article
      className="pixel-card bg-[#2a2a2a] p-4 animate-fade-in-up"
      style={{ '--cat-color': config.color } as React.CSSProperties}
      aria-label={`${config.name}의 시황 분석`}
    >
      {/* 헤더: 캐릭터 + 시간프레임 배지 + 시간 */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-2xl leading-none"
            role="img"
            aria-label={config.name}
          >
            {config.emoji}
          </span>
          <div>
            <p
              className="text-sm font-bold leading-tight"
              style={{ color: config.color }}
            >
              {config.name}
            </p>
            <p className="text-[10px] text-[var(--fg-tertiary)] leading-tight">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.eventType && (
            <span className="pixel-badge text-[9px] px-1.5 py-0.5 text-[var(--brand-primary)] retro-label">
              {post.eventType}
            </span>
          )}
          <span
            className="pixel-badge text-[9px] px-1.5 py-0.5 retro-label"
            style={{ color: config.color }}
          >
            {timeframeLabel}
          </span>
        </div>
      </header>

      {/* 콘텐츠 */}
      <div className="mb-3">
        <p
          className={[
            'text-sm text-[var(--fg-primary)] leading-relaxed',
            !isExpanded ? 'line-clamp-3' : '',
          ].join(' ')}
        >
          {post.content}
        </p>

        {post.reasoning && (
          <>
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="mt-1 text-xs text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] transition-colors"
                aria-expanded={false}
              >
                분석 더 보기 &darr;
              </button>
            )}
            {isExpanded && (
              <div
                className="mt-2 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-secondary)]"
                role="region"
                aria-label="분석 근거"
              >
                <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                  {post.reasoning}
                </p>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="mt-1 text-xs text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] transition-colors"
                  aria-expanded={true}
                >
                  접기 &uarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 종목 태그 */}
      {post.symbols.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3" role="list" aria-label="관련 종목">
          {post.symbols.map((symbol) => (
            <span
              key={symbol}
              role="listitem"
              className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--fg-secondary)] border border-[var(--border-secondary)] font-mono tabular"
            >
              {symbol}
            </span>
          ))}
        </div>
      )}

      {/* Human Indicator: 비율 바 */}
      <div className="mb-3" role="meter" aria-label={`롱 ${longPct}% 숏 ${shortPct}%`} aria-valuenow={longPct} aria-valuemin={0} aria-valuemax={100}>
        <div className="flex justify-between text-[10px] text-[var(--fg-tertiary)] mb-1 tabular">
          <span>🐂 {longPct}%</span>
          <span className="font-pixel text-[var(--fg-tertiary)]">인간지표</span>
          <span>{shortPct}% 🐻</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-primary)] flex">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${longPct}%`, backgroundColor: '#63c74d' }}
          />
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${shortPct}%`, backgroundColor: '#e43b44' }}
          />
        </div>
        <p className="text-center text-[9px] text-[var(--fg-tertiary)] mt-0.5 tabular">
          {total.toLocaleString()}명 참여
        </p>
      </div>

      {/* 동조/반박 버튼 */}
      <div className="flex gap-2" role="group" aria-label="시황 반응">
        <button
          type="button"
          onClick={() => onReact(post.id, 'LONG')}
          aria-pressed={userReaction === 'LONG'}
          aria-label={`롱 동조 (${post.longCount.toLocaleString()}명)`}
          className={[
            'pixel-btn-up flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold btn-press',
            userReaction === 'SHORT' ? 'pixel-btn-unchosen' : '',
            userReaction === 'LONG' ? 'pixel-btn-chosen' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span aria-hidden="true">🐂</span>
          <span>동조</span>
          <span className="tabular text-xs opacity-80">
            {post.longCount.toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onReact(post.id, 'SHORT')}
          aria-pressed={userReaction === 'SHORT'}
          aria-label={`숏 반박 (${post.shortCount.toLocaleString()}명)`}
          className={[
            'pixel-btn-down flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold btn-press',
            userReaction === 'LONG' ? 'pixel-btn-unchosen' : '',
            userReaction === 'SHORT' ? 'pixel-btn-chosen' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span aria-hidden="true">🐻</span>
          <span>반박</span>
          <span className="tabular text-xs opacity-80">
            {post.shortCount.toLocaleString()}
          </span>
        </button>
      </div>
    </article>
  );
}
