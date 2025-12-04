# Dashboard Auto Port Detection and Browser Launch

## Goal

Enhance dashboard server with automatic port detection and optional browser auto-launch using environment variables only.

## Scope

- **In Scope:**
    - Implement automatic free port detection when port is not specified
    - Add browser auto-launch feature when dashboard starts
    - Add `DEVFLOW_DASHBOARD_AUTO_OPEN` environment variable (default: false)
    - Port fallback strategy: env var → auto-detect
    - Better port conflict error handling with retry logic
    - Update documentation for new features
- **Out of Scope:**
    - Configuration files (keeping it simple with env vars only)
    - Dashboard authentication/security settings
    - Multiple dashboard instances
    - Dashboard theme/UI configuration
    - Custom dashboard routes configuration

## Risks

- **Port detection race conditions**: Port might be taken between detection and server start
    - **Mitigation**: Retry logic with multiple port attempts, use Bun.serve() error handling
- **Browser launch platform differences**: Opening browser varies by OS
    - **Mitigation**: Use Bun's built-in capabilities or well-tested approach, graceful fallback if fails
- **Auto-open interrupts workflow**: Browser launching might be disruptive
    - **Mitigation**: Default to `false`, only open when explicitly enabled
- **Port exhaustion**: Could fail to find available port in restricted environments
    - **Mitigation**: Configurable port range (3000-3100), clear error messages

## Dependencies

- Bun runtime (already in use)
- No external dependencies needed

## Priority

Medium

## Logging / Observability

- Log final port selection (env var/auto-detected)
- Log browser launch status (success/failure/disabled)
- Info log when using auto-detected port
- Debug log for port detection attempts
- Warn if all ports in range are busy

## Implementation Plan (TODOs)

- [x] **Step 1: Implement Auto Port Detection**
    - [x] Create `packages/core/src/dashboard/port-finder.ts`
    - [x] Implement `findAvailablePort(preferredPort?: number)` function
    - [x] Use Bun's TCP socket check to test port availability
    - [x] Add retry logic with max attempts (try ports 3000-3100)
    - [x] Return `{ port: number, wasAutoDetected: boolean }`
    - [x] Add error handling for port exhaustion
    - [ ] Add unit tests for port detection logic

