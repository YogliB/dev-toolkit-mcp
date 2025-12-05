# Replace bun:sqlite with better-sqlite3

## Goal

Replace Bun-specific SQLite implementation (`bun:sqlite`) with Node.js-compatible `better-sqlite3` to enable cross-runtime compatibility and fix pre-push hook failures caused by Node.js test runner incompatibility.

## Scope

- **In Scope:**
  - Replace `bun:sqlite` with `better-sqlite3`
  - Update Drizzle ORM adapter from `drizzle-orm/bun-sqlite` to `drizzle-orm/better-sqlite3`
  - Update all analytics database code and tests
  - Ensure migrations continue to work
  - Update package.json dependencies
  - Verify Node.js compatibility
  - Restore git pre-push hook functionality
- **Out of Scope:**
  - Analytics feature enhancements
  - Database schema changes
  - Performance optimization beyond maintaining current baseline
  - Standalone executable distribution

## Risks

- **Performance regression**: `better-sqlite3` may have different performance characteristics
  - *Mitigation*: Run performance tests before/after; both libraries are highly optimized
- **API incompatibilities**: Different method signatures between libraries
  - *Mitigation*: Review API docs; both expose similar SQLite interfaces
- **Migration compatibility**: Different migration execution patterns
  - *Mitigation*: Test migrations on fresh database; Drizzle handles abstraction
- **Type changes**: Different TypeScript type definitions
  - *Mitigation*: Run type-check after changes; fix any type errors

## Dependencies

- `better-sqlite3` package installation
- `drizzle-orm/better-sqlite3` adapter
- Node.js native module compilation (better-sqlite3 uses native bindings)
- Existing Drizzle migrations remain unchanged

## Priority

High - Blocking git push operations and Node.js runtime compatibility

## Logging / Observability

- Database initialization logs remain unchanged
- Migration execution logs maintained
- WAL mode configuration preserved
- Error handling for database operations unchanged

## Implementation Plan (TODOs)

- [ ] **Step 1: Install Dependencies**
  - [ ] Add `better-sqlite3` to dependencies in `packages/core/package.json`
  - [ ] Add `@types/better-sqlite3` to devDependencies
  - [ ] Run `bun install` to update lockfile

- [ ] **Step 2: Update Database Module**
  - [ ] Replace `import { Database } from 'bun:sqlite'` with `import Database from 'better-sqlite3'` in `src/analytics/database.ts`
  - [ ] Replace `import { drizzle } from 'drizzle-orm/bun-sqlite'` with `import { drizzle } from 'drizzle-orm/better-sqlite3'`
  - [ ] Replace `import { migrate } from 'drizzle-orm/bun-sqlite/migrator'` with `import { migrate } from 'drizzle-orm/better-sqlite3/migrator'`
  - [ ] Update `Database` instantiation: `new Database(databasePath)` (API is nearly identical)
  - [ ] Verify WAL mode pragma execution syntax
  - [ ] Update migration path resolution if needed (replace `import.meta.dir` with `__dirname` or `import.meta.url` handling)

- [ ] **Step 3: Update Test Files**
  - [ ] Replace `import { Database } from 'bun:sqlite'` with `import Database from 'better-sqlite3'` in `tests/unit/analytics/database.test.ts`
  - [ ] Verify test database cleanup logic works with better-sqlite3
  - [ ] Update any test-specific database setup code

- [ ] **Step 4: Handle Migration Path Resolution**
  - [ ] Replace `import.meta.dir` with Node.js-compatible path resolution
  - [ ] Use `new URL('.', import.meta.url).pathname` or `fileURLToPath(new URL('.', import.meta.url))` pattern
  - [ ] Ensure migrations folder path resolves correctly in both dev and built dist

- [ ] **Step 5: Verify Type Safety**
  - [ ] Run `bun run type-check` to catch any TypeScript errors
  - [ ] Fix any type mismatches between Database types
  - [ ] Ensure `AnalyticsDatabase` type remains valid

- [ ] **Step 6: Test Functionality**
  - [ ] Run analytics unit tests: `bun test tests/unit/analytics`
  - [ ] Run full test suite: `bun test`
  - [ ] Verify database creation and migration execution
  - [ ] Verify session and tool call tracking works
  - [ ] Test with fresh database (delete `~/.devflow/analytics.db`)

- [ ] **Step 7: Verify Node.js Compatibility**
  - [ ] Run tests with Node.js test runner (vitest uses Node.js)
  - [ ] Verify pre-push hook passes
  - [ ] Test git push operation completes successfully

- [ ] **Step 8: Performance Validation**
  - [ ] Run performance tests to establish new baseline
  - [ ] Compare with previous bun:sqlite performance metrics
  - [ ] Document any significant differences

## Docs

- [ ] Update `README.md`: Remove any Bun-specific analytics runtime requirements
- [ ] Update `SETUP.md`: Document that analytics works with both Bun and Node.js
- [ ] Update `ARCHITECTURE.md`: Document SQLite library choice and rationale
- [ ] Add note to `CHANGELOG.md`: Breaking change - analytics now requires better-sqlite3 native module compilation

## Testing

- [ ] Unit tests for database module pass
- [ ] Unit tests for analytics tracking pass
- [ ] Integration tests with database pass
- [ ] Pre-push hook succeeds
- [ ] Manual test: Fresh database creation and migration
- [ ] Manual test: Session tracking across MCP server lifecycle

## Acceptance

- [ ] All tests pass with better-sqlite3
- [ ] Type-check passes with no errors
- [ ] Pre-push hook executes successfully
- [ ] Git push completes without test failures
- [ ] Analytics database creates and migrates successfully
- [ ] No performance regression >20% on database operations
- [ ] Works in both Bun and Node.js runtimes
- [ ] Documentation reflects new dependency

## Fallback Plan

If better-sqlite3 causes critical issues:
1. Revert changes via git
2. Restore test exclusions for analytics tests in pre-push hook
3. Document analytics as Bun-only feature
4. Consider alternative: conditional imports with runtime detection
5. Alternative library: `sql.js` (pure JS, no native deps, but slower)

## References

- better-sqlite3: https://github.com/WiseLibs/better-sqlite3
- Drizzle ORM better-sqlite3 adapter: https://orm.drizzle.team/docs/get-started-sqlite#better-sqlite3
- Previous conversation: Thread "Investigating git push in devflow"
- Related issue: Pre-push hook failing due to Node.js incompatibility with bun:sqlite

## Complexity Check

- TODO Count: 28
- Depth: 2
- Cross-deps: 2 (packages/core dependencies, vitest config)
- High Risk Items: 4 (performance, migration compatibility, native compilation, path resolution)
- **Decision:** Proceed - Complexity is manageable; changes are localized to analytics module; clear rollback path exists