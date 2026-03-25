---
name: code-review
description: 코드 리뷰. 기능 구현 완료 시 자동 트리거. Two-Pass 리뷰 후 발견 즉시 해결.
allowed-tools: Read, Grep, Glob, Edit, Bash
user_invocable: true
---

# 코드 리뷰 🦍

## 원칙: 발견 즉시 해결

- 기계적 문제 (포맷, 타입, 린트): **즉시 AUTO-FIX**
- 판단 필요한 문제: 관련 에이전트 협의 후 수정
- 구조 문제: `/team-meeting` 소집

작성자 ≠ 리뷰어. 반드시 교차 리뷰.

## Pass 1 — Critical (보안/데이터/회귀)

- [ ] SQL Injection, XSS, CSRF 패턴 없음
- [ ] 하드코딩된 시크릿/API키 없음
- [ ] 데이터 유실 가능성 없음
- [ ] 예외처리 누락 없음
- [ ] 새 기능에 대한 테스트 존재
- [ ] 기존 테스트 회귀 없음
- [ ] `any` 타입 없음

## Pass 2 — Quality (유지보수성)

- [ ] 중복 코드 없음 (3회 이상 반복 → 추출)
- [ ] 함수 50줄 이내
- [ ] 매직 넘버 → 상수 추출
- [ ] 네이밍 명확함
- [ ] 불필요한 console.log 없음
- [ ] 비동기 에러 핸들링 적절함
- [ ] N+1 쿼리 없음

## 리뷰 완료 후

- Critical 발견 → 즉시 수정 후 재검증
- Quality 발견 → backlog 등록 또는 즉시 수정
- 완료 → `/qa` 실행
