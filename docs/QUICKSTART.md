# 5-Minute Quick Start

**Goal:** Get DevFlow running and create your first rule in under 5 minutes.

## Prerequisites

- Node.js 20+ or Bun 1.3+
- A project directory
- 5 minutes

---

## Step 1: Install DevFlow

```bash
# Using npm
npm install -g devflow-mcp

# Using bun
bun install -g devflow-mcp
```

**Expected output:**

```
✓ DevFlow MCP installed successfully
✓ Version: 0.1.0
```

---

## Step 2: Initialize in Your Project

```bash
cd your-project
devflow init
```

**What this does:**

- Creates `.devflow/` directory structure
- Sets up default templates
- Initializes empty memory files

**Expected structure:**

```
your-project/
├── .devflow/
│   ├── rules/
│   │   ├── always/
│   │   ├── contextual/
│   │   └── manual/
│   ├── memory/
│   │   ├── activeContext.md
│   │   ├── progress.md
│   │   ├── decisionLog.md
│   │   └── projectContext.md
│   └── plans/
│       ├── active/
│       └── completed/
└── docs/
    └── .templates/
```

---

## Step 3: Create Your First Rule

Create a simple coding standard:

```bash
devflow rules:create \
  --name "TypeScript Standards" \
  --type always \
  --priority 8
```

**Interactive prompts:**

```
✓ Rule name: TypeScript Standards
✓ Activation type: always
✓ Priority (1-10): 8
✓ Add tags? (optional): typescript, code-quality
```

**Or use the full command:**

```bash
cat > .devflow/rules/always/typescript-standards.mdc << 'EOF'
---
id: typescript-standards
name: TypeScript Coding Standards
type: always
priority: 8
tags: [typescript, code-quality]
version: 1.0.0
created: 2024-03-20
---

# TypeScript Standards

## Type Safety
- Use explicit types for all function signatures
- Never use `any` - prefer `unknown`
- Enable `strict` mode in tsconfig.json

## Naming Conventions
- Functions: camelCase verbs (`getUserProfile`, `validateToken`)
- Types/Interfaces: PascalCase nouns (`UserProfile`, `AuthResult`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

## Error Handling
- Always handle errors explicitly
- Use custom error types for domain errors
- Never swallow errors silently
EOF
```

---

## Step 4: Verify the Rule Loads

```bash
devflow rules:list
```

**Expected output:**

```json
{
	"total": 1,
	"active": 1,
	"rules": [
		{
			"id": "typescript-standards",
			"name": "TypeScript Standards",
			"type": "always",
			"priority": 8,
			"active": true,
			"tags": ["typescript", "code-quality"]
		}
	]
}
```

---

## Step 5: Connect to Your AI Agent

### Option A: Cursor

Create `mcp.json` in your project root:

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

Restart Cursor or reload the window.

### Option B: Zed

Edit `settings.json` (Cmd+, on macOS or Ctrl+, on Linux/Windows):

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

Restart Zed.

### Option C: Generate .cursorrules (Cursor Only)

```bash
devflow generate cursorrules
```

This creates/updates `.cursorrules` from your DevFlow rules.

---

## Step 6: Test It Works

Open a conversation with your AI agent and ask:

```
What are the active DevFlow rules for this project?
```

**Expected response:**

```
I can see 1 active rule from DevFlow:

**TypeScript Standards** (priority: 8)
- Use explicit types for all function signatures
- Never use `any` - prefer `unknown`
- Enable `strict` mode in tsconfig.json
...
```

---

## ✅ Success!

You now have DevFlow managing your project context. Your AI agent will:

- ✅ Remember these rules across sessions
- ✅ Apply them automatically to all TypeScript files
- ✅ Suggest fixes when you violate the standards

---

## Using Memory MCP in Cursor

**Memory MCP** provides tools to save and retrieve session context across Cursor sessions.

### Step 1:Next Steps

## Using Memory MCP

DevFlow provides memory tools for maintaining context across AI sessions.

### In Cursor

Once configured (see Step 5, Option A), use memory tools in Composer or Chat:

**Create a memory:**

```
Use memory:save to create a new context file:
{
  "name": "activeContext",
  "content": "Working on authentication feature. Using JWT tokens.",
  "frontmatter": {
    "title": "Current Work",
    "tags": ["auth", "jwt"]
  }
}
```

**View context (auto-loaded):**
The `devflow://context/memory` resource automatically loads activeContext and progress files into your conversation context.

**List all memories:**

```
Use memory:list to see all available memories
```

**Get specific memory:**

```
Use memory:get with name="projectContext"
```

### In Zed

Zed doesn't support auto-loaded resources, so use prompts instead:

**Load session context:**

```
Type @ in the Assistant panel and select "memory:context"
```

This manually loads activeContext + progress (equivalent to Cursor's auto-loaded resource).

**Load specific memory:**

```
Type @ and select "memory:load", then specify name="projectContext"
```

**Use memory tools:**
All memory tools (save, get, list, delete) work the same as in Cursor.

---

## Next Steps

### Learn the 4 Layers

1. **[Rules](./RULES.md)** - Define more coding standards
2. **[Memory](./MEMORY.md)** - Track decisions and context
3. **[Documentation](./DOCS.md)** - Create AI-optimized docs
4. **[Planning](./PLANNING.md)** - Plan features with auto-validation

### Try Common Workflows

**Log an architectural decision:**

```bash
devflow memory:decision:log \
  --title "Use PostgreSQL over MongoDB" \
  --decision "PostgreSQL for relational data integrity" \
  --impact high
```

**Create a feature plan:**

```bash
devflow plan:create \
  --name "User Authentication" \
  --size medium
```

**Generate documentation:**

```bash
devflow doc:create \
  --type api \
  --title "Authentication API"
```

---

## Troubleshooting

### DevFlow command not found

**Solution:**

```bash
# Verify installation
npm list -g devflow-mcp

# Reinstall if needed
npm install -g devflow-mcp
```

### Rules not loading in agent

**Solution:**

1. Check the MCP server is running: `devflow status`
2. Restart your AI agent
3. Verify config file path is correct

### Permission denied

**Solution:**

```bash
# Make sure you have write access to project
ls -la .devflow/

# Fix permissions if needed
chmod -R 755 .devflow/
```

---

## Get Help

- **[Full Documentation](./README.md)** - Complete reference
- **[Examples](./EXAMPLES.md)** - Real-world workflows
- **[Integration Guide](./INTEGRATION.md)** - Advanced setups

---

**Ready to dive deeper?** Continue to the **[Overview](./OVERVIEW.md)** to understand the full architecture.
