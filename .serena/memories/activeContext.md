# DevFlow MCP - Active Context

## Current Focus

**Memory MCP Fast Track** - Building memory layer MCP tools/resources to replace Serena/manual memory-bank editing.

**Masterplan:** `docs/masterplans/memory-mcp-fast-track.md`

## Active Work

**Phase:** Planning Complete → Ready to Start Implementation

**Next PR:** PR1 - Server Initialization + Wire MemoryRepository

- Files: `src/index.ts`, `src/core/config.ts` (new)
- ETA: 1-2h dev + 15m review
- Goal: Initialize StorageEngine and MemoryRepository in fastmcp server

## Recent Changes

### Session: Masterplan Creation

- ✅ Created comprehensive masterplan for Option A (Memory MCP Fast Track)
- ✅ Defined 4 sequential PRs with clear dependencies
- ✅ Low risk assessment confirmed (storage layer already tested)
- ✅ Timeline: 5-7h total implementation time
- ✅ Success criteria: Replace Serena with native MCP integration

## Immediate Next Steps

1. **PR1: Server Initialization** (1-2h)
    - Detect project root (look for .git, package.json, or use cwd)
    - Initialize StorageEngine({ rootPath, debug: false })
    - Initialize MemoryRepository({ storageEngine, memorybankPath: 'memory-bank' })
    - Add DEVFLOW_ROOT env var override
    - Error handling for initialization failures

2. **PR2: MCP Memory Tools** (2-3h)
    - Implement memory:get, memory:save, memory:list, memory:delete
    - Wire to MemoryRepository methods
    - Zod validation for inputs
    - Comprehensive error handling

3. **PR3: MCP Memory Resources** (1h)
    - devflow://context/memory (auto-loaded activeContext + progress)
    - devflow://memory/{name} (individual files)

4. **PR4: Integration Tests + Docs** (1-2h)
    - End-to-end MCP flow tests
    - Update README and QUICKSTART with usage examples

## Key Decisions Made

**Scope:**

- Memory layer ONLY for fast track
- Defer Rules, Docs, Planning to later phases
- Goal: Replace Serena by end of day

**Architecture:**

- Use fastmcp (39% less boilerplate)
- File-based storage (no SQLite for MVP)
- Auto-detect project root with env var override
- Backward compatible with existing memory-bank files

**Deployment:**

- 4 sequential PRs (each PR depends on previous)
- Low risk (storage layer tested, no breaking changes)
- Easy rollback (git revert, no data loss)

## Known Issues / Blockers

None currently. Ready to start PR1.

## Team/Ownership

- Project Lead: Yogev
- Focus: Memory MCP Fast Track
- Timeline: 1 day (5-7h)
- Risk: Low

## Context Continuity Notes

- Foundation is 95% complete (storage + repository tested)
- Just need to wire existing MemoryRepository to fastmcp tools/resources
- All existing memory-bank files will work without migration
- Can still edit files manually (backward compatible)

---

**Last Updated:** Masterplan Creation Session
**Next Review:** After PR1 implementation
