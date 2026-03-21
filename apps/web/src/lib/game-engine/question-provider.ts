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
