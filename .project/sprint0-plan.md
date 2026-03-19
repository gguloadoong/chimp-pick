# Sprint 0 확정 플랜

> 확정일: 2026-03-20 | PM: 김가즈아
> 기간: 2026-03-23(월) ~ 03-29(토), 1주

## Sprint 0 목표

**"Sprint 1 코어 루프 개발을 Day 1부터 병렬 착수할 수 있도록, FE/BE scaffolding + DB + 디자인 시스템 + 크로스팀 계약을 완성한다."**

---

## 에이전트별 확정 백로그

### 이떡상 (FE) — 14.5 SP

| # | 태스크 | SP | 의존성 | 완료 기준 |
|---|--------|----|--------|-----------|
| A1 | Next.js 버전 확정 + 팀 공유 | 0.5 | - | 버전 확정, 팀 공지 |
| A2 | Tailwind 디자인 토큰 연동 | 1 | D1 | config 반영 완료 |
| A3 | 공용 컴포넌트 5종 (Button, Input, Modal, Toast, Card) | 5 | A2 | 렌더링 확인, 접근성 |
| A4 | OpenAPI 타입 자동 생성 파이프라인 | 2 | X1, B5 | `npm run generate:types` |
| A5 | WebSocket 훅 (`useWebSocket.ts`) | 2 | X2 | 연결/재연결/에러/타입 |
| A6 | FE CI (Vitest + Playwright + bundle-analyzer) | 2 | - | PR 시 자동 실행 |
| A7 | 환경변수 구조 (.env.example, 네이밍) | 1 | - | 문서 + .env.example |
| A8 | API 클라이언트 기본 구조 (lib/api.ts) | 1 | A4 | fetch wrapper + 인터셉터 |

### 최풀매수 (BE) — 14 SP

| # | 태스크 | SP | 의존성 | 완료 기준 |
|---|--------|----|--------|-----------|
| B1 | NestJS 모듈 구조 셋업 (ConfigModule, filters, interceptors) | 1 | - | 모듈 디렉토리 생성 |
| B2 | Docker Compose (PostgreSQL + Redis + TimescaleDB) | 2 | - | `docker compose up` 전체 구동 |
| B3 | Prisma 스키마 v1 + 마이그레이션 | 3 | B2 | 마이그레이션 성공 |
| B4 | auth 모듈 (회원가입, 로그인, JWT — 게스트 제외) | 4 | B3 | Swagger 테스트 통과 |
| B5 | Swagger/OpenAPI 문서 자동화 | 1 | B1 | `/api/docs` 표시 |
| B6 | BE CI (Jest + 린트 + 빌드) | 2 | - | PR 시 자동 통과 |
| B7 | 테스트 DB 시딩 스크립트 | 1 | B3 | `npm run seed` 동작 |

### 박도파민 (Designer) — 10 SP

| # | 태스크 | SP | 의존성 | 완료 기준 |
|---|--------|----|--------|-----------|
| D1 | 디자인 토큰 Figma Variables | 2 | - | **월요일 오전 퍼블리시** |
| D2 | 기본 컴포넌트 디자인 6종 | 3 | D1 | 상태별 variant |
| D3 | 침팬지 캐릭터 1단계 인하우스 | 2 | - | SVG/PNG 에셋 |
| D4 | 메인 게임 화면 목업 (Hi-fi) | 2 | D1, D2 | 모바일 프레임 1장 |
| D5 | Lottie 애니메이션 (적중/실패) | 1 | D3 | JSON 파일 2개 |

### 장손절 (QA) — 8.5 SP

| # | 태스크 | SP | 의존성 | 완료 기준 |
|---|--------|----|--------|-----------|
| E1 | QA 테스트 환경 구성 (로컬 폴백 포함) | 1 | B2 | Docker 로컬 테스트 가능 |
| E2 | E2E 시나리오 상세 문서화 (5대 플로우) | 2 | - | 테스트 케이스 문서 |
| E3 | 보안 체크리스트 (OWASP + 침팬지픽 특화) | 1 | - | 체크리스트 PR |
| E4 | Playwright 세팅 + CI 연결 | 3 | X4, A6 | 스켈레톤 테스트 통과 |
| E5 | 테스트 데이터 시딩 전략 | 1 | B3 | 시드 데이터 정의 문서 |
| E7 | 버그 리포팅 프로세스 정의 | 0.5 | - | 템플릿 + 에스컬레이션 경로 |

### 한물타기 (Strategist) — 8 SP

| # | 태스크 | SP | 의존성 | 완료 기준 |
|---|--------|----|--------|-----------|
| F4 | 경쟁사 벤치마크 리포트 | 1 | - | 3개+ 서비스 비교 |
| F1 | 이벤트 택소노미 정의서 v1 (22개 이벤트) | 2 | - | AARRR 기반 이벤트+속성 |
| F2 | 온보딩 퍼널 설계 | 2 | F4 | 단계별 전환 목표 포함 |
| F3 | 바나나코인 이코노미 시뮬 v1 | 3 | - | 스프레드시트 시뮬 + 밸런스안 |

