# Changelog

> 모든 주요 변경사항을 기록합니다. [Semantic Versioning](https://semver.org/) 기준.

---

## [Unreleased] — Sprint 1

### Added
- `.claude/hooks/` 디렉토리 + 4개 훅 스크립트 (품질 게이트, 위험 명령 감지, 컨텍스트 요약)
- `.claude/settings.json` 권한 및 훅 설정
- 스킬 추가: `auto-pilot`, `code-review`, `qa`, `ship`, `hire`, `security-audit`, `office-hours`, `ask-gemini`
- `.project/sprint-log.md`, `SNAPSHOT.md` 프로젝트 문서

### Changed
- 디자인 팔레트: Sweetie 16 → ENDESGA-32 (채도 강화)
  - UP: `#a7f070` → `#63c74d`
  - DOWN: `#b13e53` → `#e43b44`
  - Brand: `#ffcd75` → `#feae34`
- 코인 종목 제거: BTC/ETH/DOGE/SHIB/XRP → KOSPI 주식만
- UI 텍스트: "베팅 금액" → "예측 포인트" (앱스토어 심사 대응)

---

## [0.1.0] — 2026-03-25 (Sprint 0)

### Added
- 기본 게임 루프: 질문 생성 → UP/DOWN 선택 → 결과 확인
- 로그인 페이지 (게스트 플레이)
- 픽셀 아트 디자인 시스템 (Sweetie 16 기반)
- 랭킹 시스템
- 프로필 페이지
- 바나나코인 시스템
- 다양한 질문 카테고리 (시세, 재미, 상식, 스포츠, 트렌드)
- CrowdGauge 군중 예측 분포 시각화
- 비교 예측 모드 (A vs B)
- 시즌 시스템 기초

### Technical
- Next.js 15 App Router + TypeScript
- NestJS 10 + Prisma + PostgreSQL
- Socket.IO 실시간 통신
- Zustand + React Query 상태 관리
- Vercel 배포 (FE)
