# 침팬지픽 API 스펙

> 최종 수정: 2026-03-20 | 작성: 최풀매수 (BE)

## Base URL
- Local: `http://localhost:4000/api/v1`
- Staging: `https://api.staging.chimppick.app/v1`
- Production: `https://api.chimppick.app/v1`

## 공통 응답 포맷

### 성공
```json
{
  "success": true,
  "data": { },
  "meta": {
    "timestamp": "2026-03-20T10:00:00Z",
    "requestId": "uuid-v4"
  }
}
```

### 에러
```json
{
  "success": false,
  "error": {
    "code": "PREDICTION_CLOSED",
    "message": "예측 마감 시간이 지났습니다",
    "details": {}
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

## 인증 API

### POST /auth/login/kakao
카카오 소셜 로그인
```
Request:  { "accessToken": "kakao-token" }
Response: { "accessToken": "jwt", "refreshToken": "jwt", "user": { ... } }
```

### POST /auth/refresh
토큰 갱신
```
Request:  { "refreshToken": "jwt" }
Response: { "accessToken": "jwt" }
```

### POST /auth/guest
게스트 로그인 (3회 체험용)
```
Response: { "accessToken": "jwt", "user": { "isGuest": true } }
```

## 유저 API

### GET /users/me
내 프로필 조회
```json
{
  "id": "cuid",
  "nickname": "가즈아전사",
  "avatarLevel": 3,
  "bananaCoins": 1250,
  "createdAt": "..."
}
```

### GET /users/me/stats
내 전적 조회
```json
{
  "totalPredictions": 156,
  "wins": 98,
  "losses": 58,
  "winRate": 62.8,
  "currentStreak": 5,
  "bestStreak": 12,
  "profitLoss": 420
}
```

### PATCH /users/me
프로필 수정
```
Request:  { "nickname": "새닉네임" }
Response: { "id": "cuid", "nickname": "새닉네임", ... }
```

## 예측 API

### POST /predictions
예측 생성
```json
// Request
{
  "symbol": "BTC-KRW",
  "direction": "UP",
  "timeframe": "5m",
  "betAmount": 10
}

// Response
{
  "id": "cuid",
  "symbol": "BTC-KRW",
  "direction": "UP",
  "timeframe": "5m",
  "entryPrice": 95234000,
  "betAmount": 10,
  "result": "PENDING",
  "expiresAt": "2026-03-20T10:05:00Z"
}
```

### GET /predictions/active
진행 중인 예측 목록
```
Response: [{ ...prediction }]
```

### GET /predictions/:id
예측 상세 조회
```
Response: { ...prediction, "exitPrice": 95500000, "result": "WIN", "reward": 18 }
```

### GET /predictions/history
내 예측 히스토리
```
Query:    ?page=1&limit=20&symbol=BTC-KRW
Response: { "items": [...], "total": 156, "page": 1, "limit": 20 }
```

## 시세 API

### GET /prices/:symbol
현재 시세
```json
{
  "symbol": "BTC-KRW",
  "price": 95234000,
  "change24h": 2.3,
  "high24h": 96000000,
  "low24h": 93500000,
  "volume24h": 1234567890,
  "updatedAt": "..."
}
```

### GET /prices/:symbol/candles
캔들 데이터
```
Query: ?timeframe=5m&limit=100
Response: [{
  "open": 95200000,
  "high": 95300000,
  "low": 95100000,
  "close": 95234000,
  "volume": 12345,
  "timestamp": "..."
}]
```

## 랭킹 API

### GET /rankings
랭킹 목록
```
Query: ?period=weekly&limit=100
Response: [{
  "rank": 1,
  "userId": "cuid",
  "nickname": "킹콩마스터",
  "avatarLevel": 4,
  "winRate": 92.3,
  "totalPredictions": 230,
  "profit": 1500
}]
```

### GET /rankings/me
내 랭킹
```
Response: { "rank": 37, "winRate": 73.2, ... }
```

## WebSocket 이벤트

### 연결
```
URL:  wss://api.chimppick.app/ws
Auth: Bearer token in handshake
```

### 구독/발행
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `subscribe:price` | C→S | 종목 시세 구독 `{ symbol }` |
| `unsubscribe:price` | C→S | 구독 해제 `{ symbol }` |
| `price:update` | S→C | 시세 업데이트 `{ symbol, price, change }` |
| `prediction:result` | S→C | 예측 결과 `{ predictionId, result, reward }` |
| `ranking:update` | S→C | 랭킹 업데이트 (1분 주기) |

## 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| AUTH_REQUIRED | 401 | 인증 필요 |
| AUTH_EXPIRED | 401 | 토큰 만료 |
| USER_NOT_FOUND | 404 | 유저 없음 |
| NICKNAME_TAKEN | 409 | 닉네임 중복 |
| INSUFFICIENT_BANANA | 400 | 바나나코인 부족 |
| PREDICTION_CLOSED | 400 | 예측 마감 |
| SYMBOL_SUSPENDED | 400 | 종목 거래 중지 |
| RATE_LIMITED | 429 | 요청 한도 초과 |
| GUEST_LIMIT | 403 | 게스트 체험 횟수 초과 |
