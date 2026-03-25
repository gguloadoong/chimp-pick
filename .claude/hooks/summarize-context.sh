#!/bin/bash
# .claude/hooks/summarize-context.sh — SessionStart 훅
# SNAPSHOT.md 자동 생성/갱신

cd /Users/bong/chimp-pick 2>/dev/null || exit 0

SNAPSHOT=".project/SNAPSHOT.md"
DATE=$(date '+%Y-%m-%d %H:%M')
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "no commits")
OPEN_TODOS=$(grep -r "TODO\|FIXME" apps/web/src apps/api/src --include="*.ts" --include="*.tsx" -l 2>/dev/null | wc -l | tr -d ' ')
BACKLOG_COUNT=$(grep -c "^-\|^##" .project/backlog.md 2>/dev/null || echo "0")

cat > "$SNAPSHOT" << EOF
# 프로젝트 스냅샷

> 자동 생성: $DATE

## 현재 상태
- **브랜치**: $BRANCH
- **최근 커밋**: $LAST_COMMIT
- **TODO 파일 수**: $OPEN_TODOS개
- **백로그 항목**: $BACKLOG_COUNT개

## 최근 커밋 (10개)
\`\`\`
$(git log --oneline -10 2>/dev/null)
\`\`\`

## 진행 중인 스프린트
$(tail -30 .project/sprint-log.md 2>/dev/null || echo "스프린트 기록 없음")

## 주요 결정사항 (최근)
$(tail -20 .project/decisions.md 2>/dev/null)
EOF

exit 0
