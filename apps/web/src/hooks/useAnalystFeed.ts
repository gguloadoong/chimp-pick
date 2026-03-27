'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket, type PositionUpdateEvent } from '@/hooks/useWebSocket';
import { fetchAnalystPosts, reactToPost, type AnalystPostFromApi } from '@/lib/api/analyst';
import { MOCK_ANALYST_POSTS } from '@/lib/mock/analyst-posts';

// Mock 데이터를 API 응답 형태로 변환
const MOCK_AS_API: AnalystPostFromApi[] = MOCK_ANALYST_POSTS.map((p) => ({
  ...p,
  createdAt: new Date(p.createdAt).toISOString(),
}));

// 임시 userId — 실제 auth 연결 전까지
function initTempUserId(): string {
  if (typeof window === 'undefined') return 'ssr-user';
  const stored = localStorage.getItem('chimp-temp-uid');
  if (stored) return stored;
  const uid = `guest-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem('chimp-temp-uid', uid);
  return uid;
}

export function useAnalystFeed() {
  const [posts, setPosts] = useState<AnalystPostFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState<Map<string, 'LONG' | 'SHORT'>>(new Map());

  // 렌더 시점에 즉시 초기화 (useEffect 타이밍 버그 방지)
  const [userId] = useState<string>(() => initTempUserId());

  // 포스트 로드 — 실패 시 Mock 폴백
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchAnalystPosts(20);
        if (!cancelled) setPosts(data.length > 0 ? data : MOCK_AS_API);
      } catch {
        if (!cancelled) setPosts(MOCK_AS_API);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Socket.IO — position:update 수신
  useWebSocket({
    onPositionUpdate: (payload: PositionUpdateEvent) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === payload.postId
            ? { ...p, longCount: payload.longCount, shortCount: payload.shortCount }
            : p,
        ),
      );
    },
  });

  const handleReact = useCallback(async (postId: string, direction: 'LONG' | 'SHORT') => {
    const opposite = direction === 'LONG' ? 'SHORT' : 'LONG';
    const countKey = direction === 'LONG' ? 'longCount' : 'shortCount';
    const oppositeKey = direction === 'LONG' ? 'shortCount' : 'longCount';

    setUserReactions((prev) => {
      const next = new Map(prev);
      const current = next.get(postId);

      if (current === direction) {
        // 같은 방향 → 취소
        next.delete(postId);
        setPosts((p) => p.map((post) =>
          post.id === postId
            ? { ...post, [countKey]: Math.max(0, post[countKey] - 1) }
            : post,
        ));
      } else {
        // 방향 전환 또는 신규 반응
        next.set(postId, direction);
        setPosts((p) => p.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            [countKey]: post[countKey] + 1,
            // 이전 반응이 있었으면 반대 방향 감소
            [oppositeKey]: current === opposite ? Math.max(0, post[oppositeKey] - 1) : post[oppositeKey],
          };
        }));
      }
      return next;
    });

    try {
      await reactToPost(postId, direction, userId);
    } catch {
      // 실패 시 소켓으로 서버 최신 상태 수신됨
    }
  }, [userId]);

  return { posts, loading, userReactions, handleReact };
}
