# Memory MCP Usage Examples

Real-world examples of using DevFlow memory tools and resources in Cursor and Zed.

## Table of Contents

- [Basic Operations](#basic-operations)
- [Session Context Management](#session-context-management)
- [Cross-Session Workflows](#cross-session-workflows)
- [Team Collaboration](#team-collaboration)
- [Troubleshooting](#troubleshooting)

---

## Basic Operations

### Save a Memory

**Use case:** Store current work context for later retrieval.

```json
// In Cursor the devflow resource auto-loads. To update a memory via MCP tools call the specific memory file tool:
//
// Example: update the active context via the `memory-activeContext` tool
{
	"tool": "memory-activeContext",
	"input": {
		"action": "update",
		"content": "# Current Work\n\nImplementing user authentication with JWT tokens.\n\n## Progress\n- ✅ Created User model\n- ✅ Added password hashing\n- 🔄 Working on token generation\n- ⏳ TODO: Refresh token logic"
	}
}
```

**Expected response:**

```json
{
	"success": true,
	"message": "Memory saved",
	"name": "activeContext"
}
```

### Get a Memory

**Use case:** Retrieve previously saved context.

```json
// Retrieve a core memory file using its specific tool
{
	"tool": "memory-activeContext",
	"input": {
		"action": "get"
	}
}
```

**Expected response:**

```json
{
	"frontmatter": {
		"title": "Authentication Implementation",
		"category": "feature-work",
		"tags": ["auth", "jwt", "security"]
	},
	"content": "# Current Work\n\nImplementing user authentication..."
}
```

### List All Memories

**Use case:** See what context is available.

```json
// List core memory files via the global `memory-list` tool (no parameters needed)
{ "tool": "memory-list" }
```

**Expected response:**

```json
{
	"memories": ["activeContext", "progress", "projectContext", "decisionLog"],
	"count": 4
}
```

### Delete a Memory

**Use case:** Remove outdated context.

```json
// Delete a core memory file (example deletes the `progress` file) via its specific tool
{
	"tool": "memory-progress",
	"input": { "action": "delete" }
}
```

**Expected response:**

```json
{
	"success": true,
	"message": "Memory deleted",
	"name": "outdated-context"
}
```

---

## Session Context Management

### Starting a New Work Session (Cursor)

**Scenario:** You return to a project after a few days.

**Step 1:** The AI automatically loads context via `devflow://context/memory` resource:

```markdown
# Active Context

# Current Work

Implementing user authentication with JWT tokens.

## Progress

- ✅ Created User model
- ✅ Added password hashing
- 🔄 Working on token generation

# Progress

## Completed Today

- JWT secret key configuration
- Token expiration logic
```

**Step 2:** Ask the AI:

```
What was I working on last?
```

**AI Response:**

```
Based on the memory context, you were implementing user authentication with JWT tokens.
You've completed the User model and password hashing, and you're currently working on
token generation. The next step is implementing refresh token logic.
```

### Starting a New Work Session (Zed)

**Scenario:** Same as above, but in Zed (manual prompt required).

**Step 1:** Type `@` in Zed Assistant and select the `memory:load` prompt (Zed workaround). Provide the `name` argument (for example `name=activeContext`) to load a single memory file.

**Step 2:** Ask the AI:

```
What was I working on last?
```

The AI will have the same context loaded and respond similarly.

---

## Cross-Session Workflows

### Example 1: Feature Implementation Tracking

**Day 1 - Start Feature:**

```json
// Save initial context
{
	"name": "activeContext",
	"content": "# Feature: User Profiles\n\n## Goal\nAllow users to create and edit their profiles.\n\n## Approach\n- Create Profile model\n- Add profile CRUD endpoints\n- Build profile UI components\n\n## Status\nJust started - created database schema",
	"frontmatter": {
		"title": "User Profiles Feature",
		"category": "feature-work",
		"tags": ["profiles", "crud", "ui"]
	}
}
```

**Day 2 - Continue Work:**

```json
// Update context with progress
{
	"name": "activeContext",
	"content": "# Feature: User Profiles\n\n## Progress\n- ✅ Created Profile model\n- ✅ Added GET /profile/:id endpoint\n- ✅ Added PUT /profile/:id endpoint\n- 🔄 Working on profile edit UI\n\n## Next Steps\n- Image upload component\n- Form validation\n- E2E tests",
	"frontmatter": {
		"title": "User Profiles Feature",
		"category": "feature-work",
		"tags": ["profiles", "crud", "ui"]
	}
}
```

**Day 3 - Complete Feature:**

```json
// Move to progress log
{
	"name": "progress",
	"content": "# Recent Completions\n\n## User Profiles Feature (Completed)\n- ✅ Profile model and migrations\n- ✅ CRUD API endpoints\n- ✅ Profile edit UI with image upload\n- ✅ Form validation\n- ✅ E2E tests\n\n**Lessons Learned:**\n- Image upload needs S3 pre-signed URLs\n- Form validation better with Zod\n- E2E tests caught 3 edge cases",
	"frontmatter": {
		"title": "Progress Log",
		"category": "tracking"
	}
}
```

### Example 2: Decision Logging

**Scenario:** You decide to use PostgreSQL instead of MongoDB.

```json
{
	"name": "decisionLog",
	"content": "# Architecture Decisions\n\n## Database Choice: PostgreSQL vs MongoDB (2024-03-20)\n\n**Decision:** Use PostgreSQL\n\n**Context:**\n- Need strong data consistency\n- Complex relations between users, posts, comments\n- Team has PostgreSQL experience\n\n**Alternatives Considered:**\n- MongoDB: Better for schema flexibility, but we need ACID transactions\n- SQLite: Too limited for production\n\n**Consequences:**\n- ✅ Better data integrity\n- ✅ Powerful query capabilities with SQL\n- ❌ Less flexible schema changes\n- ❌ Slightly more complex setup",
	"frontmatter": {
		"title": "Decision Log",
		"category": "decisions",
		"tags": ["architecture", "database"]
	}
}
```

---

## Team Collaboration

### Handoff Between Team Members

**Developer A (end of day):**

```json
{
	"name": "handoff",
	"content": "# Handoff to Sarah\n\n## What I Did Today\n- Implemented user authentication endpoints\n- Added JWT token generation\n- Tests are passing\n\n## Blockers\n- Waiting for UX review on login flow\n- Need env vars for prod JWT secret\n\n## Next Steps for You\n- Review my PR #142\n- Implement refresh token logic (branch: feature/refresh-tokens)\n- Check if password reset email template works\n\n## Files to Review\n- src/auth/jwt.ts\n- tests/integration/auth.test.ts",
	"frontmatter": {
		"title": "Handoff to Sarah",
		"category": "collaboration",
		"tags": ["handoff", "auth"]
	}
}
```

**Developer B (start of day):**

```
// In Cursor: Context auto-loads
// In Zed: Type @memory:load name=handoff

AI now has full context of the handoff
```

---

## Troubleshooting

### Memory Not Found

**Error:**

```json
{
	"error": "Memory not found",
	"name": "missing-file"
}
```

**Solution:**
Check available memories first:

```json
// Use memory:list
{}
```

### Invalid Frontmatter Field

**Scenario:** You try to save a memory with invalid frontmatter.

```json
{
	"name": "test",
	"frontmatter": {
		"invalidField": "value",
		"category": "test"
	},
	"content": "Test content"
}
```

**Result:** Invalid fields are silently filtered. Only valid fields are saved:

- `title` (string)
- `created` (string or date)
- `updated` (string or date)
- `tags` (array of strings)
- `category` (string)

**Retrieved memory will have:**

```json
{
	"frontmatter": {
		"category": "test"
	},
	"content": "Test content"
}
```

### Resource Not Auto-Loading (Cursor)

**Issue:** `devflow://context/memory` resource not appearing in Cursor.

**Solutions:**

1. Verify `mcp.json` is in project root
2. Restart Cursor or reload window
3. Check that `activeContext.md` or `progress.md` exist in `memory-bank/`
4. View Cursor logs for MCP server errors

### Prompts Not Appearing (Zed)

**Issue:** `@memory:context` prompt not showing in Zed Assistant.

**Solutions:**

1. Verify `context_servers` in `settings.json`
2. Restart Zed
3. Check Zed logs: `View > Debug > Server Logs`
4. Ensure DevFlow server is registered correctly

---

## Best Practices

### 1. Keep activeContext Current

Update `activeContext` at the end of each work session:

```json
{
	"name": "activeContext",
	"content": "# End of Day (2024-03-20)\n\n## What I Finished\n- Feature X complete\n\n## Tomorrow's First Task\n- Review PR #123\n- Start feature Y\n\n## Open Questions\n- Should we use Redis for caching?",
	"frontmatter": {
		"title": "Current Work State",
		"updated": "2024-03-20"
	}
}
```

### 2. Log Important Decisions

Create entries in `decisionLog` for architectural choices:

```json
{
	"name": "decisionLog",
	"content": "## Use React Query for Server State (2024-03-20)\n\n**Why:** Better caching, automatic refetching, less boilerplate\n**Impact:** Removes need for Redux in most cases",
	"frontmatter": {
		"category": "decisions",
		"tags": ["react", "state-management"]
	}
}
```

### 3. Track Progress Weekly

Update `progress` with weekly summaries:

```json
{
	"name": "progress",
	"content": "# Week of March 18-22, 2024\n\n## Shipped\n- User authentication\n- Profile editing\n- Email notifications\n\n## Learned\n- JWT best practices\n- Image optimization with Next.js\n\n## Next Week\n- Admin dashboard\n- Analytics integration",
	"frontmatter": {
		"title": "Weekly Progress",
		"updated": "2024-03-22"
	}
}
```

---

## Advanced Patterns

### Context Switching Between Features

**Save current work:**

```json
{
	"name": "feature-auth-context",
	"content": "Working on authentication...",
	"frontmatter": { "title": "Auth Feature Context" }
}
```

**Switch to urgent bug:**

```json
{
	"name": "activeContext",
	"content": "# Urgent: Fix Payment Bug\n\nPayments failing in production...",
	"frontmatter": { "title": "Payment Bug Fix" }
}
```

**Resume original work later:**

```json
// Load saved context
{ "name": "feature-auth-context" }

// Copy back to activeContext
{
  "name": "activeContext",
  "content": "<content from feature-auth-context>",
  "frontmatter": { "title": "Auth Feature Context" }
}
```

---

## Summary

- **Cursor**: Resources auto-load (`devflow://context/memory`)
- **Zed**: Use prompts manually (`@memory:context`, `@memory:load`)
- **Both**: Same tools (save, get, list, delete)
- **Best Practice**: Keep `activeContext` current, log decisions, track progress

For more details, see [Memory Layer Documentation](../docs/MEMORY.md).
