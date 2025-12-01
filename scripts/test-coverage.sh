#!/bin/bash

output=$(vitest run --coverage 2>&1) || true
echo "$output"

if echo "$output" | grep -q "ERROR: Coverage"; then
	echo ""
	echo "Coverage thresholds not met. Exiting with error."
	exit 1
fi

exit 0

