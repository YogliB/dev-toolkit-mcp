# Memory System

**Persistent context management across AI agent sessions.**

## Overview

DevFlow's memory system solves the problem of AI agents forgetting context between conversations. It provides a structured way to maintain session continuity, track decisions, and manage progress using human-readable Markdown files.

The memory system follows **Cline's 6-file Memory Bank structure**, used by 600k+ developers and optimized for AI agent understanding.

## Quick Start

```bash
# Initialize memory bank (creates 6 core files)
devflow memory-init

# Or use the MCP tool
/memory-init
```

This creates `.devflow/memory/` with six template files ready to customize.

## Core Memory Files

The memory bank consists of **6 core files** that work together in a hierarchical structure:

```
projectBrief.md (foundation)
├── productContext.md (why/how)
├── systemPatterns.md (architecture + decisions)
└── techContext.md (tech stack)
    ├── activeContext.md (current work)
    └── progress.md (tracking)
```

### 1. projectBrief.md

**Purpose:** Foundation document - source of truth for project scope.

**Contains:**

- What you're building (high-level description)
- Core requirements (must-haves)
- Primary and secondary goals
- Who it's for (target users/stakeholders)
- Success criteria
- Project scope (in/out)
- Timeline and key milestones
- Context (why now?)

**When to update:** Rarely - only when fundamental scope or goals change.

**Philosophy:** Keep it simple and high-level. Can be technical or non-technical. This is what you'd tell someone in 5 minutes about what you're building.

---

### 2. productContext.md

**Purpose:** Why the project exists and how it should work from a product perspective.

**Contains:**

- Why this project exists
- Problems being solved (with impact)
- Value proposition
- How it should work (UX goals)
- Core workflows and user scenarios
- Product principles
- What good looks like
- Metrics for success

**When to update:** When user experience changes, new features are scoped, or product direction shifts.

**Philosophy:** Product thinking - focus on user value and experience. This informs all technical decisions.

**References:** Built on `projectBrief.md`.

---

### 3. systemPatterns.md

**Purpose:** System architecture, design patterns, and architectural decisions.

**Contains:**

- System architecture overview
- Component relationships and data flow
- Design patterns in use
- **Key technical decisions** (with full context)
    - Context, Decision, Rationale
    - Alternatives considered
    - Consequences and trade-offs
- Critical implementation paths
- System boundaries
- Scalability, security, error handling
- Technical debt and planned improvements

**When to update:** When making architectural decisions, discovering patterns, or changing system design.

**Philosophy:** This is the "how it's built" file. Architectural decisions live here, not in a separate log.

**References:** Built on `projectBrief.md` and `productContext.md`.

**Note:** Replaces the concept of a separate `decisionLog.md`. Decisions are documented inline with architecture.

---

### 4. techContext.md

**Purpose:** Technologies, development setup, constraints, and tools.

**Contains:**

- Technology stack (languages, frameworks, databases)
- Frontend and backend technologies
- Infrastructure and DevOps setup
- Key dependencies (with versions)
- Development setup instructions
- Environment variables
- Development tools (linters, formatters, testing)
- Technical constraints (performance, compatibility, security)
- Tool usage patterns (version control, testing, deployment)
- Dependencies management
- Build and release process
- Documentation and resource links

**When to update:** When adding/changing technologies, updating dependencies, or modifying development processes.

**Philosophy:** Everything a developer needs to know to work with the technology stack.

**References:** Built on `projectBrief.md`.

---

### 5. activeContext.md

**Purpose:** Snapshot of current work, blockers, and recent activity (last 7 days).

**Contains:**

