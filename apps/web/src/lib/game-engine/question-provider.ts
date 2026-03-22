/**
 * Question Provider — generates diverse prediction questions
 *
 * Categories:
 * - price: 주식/코인 가격 UP/DOWN
 * - fun: 재미 예측 질문
 * - trivia: 상식 기반 이진 예측
 * - sports: 스포츠 예측
 * - trend: 트렌드/시사 예측
 */

import { SYMBOLS } from "@/types";
import { getPrice } from "./price-engine";

export type QuestionCategory = "price" | "fun" | "trivia" | "sports" | "trend";

export interface Question {
  id: string;
  category: QuestionCategory;
  categoryLabel: string;
  categoryEmoji: string;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
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
  sports: { label: "스포츠", emoji: "⚽" },
  trend: { label: "트렌드", emoji: "📰" },
};

type QEntry = Omit<Question, "id" | "category" | "categoryLabel" | "categoryEmoji"> & {
  /** Correct answer for trivia/sports. Undefined = random (fun/opinion). */
  correctAnswer?: "A" | "B";
};
type QPool = QEntry[];

// ── Fun questions (40종) ──
const FUN_QUESTIONS: QPool = [
  { title: "이번 라운드 UP이 더 많을까?", description: "참여자들의 선택을 예측!", optionA: "UP이 많다", optionB: "DOWN이 많다" },
  { title: "다음 라운드 종목은 코인일까?", description: "시스템의 선택을 맞춰보세요", optionA: "코인이다", optionB: "주식이다" },
  { title: "오늘 행운이 올까?", description: "침팬지 직감!", optionA: "행운 온다!", optionB: "내일 온다..." },
  { title: "지금 커피 마시는 사람이 더 많을까?", description: "세상 모든 사람의 행동 예측!", optionA: "커피 마시는 중 ☕", optionB: "안 마시는 중" },
  { title: "이 순간 웃고 있는 침팬지가 더 많을까?", description: "전 세계 침팬지 기분 예측", optionA: "웃는 중 😄", optionB: "심각한 중 🤔" },
  { title: "내일 서울 날씨는?", description: "기상캐스터 침팬지!", optionA: "맑음 ☀️", optionB: "흐림/비 🌧️" },
  { title: "이번 주말 뭐 먹을까?", description: "대한민국 주말 메뉴", optionA: "치킨 🍗", optionB: "피자 🍕" },
  { title: "오늘 운동할 사람이 더 많을까?", description: "헬스장 vs 소파", optionA: "운동한다 💪", optionB: "쉰다 🛋️" },
  { title: "유튜브 보는 사람이 더 많을까?", description: "여가 예측", optionA: "유튜브 중 📺", optionB: "다른 거 중 📱" },
  { title: "오늘 비가 올까?", description: "침팬지 기상청", optionA: "비 온다 🌧️", optionB: "안 온다 ☀️" },
  { title: "다음 라운드 점수가 100 이상일까?", description: "메타 예측!", optionA: "100 이상", optionB: "100 미만" },
  { title: "지금 잠자는 사람이 더 많을까?", description: "전 세계 수면 예측", optionA: "자는 중 😴", optionB: "깨어있는 중 ⚡" },
  { title: "오늘 라면 먹은 사람이 더 많을까?", description: "한국인 식사 예측", optionA: "먹었다 🍜", optionB: "안 먹었다 🍚" },
  { title: "이번 달 월급이 충분할까?", description: "월말 재정 예측", optionA: "충분하다 💰", optionB: "부족하다 😭" },
  { title: "이 앱 동시접속 100명 넘을까?", description: "동시접속 예측!", optionA: "넘는다 🔥", optionB: "안 넘는다" },
  { title: "오늘 좋은 일이 생길까?", description: "운세 예측!", optionA: "좋은 일 온다 ✨", optionB: "평범한 하루 😐" },
  { title: "고양이 vs 강아지?", description: "영원한 논쟁", optionA: "고양이 🐱", optionB: "강아지 🐶" },
  { title: "아이스크림 vs 붕어빵?", description: "간식 대결", optionA: "아이스크림 🍦", optionB: "붕어빵 🐟" },
  { title: "다음 주 주식시장이 오를까?", description: "시장 전망", optionA: "상승 📈", optionB: "하락 📉" },
  { title: "오늘 만보 걸은 사람이 더 많을까?", description: "건강 예측", optionA: "걸었다 🚶", optionB: "못 걸었다 🛋️" },
  { title: "지금 음악 듣는 사람이 더 많을까?", description: "음악 예측", optionA: "듣는 중 🎵", optionB: "안 듣는 중" },
  { title: "오늘 택시 탄 사람이 더 많을까?", description: "교통 예측", optionA: "탔다 🚕", optionB: "안 탔다" },
  { title: "지금 SNS 하는 사람이 더 많을까?", description: "소셜 예측", optionA: "인스타 중 📸", optionB: "다른 거 중" },
  { title: "오늘 야근하는 사람이 더 많을까?", description: "직장인 예측", optionA: "야근 중 😤", optionB: "퇴근 완료 🏠" },
  { title: "짜장면 vs 짬뽕?", description: "중국집 영원한 고민", optionA: "짜장면 🍝", optionB: "짬뽕 🌶️" },
  { title: "여름 vs 겨울?", description: "계절 대결", optionA: "여름파 ☀️", optionB: "겨울파 ❄️" },
  { title: "아침형 vs 저녁형?", description: "생활 패턴 예측", optionA: "아침형 🌅", optionB: "저녁형 🌙" },
  { title: "현금 vs 카드?", description: "결제 대결", optionA: "현금 💵", optionB: "카드 💳" },
  { title: "지금 배고픈 사람이 더 많을까?", description: "식욕 예측", optionA: "배고프다 🤤", optionB: "괜찮다 😌" },
  { title: "오늘 셀카 찍은 사람이 더 많을까?", description: "셀카 예측", optionA: "찍었다 🤳", optionB: "안 찍었다" },
  { title: "영화 vs 드라마?", description: "콘텐츠 대결", optionA: "영화파 🎬", optionB: "드라마파 📺" },
  { title: "산 vs 바다?", description: "휴가지 대결", optionA: "산이 좋다 🏔️", optionB: "바다가 좋다 🏖️" },
  { title: "소주 vs 맥주?", description: "술자리 예측", optionA: "소주 🍶", optionB: "맥주 🍺" },
  { title: "지하철 vs 버스?", description: "출퇴근 대결", optionA: "지하철 🚇", optionB: "버스 🚌" },
  { title: "떡볶이 vs 순대?", description: "분식 대결", optionA: "떡볶이 🌶️", optionB: "순대 🫕" },
  { title: "초코 vs 바닐라?", description: "아이스크림 맛 대결", optionA: "초코 🍫", optionB: "바닐라 🍦" },
  { title: "아이폰 vs 갤럭시?", description: "스마트폰 대결", optionA: "아이폰 🍎", optionB: "갤럭시 📱" },
  { title: "넷플릭스 vs 유튜브?", description: "스트리밍 대결", optionA: "넷플릭스 🎬", optionB: "유튜브 ▶️" },
  { title: "새벽에 라면 먹을까 말까?", description: "야식의 유혹", optionA: "먹는다 🍜", optionB: "참는다 💪" },
  { title: "오늘 택배 온 사람이 더 많을까?", description: "택배 예측", optionA: "왔다 📦", optionB: "안 왔다" },
];

