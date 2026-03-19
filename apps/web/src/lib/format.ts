/**
 * 가격 포맷 (원화)
 * 95234000 → "95,234,000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(price));
}

/**
 * 변동률 포맷
 * 2.3 → "+2.30%"
 * -1.5 → "-1.50%"
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * 바나나코인 포맷
 * 1250 → "1,250"
 */
export function formatBanana(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

/**
 * 승률 포맷
 * 62.8333 → "62.8%"
 */
export function formatWinRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * 숫자 축약 포맷
 * 1234567890 → "12.3억"
 */
export function formatCompact(value: number): string {
  if (value >= 1_0000_0000) {
    return `${(value / 1_0000_0000).toFixed(1)}억`;
  }
  if (value >= 1_0000) {
    return `${(value / 1_0000).toFixed(1)}만`;
  }
  return new Intl.NumberFormat("ko-KR").format(value);
}

/**
 * 상대 시간 포맷
 * "2분 전", "1시간 전"
 */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  return `${Math.floor(diffSec / 86400)}일 전`;
}
