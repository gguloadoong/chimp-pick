/**
 * Question Provider — generates diverse prediction questions
 *
 * Categories:
 * - price: 주식/코인 가격 UP/DOWN (기존)
 * - fun: 재미 예측 질문
 * - trivia: 상식 기반 이진 예측
 */

import { SYMBOLS } from "@/types";
import { getPrice } from "./price-engine";

export type QuestionCategory = "price" | "fun" | "trivia";

export interface Question {
  id: string;
  category: QuestionCategory;
  categoryLabel: string;
  categoryEmoji: string;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  /** For price questions: the symbol being tracked */
  symbol?: string;
  symbolName?: string;
}

export interface QuestionResult {
  answer: "A" | "B";
  detail: string;
}

const CATEGORY_META: Record<QuestionCategory, { label: string; emoji: string }> = {
  price: { label: "시세 예측", emoji: "📈" },
  fun: { label: "재미 예측", emoji: "🎲" },
  trivia: { label: "상식 퀴즈", emoji: "🧠" },
};

// ── Fun questions pool ──
const FUN_QUESTIONS: Omit<Question, "id" | "category" | "categoryLabel" | "categoryEmoji">[] = [
  { title: "이번 라운드 UP이 더 많을까?", description: "참여자들의 선택을 예측하세요!", optionA: "UP이 많다", optionB: "DOWN이 많다" },
  { title: "다음 라운드 종목은 코인일까?", description: "시스템이 뭘 골를지 맞춰보세요", optionA: "코인이다", optionB: "주식이다" },
  { title: "오늘 행운이 올까?", description: "침팬지의 직감을 믿어보세요!", optionA: "행운 온다!", optionB: "내일 온다..." },
  { title: "지금 커피 마시는 사람이 더 많을까?", description: "세상 모든 사람의 행동을 예측!", optionA: "커피 마시는 중", optionB: "안 마시는 중" },
  { title: "이 순간 웃고 있는 침팬지가 더 많을까?", description: "전 세계 침팬지 기분 예측", optionA: "웃는 중 😄", optionB: "심각한 중 🤔" },
  { title: "내일 서울 날씨는?", description: "기상캐스터 침팬지의 예측!", optionA: "맑음 ☀️", optionB: "흐림/비 🌧️" },
  { title: "이번 주말 뭐 먹을까?", description: "대한민국 주말 메뉴 예측", optionA: "치킨 🍗", optionB: "피자 🍕" },
  { title: "오늘 운동할 사람이 더 많을까?", description: "헬스장 vs 소파 대결", optionA: "운동한다 💪", optionB: "쉰다 🛋️" },
  { title: "지금 유튜브 보는 사람이 더 많을까?", description: "세계인의 여가 예측", optionA: "유튜브 중 📺", optionB: "다른 거 중 📱" },
  { title: "오늘 비가 올까?", description: "침팬지 기상청", optionA: "비 온다 🌧️", optionB: "안 온다 ☀️" },
  { title: "다음 라운드 점수가 100 이상일까?", description: "메타 예측!", optionA: "100 이상", optionB: "100 미만" },
  { title: "지금 잠자는 사람이 더 많을까?", description: "전 세계 수면 예측", optionA: "자는 중 😴", optionB: "깨어있는 중 ⚡" },
  { title: "오늘 라면 먹은 사람이 더 많을까?", description: "한국인 식사 예측", optionA: "라면 먹었다 🍜", optionB: "안 먹었다 🍚" },
  { title: "이번 달 월급이 충분할까?", description: "월말 재정 예측", optionA: "충분하다 💰", optionB: "부족하다 😭" },
  { title: "지금 이 앱 켜고 있는 사람이 100명 넘을까?", description: "동시접속 예측!", optionA: "넘는다 🔥", optionB: "안 넘는다 😅" },
  { title: "오늘 좋은 일이 생길까?", description: "운세 예측!", optionA: "좋은 일 온다 ✨", optionB: "평범한 하루 😐" },
  { title: "고양이 vs 강아지, 뭐가 더 인기?", description: "영원한 논쟁", optionA: "고양이 🐱", optionB: "강아지 🐶" },
  { title: "아이스크림 vs 붕어빵?", description: "간식 대결", optionA: "아이스크림 🍦", optionB: "붕어빵 🐟" },
  { title: "다음 주에 주식시장이 오를까?", description: "시장 전망 예측", optionA: "상승 📈", optionB: "하락 📉" },
  { title: "오늘 만보 걸은 사람이 더 많을까?", description: "건강 예측", optionA: "걸었다 🚶", optionB: "못 걸었다 🛋️" },
];