### 크로스팀 합의 — 8 SP (분산)

| # | 합의 사항 | SP | 참여자 | 일정 |
|---|----------|-----|--------|------|
| X1 | OpenAPI 스펙 v1 | 2 | FE+BE | 화요일 오후 |
| X2 | WebSocket 메시지 포맷 | 1 | FE+BE | 화요일 오후 |
| X3 | 에러 코드 표준화 | 1 | FE+BE+QA | 수요일 오후 |
| X4 | data-testid 컨벤션 | 1 | FE+QA | 수요일까지 |
| X5 | 이벤트 택소노미 리뷰 | 1 | Strategist+BE+FE | 목요일 오후 |
| X6 | 공유 카드 워크숍 | 1 | Designer+Strategist | 목요일 |
| X7 | 이코노미 시뮬 리뷰 | 0.5 | Strategist+QA | 금요일 |
| X8 | 엣지케이스 화면 합의 | 0.5 | Designer+QA | 목요일 |

---

## Sprint 1 이관 항목 (14 SP)

| 태스크 | SP | 담당 | 이관 사유 |
|--------|-----|------|-----------|
| 게스트 모드 | 3 | BE | auth 핵심 먼저 완성 |
| 외부 API 스파이크 (Upbit WS + KIS) | 3 | BE | KIS API 키 발급 대기 |
| CI/CD 파이프라인 (스테이징 배포) | 3 | Infra | Sprint 0는 로컬 CI만 |
| 스테이징 환경 세팅 | 2 | Infra | 로컬 개발 우선 |
| Sentry + 모니터링 | 1 | BE | 배포 전 세팅 |
| 인터랙티브 프로토타입 | 2 | Designer | D4 목업이면 충분 |

---

## 일별 마일스톤

### 월 (03/23) — "기반"
- D1 디자인 토큰 오전 퍼블리시 (크리티컬!)
- B1 모듈 구조 + B2 Docker Compose
- A1 버전 확정 + A7 환경변수
- E2/E3/E7 문서 작업 시작
- F4 경쟁사 벤치마크 시작

### 화 (03/24) — "계약"
- B3 Prisma 스키마 착수
- A2 Tailwind 토큰 연동 + A3 컴포넌트 착수
- **X1 OpenAPI 스펙 합의** (오후)
- **X2 WebSocket 포맷 합의** (오후)
- F1 이벤트 택소노미 착수

### 수 (03/25) — "엔진"
- B4 auth 모듈 (Day 1/2)
- A3 컴포넌트 계속 + A6 CI
- D2 컴포넌트 디자인 + D3 캐릭터
- **X3 에러 코드 합의 + X4 data-testid**
- F1 택소노미 완성

### 목 (03/26) — "연결"
- B4 auth 완성 + B5 Swagger
- A4 타입 자동 생성 + A5 WebSocket 훅
- D4 메인 화면 목업
- E1 테스트 환경 + E4 Playwright 착수
- X5/X6/X8 크로스팀 합의 2차
- F2 온보딩 퍼널

### 금 (03/27~29) — "마무리"
- B7 시딩 스크립트
- A8 API 클라이언트
- D5 Lottie 애니메이션
- E4 CI E2E 연결 + E5 시딩 전략
- X7 이코노미 리뷰
- F3 이코노미 시뮬
- **DoD 12항목 전수 검증**

---

## DoD (Definition of Done) — 12항목

| # | 항목 | 검증 |
|---|------|------|
| 1 | FE `npm run dev` + BE `npm run start:dev` 에러 없이 구동 | 로컬 실행 |
| 2 | `docker compose up` PostgreSQL+Redis+TimescaleDB 구동 | 컨테이너 확인 |
| 3 | Prisma 마이그레이션 + 시드 데이터 | `npm run seed` |
| 4 | auth 플로우 (가입/로그인/토큰갱신) Swagger 통과 | 수동 테스트 |
| 5 | CI lint+test PR 시 자동 실행 (FE+BE) | GitHub Actions |
| 6 | 디자인 토큰 Tailwind config 반영 | 컴포넌트 렌더링 |
| 7 | 공용 컴포넌트 5종 렌더링 | 테스트 페이지 |
| 8 | OpenAPI/WS/에러코드 문서 합의 | `.project/` 문서 |
| 9 | 이벤트 택소노미 v1 크로스팀 승인 | 문서+승인 |
| 10 | data-testid 컨벤션 합의 | 문서 |
| 11 | E2E 시나리오 문서 완성 | 테스트 케이스 |
| 12 | 보안 체크리스트 완성 | 문서 PR |

---

## 리스크 & 즉시 액션

| 즉시 액션 | 담당 | 기한 |
|-----------|------|------|
| KIS API 키 발급 신청 | PM | 오늘 |
| D1 월요일 오전 퍼블리시 확인 | Designer | 월 오전 |
| data-testid 규칙 초안 | QA | 수요일 |
| Next.js 버전 확정 | FE | 월요일 |
