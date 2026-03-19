# 침팬지픽 (ChimpPick) 🦍

> 주식/코인 Up/Down 예측 배틀 게임 — B급 밈 감성으로 무장한 예측 놀이터

## 프로젝트 개요

침팬지픽은 주식·코인 가격의 단기 등락을 예측하는 소셜 배틀 게임입니다.
실제 돈이 아닌 **바나나코인**으로 베팅하며, 밈 감성의 UI와 게이미피케이션으로 무장했습니다.

- **핵심 루프**: 종목 선택 → UP/DOWN 예측 → 결과 확인 → 보상/랭킹
- **타겟**: MZ세대 주식/코인 관심층, 캐주얼 게이머
- **톤앤매너**: B급 밈, 침팬지 캐릭터, "가즈아" 감성

## 팀 구성

| 역할 | 에이전트 | 닉네임 | 배경 |
|------|----------|--------|------|
| PM | `pm` | 김가즈아 | 토스 → 두나무 |
| Designer | `designer` | 박도파민 | 넥슨 → 크래프톤 |
| FE | `fe` | 이떡상 | 당근마켓 → 토스증권 |
| BE | `be` | 최풀매수 | 카카오페이 → 업비트 |
| QA | `qa` | 장손절 | 넷마블 → 토스뱅크 |
| Strategist | `strategist` | 한물타기 | 샌드박스네트워크 → a16z |

## 기술 스택

### Frontend
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Zustand + React Query, Framer Motion + Lottie
- TradingView Lightweight Charts, Socket.IO client

### Backend
- NestJS 10, TypeScript, Prisma ORM
- PostgreSQL + Redis + TimescaleDB
- BullMQ, Socket.IO, JWT Auth

### Infra
- Docker, AWS (ECS, RDS, ElastiCache)
- Vercel (FE), GitHub Actions (CI/CD)

## 프로젝트 문서

| 문서 | 위치 | 설명 |
|------|------|------|
| PRD | `.project/PRD.md` | 제품 요구사항 정의서 |
| 디자인 스펙 | `.project/design-spec.md` | UI/UX 디자인 명세 |
| 기술 스펙 | `.project/tech-spec.md` | 아키텍처 및 기술 설계 |
| API 스펙 | `.project/api-spec.md` | API 엔드포인트 명세 |
| 데이터 소스 | `.project/data-sources.md` | 외부 데이터 소스 정리 |
| 의사결정 로그 | `.project/decisions.md` | 주요 의사결정 기록 |
| 로드맵 | `.project/roadmap.md` | 스프린트 로드맵 |
| 백로그 | `.project/backlog.md` | 제품 백로그 |
| 테스트 플랜 | `.project/test-plan.md` | QA 테스트 계획 |
| 회의록 | `.project/meeting-notes/` | 팀 회의록 |

## 에이전트 호출 컨벤션

### 회의/협업 스킬
- `/kickoff` — 프로젝트 킥오프 미팅
- `/team-meeting` — 전체 팀 미팅
- `/sprint` — 스프린트 플래닝
- `/standup` — 데일리 스탠드업
- `/design-review` — 디자인 리뷰
- `/retro` — 스프린트 회고
- `/loop` — 자율 실행 루프
- `/create-agent` — 새 에이전트 생성
- `/request-to-ceo` — CEO(사용자)에게 의견 요청

### 에이전트 직접 호출
각 에이전트는 `.claude/agents/` 디렉토리에 정의되어 있으며, 해당 역할의 전문성이 필요할 때 호출됩니다.

## 개발 규칙

### 코드 컨벤션
- TypeScript strict mode 필수
- ESLint + Prettier 설정 통일
- 커밋 메시지: Conventional Commits (`feat:`, `fix:`, `docs:` 등)
- PR은 300줄 이내, 리뷰 필수

### 보안
- API 키/시크릿은 반드시 환경변수로 관리
- SQL Injection, XSS 방지 필수
- 인증 토큰 HttpOnly Cookie 저장
- OWASP Top 10 체크리스트 준수

### 성능
- API 응답 p95 < 200ms
- WebSocket 메시지 지연 < 100ms
- FE 번들 사이즈 < 200KB (initial)
- Lighthouse 성능 점수 90+

### 품질
- 유닛 테스트 커버리지 80%+
- E2E 핵심 플로우 자동화
- 배포 전 QA 게이트 통과 필수