- [x] **Step 2: Add Browser Auto-Launch**
    - [x] Create `packages/core/src/dashboard/browser-launcher.ts`
    - [x] Implement `openBrowser(url: string)` function
    - [x] Use Bun's `Bun.spawn()` with platform-specific commands
    - [x] Support macOS (`open`), Linux (`xdg-open`), Windows (`start`)
    - [x] Add graceful error handling (log warning, don't crash)
    - [x] Add 1-second delay after server start before opening
    - [x] Return boolean indicating success/failure

- [x] **Step 3: Update Dashboard Server**
    - [x] Modify `startDashboardServer()` to accept optional config object
    - [x] Add `autoOpen?: boolean` parameter
    - [x] Integrate port detection when port not specified
    - [x] Call `openBrowser()` after successful server start if `autoOpen: true`
    - [x] Update logging to indicate if port was auto-detected
    - [x] Improve port conflict error messages

- [x] **Step 4: Update MCP Server Integration**
    - [x] Add `DEVFLOW_DASHBOARD_AUTO_OPEN` env var parsing in server.ts
    - [x] Update `parseBoolean()` usage for auto-open setting
    - [x] Pass auto-open config to `startDashboardServer()`
    - [x] Update port parsing to handle undefined (for auto-detect)
    - [x] Modify port selection: env var specified → use it, else → auto-detect
    - [x] Ensure browser launch doesn't block MCP stdio

- [x] **Step 5: Enhance Port Selection Logic**
    - [x] If `DEVFLOW_DASHBOARD_PORT` is set, use it (existing behavior)
    - [x] If not set, call `findAvailablePort()` to auto-detect
    - [x] Log different messages for explicit vs auto-detected ports
    - [x] Handle port conflict on explicit port with clear error
    - [x] Add fallback retry on auto-detected port conflict

## Docs

- [x] **docs/SETUP.md**: Update Dashboard Server section
    - [x] Document `DEVFLOW_DASHBOARD_AUTO_OPEN` environment variable
    - [x] Update `DEVFLOW_DASHBOARD_PORT` docs to mention auto-detection
    - [x] Explain auto port detection (when port not specified)
    - [x] Add example of using auto-open
    - [x] Document port range for auto-detection (3000-3100)
- [x] **docs/ARCHITECTURE.md**: Update Dashboard Server Integration
    - [x] Document port detection algorithm
    - [x] Explain browser launcher implementation
    - [x] Document environment variable defaults
- [x] **Root README.md**: Update Quick Start
    - [x] Mention automatic port detection feature
    - [x] Add note about browser auto-launch option

## Testing

- [ ] **Unit tests**
    - [ ] Test `findAvailablePort()` returns available port
    - [ ] Test `findAvailablePort(3000)` tries preferred port first
    - [ ] Test port detection with all ports busy (error case)
    - [ ] Test `openBrowser()` platform detection
    - [ ] Test browser launch error handling
    - [ ] Test parseBoolean for auto-open env var
- [ ] **Integration tests**
    - [ ] Test dashboard starts with explicit port from env var
    - [ ] Test dashboard starts with auto port detection
    - [ ] Test dashboard handles port conflict gracefully
    - [ ] Test browser launches when `DEVFLOW_DASHBOARD_AUTO_OPEN=true`
    - [ ] Test browser launch failure doesn't crash server
    - [ ] Test auto-open disabled by default
- [ ] **Manual testing**
    - [ ] Start without `DEVFLOW_DASHBOARD_PORT` (should auto-detect)
    - [ ] Start with `DEVFLOW_DASHBOARD_PORT=3000` (should use 3000)
    - [ ] Test with port 3000 already in use (should find next available)
    - [ ] Test `DEVFLOW_DASHBOARD_AUTO_OPEN=true` (browser should open)
    - [ ] Test on macOS, Linux, Windows if possible

## Acceptance

- [x] When `DEVFLOW_DASHBOARD_PORT` not set, dashboard auto-detects available port
- [x] Auto-detection tries ports in range 3000-3100
- [x] When `DEVFLOW_DASHBOARD_PORT` is set, that specific port is used
- [x] Port conflicts on explicit port show clear error message
- [x] Port conflicts on auto-detected port trigger retry
- [x] Browser opens automatically when `DEVFLOW_DASHBOARD_AUTO_OPEN=true`
- [x] Browser auto-launch defaults to `false`
- [x] Browser launch failure logs warning but doesn't crash server
- [x] Clear logging shows whether port was explicit or auto-detected
- [x] Server works without any environment variables (auto-detects port, no browser launch)
- [x] Documentation explains both features clearly
- [ ] All tests pass

## Fallback Plan

If auto port detection is problematic:
1. Fall back to fixed default port (3000) with clear error on conflict
2. Require explicit `DEVFLOW_DASHBOARD_PORT` in documentation
3. Keep retry logic simple (only 2-3 attempts)

If browser auto-launch causes issues:
1. Keep as opt-in only (already default: false)
2. Document manual browser access as primary method
3. Add FAQ for troubleshooting browser launch

## References

- Dashboard server: `packages/core/src/dashboard/server.ts`
- MCP server: `packages/core/src/server.ts`
- Bun.serve() docs: https://bun.sh/docs/api/http
- Bun.spawn() docs: https://bun.sh/docs/api/spawn

## Complexity Check

- TODO Count: 28
- Depth: 2 (max nesting level)
- Cross-deps: 3 (port finder → browser launcher → dashboard server → MCP server)
- High Risk Items: 2 (port detection race conditions, browser platform differences)
- **Decision:** Proceed (simplified scope, no config files, atomic tasks)