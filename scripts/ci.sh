#!/bin/bash

FAILED_CHECKS=()
TOTAL_CHECKS=0

run_check() {
	local name="$1"
	local command="$2"
	
	TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
	echo ""
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "Running: $name"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	
	if eval "$command"; then
		echo "✅ $name passed"
	else
		echo "❌ $name failed"
		FAILED_CHECKS+=("$name")
	fi
}

run_check "Lint" "bun run lint"

run_check "Format Check" "bun run format:check"

run_check "Security Audit" "bun audit"

run_check "Type Check" "bun run type-check"

run_check "Build" "bun run build"

run_check "Verify Executable Exists" "test -f ./dist/devflow"

run_check "Check Executable Size" "
	SIZE=\$(stat -f%z ./dist/devflow 2>/dev/null || stat -c%s ./dist/devflow)
	echo \"Executable size: \$(numfmt --to=iec-i --suffix=B \$SIZE 2>/dev/null || echo \$SIZE bytes)\"
	if [ \$SIZE -gt 125829120 ]; then
		echo \"Warning: Executable size exceeds 120MB\"
		exit 1
	fi
"

run_check "Test Coverage" "bun run test:coverage"

run_check "Test Performance" "bun run test:perf"

run_check "Circular Dependencies" "bun run check:circular:ci"

run_check "Unused Dependencies" "bun run knip"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CI Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total checks: $TOTAL_CHECKS"

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
	echo "✅ All checks passed"
	exit 0
else
	echo "❌ Failed checks: ${#FAILED_CHECKS[@]}"
	for check in "${FAILED_CHECKS[@]}"; do
		echo "  - $check"
	done
	exit 1
fi

