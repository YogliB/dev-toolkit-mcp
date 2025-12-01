# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Additional language plugin support (Python, Go, Rust)
- Enhanced AST analysis with specialized parsers
- Improved pattern detection
- Performance optimizations
- Incremental analysis improvements

---

## [0.0.1] - 2024-12-28

### Added

- **Project Analysis Tools**
    - `getProjectOnboarding` - Extract project metadata from package.json, README, and tsconfig.json

- **Architecture Tools**
    - `getArchitecture` - Get architectural overview with symbols, patterns, and relationships

- **Symbol Tools**
    - `findSymbol` - Search for symbols by name and type
    - `findReferences` - Find all references to a symbol

- **Pattern Tools**
    - `detectPatterns` - Detect design patterns in code
    - `detectAntiPatterns` - Identify code smells and anti-patterns

- **Graph Tools**
    - `getDependencyGraph` - Build dependency graph between files and modules

- **Git Tools**
    - `getRecentDecisions` - Extract architectural decisions from git commit messages
    - `analyzeChangeVelocity` - Analyze file change frequency and stability

- **Context Tools**
    - `getContextForFile` - Get comprehensive context for a file
    - `summarizeFile` - Generate high-level file summary

- **Core Infrastructure**
    - Analysis engine with plugin architecture
    - TypeScript plugin for code analysis
    - Storage engine with path validation
    - Git analyzer for repository insights
    - File watcher with cache invalidation
    - Git-aware caching system

- **MCP Integration**
    - FastMCP server implementation
    - Tool registration system
    - Cross-platform support (Cursor, Claude Desktop, Zed)

- **Documentation**
    - Setup guide
    - Architecture documentation
    - Testing guide
    - Security policy
    - Usage guide

### Technical Details

- Built with Bun runtime
- TypeScript with strict type checking
- Zod schema validation
- ts-morph for AST manipulation
- simple-git for git operations

---

## Types of Changes

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security vulnerability fixes

---

**Note:** This changelog tracks changes from version 0.0.1 onwards. For earlier versions, see git history.
