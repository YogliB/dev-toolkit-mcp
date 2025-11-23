# Testing Guide

## Overview

This project implements a comprehensive testing strategy with three optimization levels:

1. **Option 1: Parallel Execution** - Tests run in parallel across CPU cores
2. **Option 2: Smart Watch Mode** - Dev mode runs only changed tests for fast feedback
3. **Option 3: Test Segmentation** - Tests organized by tier (unit/integration/e2e)

Plus **CI Performance Monitoring** to catch regressions early.

## Test Structure

```
tests/
├── unit/              # Fast, mocked tests (<10ms each)
│   └── examples.test.ts
├── integration/       # Real dependencies (<100ms each)
│   └── examples.test.ts
└── e2e/              # Full system tests (CI-only)
```

Original tests remain in `src/` for backward compatibility during migration.

## Running Tests

### Development

```bash
# Run all tests
bun test

# Watch mode (re-runs on file changes)
bun test --watch

# Unit tests only (fastest, mocked)
bun run test:unit

# Integration tests only
bun run test:integration
```

### CI / Performance Checking

```bash
# Full test suite with coverage and performance tracking
bun run test:ci

# Performance report with baseline comparison
bun run test:perf
```

## Performance Tiers

### Unit Tests (`tests/unit/`)

**Goal:** Sub-10ms per test, fully mocked, isolated

```typescript
import { describe, it, expect } from 'vitest';

describe.concurrent('Fast Unit Tests', () => {
	it('should calculate correctly', () => {
		expect(1 + 1).toBe(2);
	});

	it('should validate input', () => {
		expect(validate('data')).toBe(true);
	});
});
```

**Characteristics:**

- Mocked dependencies
- No I/O operations
- Deterministic
- Use `describe.concurrent()` for parallel execution
- Fast feedback in watch mode

### Integration Tests (`tests/integration/`)

**Goal:** <100ms per test, real dependencies, realistic scenarios

```typescript
describe('Real System Integration', () => {
	it('should handle database operations', async () => {
		const result = await database.query();
		expect(result).toBeDefined();
	});
});
```

**Characteristics:**

- Real dependencies
- File I/O allowed
- Database operations
- Network calls mocked or real test servers
- Sequential by default

### E2E Tests (`tests/e2e/`)

**Goal:** Full system validation, CI-only

**Note:** Currently not in use but reserved for future end-to-end testing.

## Concurrent Tests

Use `describe.concurrent()` to run tests within a suite in parallel:

```typescript
describe.concurrent('Math Operations', () => {
	it('adds numbers', () => {
		expect(2 + 2).toBe(4);
	});

	it('multiplies numbers', () => {
		expect(3 * 4).toBe(12);
	});

	// Both tests run concurrently!
});
```

## Performance Monitoring

### Baseline

Performance baseline is stored in `.vitest-performance.json`:

```json
{
	"baseline": {
		"totalDuration": 150,
		"testCount": 89,
		"fileCount": 8,
		"avgPerTest": 1.69,
		"files": {},
		"timestamp": "2024-01-15T10:30:00Z"
	},
	"thresholds": {
		"maxRegression": 0.2,
		"maxDuration": 5000
	}
}
```

### Updating Baseline

When performance improvements are intentional, update the baseline:

```bash
# Preview new baseline
bun run scripts/update-baseline.ts

# Actually update (use with caution)
bun run scripts/update-baseline.ts --update-baseline
```

### Performance Reports

CI generates performance reports automatically. Check:

1. **CI Artifacts** - `performance-report` contains `results.json`
2. **Console Output** - Performance summary printed to logs
3. **Git History** - Baseline tracked in `.vitest-performance.json`

## Configuration

### `vitest.config.ts`

Key settings for performance:

```typescript
export default defineConfig({
	test: {
		// Parallel execution
		pool: 'forks', // Process isolation
		fileParallelism: true, // Run test files in parallel
		maxConcurrency: 10, // Max concurrent files

		// Within-file concurrency
		sequence: {
			concurrent: true, // Default: run tests concurrently
			shuffle: false,
		},

		// Dev mode optimizations
		watch: !process.env.CI, // Watch mode enabled locally
		changed: !process.env.CI, // Only changed tests in dev
	},
});
```

## Writing Performant Tests

### ✅ Do

- Isolate tests - no shared state
- Mock external dependencies
- Use concurrent tests for independent cases
- Keep tests focused on one behavior
- Use descriptive names

```typescript
describe.concurrent('User Validation', () => {
	it('should reject invalid email', () => {
		expect(isValidEmail('invalid')).toBe(false);
	});

	it('should accept valid email', () => {
		expect(isValidEmail('user@example.com')).toBe(true);
	});

	// Both run in parallel
});
```

### ❌ Don't

- Share state between tests
- Create real database connections per test
- Make real HTTP requests
- Use slow libraries without mocking
- Create tests that depend on execution order

```typescript
// Bad: Shared state
let counter = 0;
describe('Counter', () => {
	it('increments', () => {
		counter++; // ❌ Unreliable with parallel execution
	});
});

// Good: Isolated state
describe.concurrent('Counter', () => {
	it('increments', () => {
		let counter = 0;
		counter++; // ✅ Isolated
		expect(counter).toBe(1);
	});
});
```

## CI Pipeline

The CI workflow runs:

1. **Lint** - ESLint
2. **Format** - Prettier
3. **Type Check** - TypeScript
4. **Test** - Full suite with:
    - Parallel execution
    - Coverage reports
    - Performance tracking
    - JSON reporter for metrics

Performance check:

- ✅ Pass if within 20% of baseline
- ⚠️ Warn if close to limits
- ❌ Fail if regression > 20%

## Troubleshooting

### Tests are slow

1. Check for I/O operations - move to integration tests
2. Verify mocks are working - add `console.log` to verify
3. Look for synchronous operations - use async/await
4. Check test isolation - ensure no shared state

### Performance regression detected

1. Check what changed - `git diff`
2. Profile the test - add timing logs
3. Consider if change is worth regression
4. Update baseline if intentional: `bun run update-baseline.ts --update-baseline`

### Tests fail randomly (flaky)

1. Check for timing issues - increase timeouts
2. Remove test interdependencies
3. Ensure mocks are deterministic
4. Check for concurrent test conflicts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/best-practices.html)
- [Concurrent Tests](https://vitest.dev/api/#concurrent)
- [Performance Tips](https://vitest.dev/guide/performance.html)

## Scripts Reference

| Script                     | Purpose                     |
| -------------------------- | --------------------------- |
| `bun test`                 | Run all tests               |
| `bun run test:unit`        | Unit tests only             |
| `bun run test:integration` | Integration tests only      |
| `bun run test:watch`       | Watch mode                  |
| `bun run test:ci`          | CI test suite with coverage |
| `bun run test:perf`        | Performance tracking        |
| `bun run update-baseline`  | Update performance baseline |