// ── Trivia questions (40종) ──
const TRIVIA_QUESTIONS: QPool = [
  { title: "지구-달 거리는 30만km 이상?", description: "우주 상식!", optionA: "이상이다", optionB: "미만이다", correctAnswer: "A" },
  { title: "한국 면적은 일본보다 클까?", description: "지리 상식!", optionA: "한국이 크다", optionB: "일본이 크다", correctAnswer: "B" },
  { title: "커피 원두는 원래 빨간색?", description: "음식 상식!", optionA: "빨간색", optionB: "초록/갈색", correctAnswer: "A" },
  { title: "비트코인 창시자 나카모토는 실존인물?", description: "크립토 상식!", optionA: "실존인물", optionB: "정체불명", correctAnswer: "B" },
  { title: "침팬지 DNA는 인간과 95% 이상 같을까?", description: "생물 상식!", optionA: "95% 이상", optionB: "95% 미만", correctAnswer: "A" },
  { title: "세계에서 가장 많이 마시는 음료는 물?", description: "음료 상식!", optionA: "물이다", optionB: "차(茶)다", correctAnswer: "B" },
  { title: "에베레스트는 아직도 높아지고 있을까?", description: "지구과학!", optionA: "높아지는 중", optionB: "그대로", correctAnswer: "A" },
  { title: "금보다 비싼 금속이 있을까?", description: "경제 상식!", optionA: "있다", optionB: "없다", correctAnswer: "A" },
  { title: "인간의 뼈는 200개 이상?", description: "인체 상식!", optionA: "200개 이상", optionB: "200개 미만", correctAnswer: "A" },
  { title: "바나나는 사실 베리(berry)?", description: "식물 상식!", optionA: "맞다 🍌", optionB: "아니다", correctAnswer: "A" },
  { title: "세계 인구는 80억 넘었을까?", description: "인구 상식!", optionA: "넘었다", optionB: "아직", correctAnswer: "A" },
  { title: "한국 최초 우주인은 여성?", description: "한국 상식!", optionA: "여성이다", optionB: "남성이다", correctAnswer: "A" },
  { title: "지구의 바다가 육지보다 넓을까?", description: "지리 상식!", optionA: "바다 🌊", optionB: "육지 🏔️", correctAnswer: "A" },
  { title: "1년은 정확히 365일?", description: "시간 상식!", optionA: "정확히 365일", optionB: "아니다", correctAnswer: "B" },
  { title: "토마토는 과일? 채소?", description: "음식 상식!", optionA: "과일 🍅", optionB: "채소 🥬", correctAnswer: "A" },
  { title: "달에도 중력이 있을까?", description: "우주 상식!", optionA: "있다 🌙", optionB: "없다", correctAnswer: "A" },
  { title: "한국 가장 긴 강은 한강?", description: "한국 지리!", optionA: "한강이다", optionB: "다른 강이다", correctAnswer: "B" },
  { title: "카카오 최대 생산지는 아프리카?", description: "음식 상식!", optionA: "아프리카 1위", optionB: "남미 1위", correctAnswer: "A" },
  { title: "상어는 공룡보다 먼저?", description: "생물 상식!", optionA: "상어가 먼저 🦈", optionB: "공룡이 먼저 🦕", correctAnswer: "A" },
  { title: "태양은 별일까?", description: "우주 상식!", optionA: "별이다 ⭐", optionB: "별이 아니다", correctAnswer: "A" },
  { title: "물은 항상 100도에서 끓을까?", description: "과학 상식!", optionA: "항상 100도", optionB: "조건에 따라 다름", correctAnswer: "B" },
  { title: "한국어 자음은 14개?", description: "한국어 상식!", optionA: "14개 맞다", optionB: "다른 수", correctAnswer: "A" },
  { title: "빛보다 빠른 것이 있을까?", description: "물리 상식!", optionA: "없다", optionB: "있다", correctAnswer: "A" },
  { title: "지구 나이는 40억년 이상?", description: "지구과학!", optionA: "40억년 이상", optionB: "40억년 미만", correctAnswer: "A" },
  { title: "인간 뇌는 10%만 사용할까?", description: "뇌과학!", optionA: "맞다 10%", optionB: "아니다 (신화)", correctAnswer: "B" },
  { title: "다이아몬드는 불에 탈까?", description: "화학 상식!", optionA: "탄다 🔥", optionB: "안 탄다", correctAnswer: "A" },
  { title: "펭귄은 새일까?", description: "동물 상식!", optionA: "새다 🐧", optionB: "새가 아니다", correctAnswer: "A" },
  { title: "한국 최고봉은 한라산?", description: "지리 상식!", optionA: "한라산", optionB: "다른 산", correctAnswer: "A" },
  { title: "성인 혈액량은 5L 이상?", description: "인체 상식!", optionA: "5L 이상", optionB: "5L 미만", correctAnswer: "A" },
  { title: "오징어에게 심장은 몇 개?", description: "동물 상식!", optionA: "1개", optionB: "3개", correctAnswer: "B" },
  { title: "세계 가장 긴 강은 나일강?", description: "지리 상식!", optionA: "나일강", optionB: "아마존강", correctAnswer: "A" },
  { title: "모기는 이빨이 있을까?", description: "곤충 상식!", optionA: "있다", optionB: "없다", correctAnswer: "A" },
  { title: "무지개 색은 7가지?", description: "과학 상식!", optionA: "7가지 맞다 🌈", optionB: "더 많다", correctAnswer: "A" },
  { title: "지구에서 가장 깊은 바다는?", description: "해양 상식!", optionA: "마리아나 해구", optionB: "다른 곳", correctAnswer: "A" },
  { title: "커피는 원래 에티오피아산?", description: "역사 상식!", optionA: "에티오피아", optionB: "브라질", correctAnswer: "A" },
  { title: "세계 가장 작은 나라는 바티칸?", description: "지리 상식!", optionA: "바티칸", optionB: "모나코", correctAnswer: "A" },
  { title: "소금은 미네랄일까?", description: "과학 상식!", optionA: "미네랄이다", optionB: "아니다", correctAnswer: "A" },
  { title: "한글 창제년도는 1443년?", description: "한국사!", optionA: "1443년", optionB: "다른 해", correctAnswer: "A" },
  { title: "세계 가장 높은 건물은 아시아에?", description: "건축 상식!", optionA: "아시아 (부르즈 할리파)", optionB: "다른 대륙", correctAnswer: "A" },
  { title: "인간은 평생 약 2만번 숨쉴까?", description: "인체 상식!", optionA: "2만번 정도", optionB: "훨씬 더 많다", correctAnswer: "B" },
];

