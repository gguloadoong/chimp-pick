---
name: qa
description: QA 테스트. test-plan.md 기반으로 단위→통합→E2E 순서로 실행. 버그 발견 시 즉시 수정.
allowed-tools: Read, Bash, Grep, Glob
user_invocable: true
---

# QA 테스트 🦍

## 사전 조건

- `test-plan.md` 확인
- 기존 테스트 전체 통과 상태 확인: `npm test`

## 실행 순서

### 1. 단위 테스트
```bash
cd apps/web && npm test -- --coverage 2>/dev/null
cd apps/api && npm test -- --coverage 2>/dev/null
```

### 2. 통합 테스트
- API 엔드포인트 응답 확인
- DB 트랜잭션 정합성
- WebSocket 연결/해제

### 3. E2E (핵심 플로우)
- 로그인 → 게임 시작 → 예측 → 결과 확인
- 랭킹 조회
- 프로필 조회

## 버그 발견 시

| 심각도 | 대응 |
|--------|------|
| P0 (서비스 불가) | 즉시 수정, `sprint-log.md`에 기록 |
| P1 (핵심 기능 오류) | 즉시 수정 후 재테스트 |
| P2 (일반 버그) | backlog 등록, 현 스프린트 내 수정 |
| P3 (마이너) | backlog 등록, 다음 스프린트 |

같은 버그 2회 이상 반복 → `/team-meeting` RCA 모드 전환

## 완료 기준

- [ ] 모든 P0/P1 버그 수정 완료
- [ ] 커버리지 기준 충족 (목표: 80%+)
- [ ] 엣지케이스 테스트 추가
- [ ] `test-plan.md` 업데이트

완료 후 → `/ship` 체크리스트 확인
