# Outline Wiki Skill

An AI agent skill for searching, reading, and managing documents in [Outline](https://www.getoutline.com/) wiki instances. Works with Claude Code, Gemini CLI, Cursor, OpenAI Codex, Goose, and other AI clients supporting the [Agent Skills Standard](https://agentskills.io).

## Features

- **Search** - Full-text search across all documents and collections
- **Read** - Retrieve document content by ID
- **List** - Browse collections and documents
- **Create** - Create new documents with markdown content
- **Update** - Modify existing documents
- **Export** - Export documents as markdown files

Works with both [Outline Cloud](https://www.getoutline.com/) and self-hosted instances.

## Quick Start

### 1. Install dependencies

```bash
cd skills/outline
pip install -r requirements.txt
```

### 2. Get your API key

1. Log into your Outline wiki
2. Go to **Settings** > **API Tokens**
3. Click **Create a token**
4. Copy the generated token

### 3. Configure environment

```bash
# Copy example config
cp .env.example .env

# Edit .env with your API key
# OUTLINE_API_KEY=your-api-key-here
```

Or set environment variables directly:

```bash
export OUTLINE_API_KEY=your-api-key-here

# For self-hosted instances:
export OUTLINE_API_URL=https://wiki.yourcompany.com/api
```

### 4. Test connection

```bash
python3 scripts/outline.py auth-info
```

## Usage Examples

### Searching

```bash
# Search for documents
python3 scripts/outline.py search "deployment"

# Search within a specific collection
python3 scripts/outline.py search "API" --collection-id abc123

# Limit results
python3 scripts/outline.py search "guide" --limit 5
```

### Reading Documents

```bash
# Read a document
python3 scripts/outline.py read doc-uuid-here

# Get JSON output
python3 scripts/outline.py read doc-uuid-here --json
```

### Browsing Collections

```bash
# List all collections
python3 scripts/outline.py list-collections

# Get collection details
python3 scripts/outline.py get-collection collection-uuid

# List documents in a collection
python3 scripts/outline.py list-documents --collection-id collection-uuid
```

### Creating Documents

```bash
# Create a simple document
python3 scripts/outline.py create \
  --title "My New Document" \
  --collection-id collection-uuid

# Create with content
python3 scripts/outline.py create \
  --title "Setup Guide" \
  --collection-id collection-uuid \
  --text "# Getting Started\n\nWelcome to the guide..."

# Create as draft (unpublished)
python3 scripts/outline.py create \
  --title "Work in Progress" \
  --collection-id collection-uuid \
  --draft

# Create as child of another document
python3 scripts/outline.py create \
  --title "Sub-section" \
  --collection-id collection-uuid \
  --parent-id parent-doc-uuid
```

### Updating Documents

```bash
# Update title
python3 scripts/outline.py update doc-uuid --title "New Title"

# Update content
python3 scripts/outline.py update doc-uuid --text "# Updated Content"

# Publish a draft
python3 scripts/outline.py update doc-uuid --publish

# Unpublish
python3 scripts/outline.py update doc-uuid --unpublish
```

### Exporting

```bash
# Print markdown to stdout
python3 scripts/outline.py export doc-uuid

# Save to file
python3 scripts/outline.py export doc-uuid --output document.md
```

## JSON Output

All commands support `--json` flag for machine-readable output:

```bash
python3 scripts/outline.py search "api" --json | jq '.documents[].title'
python3 scripts/outline.py list-collections --json | jq '.collections[] | {name, id}'
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OUTLINE_API_KEY` | Yes | - | Your Outline API token |
| `OUTLINE_API_URL` | No | `https://app.getoutline.com/api` | API endpoint URL |
| `OUTLINE_TIMEOUT` | No | `30` | Request timeout in seconds |

### Self-Hosted Outline

For self-hosted instances, set `OUTLINE_API_URL` to your instance's API endpoint:

```bash
export OUTLINE_API_URL=https://wiki.yourcompany.com/api
```

## Command Reference

| Command | Description | Required Arguments |
|---------|-------------|-------------------|
| `search <query>` | Search documents | query string |
| `read <id>` | Get document content | document ID |
| `list-collections` | List all collections | - |
| `list-documents` | List documents | - |
| `get-collection <id>` | Get collection info | collection ID |
| `create` | Create document | `--title`, `--collection-id` |
| `update <id>` | Update document | document ID |
| `export <id>` | Export as markdown | document ID |
| `auth-info` | Test authentication | - |

### Common Options

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--limit N` | Max results (default: 25, max: 100) |
| `--offset N` | Skip N results (pagination) |
| `--collection-id ID` | Filter by collection |

## Troubleshooting

### "OUTLINE_API_KEY environment variable is required"

Set your API key:
```bash
export OUTLINE_API_KEY=your-api-key
```

Or create a `.env` file in the skill directory.

### "HTTP 401: Unauthorized"

Your API key is invalid or expired. Generate a new one from Outline settings.

### "HTTP 403: Forbidden"

Your API token doesn't have permission for this operation. Create a new token with appropriate scopes.

### "Connection timeout"

- Check your `OUTLINE_API_URL` is correct
- Verify network connectivity to the Outline server
- Try increasing timeout: `export OUTLINE_TIMEOUT=60`

### "Document/Collection not found"

- Verify the ID is correct (UUIDs, not URL slugs)
- Check you have permission to access the resource

## API Reference

This skill wraps the [Outline API](https://www.getoutline.com/developers). Key endpoints used:

- `POST /auth.info` - Authentication check
- `POST /documents.search` - Full-text search
- `POST /documents.info` - Get document
- `POST /documents.list` - List documents
- `POST /documents.create` - Create document
- `POST /documents.update` - Update document
- `POST /documents.export` - Export as markdown
- `POST /collections.list` - List collections
- `POST /collections.info` - Get collection

## License

Apache 2.0
