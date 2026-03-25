#!/bin/bash
# .claude/hooks/check-quality.sh — Stop 훅
# 비어있지 않은 stdout 출력 = Claude가 계속 작업함

cd /Users/bong/chimp-pick 2>/dev/null || exit 0

ISSUES=()

# TypeScript 컴파일 에러 확인 (web)
if [ -f "apps/web/tsconfig.json" ] && command -v npx &>/dev/null; then
  if ! npx tsc --noEmit --project apps/web/tsconfig.json --quiet 2>/dev/null; then
    ISSUES+=("FE TypeScript 컴파일 에러가 있습니다. tsc --noEmit 를 확인하세요.")
  fi
fi

# TypeScript 컴파일 에러 확인 (api)
if [ -f "apps/api/tsconfig.json" ] && command -v npx &>/dev/null; then
  if ! npx tsc --noEmit --project apps/api/tsconfig.json --quiet 2>/dev/null; then
    ISSUES+=("BE TypeScript 컴파일 에러가 있습니다.")
  fi
fi

# 하드코딩된 시크릿 패턴 검사
SECRET_PATTERNS=("AKIA[A-Z0-9]{16}" "sk-[a-zA-Z0-9]{32}" "ghp_[a-zA-Z0-9]{36}" "xoxb-" "AIza[0-9A-Za-z-_]{35}")
for pattern in "${SECRET_PATTERNS[@]}"; do
  if git diff HEAD 2>/dev/null | grep -qE "$pattern"; then
    ISSUES+=("⚠️ 하드코딩된 시크릿 패턴 감지: $pattern — 절대 커밋하지 마세요!")
  fi
done

if [ ${#ISSUES[@]} -gt 0 ]; then
  echo "⛔ 품질 게이트 미통과. 아래 항목을 먼저 해결하세요:"
  for issue in "${ISSUES[@]}"; do echo "  - $issue"; done
fi

exit 0
