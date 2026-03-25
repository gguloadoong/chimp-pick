# IAP 아키텍처 설계 — 앱스토어 심사 대응

> 작성: 최풀매수 (BE) | 2026-03-26
> 참조: DEC-009 (IAP와 베팅 완전 분리)

---

## 1. 설계 목표

앱스토어 심사(Apple 5.3 도박 조항, Google Play 도박 정책)를 통과하기 위해 바나나코인의 **획득 경로**와 **사용 경로**를 구조적으로 이원화한다.

### 심사 대응 핵심 논리

| 구분 | 내용 |
|------|------|
| IAP로 구매한 코인 | 코스메틱(스킨, 칭호, 이펙트)에만 사용 가능 |
| 예측 참여용 코인 | 무료 획득 경로(일일 지급, 광고 시청)로만 공급 |
| 출금 경로 | 없음 — 바나나코인은 현금으로 전환 불가 |
| 서비스 분류 | Games > Simulation (금융 앱 아님) |

**결론:** "실제 돈 → 코인 → 예측 배당 수취" 흐름이 차단되면 도박 조항 적용 불가.

---

## 2. 현재 스키마 문제점

현재 `Transaction.type` 필드는 `BET | WIN | LOSE | BONUS | DAILY` 문자열로 관리된다.

문제점:
- IAP 구매 이력을 별도로 추적할 수 없음
- 코인의 획득 경로(IAP vs 무료)가 구분되지 않아 심사 시 흐름 증명 불가
- 영수증 검증 결과와 트랜잭션이 연결되지 않음
- 코스메틱 전용 코인과 예측용 코인이 동일한 `bananaCoins` 잔액에 혼재

---

## 3. 스키마 변경 설계

### 3-1. Transaction 타입 재정의

기존 `BET | WIN | LOSE | BONUS | DAILY` → 아래로 교체

```
PURCHASE          — IAP 또는 광고 시청으로 코인 획득
DAILY_BONUS       — 일일 출석 보상 (무료)
AD_REWARD         — 광고 시청 보상 (무료)
PREDICTION_SPEND  — 예측 참여 시 코인 차감
PREDICTION_REWARD — 예측 적중 시 고정 보상 지급
COSMETIC_SPEND    — 코스메틱 아이템 구매 차감
REFERRAL_BONUS    — 추천인 보상 (무료)
```

### 3-2. 신규 테이블: IapReceipt

IAP 영수증 검증 결과를 영구 보존한다. 심사 시 감사 로그 역할.

```prisma
model IapReceipt {
  id                String    @id @default(cuid())
  userId            String
  platform          String    // APPLE | GOOGLE
  productId         String    // com.chimppick.coins.pack1 등
  transactionId     String    @unique  // 플랫폼 고유 트랜잭션 ID
  originalTransactionId String?        // Apple 구독 원본 ID
  purchaseToken     String?            // Google Play token
  environment       String    // PRODUCTION | SANDBOX
  status            String    // PENDING | VERIFIED | REJECTED | REFUNDED
  coinAmount        Int                // 지급된 코인 수
  priceKrw          Int                // 결제 금액 (원, 로깅 전용)
  receiptData       String    @db.Text // 원본 영수증 (암호화 저장)
  verifiedAt        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user         User         @relation(fields: [userId], references: [id])
  transaction  Transaction? @relation(fields: [transactionId], references: [iapTransactionId])

  @@index([userId, createdAt])
  @@index([platform, productId])
  @@index([status])
}
```

### 3-3. Transaction 테이블 변경

```prisma
model Transaction {
  id               String   @id @default(cuid())
  userId           String
  type             String   // 새 타입 체계 적용
  coinType         String   @default("FREE")  // FREE | PAID
  amount           Int
  balanceAfter     Int
  predictionId     String?
  iapTransactionId String?  // IapReceipt 연결용
  description      String?
  createdAt        DateTime @default(now())

  user       User        @relation(fields: [userId], references: [id])
  prediction Prediction? @relation(fields: [predictionId], references: [id], onDelete: Restrict)

  @@index([userId, createdAt])
  @@index([type])
}
```

