# DevFlow Documentation

**Memory-only MCP server for maintaining context across AI agent sessions.**

---

## Quick Start

New to DevFlow? Start here:

1. **[Setup Guide](./SETUP.md)** - Installation and configuration
2. **[Memory System](./MEMORY.md)** - Complete memory documentation
3. **[Testing Guide](./TESTING.md)** - Running and writing tests

---

## Documentation Index

### Core Guides

| Document                   | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| [MEMORY.md](./MEMORY.md)   | Memory system guide and API reference          |
| [SETUP.md](./SETUP.md)     | Installation, configuration, development setup |
| [TESTING.md](./TESTING.md) | Testing strategies and performance monitoring  |

### Reference

| Document                                             | Purpose                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| [STORAGE-ARCHITECTURE.md](./STORAGE-ARCHITECTURE.md) | Storage engine and repository design      |
| [SECURITY.md](./SECURITY.md)                         | Security policy and best practices        |
| [CI.md](./CI.md)                                     | CI/CD workflow and troubleshooting        |
| [CI-QUICK-REF.md](./CI-QUICK-REF.md)                 | Quick CI reference and pre-push checklist |

---

## Memory System Overview

DevFlow provides persistent context across sessions through four core memory files:

- **activeContext.md** - Current work and immediate focus
- **progress.md** - Tasks, milestones, and metrics
- **decisionLog.md** - Architectural decisions with rationale
- **projectContext.md** - Project overview and constraints

### Quick Commands

```bash
# Initialize memory bank
devflow memory-init

# Save memory
devflow memory-save name=activeContext content="Working on..."

# Get session context
devflow memory-context

# Review all memories
devflow memory-update
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

Memory context auto-loads via `devflow://context/memory` resource.

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
├── mcp/               # MCP tools, resources, prompts
├── cli/               # CLI interface
└── index.ts          # Main server
```

**[Full Setup Guide →](./SETUP.md)**

---

## Key Features

- **7 Memory Tools** - init, save, get, list, delete, context, update
- **2 Resources** - Combined context + individual files
- **1 Prompt** - Zed workaround for dynamic resources
- **Type-Safe** - Full TypeScript with Zod validation
- **Git-Friendly** - Plain Markdown, human-readable
- **Cross-Platform** - Works with Claude, Cursor, Zed
- **Zero Config** - Works immediately after `memory-init`

---

## Troubleshooting

### Memory not loading

```bash
ls -la .devflow/memory/
```

Run `devflow memory-init` if missing.

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

**Documentation:**

- [Memory System](./MEMORY.md)
- [Storage Architecture](./STORAGE-ARCHITECTURE.md)
- [Security Policy](./SECURITY.md)

---

**Ready to start?** Follow the [Setup Guide](./SETUP.md) or dive into the [Memory System](./MEMORY.md).
