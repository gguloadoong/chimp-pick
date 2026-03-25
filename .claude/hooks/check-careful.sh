#!/bin/bash
# .claude/hooks/check-careful.sh — PreToolUse(Bash) 훅
# 위험 명령 감지 시 Claude에게 확인 요청

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

DANGEROUS=(
  "rm -rf"
  "DROP TABLE"
  "DROP DATABASE"
  "git push.*--force"
  "git push.*-f"
  "git reset --hard"
  "git clean -f"
  "kubectl delete"
  "truncate"
  "format"
)

for p in "${DANGEROUS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$p"; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"⚠️ 위험 명령 감지: %s — 실행 전 반드시 확인하세요."}}\n' "$p"
    exit 0
  fi
done

exit 0
