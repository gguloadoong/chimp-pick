---
name: ship
description: 배포. Quality Gate 전체 통과 후 배포 실행. /qa 통과 후에만 사용 가능.
user_invocable: true
---

# 배포 🚀

## Pre-flight Checklist (자동 검증)

- [ ] 모든 테스트 통과: `npm test`
- [ ] TypeScript 빌드 성공: `tsc --noEmit`
- [ ] Lint 클린: `npm run lint`
- [ ] P1 버그 0개
- [ ] 보안 감사 통과 (`/security-audit`)
- [ ] `CHANGELOG.md` 업데이트
- [ ] 환경변수 `.env.example` 최신화
- [ ] 운영 모니터링 포인트 확인

## 실패 시

- 최대 3회 수정 후 재검증
- 3회 후에도 실패 → `/request-to-ceo`

## 배포 순서

1. `/security-audit` 자동 실행
2. Pre-flight 전체 통과 확인
3. `CHANGELOG.md` 버전 항목 추가
4. Git 태그 생성: `git tag -a v{version} -m "Release v{version}"`
5. `git push && git push --tags`
6. Vercel (FE) / 서버 (BE) 배포 확인
7. 스모크 테스트: 핵심 플로우 수동 확인

## 배포 후

- `/loop 5m` 으로 5분간 오류 모니터링
- CEO에게 배포 완료 보고
- `/retro` 제안
