# Google Chat Skill

An AI agent skill for interacting with Google Chat - list spaces, send messages, read conversations, and manage DMs. Works with Claude Code, Gemini CLI, Cursor, OpenAI Codex, Goose, and other AI clients supporting the [Agent Skills Standard](https://agentskills.io).

## Features

- **List Spaces** - View all Chat spaces you're a member of
- **Find Spaces** - Search for spaces by name
- **Send Messages** - Post messages to any space
- **Direct Messages** - Send DMs to users
- **Read Messages** - Get conversation history from spaces
- **Create Spaces** - Set up new spaces with members

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
# List all spaces you're a member of
python scripts/chat.py list-spaces

# Find a space by name
python scripts/chat.py find-space "Project Alpha"

# Get messages from a space
python scripts/chat.py get-messages spaces/AAAA123 --limit 10

# Send a message to a space
python scripts/chat.py send-message spaces/AAAA123 "Hello team!"

# Send a direct message
python scripts/chat.py send-dm user@example.com "Hey, quick question..."

# Find or create DM space with someone
python scripts/chat.py find-dm user@example.com

# List threads in a space
python scripts/chat.py list-threads spaces/AAAA123

# Create a new space with members
python scripts/chat.py setup-space "New Project" user1@example.com user2@example.com
```

## Command Reference

| Command | Description | Arguments |
|---------|-------------|-----------|
| `list-spaces` | List all spaces | - |
| `find-space <name>` | Find space by name | space name |
| `get-messages <space>` | Get messages from space | space ID, `--limit` |
| `send-message <space> <text>` | Send message | space ID, message text |
| `send-dm <email> <text>` | Send direct message | user email, message text |
| `find-dm <email>` | Find/create DM space | user email |
| `list-threads <space>` | List threads | space ID |
| `setup-space <name> [emails...]` | Create space | name, member emails |

## Space Name Format

Google Chat uses `spaces/AAAA123` format for space IDs. Get space names from `list-spaces` or `find-space` output.

## Token Management

Tokens stored securely using the system keyring:
- **macOS**: Keychain
- **Windows**: Windows Credential Locker
- **Linux**: Secret Service API (GNOME Keyring, KDE Wallet)

Service name: `google-chat-skill-oauth`

## Troubleshooting

### "Failed to get access token"
Run `python scripts/auth.py login` to authenticate.

### "Space not found"
Verify the space ID format (`spaces/AAAA123`). Use `list-spaces` to get valid IDs.

### "Permission denied"
You may not be a member of the space. Check your Google Chat membership.

## License

Apache 2.0
