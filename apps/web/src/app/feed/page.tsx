'use client';

import { useState, useMemo } from 'react';
import PostCard from '@/components/analyst/PostCard';
import { MOCK_ANALYST_POSTS, type AnalystPost } from '@/lib/mock/analyst-posts';

type FilterTab = 'ALL' | 'LONG' | 'SHORT' | 'NEUTRAL';

const FILTER_TABS: { key: FilterTab; label: string; emoji: string }[] = [
  { key: 'ALL', label: '전체', emoji: '🦍' },
  { key: 'LONG', label: '롱', emoji: '🐂' },
  { key: 'SHORT', label: '숏', emoji: '🐻' },
  { key: 'NEUTRAL', label: '중립', emoji: '🦧' },
];

function filterPosts(posts: AnalystPost[], tab: FilterTab): AnalystPost[] {
  if (tab === 'ALL') return posts;
  if (tab === 'NEUTRAL') return posts.filter((p) => p.character === 'NEUTRAL' || p.character === 'WAVE');
  return posts.filter((p) => p.character === tab);
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [userReactions, setUserReactions] = useState<Map<string, 'LONG' | 'SHORT'>>(new Map());

  const filteredPosts = useMemo(
    () => filterPosts(MOCK_ANALYST_POSTS, activeTab),
    [activeTab],
  );

  function handleReact(postId: string, direction: 'LONG' | 'SHORT') {
    setUserReactions((prev) => {
      const next = new Map(prev);
      if (next.get(postId) === direction) {
        next.delete(postId);
      } else {
        next.set(postId, direction);
      }
      return next;
    });
  }

  return (
    <div className="max-w-md mx-auto">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-heading text-lg font-bold text-[var(--fg-primary)]">
            <span aria-hidden="true">🦍</span>{' '}
            <span>침팬지픽 시황</span>
          </h1>
          <span className="pixel-badge text-[9px] px-2 py-0.5 text-[var(--brand-primary)] retro-label animate-urgent">
            LIVE
          </span>
        </div>

        {/* 필터 탭 */}
        <nav
          role="tablist"
          aria-label="시황 필터"
          className="flex gap-1 scrollbar-hide overflow-x-auto pb-px"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex items-center gap-1 px-3 py-2 text-xs font-bold whitespace-nowrap transition-all duration-150 border-b-2',
                  isActive
                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                    : 'border-transparent text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]',
                ].join(' ')}
              >
                <span aria-hidden="true">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* 피드 목록 */}
      <section
        role="feed"
        aria-label="AI 시황 피드"
        aria-live="polite"
        className="px-4 py-3 flex flex-col gap-3"
      >
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl" role="img" aria-label="없음">
              🙈
            </span>
            <p className="text-sm text-[var(--fg-secondary)]">
              해당 캐릭터의 시황이 없어요
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userReaction={userReactions.get(post.id) ?? null}
              onReact={handleReact}
            />
          ))
        )}
      </section>

      {/* 하단 여백 (BottomNav 높이 보정) */}
      <div className="h-4" aria-hidden="true" />
    </div>
  );
}