// ── Trivia questions pool ──
const TRIVIA_QUESTIONS: Omit<Question, "id" | "category" | "categoryLabel" | "categoryEmoji">[] = [
  { title: "지구에서 달까지 거리는 30만km 이상일까?", description: "우주 상식!", optionA: "이상이다", optionB: "미만이다" },
  { title: "대한민국 면적은 일본보다 클까?", description: "지리 상식!", optionA: "한국이 크다", optionB: "일본이 크다" },
  { title: "커피 원두는 원래 빨간색일까?", description: "음식 상식!", optionA: "빨간색", optionB: "초록/갈색" },
  { title: "비트코인 창시자 나카모토는 실존인물일까?", description: "크립토 상식!", optionA: "실존인물", optionB: "정체불명" },
  { title: "침팬지의 DNA는 인간과 95% 이상 같을까?", description: "생물 상식!", optionA: "95% 이상", optionB: "95% 미만" },
  { title: "세계에서 가장 많이 마시는 음료는 물일까?", description: "음료 상식!", optionA: "물이다", optionB: "차(茶)다" },
  { title: "에베레스트는 아직도 높아지고 있을까?", description: "지구과학 상식!", optionA: "높아지는 중", optionB: "그대로" },
  { title: "금보다 비싼 금속이 있을까?", description: "경제 상식!", optionA: "있다", optionB: "없다" },
  { title: "인간의 뼈는 200개 이상일까?", description: "인체 상식!", optionA: "200개 이상", optionB: "200개 미만" },
  { title: "바나나는 사실 베리(berry)일까?", description: "식물 상식!", optionA: "맞다, 베리다 🍌", optionB: "아니다" },
  { title: "해가 뜨는 건 지구가 도는 것일까?", description: "과학 상식!", optionA: "지구가 돈다 🌍", optionB: "해가 돈다 ☀️" },
  { title: "세계 인구는 80억 넘었을까?", description: "인구 상식!", optionA: "넘었다", optionB: "아직" },
  { title: "한국 최초의 우주인은 여성일까?", description: "한국 상식!", optionA: "여성이다", optionB: "남성이다" },
  { title: "지구의 바다가 육지보다 넓을까?", description: "지리 상식!", optionA: "바다가 넓다 🌊", optionB: "육지가 넓다 🏔️" },
  { title: "1년은 정확히 365일일까?", description: "시간 상식!", optionA: "정확히 365일", optionB: "365일이 아니다" },
  { title: "토마토는 과일일까 채소일까?", description: "음식 상식!", optionA: "과일이다 🍅", optionB: "채소다 🥬" },
  { title: "달에도 중력이 있을까?", description: "우주 상식!", optionA: "있다 🌙", optionB: "없다" },
  { title: "한국에서 가장 긴 강은 한강일까?", description: "한국 지리!", optionA: "한강이다", optionB: "다른 강이다" },
  { title: "초콜릿의 원료 카카오는 아프리카산이 가장 많을까?", description: "음식 상식!", optionA: "아프리카가 1위", optionB: "남미가 1위" },
  { title: "상어는 공룡보다 먼저 존재했을까?", description: "생물 상식!", optionA: "상어가 먼저 🦈", optionB: "공룡이 먼저 🦕" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a price-based question */
function generatePriceQuestion(): Question {
  const sym = pickRandom(SYMBOLS);
  const price = getPrice(sym.symbol);
  const meta = CATEGORY_META.price;

  return {
    id: crypto.randomUUID(),
    category: "price",
    categoryLabel: meta.label,
    categoryEmoji: meta.emoji,
    title: `${sym.nameKr} 가격이 오를까?`,
    description: `현재가 ${price.price.toLocaleString("ko-KR")}원`,
    optionA: "UP 🚀",
    optionB: "DOWN 💀",
    symbol: sym.symbol,
    symbolName: sym.nameKr,
  };
}

/** Generate a fun question */
function generateFunQuestion(): Question {
  const q = pickRandom(FUN_QUESTIONS);
  const meta = CATEGORY_META.fun;
  return { ...q, id: crypto.randomUUID(), category: "fun", categoryLabel: meta.label, categoryEmoji: meta.emoji };
}

/** Generate a trivia question */
function generateTriviaQuestion(): Question {
  const q = pickRandom(TRIVIA_QUESTIONS);
  const meta = CATEGORY_META.trivia;
  return { ...q, id: crypto.randomUUID(), category: "trivia", categoryLabel: meta.label, categoryEmoji: meta.emoji };
}

/** Generate a random question from any category */
export function generateQuestion(): Question {
  const roll = Math.random();
  // 50% price, 25% fun, 25% trivia
  if (roll < 0.5) return generatePriceQuestion();
  if (roll < 0.75) return generateFunQuestion();
  return generateTriviaQuestion();
}

/** Resolve a question result */
export function resolveQuestion(question: Question): QuestionResult {
  if (question.category === "price" && question.symbol) {
    const price = getPrice(question.symbol);
    const entryStr = question.description.match(/[\d,]+/)?.[0] ?? "0";
    const entryPrice = Number(entryStr.replace(/,/g, ""));
    const isUp = price.price >= entryPrice;
    return {
      answer: isUp ? "A" : "B",
      detail: `${price.price.toLocaleString("ko-KR")}원 (${isUp ? "상승" : "하락"})`,
    };
  }

  // Fun/trivia: random resolution (50/50)
  const answer = Math.random() < 0.5 ? "A" : "B";
  return {
    answer,
    detail: answer === "A" ? question.optionA : question.optionB,
  };
}
