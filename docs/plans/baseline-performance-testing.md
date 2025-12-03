# Baseline-Driven Performance Testing (v1.0)

## Goal

Replace hard-coded timing assertions in performance tests with baseline-driven comparisons that account for CI environment variability, eliminating flaky test failures while maintaining effective performance regression detection.

## Scope

- **In Scope:**
    - Create utility functions for baseline-aware performance assertions
    - Refactor `analysis-engine-lazy-loading.test.ts` to use baseline comparisons
    - Refactor `performance-benchmarks.test.ts` to use baseline comparisons
    - Add test utilities for performance assertion helpers
    - Update baseline with accurate CI-representative values
    - Document new performance testing approach
- **Out of Scope:**
    - Modifying other non-performance tests
    - Changing the overall test infrastructure (Vitest)
    - Creating new performance benchmarks
    - Performance optimization work (separate effort)

## Risks

- **Medium - Baseline accuracy**: Current baseline may not be representative of CI environment
    - **Mitigation**: Run tests multiple times in CI to establish accurate baseline, use conservative regression thresholds (50%)
- **Low - Regression tolerance calibration**: 50% threshold might be too lenient or too strict
    - **Mitigation**: Start conservative (50%), monitor CI runs, adjust based on observed variance
- **Low - Missing baseline handling**: Tests might fail if baseline file is deleted
    - **Mitigation**: Add fallback logic to warn and use absolute thresholds when baseline unavailable
- **Low - Test complexity increase**: Baseline comparison adds indirection
    - **Mitigation**: Create simple, reusable utility functions with clear naming

## Dependencies

- `.bun-performance.json` baseline file (exists)
- `scripts/test-performance.ts` (exists, provides reference implementation)
- Vitest test framework (already in use)
- CI workflow must continue to generate baseline data

## Priority

**High** - Blocking CI pipeline and preventing merges

## Logging / Observability

- Log baseline comparison results in test output (actual vs baseline vs threshold)
- Include regression percentage in assertion failure messages
- Preserve existing performance report generation in CI
- Add warning when baseline is missing or stale (>30 days old)

## Implementation Plan (TODOs)

- [ ] **Step 1: Create baseline utilities module**
    - [ ] Create `tests/helpers/performance-baseline.ts`
    - [ ] Implement `loadPerformanceBaseline()` function
    - [ ] Implement `getBaselineDuration(testName: string)` function
    - [ ] Implement `expectDurationWithinBaseline(actual: number, testName: string, maxRegression?: number)` assertion helper
    - [ ] Add fallback to absolute threshold when baseline missing
    - [ ] Add unit tests for baseline utilities

- [ ] **Step 2: Refactor analysis-engine-lazy-loading.test.ts**
    - [ ] Import baseline utilities
    - [ ] Replace line 308 `expect(duration).toBeLessThan(200)` with baseline comparison
    - [ ] Use test name: "analysis-engine-lazy-loading.preloaded-file-analysis"
    - [ ] Set maxRegression to 0.5 (50%)
    - [ ] Verify test passes locally and fails appropriately on regression

- [ ] **Step 3: Refactor performance-benchmarks.test.ts**
    - [ ] Import baseline utilities
    - [ ] Replace line 110 `expect(duration).toBeLessThan(500)` with baseline comparison
    - [ ] Use test name: "performance-benchmarks.first-file-analysis"
    - [ ] Set maxRegression to 0.5 (50%)
    - [ ] Consider refactoring other timing assertions in same file for consistency
    - [ ] Verify test passes locally

- [ ] **Step 4: Update performance baseline**
    - [ ] Run tests locally 5 times to get average durations
    - [ ] Update `.bun-performance.json` with representative values for the two specific tests
    - [ ] Add metadata: `testSpecificBaselines` section to baseline file
    - [ ] Commit updated baseline

- [ ] **Step 5: Documentation**
    - [ ] Add section to `docs/TESTING.md` explaining baseline-driven performance testing
    - [ ] Document how to update baseline when legitimate performance changes occur
    - [ ] Document maxRegression threshold rationale
    - [ ] Add inline comments in test files explaining baseline approach

- [ ] **Step 6: CI Validation**
    - [ ] Push changes and verify CI test step passes
    - [ ] Monitor 3-5 CI runs to ensure stability
    - [ ] Adjust thresholds if needed based on observed variance

## Docs

- [ ] **docs/TESTING.md**: Add "Performance Testing" section
    - Explain baseline-driven approach
    - How to update baseline: `bun run update-baseline`
    - When to update (after intentional performance changes)
    - Interpreting failure messages

- [ ] **Inline comments**: Add to test files
    - Explain why baseline comparison is used
    - Reference documentation

## Testing

- [ ] Unit tests for `tests/helpers/performance-baseline.ts`
    - Test baseline loading with valid file
    - Test baseline loading with missing file (fallback)
    - Test baseline loading with corrupted file
    - Test duration comparison logic
    - Test regression calculation
- [ ] Integration tests
    - Run refactored tests locally 10 times to verify stability
    - Artificially introduce regression to verify detection works
    - Test with missing baseline file to verify fallback

## Acceptance

- [ ] Both failing tests (`analysis-engine-lazy-loading.test.ts` and `performance-benchmarks.test.ts`) pass consistently in CI
- [ ] Tests fail appropriately when actual performance regresses beyond threshold
- [ ] CI test step completes successfully for 5 consecutive runs
- [ ] Test failure messages clearly indicate baseline vs actual vs threshold
- [ ] Documentation is clear and complete
- [ ] No performance test failures in CI for 1 week after deployment

## Fallback Plan

If baseline-driven approach proves too complex or unreliable:

1. Revert changes to test files
2. Apply Option 1 (increase absolute thresholds) as quick fix:
    - `analysis-engine-lazy-loading.test.ts`: 200ms → 500ms
    - `performance-benchmarks.test.ts`: 500ms → 800ms
3. Keep baseline utilities for future use
4. Re-evaluate approach after gathering more CI performance data

## References

- Investigation report identifying root cause
- Commit `03c9ea4`: Previous attempt to fix performance tests
- `.bun-performance.json`: Current baseline structure
- `scripts/test-performance.ts`: Reference implementation for baseline comparison

## Complexity Check

- **TODO Count**: 22
- **Depth**: 2 (main steps with subtasks)
- **Cross-deps**: 2 (baseline file, test utilities)
- **High Risk Items**: 1 (baseline accuracy)
- **Decision**: ✅ Proceed (within threshold for regular plan)
