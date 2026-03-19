# 침팬지픽 백로그

> 최종 수정: 2026-03-20 (Sprint 0 확정) | 관리: 김가즈아 (PM)
> Sprint 0 상세: [sprint0-plan.md](sprint0-plan.md)

## 우선순위 기준
- **P0**: 런칭 필수 (Must Have)
- **P1**: 런칭 시 있으면 좋음 (Should Have)
- **P2**: 런칭 후 (Could Have)
- **P3**: 나중에 (Won't Have Now)

## Sprint 0 (03/23~03/29) — 기반 세팅

### FE (이떡상, 14.5 SP)
- [x] A1: Next.js 15 scaffolding (완료, 버전 확정만 남음 0.5SP)
- [ ] A2: Tailwind 디자인 토큰 연동 (1SP)
- [ ] A3: 공용 컴포넌트 5종 — Button, Input, Modal, Toast, Card (5SP)
- [ ] A4: OpenAPI 타입 자동 생성 파이프라인 (2SP)
- [ ] A5: WebSocket 훅 useWebSocket.ts (2SP)
- [ ] A6: FE CI — Vitest + Playwright + bundle-analyzer (2SP)
- [ ] A7: 환경변수 구조 .env.example (1SP)
- [ ] A8: API 클라이언트 lib/api.ts (1SP)

### BE (최풀매수, 14 SP)
- [x] B1: NestJS 10 scaffolding (완료, 모듈 구조 셋업 1SP 남음)
- [ ] B2: Docker Compose — PostgreSQL + Redis + TimescaleDB (2SP)
- [ ] B3: Prisma 스키마 v1 + 마이그레이션 (3SP)
- [ ] B4: auth 모듈 — 회원가입, 로그인, JWT (게스트 제외) (4SP)
- [ ] B5: Swagger/OpenAPI 문서 자동화 (1SP)
- [ ] B6: BE CI — Jest + 린트 + 빌드 (2SP)
- [ ] B7: 테스트 DB 시딩 스크립트 (1SP)

### Designer (박도파민, 10 SP)
- [ ] D1: 디자인 토큰 Figma Variables (2SP) ⚡크리티컬: 월 오전
- [ ] D2: 기본 컴포넌트 디자인 6종 (3SP)
- [ ] D3: 침팬지 캐릭터 1단계 인하우스 (2SP)
- [ ] D4: 메인 게임 화면 Hi-fi 목업 (2SP)
- [ ] D5: Lottie 애니메이션 — 적중/실패 (1SP)

### QA (장손절, 8.5 SP)
- [ ] E1: QA 테스트 환경 구성 (1SP)
- [ ] E2: E2E 시나리오 상세 문서화 5대 플로우 (2SP)
- [ ] E3: 보안 체크리스트 OWASP + 특화 (1SP)
- [ ] E4: Playwright 세팅 + CI 연결 (3SP)
- [ ] E5: 테스트 데이터 시딩 전략 (1SP)
- [ ] E7: 버그 리포팅 프로세스 정의 (0.5SP)

### Strategist (한물타기, 8 SP)
- [ ] F4: 경쟁사 벤치마크 리포트 (1SP)
- [ ] F1: 이벤트 택소노미 v1 — 22개 핵심 이벤트 (2SP)
- [ ] F2: 온보딩 퍼널 설계 (2SP)
- [ ] F3: 바나나코인 이코노미 시뮬 v1 (3SP)

### 크로스팀 합의 (8 SP)
- [ ] X1: OpenAPI 스펙 v1 합의 (2SP, FE+BE, 화)
- [ ] X2: WebSocket 메시지 포맷 확정 (1SP, FE+BE, 화)
- [ ] X3: 에러 코드 표준화 (1SP, FE+BE+QA, 수)
- [ ] X4: data-testid 컨벤션 (1SP, FE+QA, 수)
- [ ] X5: 이벤트 택소노미 리뷰 (1SP, Strategist+BE+FE, 목)
- [ ] X6: 공유 카드 워크숍 (1SP, Designer+Strategist, 목)
- [ ] X7: 이코노미 시뮬 리뷰 (0.5SP, Strategist+QA, 금)
- [ ] X8: 엣지케이스 화면 합의 (0.5SP, Designer+QA, 목)

---

## Sprint 1 (03/30~) — 이관 항목 + 코어 루프 시작

### Sprint 0에서 이관 (14 SP)
- [ ] 게스트 모드 (3SP, BE)
- [ ] 외부 API 스파이크 — Upbit WS + KIS REST (3SP, BE)
- [ ] CI/CD 파이프라인 — 스테이징 배포 (3SP, Infra)
- [ ] 스테이징 환경 세팅 (2SP, Infra)
- [ ] Sentry + 모니터링 (1SP, BE)
- [ ] 인터랙티브 프로토타입 (2SP, Designer)

---

## P0 — Must Have (MVP)

### 인증
- [ ] 카카오 소셜 로그인
- [ ] 게스트 모드 (3회 체험) → Sprint 1
- [ ] JWT + Refresh Token → Sprint 0 (B4)
- [ ] 닉네임 설정 (중복 체크)

### 게임 코어
- [ ] 종목 선택 UI (코인 5개 + 주식 5개)
- [ ] 타임프레임 선택 (1분, 5분, 1시간, 1일)
- [ ] UP/DOWN 예측 버튼
- [ ] 바나나코인 베팅 (1~50BC)
- [ ] 실시간 캔들 차트
- [ ] 현재가 + 변동률 표시
- [ ] 예측 결과 판정 (서버)
- [ ] 결과 화면 + 애니메이션
- [ ] 바나나코인 증감 처리

### 시세 데이터
- [ ] Upbit 코인 시세 수집 (WebSocket) → Sprint 1
- [ ] KIS 주식 시세 수집 → Sprint 1
- [ ] 캔들 데이터 집계 + 저장
- [ ] 실시간 브로드캐스트 (Socket.IO)

### 인프라
- [x] 프로젝트 scaffolding → Sprint 0 완료
- [ ] DB 스키마 + 마이그레이션 → Sprint 0 (B3)
- [ ] CI/CD 파이프라인 → Sprint 0 로컬 CI (B6/A6), Sprint 1 스테이징
- [ ] 스테이징 환경 → Sprint 1
- [ ] 모니터링 (Sentry + 헬스체크) → Sprint 1

## P1 — Should Have

### 소셜
- [ ] 랭킹 (일간/주간)
- [ ] 프로필 + 전적
- [ ] 결과 공유 카드
- [ ] 친구 초대 (50BC 보상)

### 게이미피케이션
- [ ] 침팬지 진화 시스템
- [ ] 칭호 시스템
- [ ] 연승 보너스
- [ ] 일일 출석 보상

### UX
- [ ] 온보딩 튜토리얼
- [ ] 푸시 알림
- [ ] 로딩/에러 상태 UI

## P2 — Could Have (런칭 후)

- [ ] 월간/전체 랭킹
- [ ] 1:1 대결
- [ ] 일일 미션
- [ ] 인앱 구매
- [ ] 리워드 광고
- [ ] 프리미엄 구독
- [ ] 고급 통계/분석

## P3 — Won't Have Now (v2+)

- [ ] 해외 주식
- [ ] 커뮤니티 (채팅/게시판)
- [ ] 시즌제
- [ ] 토너먼트
- [ ] NFT 연동
- [ ] 네이티브 앱
- [ ] 자동 예측 봇
