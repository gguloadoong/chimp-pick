const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

export async function fetchAnalystPosts(limit = 20): Promise<AnalystPostFromApi[]> {
  const res = await fetch(`${API_BASE}/api/v1/analyst/posts?limit=${limit}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  const json = await res.json() as { success: boolean; data: AnalystPostFromApi[] };
  return json.data;
}

export async function reactToPost(
  postId: string,
  direction: 'LONG' | 'SHORT',
  userId: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/analyst/posts/${postId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ direction }),
  });
  if (!res.ok) throw new Error(`Failed to react: ${res.status}`);
}
