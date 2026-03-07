# Google Calendar Skill

An AI agent skill for interacting with Google Calendar - list events, create/update/delete events, find free time, and respond to invitations. Works with Claude Code, Gemini CLI, Cursor, OpenAI Codex, Goose, and other AI clients supporting the [Agent Skills Standard](https://agentskills.io).

## Features

- **List Events** - View upcoming events with time range filtering
- **Create Events** - Schedule meetings with attendees
- **Update Events** - Modify existing events
- **Delete Events** - Remove calendar entries
- **Find Free Time** - Discover available slots across attendees
- **Respond to Invitations** - Accept, decline, or mark tentative

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

### List Events

```bash
# List events from primary calendar (default: next 30 days)
python scripts/gcal.py list-events

# List events with time range
python scripts/gcal.py list-events --time-min 2024-01-15T00:00:00Z --time-max 2024-01-31T23:59:59Z

# List from specific calendar
python scripts/gcal.py list-events --calendar "work@example.com"
```

### Create Events

```bash
# Basic event
python scripts/gcal.py create-event "Team Meeting" "2024-01-15T10:00:00Z" "2024-01-15T11:00:00Z"

# With description and location
python scripts/gcal.py create-event "Team Meeting" "2024-01-15T10:00:00Z" "2024-01-15T11:00:00Z" \
    --description "Weekly sync" --location "Conference Room A"

# With attendees
python scripts/gcal.py create-event "Team Meeting" "2024-01-15T10:00:00Z" "2024-01-15T11:00:00Z" \
    --attendees user1@example.com user2@example.com
```

### Update Events

```bash
python scripts/gcal.py update-event EVENT_ID --summary "New Title"
python scripts/gcal.py update-event EVENT_ID --start "2024-01-15T14:00:00Z" --end "2024-01-15T15:00:00Z"
```

### Find Free Time

```bash
# Find 30-minute slot for yourself
python scripts/gcal.py find-free-time \
    --attendees me \
    --time-min "2024-01-15T09:00:00Z" \
    --time-max "2024-01-15T17:00:00Z" \
    --duration 30

# Find 60-minute slot with multiple attendees
python scripts/gcal.py find-free-time \
    --attendees me user1@example.com user2@example.com \
    --time-min "2024-01-15T09:00:00Z" \
    --time-max "2024-01-19T17:00:00Z" \
    --duration 60
```

### Respond to Invitations

```bash
python scripts/gcal.py respond-to-event EVENT_ID accepted
python scripts/gcal.py respond-to-event EVENT_ID declined
python scripts/gcal.py respond-to-event EVENT_ID tentative
```

## Command Reference

| Command | Description | Arguments |
|---------|-------------|-----------|
| `list-calendars` | List all calendars | - |
| `list-events` | List events | `--calendar`, `--time-min`, `--time-max` |
| `get-event <id>` | Get event details | event ID |
| `create-event <title> <start> <end>` | Create event | title, times, `--attendees` |
| `update-event <id>` | Update event | event ID, fields to update |
| `delete-event <id>` | Delete event | event ID |
| `find-free-time` | Find available slots | `--attendees`, `--duration` |
| `respond-to-event <id> <response>` | Respond to invite | event ID, accepted/declined/tentative |

## Date/Time Format

All times use ISO 8601 format:
- UTC: `2024-01-15T10:30:00Z`
- With offset: `2024-01-15T10:30:00-05:00`
- Local time (offset added automatically): `2024-01-15T10:30:00`

## Token Management

Tokens stored securely using the system keyring:
- **macOS**: Keychain
- **Windows**: Windows Credential Locker
- **Linux**: Secret Service API (GNOME Keyring, KDE Wallet)

Service name: `google-calendar-skill-oauth`

## Troubleshooting

### "Failed to get access token"
Run `python scripts/auth.py login` to authenticate.

### "Event not found"
Check the event ID and your calendar access.

### "No free time found"
Try a wider time range or longer duration.

## License

Apache 2.0
