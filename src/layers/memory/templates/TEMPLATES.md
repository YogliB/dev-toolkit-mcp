# Memory Bank Templates

This directory contains template files for initializing a DevFlow memory bank following Cline's official Memory Bank structure. Each template provides a structured starting point for maintaining session continuity and project context across AI agent sessions.

## Overview

The memory bank consists of **6 core files** that work together in a hierarchical structure to maintain comprehensive project context:

1. **projectBrief.md** - Foundation document (what you're building)
2. **productContext.md** - Why it exists and how it should work
3. **systemPatterns.md** - Architecture, design patterns, and decisions
4. **techContext.md** - Technologies, setup, and constraints
5. **activeContext.md** - Current work focus and immediate concerns
6. **progress.md** - Historical milestones, metrics, and tracking

This structure is based on [Cline's Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank), used by 600k+ developers.

## File Hierarchy

Files build upon each other in a clear dependency structure:

```
projectBrief.md (foundation - read first)
├── productContext.md (why/how product works)
├── systemPatterns.md (architecture + decisions)
└── techContext.md (tech stack + setup)
    ├── activeContext.md (current work)
    └── progress.md (tracking + history)
```

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

## File Descriptions

### 1. projectBrief.md

**Purpose:** Foundation document that shapes all other files. Source of truth for project scope.

**Philosophy:** Keep it simple and high-level. Can be technical or non-technical. This is what you'd tell someone in 5 minutes about what you're building.

**Key Sections:**

- What Are We Building? - Clear description
- Core Requirements - Fundamental must-haves
- Goals - Primary and secondary objectives
- Who Is This For? - Target users and stakeholders
- Success Criteria - How we'll know we succeeded
- Project Scope - What's in and out
- Timeline - Key dates
- Context - Why now? What prompted this?

**Update Frequency:** Rarely - only when fundamental scope or goals change

**Use Cases:**

- New team member orientation
- Aligning on project direction
- Scope discussions
- Quarterly reviews

---

### 2. productContext.md

**Purpose:** Explains why the project exists, what problems it solves, and how it should work from a product perspective.

**Philosophy:** Product thinking - focus on user value, experience, and workflows. This informs all technical decisions.

**Key Sections:**

- Why This Project Exists - Root cause and value proposition
- Problems Being Solved - Specific issues with impact
- How It Should Work - User experience goals and workflows
- User Scenarios - Typical and edge case journeys
- Product Principles - Guiding principles for decisions
- What Good Looks Like - Success indicators
- Metrics for Success - Measurable targets

**Update Frequency:** When user experience changes, new features are scoped, or product direction shifts

**Use Cases:**

- Understanding user needs
- Making product vs. technical trade-offs
- Designing new features
- Validating solutions against goals

**References:** Built on foundation in `projectBrief.md`

---

### 3. systemPatterns.md

**Purpose:** Documents system architecture, design patterns, component relationships, and architectural decisions.

**Philosophy:** This is the "how it's built" file. Includes architectural decisions (replaces standalone decision log concept).

**Key Sections:**

- System Architecture - High-level structure and style
- Component Overview - What each component does
- Component Relationships - Data flow and dependencies
- Design Patterns - Patterns used and where
- Key Technical Decisions - Architectural choices with full context
    - Context, Decision, Rationale
    - Alternatives Considered
    - Consequences and Trade-offs
- Critical Implementation Paths - Important flows through system
- System Boundaries - What system does/doesn't do
- Scalability Considerations
- Security Architecture
- Error Handling Strategy
- Technical Debt & Improvements

**Update Frequency:** When making architectural decisions, discovering patterns, or changing system design

**Use Cases:**

- Understanding system architecture
- Making architectural decisions
- Avoiding re-litigating past choices
- Onboarding to technical design
- Refactoring planning

**References:** Built on `projectBrief.md` and `productContext.md`, informs `activeContext.md`

---

### 4. techContext.md

**Purpose:** Documents technologies used, development setup, technical constraints, dependencies, and tool usage patterns.

**Philosophy:** Everything a developer needs to know to work with the technology stack.

**Key Sections:**

- Technology Stack - Languages, frameworks, databases
- Frontend/Backend Tech - Specific frameworks and tools
- Infrastructure & DevOps - Hosting, CI/CD, monitoring
- Key Dependencies - Critical libraries and versions
- Development Setup - How to get started locally
- Environment Variables - Configuration needed
- Development Tools - Linters, formatters, testing
- Technical Constraints - Performance, compatibility, security, scalability
- Tool Usage Patterns - Version control, testing, deployment
- Dependencies Management - Package management strategy
- Build & Release - Build process and release strategy
- Documentation & Resources - Links to docs and resources

**Update Frequency:** When adding/changing technologies, updating dependencies, or modifying development processes

**Use Cases:**

- Setting up development environment
- Understanding technical constraints
- Evaluating new technologies
- Troubleshooting setup issues
- Documenting tool choices

**References:** Built on `projectBrief.md`, informs `activeContext.md`

---

### 5. activeContext.md

**Purpose:** Snapshot of current work, blockers, and recent activity (last 7 days). The most frequently updated file.

**Philosophy:** Keep it current. This is what you read every time you start working. Archive old entries to `progress.md`.

**Key Sections:**

- Current Focus - What's being worked on right now
- Active Blockers - Problems blocking progress with severity
- Recent Changes (Last 7 Days) - What changed and why
- Context Notes - Important patterns, performance, security considerations
- Next Steps - Immediate priorities
- Archive Note - Reminder to archive old changes

**Update Frequency:** Daily or multiple times per day

**Retention Policy:** Keep last 7 days only; move older entries to `progress.md`

**Use Cases:**

- Starting a work session
- Understanding current blockers
- Coordinating with team on priorities
- Documenting recent decisions

**References:** References all upstream files (`projectBrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`), feeds into `progress.md`

---

### 6. progress.md

**Purpose:** Long-term project history, milestone tracking, metrics, and lessons learned.

**Philosophy:** Historical record of what's been accomplished, what's working, and what's next.

**Key Sections:**

- Current Milestone - Status and task breakdown
- Completed Milestones - Historical achievements with learnings
- Upcoming Milestones - Future planned work
- Metrics & Velocity - Task completion, duration, trends
- Known Issues - Bugs and problems with severity
- Lessons Learned & Patterns - Insights discovered
- Risk Tracking - Realized and active risks
- Archived Changes - Work older than 30 days (compressed)

**Update Frequency:** Weekly or at milestone boundaries

**Retention Policy:** Permanent; compress entries older than 90 days

**Use Cases:**

- Tracking project health and velocity
- Understanding what worked/didn't work
- Planning future milestones
- Identifying recurring issues
- Onboarding to project history

**References:** Receives archived content from `activeContext.md`

---

## Template Variables

All templates use placeholder variables in `[brackets]`. Replace them with actual values:

- `[DATE]` - Current date (format: YYYY-MM-DD or ISO 8601)
- `[Name]` - Descriptive name or title
- `[High/Medium/Low]` - Choose one based on context
- `[Task]` - Specific task or item
- `[Description]` - Explanatory text
- `[Technology]` - Technology name and version

## Frontmatter Fields

Each memory file uses YAML frontmatter to track metadata:

**Standard fields:**

- `category` - File type category
    - `foundation` (projectBrief)
    - `product` (productContext)
    - `architecture` (systemPatterns)
    - `technical-setup` (techContext)
    - `active-work` (activeContext)
    - `tracking` (progress)
- `created` - File creation timestamp (ISO 8601)
- `updated` - Last modification timestamp (ISO 8601)

**Optional fields:**

- `tags` - Array of tags for categorization
- `status` - Current status if applicable
- `impact` - Impact level for decisions

**Example frontmatter:**

```yaml
---
category: active-work
created: 2024-03-15T10:00:00Z
updated: 2024-03-20T14:30:00Z
tags: [auth, critical]
---
```

## Usage Guide

### Initializing a New Project

1. Use `memory-init` tool to create all 6 files with templates
2. Fill in `projectBrief.md` first - this is your foundation
3. Complete `productContext.md` - define the "why" and "how"
4. Set up `systemPatterns.md` with initial architecture thoughts
5. Configure `techContext.md` with your tech stack
6. Create initial `activeContext.md` entry for current work
7. Set up `progress.md` with first milestone

**Order matters:** Each file builds on the previous ones.

### Daily Workflow

**Starting Work:**

1. Read `activeContext.md` for immediate context
2. Check `progress.md` for current milestone status
3. Reference `systemPatterns.md` if architectural questions arise

**During Work:**

1. Update `activeContext.md` with what you're working on
2. Note any blockers or decisions made
3. Document architectural decisions in `systemPatterns.md`

**Ending Work Session:**

1. Update `activeContext.md` with current state
2. Document any decisions made today
3. Note next steps for tomorrow

### Weekly Maintenance

1. Review `activeContext.md` and archive entries >7 days to `progress.md`
2. Update `progress.md` with milestone status and metrics
3. Add lessons learned to `progress.md`
4. Update `techContext.md` if dependencies changed
5. Adjust `productContext.md` if user experience insights emerged

### Making Architectural Decisions

When making a significant technical or architectural decision:

1. Document in `systemPatterns.md` under "Key Technical Decisions"
2. Include full context (what led to this decision)
3. State the decision clearly
4. Explain rationale with specific reasons
5. List alternatives considered and why not chosen
6. Document consequences (positive, negative, trade-offs)
7. Reference from `activeContext.md` if currently relevant

### Resuming After Time Away

**New Session (you or AI):**

1. Read `projectBrief.md` - What are we building?
2. Read `productContext.md` - Why and how should it work?
3. Scan `systemPatterns.md` - How is it architected?
4. Check `techContext.md` - What technologies are used?
5. Read `activeContext.md` - What's happening right now?
6. Review `progress.md` - Where are we in the timeline?

**Quick Context (AI agents):**

- All 6 files should be loaded at session start
- `activeContext.md` + `progress.md` provide immediate working context
- Other files provide deep context when needed

## Best Practices

### Writing Guidelines

- **Be specific:** Use dates, file names, concrete examples
- **Be searchable:** Use consistent terminology, avoid vague language
- **Be concise:** Clarity over completeness
- **Be current:** Update frequently, archive old content
- **Link between files:** Reference related sections

### File-Specific Tips

**projectBrief.md:**

- Keep it simple and high-level
- Don't duplicate details from other files
- Update rarely - this should be stable

**productContext.md:**

- Focus on user value, not implementation
- Describe ideal experience, not current state
- Use scenarios and workflows

**systemPatterns.md:**

- Document decisions when made, not retroactively
- Include alternatives considered
- Explain architectural reasoning
- Update as system evolves

**techContext.md:**

- Keep dependency versions current
- Document setup issues and solutions
- Update when technologies change

**activeContext.md:**

- Update daily or more
- Archive after 7 days
- Keep focused on "now"
- Reference upstream files

**progress.md:**

- Track metrics consistently
- Document lessons learned
- Compress old entries
- Celebrate milestones

### Context Management

**When context window fills:**

1. Ask AI to "update memory bank"
2. Review all 6 files
3. Archive old content from `activeContext.md` to `progress.md`
4. Start new session with "follow your custom instructions"
5. AI loads all 6 files to rebuild context

**Keeping files manageable:**

- Archive `activeContext.md` changes >7 days
- Compress `progress.md` entries >90 days
- Don't duplicate content across files
- Use references instead of copying

## Migration from Legacy Structure

If you have an older 4-file structure (`projectContext`, `activeContext`, `progress`, `decisionLog`):

**Migration Steps:**

1. Split `projectContext.md` into:
    - `projectBrief.md` - High-level scope and goals
    - `productContext.md` - Product thinking and workflows
    - `techContext.md` - Technology stack and setup
2. Create `systemPatterns.md` from architecture sections
3. Migrate decision log entries to `systemPatterns.md` "Key Technical Decisions" section
4. Update `activeContext.md` and `progress.md` if needed
5. Delete old files after migration

See `MIGRATION.md` for detailed instructions.

## Philosophical Notes

### Why This Structure?

**Hierarchical organization:** Files build on each other, providing clear reading order and reducing duplication.

**Separation of concerns:** Product thinking (why) separated from technical implementation (how).

**Decision documentation:** Architectural decisions live in `systemPatterns.md` where they're most relevant, not in a separate log.

**AI-friendly:** Structure designed for AI agents to load context efficiently and maintain understanding across sessions.

**Human-readable:** All files are markdown, git-friendly, and useful documentation for humans too.

### Design Principles

1. **Foundation first:** `projectBrief.md` is the source of truth
2. **Product before implementation:** Understand "why" before "how"
3. **Architecture informs work:** System design guides daily tasks
4. **Current over historical:** `activeContext.md` is most important for daily work
5. **Archive aggressively:** Keep current files focused
6. **Document decisions in context:** Decisions live with architecture, not separate

---

_These templates follow Cline's Memory Bank methodology, proven with 600k+ users. They enable AI agents to maintain context across sessions and provide valuable project documentation as a side effect._
