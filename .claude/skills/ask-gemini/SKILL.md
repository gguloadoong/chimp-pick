---
name: ask-gemini
description: Claude가 논리적 벽에 부딪히거나 외부 시각이 필요할 때 Gemini CLI로 분석. 결과는 팀이 검증 후 반영.
allowed-tools: Bash, Read, Grep, Glob
user_invocable: true
argument-hint: "[질문 또는 분석 요청]"
---

# Gemini 외부 시각 요청 🔭

## 사용 원칙

1. 기본 해결은 Claude 내부에서 먼저 시도한다.
2. 구조적 맹점 점검, 대형 파일 분석, 외부 관점이 **꼭 필요할 때만** 사용.
3. Gemini 결과를 그대로 채택하지 말고 팀이 검증 후 반영.
4. 보안/시크릿 정보는 마스킹 후 전달.

## OMC 환경 사용법

```bash
# 단일 질문
omc ask gemini "질문 내용"

# Claude + Codex + Gemini 3중 병렬 분석
# /oh-my-claudecode:ccg 스킬 사용
```

## 직접 Gemini CLI 사용

```bash
# Gemini CLI가 설치된 경우
gemini "침팬지픽 서비스에서 [분석 대상]의 문제점과 개선 방향을 분석해줘"
```

## 결과 처리

1. Gemini 응답 → 팀 내부 검토
2. 타당한 인사이트 → `decisions.md` 또는 `backlog.md` 반영
3. 결과 요약을 `meeting-notes/gemini-{날짜}.md`에 저장

## 적합한 사용 사례

- 아키텍처 설계의 맹점 검토
- 경쟁사 분석 (긴 문서 처리)
- 앱스토어 심사 정책 조사
- 규제/법무 관련 외부 의견 수렴
