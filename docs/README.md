# DevFlow Documentation

**Memory-only MCP server for maintaining context across AI agent sessions.**

---

## Quick Start

New to DevFlow? Start here:

1. **[Setup Guide](./SETUP.md)** - Installation and configuration
2. **[Memory System](./MEMORY.md)** - Complete memory documentation
3. **[Custom Instructions](./CUSTOM-INSTRUCTIONS.md)** - AI agent guidance

---

## Documentation Index

### Core Guides

| Document                                           | Purpose                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| [MEMORY.md](./MEMORY.md)                           | Memory system guide and API reference          |
| [CUSTOM-INSTRUCTIONS.md](./CUSTOM-INSTRUCTIONS.md) | AI agent guidance for Memory Bank              |
| [SETUP.md](./SETUP.md)                             | Installation, configuration, development setup |
| [TESTING.md](./TESTING.md)                         | Testing strategies and performance monitoring  |

### Migration & Deprecation

| Document                           | Purpose                                       |
| ---------------------------------- | --------------------------------------------- |
| [MIGRATION.md](./MIGRATION.md)     | Upgrade guide from 4-file to 6-file structure |
| [DEPRECATION.md](./DEPRECATION.md) | Deprecation timeline and affected features    |

### Reference

| Document                                             | Purpose                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| [STORAGE-ARCHITECTURE.md](./STORAGE-ARCHITECTURE.md) | Storage engine and repository design      |
| [SECURITY.md](./SECURITY.md)                         | Security policy and best practices        |
| [CI.md](./CI.md)                                     | CI/CD workflow and troubleshooting        |
| [CI-QUICK-REF.md](./CI-QUICK-REF.md)                 | Quick CI reference and pre-push checklist |

### Templates

| Document                                                    | Purpose                             |
| ----------------------------------------------------------- | ----------------------------------- |
| [TEMPLATES.md](../src/layers/memory/templates/TEMPLATES.md) | Memory bank templates documentation |

---

## Memory System Overview

DevFlow provides persistent context across sessions through **six core memory files** following the Cline Memory Bank structure:

### File Hierarchy

```
projectBrief.md (foundation)
├── productContext.md (why/how)
├── systemPatterns.md (architecture + decisions)
└── techContext.md (tech stack)
    ├── activeContext.md (current work)
    └── progress.md (tracking)
```

### Core Files

- **projectBrief.md** - Foundation document (what you're building)
- **productContext.md** - Why it exists and how it should work
- **systemPatterns.md** - Architecture, design patterns, and decisions
- **techContext.md** - Technologies, setup, and constraints
- **activeContext.md** - Current work and immediate focus
- **progress.md** - Tasks, milestones, and metrics

### Quick Commands

```bash
# Initialize memory bank (creates 6 files)
devflow memory-init

# Save memory
devflow memory-save name=activeContext content="Working on..."

# Get full session context (all 6 files)
devflow memory-context

# Review all memories with guided workflow
devflow memory-update

# List memories with structure detection
devflow memory-list
```

**[Full Memory Documentation →](./MEMORY.md)**

---

## Agent Integration

### Cursor

Add to `mcp.json`:

```json
{
	"mcpServers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve", "--stdio"]
		}
	}
}
```

Memory context auto-loads via `devflow://context/memory` resource (all 6 files).

### Zed

Add to `settings.json`:

```json
{
	"context_servers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve", "--stdio"]
		}
	}
}
```

Use `/memory-context` to load all 6 files.

### Claude Desktop

Add to `mcp.json`:

```json
{
	"mcpServers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve"]
		}
	}
}
```

**[Detailed Setup Instructions →](./SETUP.md)**

---

## For AI Agents

If you're an AI agent working with DevFlow:

1. **Read [CUSTOM-INSTRUCTIONS.md](./CUSTOM-INSTRUCTIONS.md)** for complete guidance
2. **Load ALL 6 files** at session start using `/memory-context`
3. **Update activeContext.md** frequently during work
4. **Document decisions** in systemPatterns.md with full context
5. **Archive aggressively** - keep activeContext.md to last 7 days only

**File Reading Order:**

1. projectBrief.md - Understand what you're building
2. productContext.md - Understand why and how
3. systemPatterns.md - Understand architecture
4. techContext.md - Understand technologies
5. activeContext.md - Understand current work
6. progress.md - Understand project status

---

## Development

### Quick Commands

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run type-check

# Lint & format
bun run lint:fix
bun run format

# Build
bun run build
```

### Project Structure

```
src/
├── core/              # Config, schemas, storage
├── layers/memory/     # Memory repository
│   └── templates/     # 6 core template files
├── mcp/               # MCP tools, resources, prompts
├── cli/               # CLI interface
└── index.ts          # Main server
```

**[Full Setup Guide →](./SETUP.md)**

---

## Key Features

- **7 Memory Tools** - init, save, get, list, delete, context, update
- **2 Resources** - Combined context (all 6 files) + individual files
- **1 Prompt** - Zed workaround for dynamic resources
- **Type-Safe** - Full TypeScript with Zod validation
- **Git-Friendly** - Plain Markdown, human-readable
- **Cross-Platform** - Works with Claude, Cursor, Zed
- **Zero Config** - Works immediately after `memory-init`
- **Cline-Compatible** - Same 6-file structure as 600k+ users

---

## Migration from Legacy Structure

If you have the old 4-file structure (`projectContext`, `activeContext`, `progress`, `decisionLog`):

**Quick Check:**

```bash
devflow memory-list
```

If output shows `"structure": "legacy-4-file"`, you should migrate.

**Migration Steps:**

1. Backup: `cp -r .devflow/memory .devflow/memory-backup`
2. Initialize: `devflow memory-init`
3. Split `projectContext.md` → 3 files (projectBrief, productContext, techContext)
4. Create `systemPatterns.md` from architecture sections
5. Migrate `decisionLog.md` → `systemPatterns.md` "Key Technical Decisions"
6. Update `activeContext.md` and `progress.md`
7. Verify: `devflow memory-list` shows `cline-6-file`

**[Complete Migration Guide →](./MIGRATION.md)**

**[Deprecation Timeline →](./DEPRECATION.md)**

---

## Troubleshooting

### Memory not loading

```bash
ls -la .devflow/memory/
devflow memory-list
```

Run `devflow memory-init` if missing or incomplete.

### Legacy structure detected

```bash
devflow memory-list
```

If shows `"structure": "legacy-4-file"`, see [MIGRATION.md](./MIGRATION.md).

### Server won't start

```bash
bun install
bun run dev 2>&1
```

### Tests failing

```bash
bun test --reporter=verbose
```

**[Full Testing Guide →](./TESTING.md)**

---

## Resources

**External:**

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank)

**Documentation:**

- [Memory System](./MEMORY.md)
- [Custom Instructions](./CUSTOM-INSTRUCTIONS.md)
- [Migration Guide](./MIGRATION.md)
- [Storage Architecture](./STORAGE-ARCHITECTURE.md)
- [Security Policy](./SECURITY.md)

---

**Ready to start?** Follow the [Setup Guide](./SETUP.md) or dive into the [Memory System](./MEMORY.md).

**Using AI agents?** Read [Custom Instructions](./CUSTOM-INSTRUCTIONS.md) for guidance.

**Migrating?** See [Migration Guide](./MIGRATION.md) for upgrade instructions.
