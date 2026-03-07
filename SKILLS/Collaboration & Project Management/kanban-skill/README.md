# kanban-markdown

A Claude Code skill for managing kanban board features backed by markdown files with YAML frontmatter.

Works with the [kanban-markdown](https://marketplace.visualstudio.com/items?itemName=your-publisher.kanban-markdown) VS Code extension — Claude can create, update, and move feature files that the extension renders as a kanban board.

## How it works

Each feature is a `.md` file with structured YAML frontmatter:

```markdown
---
id: "add-dark-mode-2026-02-20"
status: "in-progress"
priority: "high"
assignee: "Lachlan"
dueDate: "2026-03-01"
created: "2026-02-20T10:00:00.000Z"
modified: "2026-02-20T14:30:00.000Z"
completedAt: null
labels: ["ui", "feature"]
order: 0
---

# Add dark mode

Support system-level dark mode preference with manual toggle.

## Acceptance Criteria

- [ ] Detect system preference
- [ ] Manual toggle in settings
- [ ] Persist preference
```

Features live in `.devtool/features/` (configurable), with completed features in a `done/` subfolder. The extension watches for file changes and updates the board in real time.

## What Claude can do

- **Create features** — generates files with correct ID, frontmatter format, and placement
- **Read board state** — scans the features directory to understand what's in each column
- **Update features** — edits frontmatter fields while preserving the exact serialization format
- **Move features** — changes status, handles the `done/` subfolder boundary, sets `completedAt`

## Install

```bash
npx skills add https://github.com/LachyFS/kanban-skill
```

## Structure

```
kanban-markdown/
├── SKILL.md                  # Core instructions for Claude
└── references/
    └── data-model.md         # Full field specs, enums, and conventions
```
