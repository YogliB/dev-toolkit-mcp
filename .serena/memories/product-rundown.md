# DevFlow MCP: Product Rundown

## What We're Building

**DevFlow MCP** is an open-source Model Context Protocol (MCP) server that solves the **context fragmentation problem** for AI coding agents. It provides a unified, git-friendly system for managing project knowledge across four independent layers.

### The Core Problem We Solve

AI agents working on projects face these challenges:

1. **Fragmented Rules** - Coding standards scattered across `.cursorrules`, `AGENTS.md`, wikis, READMEs
2. **Lost Context** - Memory resets between sessions (e.g., Cline's limitation)
3. **Human-First Docs** - Documentation optimized for humans, not LLMs
4. **Manual Planning** - Task lists require manual status updates; no execution validation

**DevFlow consolidates all of this** into one system that works with any MCP-compatible AI agent.

---

## The Four Layers (Core Value Proposition)

### 1. Rules Layer: Project Standards Engine

**Purpose**: Define and enforce project-specific coding standards, conventions, and constraints.

**User Problem It Solves**:

- Agents forget project conventions across sessions
- Rules scattered across different files and formats
- Hard to sync rules between agents (Cursor, Claude, Zed, etc.)

**Key Features**:

- **Three activation modes**:
    - `always` - Global rules (e.g., "never use `any` in TypeScript")
    - `manual` - Checklists (e.g., "performance optimization steps")
    - `context` - File-scoped rules (e.g., "API endpoints must follow REST patterns")
- **Priority system** - Resolve conflicts between rules automatically
- **Cross-agent format generation** - Export to `.cursorrules`, `AGENTS.md`, or native MCP
- **Validation tools** - Check code compliance against active rules

**File Format**: `.mdc` (Markdown Component) files in `.devflow/rules/`

**Example Rule**:

```yaml
id: typescript-standards
name: TypeScript Coding Standards
type: always
priority: 8
tags: [typescript, code-quality]
globs: ['src/**/*.ts']
```

---

### 2. Memory Layer: Session Continuity & Knowledge Base

**Purpose**: Maintain conversation context, architectural decisions, and progress across sessions.

**User Problem It Solves**:

- Agents forget context when sessions end (Cline's biggest limitation)
- Architectural decisions aren't documented or tracked
- No way to maintain blockers, recent changes, or progress
- Team doesn't know what work was planned, in-progress, or completed

**Key Features**:

- **Four-file architecture**:
    - `activeContext.md` - Current focus, active blockers, recent changes
    - `progress.md` - Milestone tracking, task completion, metrics
    - `decisionLog.md` - Architectural decisions with rationale and alternatives
    - `projectContext.md` - Team info, constraints, tech stack, goals
- **Semantic search** - Find relevant decisions, blockers, changes via SQLite (Phase 2)
- **Decision logging** - Track decisions with context, rationale, alternatives, outcomes
- **Blocker tracking** - Log blockers, track resolution time, auto-archive old ones
- **Change logs** - Auto-archive changes older than 30 days; always visible in active context

**Storage**: `.devflow/memory/` (all Markdown, git-friendly)

**Example Memory Structure**:

```markdown
# Active Context

## Current Focus

Working on OAuth authentication (Plan: feature-123, Task: session-middleware)

## Active Blockers

- Waiting for Redis configuration from DevOps
- Need to clarify token expiration policy with security team

## Recent Changes (Last 7 Days)

- 2024-03-20: Implemented session middleware scaffolding
- 2024-03-19: Completed OAuth provider integration

## Context Notes

- Related rule: #47 (REST over GraphQL)
- See decision log #47 for architectural rationale
```

---

### 3. Documentation Layer: AI-Optimized Knowledge Base

**Purpose**: Maintain structured, validated, LLM-friendly project documentation.

**User Problem It Solves**:

- Documentation written for humans, not AI agents
- Inconsistent structure makes it hard for agents to parse
- No automated validation of doc freshness or accuracy
- Documentation gets out of sync with code/decisions

**Key Features**:

- **Three template types**: API, Architecture, Guide
- **Consistency validation** - Check headings, terminology, code examples
- **LLM optimization** - Generate model-specific views of docs
- **Cross-reference linking** - Track doc ↔ memory ↔ rules dependencies

**Storage**: `docs/**/*.md` (standard GitHub-style docs)

**Status for MVP**: Stub (basic structure, full implementation in Phase 3+)

---

### 4. Planning Layer: Validated Task Management

**Purpose**: Feature planning with automatic execution validation and dependency tracking.

**User Problem It Solves**:

- Task lists become stale; no automatic validation of completion
- Complexity estimates are guesses; no tracking
- Dependencies between tasks aren't clear
- Manual status updates; no automatic detection of actual progress

**Key Features**:

- **Task decomposition** - Break features into subtasks with complexity scores (1-10)
- **Dependency management** - Define task relationships, order, blocking
- **Automatic validation** - Detect task completion via:
    - File monitoring (code files changed)
    - Test execution (tests passing)
    - Git commits (matching criteria)
- **Confidence scoring** - Track probability of completion (0-1)
- **Milestone grouping** - Organize tasks into milestones with progress tracking

**Storage**: `.devflow/plans/{active,completed}/*.json` (JSON for structured data)

**Status for MVP**: Stub (basic CRUD, full auto-validation in Phase 3+)

---

## Cross-Layer Integration (The Secret Sauce)

### Unified Context Loading

When an agent starts a session with DevFlow, it automatically receives **consolidated context**:

```markdown
# DevFlow Project Context (Auto-Loaded)

## Active Rules (3 relevant)

- TypeScript Standards: Explicit types, no `any`
- REST API Patterns: Use REST over GraphQL (see decision #47)
- Code Review: All PRs need 2 approvals

## Current Focus

Working on OAuth authentication (Plan: feature-123)
Status: 3/7 tasks complete
Next: Implement session middleware

## Active Blockers

- Waiting for Redis setup (blocked 2 days)

## Recent Decisions

- #47: REST over GraphQL (Jan 15) - team familiarity, simpler debugging
- #46: Session-based auth over JWT (Jan 12)

## Key Documentation

- See docs/architecture/auth.md for OAuth flow
- See docs/api/endpoints.md for endpoint patterns
```

### Bidirectional Linking

Layers automatically reference each other:

- **Rules → Memory**: Rule links to the decision that drove it
- **Memory → Planning**: Decision notes link to related tasks
- **Planning → Documentation**: Tasks reference docs they implement
- **Documentation → Rules**: Docs cite rules they enforce

### Consistency Validation

The `sync:validate` tool ensures integrity across all layers:

- Memory decisions reference valid, active rules
- Plans link to documented features
- Rules cite existing documentation
- Orphaned content detection

---

## MCP Primitives (How It Works)

### Tools (Actionable Operations)

These are "verbs" - things agents can DO:

**Rules Tools**:

- `rules:create` - Add new rule
- `rules:update` - Modify rule
- `rules:validate` - Check code against rules
- `rules:activate/deactivate` - Toggle rule status
- `rules:list` - Show active rules
- `rules:export` - Export to `.cursorrules` or `AGENTS.md`

**Memory Tools**:

- `memory:context:set` - Update active context (focus, blockers, files)
- `memory:decision:log` - Record an architectural decision
- `memory:blocker:add/resolve` - Track blockers
- `memory:change:log` - Log recent changes
- `memory:progress:task` - Update task progress
- `memory:recall` - Search memory (decisions, context, changes)

**Planning Tools**:

- `plan:create` - Create feature plan
- `plan:task:create` - Add task to plan
- `plan:task:validate` - Check task completion
- `plan:milestone:create` - Group tasks into milestone

**Documentation Tools** (MVP: stubs):

- `doc:create` - Create doc file
- `doc:validate` - Check consistency

### Resources (Auto-Loaded Context)

These are "nouns" - things agents automatically get:

**Rules Resources**:

- `devflow://context/rules` - All active rules (auto-loaded)
- `devflow://rules/{rule-id}` - Individual rule details

**Memory Resources**:

- `devflow://context/memory` - Active context summary (auto-loaded)
- `devflow://memory/active` - Current focus and blockers
- `devflow://memory/progress` - Milestone and task progress
- `devflow://memory/decisions` - Recent decisions with rationale

**Planning Resources**:

- `devflow://plans/active` - Current plans and tasks
- `devflow://plans/{plan-id}` - Individual plan details

### Prompts (Workflow Templates)

These are "recipes" - reusable workflows:

- `init_memory` - Initialize memory at project start
- `init_session` - Load context at session start
- `decision_template` - Structure for logging decisions
- `weekly_summary` - Summarize week's progress

---

## Why DevFlow vs Alternatives?

| Feature              | Cline Memory | SWE Planning MCP | Project KG  | **DevFlow**            |
| -------------------- | ------------ | ---------------- | ----------- | ---------------------- |
| Session Memory       | ✅ 4-file    | ❌               | ❌          | ✅ Cline-inspired      |
| Task Planning        | ❌           | ✅ Basic         | ✅ Advanced | ✅ **Auto-validation** |
| Documentation Layer  | ❌           | ❌               | ❌          | ✅ **AI-optimized**    |
| Rules Engine         | ❌           | ❌               | ❌          | ✅ **Cross-agent**     |
| Automatic Validation | ❌ Manual    | ❌ Manual        | ⚠️ Manual   | ✅ **Automatic**       |
| Cross-Layer Linking  | N/A          | N/A              | N/A         | ✅ **Bidirectional**   |
| Git-Friendly         | ✅           | ⚠️               | ❌          | ✅ **Markdown + JSON** |

---

## MVP Scope: What We're Shipping First

### In MVP (Weeks 1-3)

✅ File storage infrastructure (Markdown + JSON)
✅ Rules Layer: Load, validate, expose via MCP
✅ Memory Layer: CRUD operations, decision logging
✅ MCP tools: All core operations
✅ MCP resources: Auto-loaded context
✅ CLI commands: `devflow init`, `devflow serve`
✅ Integration: Claude Desktop + Cursor examples
✅ Testing: >80% coverage, integration tests

### Out of MVP (Later Phases)

❌ Full documentation layer optimization
❌ Advanced planning auto-validation
❌ SQLite semantic search (Phase 2)
❌ Management UI (Tauri + Svelte)
❌ Team collaboration features
❌ Multi-database backend support

---

## Success Metrics for MVP

When MVP is **done**, we can confirm:

1. **Functional**: File storage works reliably with zero data loss
2. **Usable**: Works with Claude Desktop and Cursor out of the box
3. **Complete**: All core features covered by integration tests (>80% coverage)
4. **Polished**: No console errors, clean CLI output
5. **Documented**: Clear README, quick start guide, integration examples
6. **Extensible**: Each layer can be used independently

---

## Target Users

### Primary

- **AI-First Developers** - Using Claude, Cursor, Zed for coding
- **Teams with Multiple Agents** - Need consistent context across tools
- **Open-Source Projects** - Want rules/memory to onboard contributors

### Secondary

- **Solo Developers** - Using Claude Desktop for side projects
- **Agencies** - Managing rules/memory across client projects
- **Internal Tool Teams** - Standardizing conventions across repos

---

## Tech Stack (Building Blocks)

- **TypeScript 5.7+** - Type safety, developer experience
- **fastmcp 3.23.1** - Simplified MCP SDK (39% less boilerplate)
- **Bun 1.3.2** - Fast runtime, package manager
- **Vitest 2.1.8** - Testing framework
- **Zod 4.1.12** - Schema validation
- **gray-matter 4.0.3** - Markdown frontmatter parsing
- **Markdown/JSON** - Git-friendly storage formats
- **Node.js fs/path** - Built-in file I/O

---

## Go-To-Market Strategy

### Phase 0 (Current): MVP Release

- **Target**: DevFlow works, is documented, integrates with Claude Desktop + Cursor
- **Goal**: Get real feedback from early users

### Phase 1: Community Adoption

- **Launch**: Product Hunt, Hacker News, Dev communities
- **Marketing**: Blog posts on AI context management, agent workflows
- **Target**: 100 GitHub stars, 50 active projects using DevFlow

### Phase 2: Enterprise Features

- **Add**: Team features, dashboards, analytics
- **Target**: Small teams, agencies wanting shared context

### Phase 3: Agent Ecosystem

- **Add**: Zed, VSCode, custom agents integrations
- **Target**: Multi-agent workflows, complex projects

---

## Key Differentiators

1. **Only MCP server with all four layers** - Rules + Memory + Docs + Planning
2. **Automatic validation** - Tasks auto-validate via file, test, commit monitoring
3. **Cross-agent compatibility** - Works with Claude, Cursor, Zed, VSCode, custom
4. **Git-friendly** - All data stored as readable Markdown/JSON, version-controlled
5. **No vendor lock-in** - Pure file-based storage, can fork/export anytime
6. **Cline-inspired memory** - Proven 4-file architecture, battle-tested by thousands

---

## Competitive Landscape

**Cline Memory Bank** - Best memory system for single agent, but:

- ❌ Only for Cline
- ❌ No rules engine
- ❌ No planning
- ❌ No docs layer
- ❌ Can't export to other agents

**Software Planning MCP** - Good task planning, but:

- ❌ No memory system
- ❌ No rules engine
- ❌ Manual validation
- ❌ Limited documentation support

**Project KG Tools** - Graph-based knowledge, but:

- ❌ Complex setup
- ❌ Manual validation
- ❌ Not agent-focused
- ❌ Vendor-specific

**DevFlow** - Unified, automatic, extensible:

- ✅ All four layers
- ✅ Automatic validation
- ✅ Works with any MCP agent
- ✅ Git-friendly, no vendor lock-in

---

## Revenue Model (Post-MVP)

**Open-Source Core** (free, MIT license)

- All four layers
- File-based storage
- Community support

**DevFlow Cloud** (optional, paid)

- Hosted MCP server
- Team collaboration
- Advanced analytics
- Backup/sync across devices
- Dedicated support

**DevFlow Pro** (optional, paid)

- Management UI (Tauri)
- Advanced planning features
- LLM-optimized documentation
- Custom integrations
- Priority support

---

## Development Status

**Current**: Foundation complete, MVP implementation starting

- ✅ Tooling, testing, CI/CD setup
- ✅ Storage engine scaffolded
- ✅ Schemas and validation
- ⏳ Wire storage to MCP server
- ⏳ Implement MCP tools
- ⏳ Implement MCP resources
- ⏳ CLI commands
- ⏳ Integration testing

**Estimated**: 2-3 weeks to MVP release

---

## What We're NOT Building (Scope Boundaries)

- ❌ Database backend (files only for MVP)
- ❌ Team collaboration (single project focus)
- ❌ Web dashboard (CLI + MCP only for MVP)
- ❌ Custom agents (only existing MCP agents)
- ❌ Advanced planning algorithms (basic CRUD)
- ❌ Multi-language support (English only for MVP)
- ❌ SaaS service (self-hosted only for MVP)

---

## Open Questions for Validation

1. **Memory System**: Is 4-file architecture from Cline sufficient, or do agents need more?
2. **Rules Format**: Should we auto-sync `.cursorrules` ↔ `AGENTS.md` ↔ DevFlow rules?
3. **Planning Validation**: How do we best detect task completion (file changes, tests, commits)?
4. **Performance**: Will Markdown search be fast enough, or do we need SQLite sooner?
5. **Integration**: Should we add Zed/VSCode support before MVP or after?

---

**Summary**: DevFlow is the first MCP server to unify project knowledge management across rules, memory, docs, and planning, with automatic validation and cross-agent compatibility. It solves the context fragmentation problem for AI coding agents.