`coinType` 필드 도입 이유: PAID(IAP 구매) 코인은 코스메틱에만 사용 가능하고, FREE(무료 획득) 코인은 예측에만 사용 가능하도록 서비스 레이어에서 검증.

### 3-4. 신규 테이블: IapProduct

스토어에 등록된 상품 카탈로그. 가격/코인 수량은 DB 관리.

```prisma
model IapProduct {
  id          String  @id @default(cuid())
  productId   String  @unique  // com.chimppick.coins.pack1
  platform    String           // APPLE | GOOGLE | ALL
  name        String           // "바나나 50개"
  coinAmount  Int
  priceKrw    Int
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
}
```

### 3-5. ERD 변경 요약

```
User (1) ──── (*) IapReceipt
User (1) ──── (*) Transaction (coinType: FREE | PAID)
IapReceipt (1) ──── (0..1) Transaction
IapProduct ← 상품 카탈로그 (독립 테이블)
```

---

## 4. NestJS 모듈 구조: PaymentsModule

### 4-1. 디렉토리 구조

```
src/modules/payments/
├── payments.module.ts
├── payments.controller.ts       — 엔드포인트 정의, 가드 적용
├── payments.service.ts          — 비즈니스 로직, 트랜잭션 처리
├── iap/
│   ├── apple-iap.service.ts     — StoreKit 2 서버 알림 처리
│   ├── google-iap.service.ts    — Play Billing Webhook 처리
│   └── iap-verifier.interface.ts — 플랫폼 공통 인터페이스
├── dto/
│   ├── apple-notification.dto.ts
│   └── google-notification.dto.ts
└── guards/
    └── iap-signature.guard.ts   — 서버 알림 서명 검증
```

### 4-2. 엔드포인트 설계

#### POST /payments/iap/apple

Apple StoreKit 2 서버 알림 수신 (Server-to-Server Notification V2).

```
인증: Apple 서명 검증 (IapSignatureGuard)
요청 본문: JWSTransactionDecodedPayload (Apple 표준)
처리 흐름:
  1. JWS 서명 검증 (Apple 루트 CA)
  2. notificationType 확인 (PURCHASED, REFUND 등)
  3. transactionId 중복 검사 (IapReceipt.transactionId UNIQUE)
  4. 상품 ID → 코인 수량 조회 (IapProduct)
  5. DB 트랜잭션: IapReceipt 생성 + Transaction(PURCHASE, coinType=PAID) 생성 + User.bananaCoins 증가
  6. 응답: 200 OK (Apple은 200 이외 응답 시 재전송)
```

#### POST /payments/iap/google

Google Play Billing RTDN(Real-time Developer Notification) 처리.

```
인증: Google Cloud Pub/Sub 서명 검증
요청 본문: { message: { data: base64(DeveloperNotification) } }
처리 흐름:
  1. Pub/Sub 메시지 base64 디코드
  2. purchaseToken으로 Google Play API 영수증 조회 (서버 사이드 검증)
  3. 이후 Apple과 동일 흐름 (중복 → 코인 조회 → DB 트랜잭션)
```

#### GET /payments/iap/products

스토어 상품 목록 반환. 클라이언트 상품 화면에서 사용.

```json
[
  {
    "productId": "com.chimppick.coins.pack1",
    "name": "바나나 50개",
    "coinAmount": 50,
    "priceKrw": 1200
  }
]
```

### 4-3. 코인 사용 경로 검증 로직 (RewardService 연동)

예측 참여 시 `GameService`에서 `RewardService.spendCoins()` 호출. 이 시점에 `coinType` 검증을 수행한다.

