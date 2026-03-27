import { request } from '@/lib/api';

export interface AnalystPostFromApi {
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

export function fetchAnalystPosts(limit = 20): Promise<AnalystPostFromApi[]> {
  return request<AnalystPostFromApi[]>(`/analyst/posts?limit=${limit}`);
}

export function reactToPost(
  postId: string,
  direction: 'LONG' | 'SHORT',
  userId: string,
): Promise<unknown> {
  return request<unknown>(`/analyst/posts/${postId}/react`, {
    method: 'POST',
    headers: { 'x-user-id': userId },
    body: JSON.stringify({ direction }),
  });
}
