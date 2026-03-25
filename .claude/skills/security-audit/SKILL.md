---
name: security-audit
description: OWASP Top 10 + 침팬지픽 특화 보안 감사. /ship 전 자동 실행.
allowed-tools: Read, Grep, Glob, Bash
user_invocable: true
---

# 보안 감사 🔒

## OWASP Top 10 체크

- [ ] **A01 Broken Access Control**: 소유권 검증, IDOR 방지
- [ ] **A02 Cryptographic Failures**: HTTPS 필수, 민감 데이터 암호화
- [ ] **A03 Injection**: SQL 파라미터 바인딩, NoSQL Injection
- [ ] **A04 Insecure Design**: 인증 흐름 설계 검토
- [ ] **A05 Security Misconfiguration**: 환경변수, 기본 설정 확인
- [ ] **A06 Vulnerable Components**: `npm audit` 실행
- [ ] **A07 Auth Failures**: JWT 검증, 세션 관리
- [ ] **A08 Integrity Failures**: 입력 검증, 직렬화
- [ ] **A09 Logging Failures**: 민감 정보 로그 출력 없음
- [ ] **A10 SSRF**: 외부 URL 요청 검증

## 침팬지픽 특화 체크

- [ ] 바나나코인 조작 불가 (서버 검증)
- [ ] 예측 결과 위조 불가
- [ ] 랭킹 조작 불가
- [ ] Rate limiting 적용 (예측 API)
- [ ] 게스트 → 실사용자 전환 시 데이터 정합성
- [ ] WebSocket 인증 검증

## 시크릿 패턴 스캔

```bash
grep -rE "AKIA[A-Z0-9]{16}|sk-[a-zA-Z0-9]{32}|ghp_[a-zA-Z0-9]{36}|password\s*=\s*['\"]" \
  apps/ --include="*.ts" --include="*.tsx" --include="*.js"
```

## npm 취약점 스캔

```bash
npm audit --audit-level=high
```

## 결과 처리

- Critical/High → 즉시 수정 필수. 수정 불가 시 `/request-to-ceo`
- Medium → backlog 등록, 현 스프린트 내 수정
- Low → backlog 등록, 다음 스프린트
