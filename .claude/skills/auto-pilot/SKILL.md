---
name: auto-pilot
description: 자율주행 엔진 — 현황 파악 후 Exec→Verify→Fix→Record→Commit 무한 루프. 킥오프 완료 후 자동 시작.
user_invocable: true
argument-hint: "[선택: 시작 태스크]"
---

# 오토파일럿 🦍

## 현재 프로젝트 상태 (자동 주입)
- Backlog: !`cat .project/backlog.md 2>/dev/null | head -30`
- Sprint: !`cat .project/sprint-log.md 2>/dev/null | tail -20`
- Snapshot: !`cat .project/SNAPSHOT.md 2>/dev/null | head -30`
- Git: !`git log --oneline -10 2>/dev/null`

## Phase 0 — 현황 파악

1. `SNAPSHOT.md`, `backlog.md`, `sprint-log.md` 읽기
2. 완료/미완료/블로커 항목 파악
3. 다음 작업 우선순위 결정
4. CEO 승인 없이 바로 시작 (에스컬레이션 조건에 해당하는 것만 보고)

## Phase 1 — 자율 실행 루프

```
[EXEC] 코드/문서/디자인/분석 작업 실행
  ↓
[VERIFY] 품질 게이트 검증
  - TypeScript 컴파일 오류 0
  - 기존 테스트 통과
  - 보안 패턴 없음
  ↓ 실패 시
[FIX] 수정 후 VERIFY 복귀 (최대 3회)
  ↓ 3회 실패 시 → Opus 승격
[RECORD] backlog / sprint-log / decisions 업데이트
  ↓
[COMMIT] 확정 후 다음 태스크로 자동 이동
```

## 자율 호출 규칙

- 코드 구현 완료 → `/code-review` 실행
- 디자인 작업 완료 → `/design-review` 실행
- 버그 수정 착수 → 반드시 `.repro.sh` 또는 실패 테스트 먼저 작성
- 같은 버그 2회 반복 → `/team-meeting` RCA 모드
- Verify 3회 실패 → `Agent(model="opus")` 로 전체 위임
- 역량 부족 → `/hire [역할] [사유]`
- 외부 블로커 → `/request-to-ceo`

## 에스컬레이션 조건 (이것만 CEO에게 보고)

- 유료 API 키, 결제, 계정 연결 등 자원 요청
- 서비스 방향을 크게 바꿔야 하는 중대 피벗
- 팀으로 해결 불가능한 물리적/법적/행정적 도움

## 종료 시 필수

1. `sprint-log.md` 갱신 (완료된 항목, 남은 항목)
2. `SNAPSHOT.md` 갱신
3. 다음 세션 진입점 메모 (`SNAPSHOT.md` 하단에 "다음 세션에서 X부터 시작" 기록)