// ── Sports questions (20종) ──
const SPORTS_QUESTIONS: QPool = [
  { title: "축구 vs 야구, 뭐가 더 인기?", description: "한국 스포츠 인기 예측", optionA: "축구 ⚽", optionB: "야구 ⚾" },
  { title: "이번 주말 프리미어리그에서 홈팀이 더 많이 이길까?", description: "축구 예측", optionA: "홈팀 우세", optionB: "원정팀 우세" },
  { title: "올림픽에서 한국이 금메달 10개 이상 딸까?", description: "올림픽 예측", optionA: "10개 이상 🥇", optionB: "10개 미만" },
  { title: "NBA 오늘 경기에서 100점 넘는 팀이 더 많을까?", description: "농구 예측", optionA: "100점+ 많다", optionB: "적다" },
  { title: "마라톤 세계기록이 2시간 벽을 깰까?", description: "육상 예측", optionA: "깬다 🏃", optionB: "못 깬다" },
  { title: "테니스 그랜드슬램에서 탑시드가 우승할까?", description: "테니스 예측", optionA: "탑시드 우승", optionB: "다크호스 우승" },
  { title: "K리그 이번 라운드 무승부가 2경기 이상?", description: "K리그 예측", optionA: "2경기 이상", optionB: "1경기 이하" },
  { title: "UFC에서 KO 승이 판정승보다 많을까?", description: "격투기 예측", optionA: "KO가 많다 👊", optionB: "판정이 많다" },
  { title: "야구에서 투수전이 더 재밌을까?", description: "야구 논쟁", optionA: "투수전 🎯", optionB: "타자전 💥" },
  { title: "손흥민이 이번 시즌 20골 넘길까?", description: "손흥민 예측", optionA: "20골 이상 ⚽", optionB: "20골 미만" },
  { title: "e스포츠가 올림픽 정식 종목이 될까?", description: "e스포츠 예측", optionA: "된다 🎮", optionB: "안 된다" },
  { title: "골프 vs 테니스, 뭐가 더 돈을 많이 벌까?", description: "스포츠 수입 예측", optionA: "골프 ⛳", optionB: "테니스 🎾" },
  { title: "월드컵 우승은 유럽팀이 더 많을까?", description: "월드컵 역사", optionA: "유럽이 많다", optionB: "남미가 많다" },
  { title: "수영 vs 달리기, 칼로리 소모가 더 큰 건?", description: "운동 상식", optionA: "수영 🏊", optionB: "달리기 🏃" },
  { title: "오늘 스포츠 뉴스 1면은 축구일까?", description: "스포츠 뉴스 예측", optionA: "축구다 ⚽", optionB: "다른 종목" },
  { title: "MLB에서 홈런이 300개 넘는 시즌이 있을까?", description: "야구 상식", optionA: "있다", optionB: "없다" },
  { title: "배드민턴 셔틀콕 속도가 300km/h 넘을까?", description: "배드민턴 상식", optionA: "넘는다 🏸", optionB: "안 넘는다" },
  { title: "피겨 스케이팅에서 4회전 점프가 가능할까?", description: "피겨 상식", optionA: "가능하다 ⛸️", optionB: "불가능하다" },
  { title: "볼링 퍼펙트 게임은 300점?", description: "볼링 상식", optionA: "300점 맞다 🎳", optionB: "다른 점수" },
  { title: "오늘 헬스장 가는 사람이 더 많을까?", description: "운동 예측", optionA: "간다 🏋️", optionB: "안 간다" },
];

