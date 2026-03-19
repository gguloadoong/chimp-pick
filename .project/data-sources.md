# 침팬지픽 데이터 소스

> 최종 수정: 2026-03-20 | 작성: 최풀매수 (BE)

## 1. 코인 시세

### Primary: Upbit API
- **종류**: WebSocket (실시간) + REST (히스토리)
- **종목**: BTC-KRW, ETH-KRW, DOGE-KRW, SHIB-KRW, XRP-KRW
- **WebSocket**: `wss://api.upbit.com/websocket/v1`
- **REST**: `https://api.upbit.com/v1/candles/minutes/{unit}`
- **제한**: 초당 10회 (REST), WebSocket 무제한
- **인증**: 불필요 (공개 API)
- **비고**: 한국 코인 시장 1위, 가장 신뢰성 높음

### Fallback: Binance API
- **종류**: WebSocket + REST
- **종목**: BTCUSDT, ETHUSDT 등 (USD 기반 → KRW 환산)
- **WebSocket**: `wss://stream.binance.com:9443/ws`
- **비고**: Upbit 장애 시 자동 전환, 환율 변환 필요

## 2. 한국 주식 시세

### Primary: 한국투자증권 OpenAPI (KIS)
- **종류**: REST + WebSocket
- **종목**: KOSPI/KOSDAQ 주요 종목 (삼성전자, SK하이닉스, 카카오 등)
- **REST**: `https://openapi.koreainvestment.com:9443`
- **인증**: App Key + App Secret (환경변수)
- **제한**: 초당 20회
- **비고**: 실시간 시세는 WebSocket, 캔들은 REST
- **주의**: 장 마감 시간 (15:30 이후) 시세 고정

### Fallback: 네이버 금융
- **종류**: 웹 스크래핑 (비공식)
- **비고**: KIS 장애 시 임시 대체, 지연 있음

## 3. 환율 (Binance USD→KRW 변환용)

### 한국수출입은행 API
- **URL**: `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON`
- **갱신**: 하루 1회 (영업일 11시)
- **비고**: Redis에 캐시 (TTL 24h)

## 4. 데이터 처리 파이프라인

```
[외부 소스] → [Collector Worker]
                    ↓
            유효성 검증 (가격 범위, 타임스탬프)
                    ↓
            [Redis Pub/Sub] → 실시간 브로드캐스트
                    ↓
            [TimescaleDB] → 캔들 데이터 저장
                    ↓
            [Candle Aggregator] → 1분/5분/1시간/1일 캔들 집계
```

## 5. 장애 대응 매트릭스

| 시나리오 | 대응 | 자동/수동 |
|----------|------|-----------|
| Upbit WS 끊김 | Binance로 페일오버 | 자동 (3초 감지) |
| KIS API 에러 | 네이버 금융 스크래핑 | 자동 (5초 감지) |
| 모든 소스 다운 | 마지막 캐시 가격 + "지연" 표시 | 자동 |
| 시세 이상치 | 전후 가격 ±10% 초과 시 버림 | 자동 |
| 장 마감 | 예측 기능 비활성화 (주식만) | 자동 (스케줄) |

## 6. 종목 목록 (MVP)

### 코인 (24/7)
| 심볼 | 이름 | 소스 |
|------|------|------|
| BTC-KRW | 비트코인 | Upbit |
| ETH-KRW | 이더리움 | Upbit |
| DOGE-KRW | 도지코인 | Upbit |
| SHIB-KRW | 시바이누 | Upbit |
| XRP-KRW | 리플 | Upbit |

### 주식 (09:00-15:30, 평일)
| 심볼 | 이름 | 소스 |
|------|------|------|
| 005930 | 삼성전자 | KIS |
| 000660 | SK하이닉스 | KIS |
| 035420 | NAVER | KIS |
| 035720 | 카카오 | KIS |
| 068270 | 셀트리온 | KIS |
