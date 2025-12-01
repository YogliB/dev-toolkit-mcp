# DevFlow Documentation

**Code analysis MCP server for understanding project structure, symbols, patterns, and dependencies.**

---

## Quick Start

New to DevFlow? Start here:

1. **[Setup Guide](./SETUP.md)** - Installation and configuration
2. **[Usage Guide](./USAGE.md)** - Usage examples and workflows
3. **[Architecture](./ARCHITECTURE.md)** - Technical architecture documentation

---

## Documentation Index

### Core Guides

| Document                             | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| [SETUP.md](./SETUP.md)               | Installation, configuration, development setup |
| [USAGE.md](./USAGE.md)               | Usage examples, workflows, and integration     |
| [TESTING.md](./TESTING.md)           | Testing strategies and performance monitoring  |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture and design patterns     |

### Reference

| Document                             | Purpose                            |
| ------------------------------------ | ---------------------------------- |
| [SECURITY.md](./SECURITY.md)         | Security policy and best practices |
| [CHANGELOG.md](./CHANGELOG.md)       | Version history and changes        |
| [ROADMAP.md](./ROADMAP.md)           | Project roadmap and future plans   |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines            |

---

## Analysis Capabilities

DevFlow provides comprehensive code analysis through AST parsing and pattern detection:

### Analysis Tools

- **Project Analysis** - Extract metadata, dependencies, and structure
- **Architecture Analysis** - Understand project organization and layers
- **Symbol Analysis** - Find and track symbols across the codebase
- **Pattern Detection** - Identify design patterns and anti-patterns
- **Dependency Graphs** - Visualize relationships between modules
- **Git Analysis** - Extract decisions and track change velocity
- **Context Analysis** - Get comprehensive file context and summaries

### Supported Languages

Currently supports **TypeScript** and **JavaScript** via the TypeScript plugin.

**Coming Soon:** Python, Go, Rust, and more via language plugins.

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

DevFlow tools are available via MCP protocol for code analysis.

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

Use DevFlow tools for code analysis and project understanding.

**Note:** Zed supports MCP tools for code analysis.

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

1. **Start with project overview** - Use `getProjectOnboarding` to understand the project
2. **Analyze architecture** - Use `getArchitecture` to understand structure
3. **Find symbols** - Use `findSymbol` and `findReferences` to locate code
4. **Understand context** - Use `getContextForFile` for detailed file analysis
5. **Track changes** - Use `getRecentDecisions` and `analyzeChangeVelocity` for git insights

See [Usage Guide](./USAGE.md) for detailed examples and workflows.

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
├── core/              # Core infrastructure
│   ├── config.ts     # Project root detection
│   ├── storage/       # File I/O engine
│   └── analysis/     # Analysis engine and plugins
├── mcp/               # MCP server
│   └── tools/         # Analysis tools
├── server.ts          # Main server entry point
└── index.ts          # Public API
```

**[Full Setup Guide →](./SETUP.md)**

---

## Key Features

- **7 Tool Categories** - Project, architecture, symbols, patterns, graph, git, and context analysis
- **Plugin Architecture** - Extensible language support via plugins
- **AST-Based Analysis** - Deep code understanding through AST parsing
- **Pattern Detection** - Identify design patterns and code smells
- **Dependency Analysis** - Visualize relationships and dependencies
- **Git Integration** - Extract decisions and track change velocity
- **Type-Safe** - Full TypeScript with Zod validation
- **Cross-Platform** - Works with Claude Desktop, Cursor, Zed
- **Fast & Efficient** - Caching and incremental analysis support

---

## Troubleshooting

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

- [Setup Guide](./SETUP.md) - Installation and configuration
- [Usage Guide](./USAGE.md) - Usage examples and workflows
- [Architecture](./ARCHITECTURE.md) - Technical architecture
- [Testing Guide](./TESTING.md) - Testing strategies
- [Security Policy](./SECURITY.md) - Security best practices

---

**Ready to start?** Follow the [Setup Guide](./SETUP.md) or check out the [Usage Guide](./USAGE.md) for examples.

**Want to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
