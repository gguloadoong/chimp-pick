# 스프린트 로그

> 스프린트별 목표, 완료 항목, 회고 핵심을 기록합니다.

---

## Sprint 0 — 기반 설계 (2026-03-20 ~ 2026-03-25)

**목표**: 프로젝트 셋업, 기술 스택 확정, 기본 게임 루프 구현

**완료**
- [x] 프로젝트 구조 설정 (Next.js 15 + NestJS 10)
- [x] 기본 게임 루프 (질문 생성 → UP/DOWN 선택 → 결과)
- [x] 로그인 페이지 (게스트 플레이)
- [x] 픽셀 아트 디자인 시스템 (Sweetie 16 → ENDESGA-32 전환)
- [x] 랭킹 시스템 기초
- [x] 프로필 페이지

**결정사항**
- DEC-001 ~ DEC-011: 프레임워크, WebSocket, 배팅 배율, PWA, 데이터소스, 서비스 본질 재정의, 앱스토어 전략, 디자인 시스템

**회고 핵심**
- Keep: 빠른 이터레이션, 픽셀 디자인 방향성
- Problem: 코인 종목 앱스토어 리스크 (→ 제거 완료)
- Try: 테스트 커버리지 개선, 훅 시스템 활용

---

## Sprint 1 — 핵심 기능 고도화 (2026-03-26 ~ )

**목표**: 앱스토어 심사 통과 가능한 구조 + 병맛 UX 강화

**완료**
- [x] ENDESGA-32 + Galmuri11 전체 적용 (박도파민 + 이떡상) — PR #79
- [x] 패배 밈 다양화 15종 + 시간대별 특별 메시지 (박도파민) — PR #82
- [x] CrowdGauge 시각화 개선 — 배점 표시 + 군중 쏠림 코멘트 (이떡상) — PR #82
- [x] IAP-베팅 분리 아키텍처 설계 (최풀매수) — `.project/iap-architecture.md`, DEC-013
- [x] galmuri CDN @latest → npm 로컬 패키지 (이떡상) — PR #82
- [x] IAP PaymentsModule 구현 (최풀매수) — PR #83, freeCoins/paidCoins/IapReceipt/IapProduct
- [x] 배틀패스 수익 모델 초안 (한물타기) — `.project/battlepass-model.md` (30티어, 4주 시즌)

**진행 중**
- [ ] IAP 서명 검증 구현 Sprint 2 — Apple JWS, Google Pub/Sub
- [ ] GRAC 사전 질의 (김가즈아, 기한: 2026-03-30) — CEO 직접 진행
- [ ] Apple Developer 법인 계정 확인 (김가즈아, 기한: 2026-04-05) — CEO 직접 진행

**Opus 승격 기록**
- (없음)

---

## Sprint 2 — 안정화 + 리텐션 (2026-03-26 ~ )

**목표**: 에러 모니터링 체계 구축 + 리텐션 루프 강화 + 온보딩 개선

**완료**
- [x] Sentry FE SDK 설치 + withSentryConfig 래핑 (이떡상) — PR #91
- [x] Sentry BE SDK 설치 + instrument.ts (최풀매수) — PR #90
- [x] RetentionPanel UI — 스트릭 바 + 미션 3종 표시 (이떡상) — PR #91
- [x] OG 메타태그 + Twitter Card 동적 생성 (이떡상) — PR #91
- [x] 예측 완료 시 리텐션 미션 자동 트리거 (최풀매수) — PR #90
- [x] 3-step 온보딩 튜토리얼 힌트 개선 (이떡상) — PR #93
- [x] Empty state CTA — "라운드 준비 중" → 침팬지 캐릭터 화면 (이떡상) — PR #93
- [x] 게스트→회원 전환 넛지 배너 GuestNudge.tsx (이떡상) — PR #93

**진행 중**
- [ ] Prisma 마이그레이션 실행 (DATABASE_URL 설정 후) — BE 로컬 실행 필요
- [ ] og-image.png 실제 이미지 제작 (1200x630) — 박도파민

**메트릭**

| 구분 | 포인트 |
|------|--------|
| 완료 | 8 |
| 진행 중 | 2 |
| 총 완료 포인트 (Sprint 2) | 8 |

**Opus 승격 기록**
- (없음)

---

_새 스프린트 시작 시 위 형식으로 추가_
