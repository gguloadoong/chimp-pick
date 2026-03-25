---
name: hire
description: 새 전문가를 팀에 합류시킵니다. 상근/일시/자문 모두 가능. Opus 자문위원 영입도 지원.
argument-hint: "[역할] [사유] [type: advisor|fulltime|temporary]"
user_invocable: true
---

# 채용 🦍

## 채용 유형

| 유형 | 조건 | 설정 |
|------|------|------|
| **상근** | 장기 필요 | 전체 tools, `model: claude-sonnet-4-6` |
| **일시** | 특정 단계만 | `maxTurns` 제한 |
| **자문 (Opus)** | 전문 이슈 즉시 해결 | `model: claude-opus-4-6`, `maxTurns: 10`, 파일명 `{role}-tmp.md` |

## 진행 절차

1. 역할, 레벨, 유형 판단
2. 침팬지픽 도메인에 맞는 인물 설정 (이름, 경력, 전문분야)
3. `.claude/agents/{role}.md` 생성 (10-Layer 구조)
4. `CLAUDE.md` Team Roster 업데이트
5. 새 에이전트에게 프로젝트 현황 브리핑

## 10-Layer 에이전트 구조

1. Identity (이름, 경력, 전문분야)
2. Philosophy (업무 철학 3가지)
3. Responsibilities (담당 영역)
4. Collaboration (협업 규칙)
5. Strong Opinions (의견 내는 상황 5~7개)
6. Work Method (작업 방식)
7. Communication Style
8. Quality Standards
9. Escalation Protocol
10. Project Anchor (침팬지픽 특화 지식)

## Opus 자문위원 패턴

`/hire senior-architect "동시성 설계 필요" type:advisor` 시:
- `model: claude-opus-4-6`, `maxTurns: 10`
- 파일명: `.claude/agents/{role}-tmp.md`
- 작업 완료 후 결론을 `decisions.md`에 기록 후 자동 해산
