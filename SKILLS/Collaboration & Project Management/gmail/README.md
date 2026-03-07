# Gmail Skill

An AI agent skill for interacting with Gmail - search emails, read messages, send emails, create drafts, and manage labels. Works with Claude Code, Gemini CLI, Cursor, OpenAI Codex, Goose, and other AI clients supporting the [Agent Skills Standard](https://agentskills.io).

## Features

- **Search** - Find emails using Gmail query syntax
- **Read** - Get full message content
- **Send** - Send plain text or HTML emails
- **Drafts** - Create and send draft emails
- **Labels** - Archive, star, mark read/unread

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

### Search Emails

```bash
# Search with Gmail query syntax
python scripts/gmail.py search "from:someone@example.com is:unread"

# Get recent emails
python scripts/gmail.py search --limit 20

# Filter by label
python scripts/gmail.py search --label INBOX --limit 10

# Include spam and trash
python scripts/gmail.py search "subject:important" --include-spam-trash
```

### Read Emails

```bash
# Get full message content
python scripts/gmail.py get MESSAGE_ID

# Get just metadata (headers)
python scripts/gmail.py get MESSAGE_ID --format metadata
```

### Send Emails

```bash
# Send a simple email
python scripts/gmail.py send --to "user@example.com" --subject "Hello" --body "Message body"

# Send with CC and BCC
python scripts/gmail.py send --to "user@example.com" --cc "cc@example.com" --bcc "bcc@example.com" \
  --subject "Team Update" --body "Update message"

# Send HTML email
python scripts/gmail.py send --to "user@example.com" --subject "HTML Email" \
  --body "<h1>Hello</h1><p>HTML content</p>" --html
```

### Draft Management

```bash
# Create a draft
python scripts/gmail.py create-draft --to "user@example.com" --subject "Draft Subject" \
  --body "Draft content"

# Send an existing draft
python scripts/gmail.py send-draft DRAFT_ID
```

### Modify Messages (Labels)

```bash
# Mark as read
python scripts/gmail.py modify MESSAGE_ID --remove-label UNREAD

# Archive (remove from inbox)
python scripts/gmail.py modify MESSAGE_ID --remove-label INBOX

# Star a message
python scripts/gmail.py modify MESSAGE_ID --add-label STARRED

# Multiple changes
python scripts/gmail.py modify MESSAGE_ID --remove-label UNREAD --add-label STARRED
```

## Command Reference

| Command | Description | Arguments |
|---------|-------------|-----------|
| `search [query]` | Search emails | query, `--limit`, `--label` |
| `get <id>` | Read message | message ID, `--format` |
| `send` | Send email | `--to`, `--subject`, `--body`, `--html` |
| `create-draft` | Create draft | `--to`, `--subject`, `--body` |
| `send-draft <id>` | Send draft | draft ID |
| `modify <id>` | Change labels | `--add-label`, `--remove-label` |
| `list-labels` | List all labels | - |

## Gmail Query Syntax

| Query | Description |
|-------|-------------|
| `from:user@example.com` | From specific sender |
| `to:user@example.com` | To specific recipient |
| `subject:meeting` | Subject contains "meeting" |
| `is:unread` | Unread emails |
| `is:starred` | Starred emails |
| `has:attachment` | Has attachments |
| `after:2024/01/01` | After date |
| `newer_than:7d` | Last 7 days |
| `label:work` | Specific label |

Combine with AND (space), OR, or `-` (NOT).

## Common Labels

| Label | Description |
|-------|-------------|
| `INBOX` | Inbox |
| `SENT` | Sent mail |
| `STARRED` | Starred |
| `IMPORTANT` | Important |
| `UNREAD` | Unread |
| `TRASH` | Trash |
| `SPAM` | Spam |

## Token Management

Tokens stored securely using the system keyring:
- **macOS**: Keychain
- **Windows**: Windows Credential Locker
- **Linux**: Secret Service API (GNOME Keyring, KDE Wallet)

Service name: `gmail-skill-oauth`

## Troubleshooting

### "Failed to get access token"
Run `python scripts/auth.py login` to authenticate.

### "Message not found"
Check the message ID. Use `search` to find valid IDs.

### "Permission denied"
Ensure you have the required Gmail permissions. Re-authenticate if needed.

## License

Apache 2.0
