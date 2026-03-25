#!/bin/bash
# .claude/hooks/check-commercial-quality.sh — TaskCompleted 훅
# 상업 수준 품질 검증

cd /Users/bong/chimp-pick 2>/dev/null || exit 0

ISSUES=()

# 새 코드에 테스트 파일 존재 여부
RECENT=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx|js|jsx)$' | grep -vE '(test|spec|\.d\.ts)')
if [ -n "$RECENT" ]; then
  TESTS=$(git diff --name-only HEAD 2>/dev/null | grep -E '(test|spec)\.')
  if [ -z "$TESTS" ]; then
    ISSUES+=("새 코드에 테스트 파일이 없습니다. 테스트를 추가하세요.")
  fi
fi

# console.log 실수 체크
if git diff HEAD 2>/dev/null | grep -qE '^\+.*console\.(log|debug|warn)\('; then
  ISSUES+=("console.log/debug/warn 가 코드에 남아 있습니다. 제거하거나 logger로 교체하세요.")
fi

# any 타입 체크
if git diff HEAD 2>/dev/null | grep -qE '^\+.*: any[^A-Za-z]'; then
  ISSUES+=("'any' 타입이 감지됐습니다. 구체적인 타입으로 교체하세요.")
fi

# TODO/FIXME 미완성 체크
if git diff HEAD 2>/dev/null | grep -qE '^\+.*(TODO|FIXME|HACK|XXX):'; then
  ISSUES+=("TODO/FIXME 가 남아 있습니다. 완료 후 커밋하세요.")
fi

if [ ${#ISSUES[@]} -gt 0 ]; then
  echo "⚠️ 상업 수준 품질 이슈:"
  for issue in "${ISSUES[@]}"; do echo "  - $issue"; done
fi

exit 0
