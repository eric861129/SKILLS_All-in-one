# Google Docs Skill

An AI agent skill for interacting with Google Docs - create documents, search by title, read content, and edit text. Works with Claude Code, Gemini CLI, Cursor, OpenAI Codex, Goose, and other AI clients supporting the [Agent Skills Standard](https://agentskills.io).

## Features

- **Create Documents** - Create new Google Docs with optional content
- **Search** - Find documents by title
- **Read Content** - Extract text from documents
- **Edit** - Append, insert, or replace text

Lightweight alternative to the full [Google Workspace MCP server](https://github.com/gemini-cli-extensions/workspace).

> **⚠️ Requires Google Workspace account.** Personal Gmail accounts are not supported.

## Quick Start

### 1. Install dependencies

```bash
pip install keyring
```

### 2. Authenticate

```bash
python scripts/auth.py login
```

This opens a browser for Google OAuth. Tokens are stored securely in your system keyring.

### 3. Test connection

```bash
python scripts/auth.py status
```

## Usage Examples

```bash
# Create a new document
python scripts/docs.py create "Meeting Notes"

# Create with initial content
python scripts/docs.py create "Project Plan" --content "# Overview\n\nThis is the plan."

# Find documents by title
python scripts/docs.py find "meeting" --limit 10

# Get text content of a document
python scripts/docs.py get-text 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# Get text using a full URL
python scripts/docs.py get-text "https://docs.google.com/document/d/1BxiMVs.../edit"

# Append text to end of document
python scripts/docs.py append-text DOC_ID "New paragraph at the end."

# Insert text at beginning
python scripts/docs.py insert-text DOC_ID "Text at the beginning.\n\n"

# Replace text in document
python scripts/docs.py replace-text DOC_ID "old text" "new text"
```

## Command Reference

| Command | Description | Arguments |
|---------|-------------|-----------|
| `create <title>` | Create new document | title, `--content` |
| `find <query>` | Search by title | search query, `--limit` |
| `get-text <id>` | Get document text | document ID or URL |
| `append-text <id> <text>` | Append to end | document ID, text |
| `insert-text <id> <text>` | Insert at start | document ID, text |
| `replace-text <id> <old> <new>` | Replace text | document ID, old, new |

## Document ID Format

Google Docs uses IDs like `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`. You can:
- Use the full URL (ID is extracted automatically)
- Use just the document ID
- Get document IDs from the `find` command

## Token Management

Tokens stored securely using the system keyring:
- **macOS**: Keychain
- **Windows**: Windows Credential Locker
- **Linux**: Secret Service API (GNOME Keyring, KDE Wallet)

Service name: `google-docs-skill-oauth`

## Troubleshooting

### "Failed to get access token"
Run `python scripts/auth.py login` to authenticate.

### "Document not found"
Check that the document ID is correct and you have access to the document.

### "Permission denied"
You need edit access to modify a document. Check sharing settings.

## License

Apache 2.0
