# Documentation Index

Quick reference guide to find what you need in the DevFlow documentation.

---

## By User Type

### 🆕 First-Time Users

1. **[Quick Start](./QUICKSTART.md)** - Get running in 5 minutes
2. **[Overview](./OVERVIEW.md)** - Understand the architecture
3. **[Integration Guide](./INTEGRATION.md)** - Connect to your AI agent

### 👨‍💻 Developers

1. **[Implementation Details](./IMPLEMENTATION.md)** - Technical architecture
2. **[MCP Primitives](./MCP-PRIMITIVES.md)** - Complete API reference
3. **[Examples](./EXAMPLES.md)** - Code samples and patterns

### 🏢 Teams

1. **[Rules Engine](./RULES.md)** - Enforce team standards
2. **[Memory System](./MEMORY.md)** - Track decisions and context
3. **[Integration Guide](./INTEGRATION.md#common-workflows)** - Team workflows

### 🤝 Contributors

1. **[Overview](./OVERVIEW.md#implementation-roadmap)** - Development roadmap
2. **[Implementation Details](./IMPLEMENTATION.md)** - Architecture details
3. **[Agent Compatibility](./AGENT-COMPATIBILITY.md)** - Platform integrations

---

## By Topic

### Getting Started

- **Installation** → [Quick Start](./QUICKSTART.md#step-1-install-devflow)
- **Project Setup** → [Quick Start](./QUICKSTART.md#step-2-initialize-in-your-project)
- **First Rule** → [Quick Start](./QUICKSTART.md#step-3-create-your-first-rule)
- **Agent Connection** → [Quick Start](./QUICKSTART.md#step-5-connect-to-your-ai-agent)

### Rules Management

- **Creating Rules** → [Rules Engine](./RULES.md#mcp-primitives)
- **Rule Types** → [Rules Engine](./RULES.md#file-format-mdc-markdown-component)
- **Priority System** → [Rules Engine](./RULES.md#conflict-resolution)
- **Examples** → [Rules Engine](./RULES.md#examples)

### Memory & Context

- **Decision Logging** → [Memory System](./MEMORY.md#decisionlogmd)
- **Active Context** → [Memory System](./MEMORY.md#activecontextmd)
- **Progress Tracking** → [Memory System](./MEMORY.md#progressmd)
- **Project Context** → [Memory System](./MEMORY.md#projectcontextmd)

### Documentation

- **Templates** → [Documentation Layer](./DOCS.md#template-specifications)
- **API Docs** → [Documentation Layer](./DOCS.md#api-template)
- **Architecture Docs** → [Documentation Layer](./DOCS.md#architecture-template)
- **Validation** → [Documentation Layer](./DOCS.md#validation-rules)

### Planning

- **Creating Plans** → [Planning Layer](./PLANNING.md#plan-schema)
- **Task Management** → [Planning Layer](./PLANNING.md#task-structure)
- **Auto-Validation** → [Planning Layer](./PLANNING.md#automatic-validation)
- **Milestones** → [Planning Layer](./PLANNING.md#milestone-grouping)

### Integration

- **Unified Context** → [Integration Guide](./INTEGRATION.md#unified-context-loading)
- **Cross-Layer Linking** → [Integration Guide](./INTEGRATION.md#bidirectional-linking)
- **Workflows** → [Integration Guide](./INTEGRATION.md#common-workflows)
- **Consistency Checks** → [Integration Guide](./INTEGRATION.md#consistency-validation)

### Agent Platforms

- **Claude Desktop** → [Agent Compatibility](./AGENT-COMPATIBILITY.md#claude-desktop)
- **Cursor** → [Agent Compatibility](./AGENT-COMPATIBILITY.md#cursor)
- **Zed** → [Agent Compatibility](./AGENT-COMPATIBILITY.md#zed)
- **VSCode** → [Agent Compatibility](./AGENT-COMPATIBILITY.md#vscode)

---

## By Use Case

### "I want to..."

#### Enforce Coding Standards

1. Read [Rules Engine](./RULES.md#overview)
2. Create rules with [Rules: Create Tool](./RULES.md#rulescreate)
3. See [Rule Examples](./RULES.md#examples)

#### Track Architectural Decisions

1. Read [Memory System](./MEMORY.md#decisionlogmd)
2. Use [Decision Logging Tool](./MEMORY.md#memorydecisionlog)
3. See [Decision Template](./MEMORY.md#decision_template)

#### Plan a New Feature

1. Read [Planning Layer](./PLANNING.md#overview)
2. Use [Plan Create Tool](./PLANNING.md#plancreate)
3. See [Common Workflows](./INTEGRATION.md#workflow-1-starting-a-new-feature)

#### Create AI-Optimized Docs

1. Read [Documentation Layer](./DOCS.md#overview)
2. Choose a [Template](./DOCS.md#template-specifications)
3. Use [Doc Create Tool](./DOCS.md#doccreate)

#### Onboard a New Team Member

1. Follow [Onboarding Workflow](./INTEGRATION.md#workflow-5-onboarding-new-team-member)
2. Share [Project Context](./MEMORY.md#projectcontextmd)
3. Review [Active Rules](./RULES.md#devflowcontextrules)

#### Debug an Issue

1. Follow [Debugging Workflow](./INTEGRATION.md#workflow-4-debugging-issue-resolution)
2. Add [Blocker](./MEMORY.md#memoryblockeradd)
3. Log [Resolution](./MEMORY.md#memoryblockerresolve)

#### Review Code Quality

1. Follow [Code Review Workflow](./INTEGRATION.md#workflow-3-code-review-quality-check)
2. Use [Rules Validate](./RULES.md#rulesvalidate)
3. Check [Consistency](./INTEGRATION.md#consistency-validation)

---

## API Reference

### Resources (Auto-Loaded Context)

- **Unified Context** → [Integration Guide](./INTEGRATION.md#session-initialization)
- **Rules Context** → [Rules Engine](./RULES.md#devflowcontextrules)
- **Memory Context** → [Memory System](./MEMORY.md#devflowcontextmemory)
- **Active Plans** → [Planning Layer](./PLANNING.md#devflowplansactive)
- **Documentation** → [Documentation Layer](./DOCS.md#devflowdocs)

### Tools (Actions)

- **Rules Tools** → [Rules Engine](./RULES.md#tools)
- **Memory Tools** → [Memory System](./MEMORY.md#tools)
- **Documentation Tools** → [Documentation Layer](./DOCS.md#tools)
- **Planning Tools** → [Planning Layer](./PLANNING.md#tools)

### Prompts (Templates)

- **Session Init** → [Rules Engine](./RULES.md#init_session)
- **Decision Template** → [Memory System](./MEMORY.md#decision_template)
- **Planning Templates** → [Planning Layer](./PLANNING.md#templates)

---

## File Structure Reference

### Project Layout

```
.devflow/
├── rules/           → Rules Engine
│   ├── always/
│   ├── contextual/
│   └── manual/
├── memory/          → Memory System
│   ├── activeContext.md
│   ├── progress.md
│   ├── decisionLog.md
│   └── projectContext.md
└── plans/           → Planning Layer
    ├── active/
    └── completed/

docs/                → Documentation Layer
├── api/
├── architecture/
├── guides/
└── .templates/
```

### Documentation Files

- **[README.md](./README.md)** - Documentation hub
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute guide
- **[OVERVIEW.md](./OVERVIEW.md)** - Vision & architecture
- **[RULES.md](./RULES.md)** - Layer 1: Rules
- **[MEMORY.md](./MEMORY.md)** - Layer 2: Memory
- **[DOCS.md](./DOCS.md)** - Layer 3: Documentation
- **[PLANNING.md](./PLANNING.md)** - Layer 4: Planning
- **[INTEGRATION.md](./INTEGRATION.md)** - Cross-layer workflows
- **[MCP-PRIMITIVES.md](./MCP-PRIMITIVES.md)** - API reference
- **[AGENT-COMPATIBILITY.md](./AGENT-COMPATIBILITY.md)** - Platform guides
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical details
- **[EXAMPLES.md](./EXAMPLES.md)** - Real-world patterns

---

## Troubleshooting Quick Links

### Installation Issues

- [DevFlow not found](./QUICKSTART.md#devflow-command-not-found)
- [Permission denied](./QUICKSTART.md#permission-denied)

### Rules Issues

- [Rules not loading](./RULES.md#rules-not-loading)
- [Rule conflicts](./RULES.md#conflicts-between-rules)
- [Agent not respecting rules](./RULES.md#agent-not-respecting-rules)

### Memory Issues

- [Memory not loading](./MEMORY.md#memory-not-loading)
- [Slow search](./MEMORY.md#slow-search-phase-1)
- [SQLite sync issues](./MEMORY.md#sqlite-index-out-of-sync-phase-2)

### Integration Issues

- [Broken cross-references](./INTEGRATION.md#issue-broken-cross-references)
- [Stale context](./INTEGRATION.md#issue-stale-context)
- [Conflicting information](./INTEGRATION.md#issue-conflicting-information)

---

## Quick Command Reference

```bash
# Installation
npm install -g devflow-mcp

# Setup
devflow init

# Rules
devflow rules:create --name "Rule Name" --type always
devflow rules:list
devflow rules:validate src/file.ts

# Memory
devflow memory:decision:log --title "Decision Title"
devflow memory:context:set --focus "Current Task"
devflow memory:recall --query "authentication"

# Documentation
devflow doc:create --type api --title "API Name"
devflow doc:validate docs/api/auth.md

# Planning
devflow plan:create --name "Feature Name" --size medium
devflow plan:task:update --task-id task-123 --status completed

# Integration
devflow sync:validate
devflow status
```

---

## Contributing to Docs

Found an issue or want to improve the documentation?

1. **Typos/Errors** - Open an issue or submit a PR
2. **Missing Examples** - Add to [EXAMPLES.md](./EXAMPLES.md)
3. **New Use Cases** - Update this index and relevant guides
4. **Unclear Sections** - Flag for rewriting

**Documentation Standards:**

- Use clear, concise language
- Include examples for all features
- Keep files under 500 lines
- Add metadata frontmatter
- Link related resources

---

**Can't find what you need?** Start with the [Quick Start Guide](./QUICKSTART.md) or read the full [Documentation Hub](./README.md).
