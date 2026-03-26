'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { fetchAnalystPosts, reactToPost, type AnalystPostFromApi } from '@/lib/api/analyst';
import { MOCK_ANALYST_POSTS } from '@/lib/mock/analyst-posts';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

// Mock 데이터를 API 응답 형태로 변환
const MOCK_AS_API: AnalystPostFromApi[] = MOCK_ANALYST_POSTS.map((p) => ({
  ...p,
  createdAt: new Date(p.createdAt).toISOString(),
}));

interface PositionUpdate {
  postId: string;
  longCount: number;
  shortCount: number;
  longPct: number;
  shortPct: number;
  totalVotes: number;
}

// 임시 userId (Sprint 3 Mock — 실제 auth 연결 전까지)
function getTempUserId(): string {
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
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>('');

  // 포스트 로드 (API 실패 시 Mock 폴백)
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

  // userId 초기화
  useEffect(() => {
    userIdRef.current = getTempUserId();
  }, []);

  // Socket.IO 연결 + position:update 수신
  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('position:update', (payload: PositionUpdate) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === payload.postId
            ? { ...p, longCount: payload.longCount, shortCount: payload.shortCount }
            : p,
        ),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleReact = useCallback(async (postId: string, direction: 'LONG' | 'SHORT') => {
    // 낙관적 업데이트
    setUserReactions((prev) => {
      const next = new Map(prev);
      const current = next.get(postId);
      if (current === direction) {
        next.delete(postId);
        setPosts((p) => p.map((post) =>
          post.id === postId
            ? { ...post, [direction === 'LONG' ? 'longCount' : 'shortCount']: Math.max(0, (direction === 'LONG' ? post.longCount : post.shortCount) - 1) }
            : post,
        ));
      } else {
        next.set(postId, direction);
        setPosts((p) => p.map((post) =>
          post.id === postId
            ? { ...post, [direction === 'LONG' ? 'longCount' : 'shortCount']: (direction === 'LONG' ? post.longCount : post.shortCount) + 1 }
            : post,
        ));
      }
      return next;
    });

    // API 호출 (실패해도 낙관적 업데이트 유지)
    try {
      await reactToPost(postId, direction, userIdRef.current);
    } catch {
      // 실패 시 소켓으로 최신 상태 수신될 예정
    }
  }, []);

  return { posts, loading, userReactions, handleReact };
}
