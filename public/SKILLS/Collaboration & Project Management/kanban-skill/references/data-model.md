# Kanban-Markdown Data Model

## Feature File Format

Each feature is a markdown file with YAML frontmatter. Files live in a features directory (default `.devtool/features/`), with completed features in a `done/` subfolder.

### Frontmatter Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` (quoted) | Generated from title + date | Unique identifier, matches filename without `.md` |
| `status` | `string` (quoted) | `"backlog"` | Current column |
| `priority` | `string` (quoted) | `"medium"` | Priority level |
| `assignee` | `string` (quoted) or `null` | `null` | Person assigned |
| `dueDate` | `string` (quoted) or `null` | `null` | Due date as `"YYYY-MM-DD"` |
| `created` | `string` (quoted) | ISO 8601 timestamp | Creation time |
| `modified` | `string` (quoted) | ISO 8601 timestamp | Last modification time |
| `completedAt` | `string` (quoted) or `null` | `null` | Completion time (set when moved to done) |
| `labels` | `array` | `[]` | List of label strings |
| `order` | `string` (quoted) | Fractional index (e.g. `"a0"`) | Lexicographic sort position within column (fractional indexing) |

### Enum Values

**status**: `backlog` | `todo` | `in-progress` | `review` | `done`

**priority**: `critical` | `high` | `medium` | `low`

### Columns (display order)

| ID | Display Name | Color |
|----|-------------|-------|
| `backlog` | Backlog | `#6b7280` |
| `todo` | To Do | `#3b82f6` |
| `in-progress` | In Progress | `#f59e0b` |
| `review` | Review | `#8b5cf6` |
| `done` | Done | `#22c55e` |

## ID Generation

The ID is generated from the feature title using this algorithm (matches `generateFeatureFilename` in the extension):

1. Take the title (from the first `# Heading` in content)
2. Lowercase
3. Remove all characters except `a-z`, `0-9`, spaces, hyphens
4. Replace spaces with hyphens
5. Collapse multiple hyphens to single
6. Trim leading/trailing hyphens
7. Truncate to 50 characters
8. Append `-YYYY-MM-DD` (current date)
9. If slug is empty, use `feature-YYYY-MM-DD`

The ID is also the filename (without `.md`).

## Exact Serialization Format

The frontmatter MUST be serialized in this exact format (matching `_serializeFeature`):

```
---
id: "my-feature-2026-02-20"
status: "backlog"
priority: "medium"
assignee: null
dueDate: null
created: "2026-02-20T10:00:00.000Z"
modified: "2026-02-20T10:00:00.000Z"
completedAt: null
labels: []
order: "a0"
---
```

Rules:
- String values: always double-quoted (`"value"`)
- Nullable strings: `null` (bare, no quotes) when unset, `"value"` when set
- Labels: inline array syntax `["label1", "label2"]` or `[]` when empty
- Order: double-quoted string — fractional index for lexicographic sorting (e.g. `"a0"`, `"a1"`, `"a0V"`)
- Field order must match the order above exactly
- One blank line between closing `---` and content

### Fractional Index Ordering

The `order` field uses fractional indexing (via the `fractional-indexing` npm package). Keys are lexicographically sortable strings that allow insertion between any two items without reindexing other items.

- First key in an empty column: `"a0"`
- Appending after `"a0"`: `"a1"`, after `"a1"`: `"a2"`, etc.
- Character sequence: `0-9`, `A-Z`, `a-z` (base-62, ASCII order)
- The extension auto-migrates legacy bare integer orders to fractional indices on load

## File Storage

- **Active features** (backlog, todo, in-progress, review): `{featuresDir}/{id}.md`
- **Completed features** (done): `{featuresDir}/done/{id}.md`
- Default features directory: `.devtool/features/` relative to workspace root
- Configurable via VS Code setting `kanban-markdown.featuresDirectory`

## Status Transitions

When a feature moves **to `done`**:
- Set `completedAt` to current ISO timestamp
- Move file from `{featuresDir}/{id}.md` to `{featuresDir}/done/{id}.md`
- Update `modified`

When a feature moves **from `done`** to another status:
- Set `completedAt` to `null`
- Move file from `{featuresDir}/done/{id}.md` to `{featuresDir}/{id}.md`
- Update `modified`

When moving within non-done columns:
- File stays in same location
- Update `status`, `modified`, and `order`
- Only the moved feature's `order` is updated (fractional key between new neighbors); other features are not reindexed

## Content Format

After the frontmatter, content starts with `# Title` heading followed by description, acceptance criteria, checklists, etc.

```markdown
# Feature Title

Description of the feature.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
```

## VS Code Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `kanban-markdown.featuresDirectory` | `string` | `.devtool/features` | Path to features directory |
| `kanban-markdown.defaultPriority` | `string` | `"medium"` | Default priority for new features |
| `kanban-markdown.defaultStatus` | `string` | `"backlog"` | Default status for new features |
| `kanban-markdown.showPriorityBadges` | `boolean` | `true` | Show priority badges on cards |
| `kanban-markdown.showAssignee` | `boolean` | `true` | Show assignee on cards |
| `kanban-markdown.showDueDate` | `boolean` | `true` | Show due date on cards |
| `kanban-markdown.showLabels` | `boolean` | `true` | Show labels on cards |
| `kanban-markdown.compactMode` | `boolean` | `false` | Compact card display |
| `kanban-markdown.markdownEditorMode` | `boolean` | `false` | Open features in native editor |
