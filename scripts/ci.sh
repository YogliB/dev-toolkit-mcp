#!/bin/bash
# Auto-generated from .github/workflows/ci.yml
# DO NOT EDIT MANUALLY - run: bun run generate:ci-sh

FAILED_CHECKS=()
OPTIONAL_FAILED=()
TOTAL_CHECKS=0

run_check() {
	local name="$1"
	local command="$2"
	local optional="$3"

	TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
	echo ""
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "Running: $name"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

	if eval "$command"; then
		echo "✅ $name passed"
	else
		if [ "$optional" = "true" ]; then
			echo "⚠️  $name failed (non-blocking)"
			OPTIONAL_FAILED+=("$name")
		else
			echo "❌ $name failed"
			FAILED_CHECKS+=("$name")
		fi
	fi
}

run_check "Run ESLint" "bun run lint" "false"

run_check "Check Prettier formatting" "bun run format:check" "false"

run_check "Run security audit" "bun audit" "false"

run_check "Type check with TypeScript" "bun run type-check" "false"

run_check "Build packages" "bun run build" "false"

run_check "Verify core executable exists" "test -f packages/core/dist/server.js" "false"

run_check "Verify dashboard build exists" "test -d packages/dashboard/.svelte-kit/output" "false"

run_check "Run tests" "bun run test" "false"

run_check "Run test coverage" "bun run test:coverage" "false"

run_check "Check for circular dependencies" "bun run --filter devflow-mcp check:circular:ci" "false"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CI Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total checks: $TOTAL_CHECKS"

if [ ${#OPTIONAL_FAILED[@]} -gt 0 ]; then
	echo "⚠️  Optional checks failed: ${#OPTIONAL_FAILED[@]}"
	for check in "${OPTIONAL_FAILED[@]}"; do
		echo "  - $check"
	done
fi

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
	echo "✅ All required checks passed"
	exit 0
else
	echo "❌ Failed checks: ${#FAILED_CHECKS[@]}"
	for check in "${FAILED_CHECKS[@]}"; do
		echo "  - $check"
	done
	exit 1
fi