```
spendCoins(userId, amount, purpose: 'PREDICTION' | 'COSMETIC'):
  - purpose === 'PREDICTION': FREE 코인 잔액 우선 차감. PAID 코인 차단.
  - purpose === 'COSMETIC': PAID 코인 잔액 우선 차감. FREE 코인 차감 허용.
```

구현 방식: `User` 테이블에 `freeCoins`와 `paidCoins`를 분리하거나, 또는 `Transaction` 히스토리를 집계하는 방법 중 선택이 필요하다.

권장: `User` 테이블에 `freeCoins Int @default(100)` / `paidCoins Int @default(0)` 컬럼 분리. 집계 방식은 동시성 문제가 있고 쿼리 비용이 높다.

---

## 5. 보안 설계

### 5-1. 영수증 검증은 서버에서만

클라이언트가 "영수증 유효함"을 알려주는 구조 금지. 반드시 서버가 Apple/Google API를 직접 호출해 검증.

### 5-2. 중복 처리 방지

`IapReceipt.transactionId`에 UNIQUE 제약. 동일 트랜잭션 ID 재처리 시 409 반환. Apple 재전송(retry)에 안전.

### 5-3. 환불 처리

Apple `REFUND` 알림 수신 시:
- `IapReceipt.status = REFUNDED`로 업데이트
- `Transaction(type=REFUND, amount=-coinAmount)` 생성
- `User.paidCoins` 차감 (잔액 부족 시 0으로 클램핑, 마이너스 허용 안 함)

### 5-4. 영수증 원문 암호화

`IapReceipt.receiptData`는 AES-256-GCM으로 암호화 후 저장. 복호화 키는 AWS KMS 관리. ConfigService로만 접근.

### 5-5. SSRF 방지

Apple/Google API URL은 환경변수 화이트리스트에서만 허용. 외부 URL 직접 호출 금지.

---

## 6. 에러 코드 추가 (api-spec.md 반영 필요)

| 코드 | HTTP | 설명 |
|------|------|------|
| IAP_DUPLICATE | 409 | 이미 처리된 영수증 |
| IAP_INVALID_SIGNATURE | 400 | 서명 검증 실패 |
| IAP_PRODUCT_NOT_FOUND | 404 | 등록되지 않은 상품 ID |
| IAP_VERIFICATION_FAILED | 502 | Apple/Google API 검증 실패 |
| INSUFFICIENT_FREE_COINS | 400 | 예측용 무료 코인 부족 |

---

## 7. 마이그레이션 전략

1단계 (현재 → IAP 분리):
- `Transaction.coinType` 컬럼 추가 (default: FREE — 기존 데이터 호환)
- `Transaction.iapTransactionId` 컬럼 추가 (nullable)
- `IapReceipt`, `IapProduct` 테이블 신규 생성
- `User.freeCoins`, `User.paidCoins` 컬럼 추가 후 `bananaCoins` 값으로 초기화
- 기존 `User.bananaCoins`는 하위 호환을 위해 잠시 유지 후 다음 스프린트에서 제거

2단계 (다음 스프린트):
- `Transaction.type` 문자열을 새 타입 체계로 전환 (`BET` → `PREDICTION_SPEND` 등)
- `User.bananaCoins` 컬럼 제거
- RewardService 내 코인 분리 검증 로직 적용

---

## 8. 미결 사항 (CEO/PM 확인 필요)

| 항목 | 옵션 | 기본 제안 |
|------|------|-----------|
| IAP 코인 유효기간 | 영구 vs 1년 만료 | 영구 (Apple 정책상 만료 설정 주의) |
| 광고 일일 시청 한도 | 제한 없음 vs 5회/일 | 5회/일 (인플레이션 방지) |
| 환불 시 코스메틱 회수 | 회수 vs 유지 | 유지 (UX 충격 최소화) |
| GRAC 사전 질의 | 법무팀 진행 여부 | DEC-009 기준 필수 |

---

_다음 단계: 이 설계 기준으로 Prisma 마이그레이션 파일 및 PaymentsModule 코드 구현_
