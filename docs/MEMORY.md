# Memory System

**Persistent context management across AI agent sessions.**

## Overview

DevFlow's memory system solves the problem of AI agents forgetting context between conversations. It provides a structured way to maintain session continuity, track decisions, and manage progress using human-readable Markdown files.

## Quick Start

```bash
# Initialize memory bank (creates 4 core files)
devflow memory-init

# Or use the MCP tool
/memory-init
```

This creates `.devflow/memory/` with four template files ready to customize.

## Core Memory Files

The memory bank consists of four files, each serving a specific purpose:

### 1. activeContext.md

**Purpose:** What you're working on right now.

**Contains:**

- Current focus and active task
- Git branch and files being modified
- Active blockers and workarounds
- Recent changes (last 7 days)
- Next immediate steps

**When to update:** At the start of each work session, when switching tasks, or when encountering blockers.

### 2. progress.md

**Purpose:** Track what's done and what's next.

**Contains:**

- Current milestone and completion percentage
- Completed tasks with dates
- In-progress tasks with assignments
- Remaining tasks in backlog
- Completed milestones and lessons learned
- Project metrics and velocity

**When to update:** When completing tasks, starting new work, or reviewing sprint/milestone progress.

### 3. decisionLog.md

**Purpose:** Document why things are the way they are.

**Contains:**

- Architectural and technical decisions
- Context that led to each decision
- Rationale and reasoning
- Alternatives considered and why they were rejected
- Consequences and trade-offs
- Related decisions

**When to update:** After making significant technical or architectural decisions.

### 4. projectContext.md

**Purpose:** High-level project overview.

**Contains:**

- Project goals and success criteria
- Scope (what's in, what's out)
- Technical and business constraints
- Technology stack
- Key stakeholders
- Project structure and dependencies

**When to update:** During project setup, when scope changes, or when key constraints are added/removed.

## Memory Tools

DevFlow provides 7 MCP tools for working with memory:

### memory-init

Initialize the memory bank with template files.

```bash
/memory-init
```

Creates all four core memory files in `.devflow/memory/`.

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
/memory-save name=myNote frontmatter='{"tags":["important"],"created":"2024-01-15"}' content="Note content"
```

### memory-get

Retrieve a specific memory file.

```bash
/memory-get name=activeContext
```

Returns the full content including frontmatter if present.

### memory-list

List all memory files in the bank.

```bash
/memory-list
```

Returns a list of all available memory files with their metadata.

### memory-delete

Delete a memory file.

```bash
/memory-delete name=oldNote
```

Permanently removes the specified memory file.

### memory-context

Get combined session context (activeContext + progress).

```bash
/memory-context
```

Returns a combined view of your current work and progress - perfect for starting a new session.

### memory-update

Review and update all memory files with guided workflow.

```bash
/memory-update
```

Presents each memory file for review with suggestions on what to update.

## Memory Resources

DevFlow provides 2 MCP resources for automatic context loading:

### devflow://context/memory

**Auto-loaded combined context** (Cursor support)

Combines `activeContext.md` + `progress.md` into a single resource that's automatically available in Cursor's context.

### devflow://memory/{name}

**Individual memory file** by name.

Access any memory file directly:

- `devflow://memory/activeContext`
- `devflow://memory/progress`
- `devflow://memory/decisionLog`
- `devflow://memory/projectContext`
- `devflow://memory/customName`

## Memory Prompts

DevFlow provides 1 MCP prompt:

### memory:load

**Load specific memory** (Zed workaround for dynamic resources)

```bash
/memory:load name=activeContext
```

Loads and formats a memory file. This is a workaround for Zed until dynamic resource templates are supported.

## File Structure

```
.devflow/
└── memory/
    ├── activeContext.md      # Current work focus
    ├── progress.md           # Tasks and milestones
    ├── decisionLog.md        # Architecture decisions
    ├── projectContext.md     # Project overview
    └── [custom].md           # Your custom memories
```

## Frontmatter Support

All memory files support optional YAML frontmatter for metadata:

```markdown
---
title: 'My Memory'
created: '2024-01-15'
updated: '2024-01-20'
tags: ['important', 'auth']
category: 'technical'
---

# Memory Content

Your content here...
```

**Common frontmatter fields:**

- `title` - Display name
- `created` - Creation date
- `updated` - Last update date
- `tags` - Array of tags for categorization
- `category` - Category name

## Best Practices

### Keep It Current

- Update `activeContext.md` at the start of each session
- Archive old changes from `activeContext.md` after 7 days
- Update `progress.md` when completing or starting tasks
- Log decisions while context is fresh

### Be Concise

- Focus on what's actionable and relevant
- Remove outdated information
- Use bullets and short paragraphs
- Link to external docs instead of duplicating

### Make It Searchable

- Use consistent terminology
- Add tags to frontmatter
- Cross-reference related decisions
- Include task/issue IDs where applicable

### Review Regularly

- Run `/memory-update` weekly to review all files
- Clean up completed milestones in `progress.md`
- Archive old decisions that are no longer relevant
- Update project constraints as they change

## Agent Integration

### Cursor

Memory context is **automatically loaded** via the `devflow://context/memory` resource.

Use tools in Composer or Chat:

- `/memory-save` `/memory-get` `/memory-list` `/memory-delete`
- `/memory-context` `/memory-update` `/memory-init`

### Zed

Use prompts and tools in Assistant:

- `/memory:load name=activeContext` - Load specific memory
- `/memory-context` - Get combined context
- All standard tools available

### Claude Desktop

Use tools directly:

- `/memory-save name=... content=...`
- `/memory-get name=...`
- `/memory-list` `/memory-delete` `/memory-init`
- `/memory-context` `/memory-update`

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

### File not found error

Verify the memory file exists:

```bash
cat .devflow/memory/activeContext.md
```

Use exact name (case-sensitive, no .md extension in tool calls).

### Frontmatter parsing error

Ensure YAML frontmatter is valid:

- Must start and end with `---` on separate lines
- Use proper YAML syntax
- Quote strings with special characters

### Resource not auto-loading (Cursor)

1. Restart Cursor
2. Check MCP server is running
3. Verify `mcp.json` configuration
4. Check `.devflow/memory/` exists

## Related Documentation

- [Setup Guide](./SETUP.md) - Installation and configuration
- [Storage Architecture](./STORAGE-ARCHITECTURE.md) - Technical details
- [Security Policy](./SECURITY.md) - Security best practices

---

**Quick Reference:**

- Initialize: `/memory-init`
- Save: `/memory-save name=X content=Y`
- Get: `/memory-get name=X`
- List: `/memory-list`
- Context: `/memory-context`
- Update: `/memory-update`

**Auto-loaded in Cursor:** `devflow://context/memory`