// ── Trend questions (20종) ──
const TREND_QUESTIONS: QPool = [
  { title: "AI가 5년 내 의사를 대체할까?", description: "AI 트렌드", optionA: "대체한다 🤖", optionB: "못한다 👨‍⚕️" },
  { title: "올해 가장 핫한 SNS는 인스타?", description: "SNS 트렌드", optionA: "인스타 📸", optionB: "틱톡 🎵" },
  { title: "전기차가 내연기관차보다 많아질까?", description: "자동차 트렌드", optionA: "10년 내 역전 ⚡", optionB: "아직 멀었다 ⛽" },
  { title: "현금이 사라질까?", description: "결제 트렌드", optionA: "사라진다 💳", optionB: "남는다 💵" },
  { title: "메타버스가 진짜 올까?", description: "테크 트렌드", optionA: "온다 🥽", optionB: "과대광고다" },
  { title: "재택근무가 표준이 될까?", description: "일자리 트렌드", optionA: "표준 된다 🏠", optionB: "출근 복귀 🏢" },
  { title: "올해 부동산 가격이 오를까?", description: "부동산 트렌드", optionA: "오른다 📈", optionB: "내린다 📉" },
  { title: "비건 인구가 10% 넘을까?", description: "식문화 트렌드", optionA: "넘는다 🥗", optionB: "아직 🥩" },
  { title: "한국 출산율이 반등할까?", description: "인구 트렌드", optionA: "반등한다", optionB: "계속 하락" },
  { title: "우주 여행이 대중화될까?", description: "우주 트렌드", optionA: "10년 내 🚀", optionB: "아직 멀었다" },
  { title: "다음 빅테크 혁신은 AI?", description: "테크 예측", optionA: "AI가 대세", optionB: "양자컴퓨팅" },
  { title: "한국 경제 성장률이 3% 넘을까?", description: "경제 트렌드", optionA: "넘는다", optionB: "못 넘는다" },
  { title: "유튜버가 직업으로 인정받을까?", description: "직업 트렌드", optionA: "이미 인정 📹", optionB: "아직 애매" },
  { title: "종이책이 사라질까?", description: "미디어 트렌드", optionA: "사라진다 📱", optionB: "남는다 📖" },
  { title: "한국이 인구 5천만 유지할까?", description: "인구 예측", optionA: "유지한다", optionB: "줄어든다" },
  { title: "로봇 배달이 보편화될까?", description: "물류 트렌드", optionA: "5년 내 🤖", optionB: "아직 멀었다" },
  { title: "지구 평균 기온이 1.5도 더 오를까?", description: "기후 트렌드", optionA: "오른다 🌡️", optionB: "막을 수 있다" },
  { title: "K-POP 인기가 계속될까?", description: "문화 트렌드", optionA: "계속 성장 🎵", optionB: "정체/하락" },
  { title: "반도체가 한국 경제 1위 산업을 유지할까?", description: "산업 트렌드", optionA: "유지한다 💾", optionB: "다른 산업이 추월" },
  { title: "ChatGPT 같은 AI가 검색을 대체할까?", description: "AI 트렌드", optionA: "대체한다 🤖", optionB: "공존한다 🔍" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
    description: `라운드 시작가 ${price.price.toLocaleString("ko-KR")}원 기준`,
    optionA: "UP 🚀",
    optionB: "DOWN 💀",
    symbol: sym.symbol,
    symbolName: sym.nameKr,
  };
}

