# 크로스팀 협약 (X1–X8)

> Sprint 0 | 작성: 2026-03-25 | 참여: FE(이떡상), BE(최풀매수), QA(장손절), Designer(박도파민), Strategist(한물타기)

---

## X1: OpenAPI 스펙 v1 합의 (FE + BE)

**합의 사항**

- Base URL: `http://localhost:4000/api/v1` (로컬), `/api/v1` (프로덕션)
- Swagger UI: `GET /api/docs` (개발 환경에서만 노출)
- OpenAPI JSON: `GET /api/docs-json` → FE 타입 자동 생성 (`npm run gen:types`)
- 응답 포맷 고정:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "메시지" } }
```

- Nullable 필드: `null` 허용, `undefined` 사용 금지
- 날짜: ISO 8601 (`2026-03-25T00:00:00.000Z`)
- 페이지네이션: `{ items: [], total, page, limit }` (목록 API 전체 통일)

---

## X2: WebSocket 메시지 포맷 확정 (FE + BE)

**이벤트 목록 (Server → Client)**

| 이벤트 | 페이로드 | 용도 |
|--------|----------|------|
| `price:update` | `{ symbol: string, price: number, change: number, changePercent: number, timestamp: string }` | 실시간 가격 |
| `prediction:result` | `{ predictionId: string, result: "WIN"\|"LOSE", reward: number, balanceAfter: number }` | 예측 결과 |
| `ranking:update` | `{ rankings: Array<{ rank, userId, nickname, bananaCoins, winRate }> }` | 랭킹 갱신 |

**이벤트 목록 (Client → Server)**

| 이벤트 | 페이로드 | 용도 |
|--------|----------|------|
| `subscribe:symbol` | `{ symbol: string }` | 특정 종목 구독 |
| `unsubscribe:symbol` | `{ symbol: string }` | 종목 구독 해제 |

**연결 규칙**
- 인증: WS 핸드셰이크 시 `auth: { token }` 전달
- 재연결: 최대 5회, 1–5초 지수 백오프
- 네임스페이스: `/` (기본) → 향후 `/game`, `/ranking` 분리 가능

---

## X3: 에러 코드 표준화 (FE + BE + QA)

**HTTP 상태 코드 → 에러 코드 매핑**

| HTTP | 에러 코드 | 사용 상황 |
|------|----------|----------|
| 400 | `INVALID_REQUEST` | 요청 파라미터 오류 |
| 401 | `UNAUTHORIZED` | 토큰 없음/만료 |
| 401 | `TOKEN_EXPIRED` | JWT 만료 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `DUPLICATE_EMAIL` | 이메일 중복 |
| 409 | `DUPLICATE_NICKNAME` | 닉네임 중복 |
| 422 | `PREDICTION_CLOSED` | 예측 마감 시간 초과 |
| 422 | `INSUFFICIENT_COINS` | 코인 부족 |
| 422 | `DUPLICATE_PREDICTION` | 같은 종목 예측 중복 |
| 429 | `RATE_LIMITED` | 요청 제한 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

**FE 처리 규칙**
- `401 UNAUTHORIZED` → 로그인 페이지로 리다이렉트
- `401 TOKEN_EXPIRED` → Refresh 토큰으로 자동 갱신 시도
- `429 RATE_LIMITED` → 토스트 알림 표시, 재시도 금지
- 그 외 → 에러 토스트 표시, 코드 기반 메시지 매핑

---

## X4: data-testid 컨벤션 (FE + QA)

**네이밍 규칙**: `{컴포넌트}-{요소}-{수식어?}`

```
예) prediction-button-up
    ranking-row-1
    auth-input-email
    nav-tab-game
```

**필수 testid 목록 (Sprint 0 E2E 기준)**

| testid | 컴포넌트 | 용도 |
|--------|----------|------|
| `auth-button-guest` | LoginPage | 게스트 로그인 버튼 |
| `auth-input-email` | LoginPage | 이메일 입력 |
| `auth-input-password` | LoginPage | 비밀번호 입력 |
| `auth-button-submit` | LoginPage | 로그인 제출 |
| `game-button-up` | PredictionCard | UP 예측 버튼 |
| `game-button-down` | PredictionCard | DOWN 예측 버튼 |
| `nav-tab-game` | BottomNav | 게임 탭 |
| `nav-tab-ranking` | BottomNav | 랭킹 탭 |
| `nav-tab-profile` | BottomNav | 프로필 탭 |
| `ranking-list` | RankingPage | 랭킹 목록 |

---

## X5: 이벤트 택소노미 (Strategist + BE + FE)

**이벤트 네이밍**: `{명사}_{동사}` (snake_case)

| 이벤트 | 트리거 | 속성 |
|--------|--------|------|
| `prediction_submitted` | UP/DOWN 예측 제출 | `symbol, direction, timeframe, amount` |
| `prediction_resolved` | 예측 결과 확인 | `result, reward, symbol` |
| `user_registered` | 회원가입 | `method: email\|guest` |
| `ranking_viewed` | 랭킹 페이지 진입 | — |
| `daily_bonus_claimed` | 데일리 보너스 수령 | `amount` |

**Sprint 0**: 이벤트 로깅 인프라 미구축, 스키마만 합의. Sprint 1에서 구현.

---

## X6: 공유 카드 워크숍 (Designer + Strategist)

**소셜 공유 카드 스펙**

- 규격: 1200×630px (OG 이미지 표준)
- 포맷: `{닉네임}이 {종목}을 {방향}으로 예측해서 {결과}했다! 🦍`
- 예시: "가즈아전사가 TSLA를 UP으로 예측해서 🍌 바나나 190코인 획득!"
- 배경: 브랜드 옐로우 (#FFD700) + 침팬지 캐릭터
- Sprint 1에서 구현 예정

---

## X7: 이코노미 시뮬레이션 리뷰 (Strategist + QA)

**바나나코인 이코노미 합의**

| 이벤트 | 지급/차감 | 조건 |
|--------|----------|------|
| 신규가입 | +100 🍌 | 1회 |
| 예측 WIN | 베팅액 × 1.9배 | 30초~1시간 내 결과 |
| 예측 LOSE | -베팅액 | — |
| 일일 로그인 보너스 | +50 🍌 | 24시간마다 1회 |
| 베팅 최소/최대 | 10 ~ 500 🍌 | 단위: 10 |
| 코인 하한 | 10 🍌 | 베팅 불가 상태 |

**인플레이션 방지**: WIN 배율 1.9배 (하우스 엣지 5%) → 장기적 코인 소각 구조

---

## X8: 엣지케이스 화면 합의 (Designer + QA)

**필수 처리 상태**

| 상황 | 처리 방식 | 디자인 |
|------|----------|--------|
| 코인 부족 (< 10) | 베팅 버튼 비활성화 + 토스트 | 빈 바나나 아이콘 |
| 네트워크 오류 | 재시도 버튼 있는 에러 배너 | 침팬지 당황 이모지 |
| 예측 마감 | 남은 시간 카운트다운 → 버튼 잠금 | 자물쇠 아이콘 |
| 빈 랭킹 | "아직 예측자가 없어요" 플레이스홀더 | 침팬지 기다리는 일러스트 |
| 로딩 중 | 스켈레톤 UI (shimmer 효과) | 브랜드 색상 |
| 중복 예측 | 기존 예측 카드 하이라이트 | 경고 테두리 |

---

*이 문서는 Sprint 0 기간 내 모든 크로스팀 협약의 단일 진실 소스입니다.*
*변경이 필요한 경우 PR + 팀 동의 후 업데이트.*