- Current focus (what you're working on NOW)
- Active blockers (with severity, impact, workarounds)
- Recent changes (last 7 days only)
- Context notes (important patterns, considerations)
- Next immediate steps

**When to update:** Daily or multiple times per day.

**Retention policy:** Keep last 7 days only. Archive older entries to `progress.md`.

**Philosophy:** Keep it current. This is what you read every time you start working.

**References:** References all upstream files (`projectBrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`).

---

### 6. progress.md

**Purpose:** Long-term project history, milestone tracking, and lessons learned.

**Contains:**

- Current milestone (status, tasks, completion %)
- Completed milestones (with learnings)
- Upcoming milestones
- Metrics and velocity (task completion, duration, trends)
- Known issues (with severity)
- Lessons learned and patterns discovered
- Risk tracking (realized and active risks)
- Archived changes (>30 days, compressed)

**When to update:** Weekly or at milestone boundaries.

**Retention policy:** Permanent; compress entries older than 90 days.

**Philosophy:** Historical record of what's been accomplished and what's working.

**References:** Receives archived content from `activeContext.md`.

---

## File Hierarchy

Files build upon each other in a clear dependency structure:

**Reading Order for New Sessions:**

1. `projectBrief.md` - Understand what you're building
2. `productContext.md` - Understand why and how
3. `systemPatterns.md` - Understand architecture
4. `techContext.md` - Understand technologies
5. `activeContext.md` - Understand current work
6. `progress.md` - Understand project status

**Editing Order When Working:**

1. `activeContext.md` - Update daily with current work
2. `systemPatterns.md` - Document architectural decisions as made
3. `progress.md` - Update weekly with milestone progress
4. `productContext.md` - Update when user experience changes
5. `techContext.md` - Update when tech stack changes
6. `projectBrief.md` - Update when scope changes

## Memory Tools

DevFlow provides 7 MCP tools for working with memory:

### memory-init

Initialize the memory bank with 6 core template files.

```bash
/memory-init
```

Creates all six core memory files in `.devflow/memory/` with the Cline structure.

**Output includes:**

- Files created
- File hierarchy visualization
- Structure type (`cline-6-file`)

---

### memory-save

Save or update a memory file.

```bash
/memory-save name=activeContext content="Working on authentication..."
```

**Parameters:**

- `name` (required) - Memory file name (without .md extension)
- `content` (required) - Content to save
- `frontmatter` (optional) - YAML frontmatter as object

**Example with frontmatter:**

```bash
/memory-save name=activeContext frontmatter='{"category":"active-work","updated":"2024-03-20"}' content="Current work..."
```

---

### memory-get

Retrieve a specific memory file.

```bash
/memory-get name=activeContext
```

Returns the full content including frontmatter if present.

---

### memory-list

List all memory files in the bank with metadata.

```bash
/memory-list
```

**Returns:**

- List of all memory files
- Metadata for each file:
    - `name` - File name
    - `isCoreFile` - Whether it's part of the 6 core files
    - `category` - File category (foundation, product, architecture, etc.)
    - `deprecated` - If file is deprecated (e.g., old `decisionLog.md`)
- Overall structure type:
    - `cline-6-file` - Current 6-file structure
    - `legacy-4-file` - Old 4-file structure (deprecated)
    - `partial` - Incomplete structure
    - `unknown` - No core files found
- Deprecation warnings if applicable

---

### memory-delete

Delete a memory file.

```bash
/memory-delete name=oldNote
```

Permanently removes the specified memory file.

---

### memory-context

Get combined session context from all 6 core files.

```bash
/memory-context
```

Returns a combined view of all 6 core memory files in hierarchical order. Perfect for starting a new session or refreshing context.

**Loads files in order:**

1. projectBrief
2. productContext
3. systemPatterns
4. techContext
5. activeContext
6. progress

**Handles missing files gracefully** - loads what's available and notes what's missing.

---

### memory-update

Review and update all memory files with guided workflow.

```bash
/memory-update
```

Presents each of the 6 core memory files for review with:

- Current content of each file
- File hierarchy explanation
- Update checklist for each file
- Guidance on what to review
- Tips for updates

**Use this when:**

- Context window is getting full
- Significant milestone completed
- User explicitly requests "update memory bank"
- Need to archive old content from `activeContext.md`

---

## Memory Resources

DevFlow provides 2 MCP resources for automatic context loading:

### devflow://context/memory

**Auto-loaded combined context** (Cursor support)

Combines all 6 core memory files into a single resource that's automatically available in Cursor's context.

**Contents:**

- projectBrief.md
- productContext.md
- systemPatterns.md
- techContext.md
- activeContext.md
- progress.md

Files are loaded in hierarchical order with section headers.

---

### devflow://memory/{name}

**Individual memory file** by name.

Access any memory file directly:

- `devflow://memory/projectBrief`
- `devflow://memory/productContext`
- `devflow://memory/systemPatterns`
- `devflow://memory/techContext`
- `devflow://memory/activeContext`
- `devflow://memory/progress`
- `devflow://memory/customName` (for custom files)

---

## Memory Prompts

DevFlow provides prompts for Zed and other agents:

### memory:load

**Load specific memory** (Zed workaround for dynamic resources)

```bash
/memory:load name=activeContext
```

Loads and formats a memory file. This is a workaround for Zed until dynamic resource templates are supported.

---

## File Structure

```
.devflow/
└── memory/
    ├── projectBrief.md       # Foundation
    ├── productContext.md     # Product thinking
    ├── systemPatterns.md     # Architecture + decisions
    ├── techContext.md        # Tech stack
    ├── activeContext.md      # Current work
    ├── progress.md           # Tracking
    └── [custom].md           # Your custom memories
```

## Frontmatter Support

All memory files support optional YAML frontmatter for metadata:

```markdown
---
category: 'active-work'
created: '2024-03-15T10:00:00Z'
updated: '2024-03-20T14:30:00Z'
tags: ['important', 'auth']
---

# Memory Content

Your content here...
```

**Standard categories:**

- `foundation` - projectBrief.md
- `product` - productContext.md
- `architecture` - systemPatterns.md
- `technical-setup` - techContext.md
- `active-work` - activeContext.md
- `tracking` - progress.md

**Common frontmatter fields:**

- `category` - File type category
- `created` - Creation date (ISO 8601)
- `updated` - Last update date (ISO 8601)
- `tags` - Array of tags for categorization

## Best Practices

### Keep It Current

- Update `activeContext.md` at the start of each session
- Archive old changes from `activeContext.md` after 7 days
- Update `progress.md` when completing or starting tasks
- Document decisions in `systemPatterns.md` while context is fresh

### Be Concise

- Focus on what's actionable and relevant
- Remove outdated information
- Use bullets and short paragraphs
- Link to external docs instead of duplicating

### Make It Searchable

- Use consistent terminology
- Add tags to frontmatter
- Cross-reference related sections
- Include task/issue IDs where applicable

### Review Regularly

- Run `/memory-update` weekly to review all files
- Clean up completed milestones in `progress.md`
- Archive old decisions that are no longer relevant
- Update constraints as they change

### Document Decisions Thoroughly

- Record decisions in `systemPatterns.md` as they're made (not retroactively)
- Include what was considered but not chosen
- Explain why chosen option was better
- Note any assumptions that could change

## Agent Integration

### Cursor

Memory context is **automatically loaded** via the `devflow://context/memory` resource.

Use tools in Composer or Chat:

- `/memory-save` `/memory-get` `/memory-list` `/memory-delete`
- `/memory-context` `/memory-update` `/memory-init`

All 6 core files are auto-loaded into context.

---

### Zed

Use prompts and tools in Assistant:

- `/memory:load name=activeContext` - Load specific memory
- `/memory-context` - Get combined context (all 6 files)
- All standard tools available

---

### Claude Desktop

Use tools directly:

- `/memory-save name=... content=...`
- `/memory-get name=...`
- `/memory-list` `/memory-delete` `/memory-init`
- `/memory-context` `/memory-update`

---

## Storage Details

- **Location:** `.devflow/memory/`
- **Format:** Markdown with optional YAML frontmatter
- **Encoding:** UTF-8
- **Size limit:** 2MB+ per file
- **Validation:** Zod schema validation on save
- **Security:** Path validation prevents directory traversal

## Troubleshooting

### Memory not loading

Check if `.devflow/memory/` exists:

```bash
ls -la .devflow/memory/
```

Run `memory-init` if missing.

---

### File not found error

Verify the memory file exists:

```bash
cat .devflow/memory/activeContext.md
```

Use exact name (case-sensitive, no .md extension in tool calls).

---

### Frontmatter parsing error

Ensure YAML frontmatter is valid:

- Must start and end with `---` on separate lines
- Use proper YAML syntax
- Quote strings with special characters

---

### Resource not auto-loading (Cursor)

1. Restart Cursor
2. Check MCP server is running
3. Verify `mcp.json` configuration
4. Check `.devflow/memory/` exists
5. Run `/memory-list` to verify structure

---

### Legacy structure detected

If `/memory-list` shows `"structure": "legacy-4-file"`:

1. You're using the old 4-file structure
2. See [MIGRATION.md](./MIGRATION.md) for upgrade guide
3. Old structure works but is deprecated
4. Migrate to 6-file structure for best experience

---

## Migration from Legacy Structure

If you have an older 4-file structure (`projectContext`, `activeContext`, `progress`, `decisionLog`):

**Quick Migration:**

1. Backup: `cp -r .devflow/memory .devflow/memory-backup`
2. Initialize: `/memory-init`
3. Split `projectContext.md` → `projectBrief.md`, `productContext.md`, `techContext.md`
4. Create `systemPatterns.md` from architecture sections
5. Migrate `decisionLog.md` content → `systemPatterns.md` "Key Technical Decisions"
6. Update `activeContext.md` and `progress.md` with cross-references
7. Verify: `/memory-list` shows `cline-6-file`
8. Delete old files

**Complete Guide:** See [MIGRATION.md](./MIGRATION.md) for detailed instructions.

**Deprecation Timeline:** See [DEPRECATION.md](./DEPRECATION.md) for deprecation schedule.

---

## Related Documentation

- [Setup Guide](./SETUP.md) - Installation and configuration
- [Storage Architecture](./STORAGE-ARCHITECTURE.md) - Technical details
- [Security Policy](./SECURITY.md) - Security best practices
- [Custom Instructions](./CUSTOM-INSTRUCTIONS.md) - AI agent guidance
- [Migration Guide](./MIGRATION.md) - Upgrade from 4-file to 6-file
- [Deprecation Notice](./DEPRECATION.md) - Deprecation timeline
- [Templates Documentation](../src/layers/memory/templates/TEMPLATES.md) - Template details

---

## Quick Reference

**Initialize:**

```bash
/memory-init
```

**Save:**

```bash
/memory-save name=X content=Y
```

**Get:**

```bash
/memory-get name=X
```

**List:**

```bash
/memory-list
```

**Context:**

```bash
/memory-context
```

**Update:**

```bash
/memory-update
```

**Auto-loaded in Cursor:**

```
devflow://context/memory
```

**File Hierarchy:**

```
projectBrief → productContext, systemPatterns, techContext
             → activeContext → progress
```

---

**Based on:** [Cline's Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank) methodology, proven with 600k+ users.