function makeQuestion(pool: QPool, cat: QuestionCategory): Question {
  const q = pickRandom(pool);
  const meta = CATEGORY_META[cat];
  return { ...q, id: crypto.randomUUID(), category: cat, categoryLabel: meta.label, categoryEmoji: meta.emoji };
}

/** Whether live price data is available */
let livePrice = false;

export function setLivePriceAvailable(available: boolean) {
  livePrice = available;
}

/** Generate a random question with dynamic category ratio */
export function generateQuestion(): Question {
  const roll = Math.random();

  if (livePrice) {
    // 시세 연결됨: price 40% / fun 20% / trivia 15% / sports 15% / trend 10%
    if (roll < 0.40) return generatePriceQuestion();
    if (roll < 0.60) return makeQuestion(FUN_QUESTIONS, "fun");
    if (roll < 0.75) return makeQuestion(TRIVIA_QUESTIONS, "trivia");
    if (roll < 0.90) return makeQuestion(SPORTS_QUESTIONS, "sports");
    return makeQuestion(TREND_QUESTIONS, "trend");
  }

  // 시세 미연결: price 30%(mock) / fun 25% / trivia 20% / sports 15% / trend 10%
  if (roll < 0.30) return generatePriceQuestion();
  if (roll < 0.55) return makeQuestion(FUN_QUESTIONS, "fun");
  if (roll < 0.75) return makeQuestion(TRIVIA_QUESTIONS, "trivia");
  if (roll < 0.90) return makeQuestion(SPORTS_QUESTIONS, "sports");
  return makeQuestion(TREND_QUESTIONS, "trend");
}

/** Resolve a question result */
export function resolveQuestion(question: Question): QuestionResult {
  if (question.category === "price" && question.symbol) {
    // Price resolution is handled by round-engine directly (not here)
    // This fallback uses current price vs a rough estimate
    const price = getPrice(question.symbol);
    const isUp = Math.random() < 0.5; // Actual resolution done in round-engine
    return {
      answer: isUp ? "A" : "B",
      detail: `${price.price.toLocaleString("ko-KR")}원`,
    };
  }

  // Check if question has a known correct answer (trivia/sports with facts)
  const stored = [...TRIVIA_QUESTIONS, ...SPORTS_QUESTIONS].find(
    (q) => q.title === question.title && q.correctAnswer,
  );

  const answer = stored?.correctAnswer ?? (Math.random() < 0.5 ? "A" : "B");
  return {
    answer,
    detail: answer === "A" ? question.optionA : question.optionB,
  };
}
