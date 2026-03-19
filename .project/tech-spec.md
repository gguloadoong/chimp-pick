# 침팬지픽 기술 스펙

> 최종 수정: 2026-03-20 | 작성: 이떡상 (FE) + 최풀매수 (BE)

## 1. 시스템 아키텍처

```
[모바일/웹 클라이언트]
        ↕ HTTPS / WSS
[Vercel Edge] ← CDN + SSR
        ↕
[API Gateway (NestJS)]
   ↕         ↕           ↕
[Game]   [Price]    [User]     ← 모듈별 분리
   ↕         ↕           ↕
[PostgreSQL] [TimescaleDB] [Redis]
                              ↕
                        [BullMQ Workers]
```

## 2. 프론트엔드 아키텍처

### 기술 스택
| 카테고리 | 기술 | 선택 이유 |
|----------|------|-----------|
| Framework | Next.js 15 | App Router, RSC, Edge Runtime |
| Language | TypeScript | 타입 안전성, DX |
| Styling | Tailwind CSS | 빠른 이터레이션, 일관성 |
| State (Client) | Zustand | 경량, 심플, 보일러플레이트 최소 |
| State (Server) | React Query | 캐싱, 재검증, 옵티미스틱 |
| Chart | Lightweight Charts | TradingView 품질, 경량 |
| Animation | Framer Motion | 선언적 애니메이션, 제스처 |
| Real-time | Socket.IO Client | 안정적 WebSocket + fallback |
| Testing | Vitest + Playwright | 빠른 유닛 + 안정적 E2E |

### 디렉토리 구조
```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (game)/
│   │   ├── page.tsx              # 메인 게임 화면
│   │   ├── result/[id]/page.tsx  # 결과 화면
│   │   └── layout.tsx
│   ├── ranking/page.tsx
│   ├── profile/page.tsx
│   ├── api/                      # Route Handlers
│   └── layout.tsx                # Root Layout
├── components/
│   ├── ui/                       # 기본 UI (Button, Card, Modal...)
│   ├── game/                     # PredictionPanel, ResultOverlay...
│   ├── chart/                    # LiveChart, MiniChart...
│   └── shared/                   # Header, BottomNav, Loading...
├── hooks/
│   ├── usePrice.ts               # 실시간 가격
│   ├── usePrediction.ts          # 예측 CRUD
│   ├── useWebSocket.ts           # WS 연결 관리
│   └── useAuth.ts                # 인증 상태
├── stores/
│   ├── gameStore.ts              # 게임 상태
│   └── userStore.ts              # 유저 상태
├── lib/
│   ├── api.ts                    # API 클라이언트
│   ├── socket.ts                 # Socket.IO 인스턴스
│   └── utils.ts                  # 유틸리티
├── types/
│   └── index.ts                  # 공용 타입
└── styles/
    └── globals.css               # 글로벌 스타일 + Tailwind
```

## 3. 백엔드 아키텍처

### 기술 스택
| 카테고리 | 기술 | 선택 이유 |
|----------|------|-----------|
| Runtime | Node.js 20 LTS | 안정성, 생태계 |
| Framework | NestJS 10 | 구조화, DI, 모듈화 |
| ORM | Prisma | 타입 안전, 마이그레이션 |
| DB | PostgreSQL 16 | ACID, 신뢰성 |
| Cache | Redis 7 | 실시간, 캐시, Pub/Sub |
| Time-series | TimescaleDB | 시세 데이터 최적화 |
| Queue | BullMQ | 비동기 작업 처리 |
| Auth | JWT + Cookie | 보안, stateless |

### 모듈 구조
```
src/
├── modules/
│   ├── auth/         # AuthController, AuthService, JwtStrategy
│   ├── user/         # UserController, UserService
│   ├── game/         # GameController, GameService, GameGateway(WS)
│   ├── price/        # PriceService, PriceCollector, PriceGateway(WS)
│   ├── ranking/      # RankingService, RankingScheduler
│   ├── reward/       # RewardService (바나나코인 관리)
│   └── notification/ # NotificationService
├── common/
│   ├── guards/       # JwtAuthGuard
│   ├── interceptors/ # LoggingInterceptor, CacheInterceptor
│   ├── filters/      # HttpExceptionFilter
│   └── decorators/   # @CurrentUser, @Public
└── prisma/
    ├── schema.prisma
    └── migrations/
```

## 4. 데이터베이스 설계

### ERD 핵심
```
User (1) ──── (*) Prediction
User (1) ──── (1) UserStats
User (1) ──── (*) Transaction (바나나코인 내역)
PriceCandle ← TimescaleDB hypertable
```

### 인덱스 전략
- `Prediction`: (userId, createdAt), (symbol, createdAt), (result)
- `PriceCandle`: (symbol, timestamp) — TimescaleDB 자동 파티셔닝
- `User`: (nickname) UNIQUE
- `Transaction`: (userId, createdAt)

## 5. 실시간 데이터 플로우

```
[Upbit WS] ─┐
[KIS API]  ──┼→ [PriceCollector] → [Redis Pub/Sub] → [Socket.IO] → [Client]
[Binance WS]─┘         ↓
                  [TimescaleDB]
                        ↓
                  [Candle Aggregator (BullMQ)]
```

### WebSocket 이벤트
| 이벤트 | 방향 | 페이로드 |
|--------|------|----------|
| `price:update` | Server→Client | `{ symbol, price, change, timestamp }` |
| `prediction:result` | Server→Client | `{ predictionId, result, reward }` |
| `ranking:update` | Server→Client | `{ rankings: [...] }` |
| `prediction:submit` | Client→Server | `{ symbol, direction, timeframe, amount }` |

## 6. 인프라 & 배포

### 환경
| 환경 | 용도 | URL |
|------|------|-----|
| local | 개발 | localhost:3000 / :4000 |
| staging | 테스트 | staging.chimppick.app |
| production | 서비스 | chimppick.app |

### CI/CD 파이프라인
```
Push → Lint → Test → Build → Deploy(staging) → QA → Deploy(prod)
```

## 7. 보안 체크리스트

- [ ] JWT secret 환경변수 관리 (32자+)
- [ ] CORS 설정 (허용 도메인만)
- [ ] Rate limiting (API, WebSocket)
- [ ] Input validation (class-validator)
- [ ] SQL Injection 방지 (Prisma)
- [ ] XSS 방지 (React 기본 이스케이핑)
- [ ] CSRF 방지 (SameSite Cookie)
- [ ] 민감정보 로깅 금지
