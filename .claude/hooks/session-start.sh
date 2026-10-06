#!/bin/bash
# Prepara las sesiones de Claude Code en la nube: instala dependencias y compila shared,
# para que lint, typecheck y tests funcionen desde el primer comando.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile
pnpm --filter @playbook/shared build
