#!/usr/bin/env python3
"""
Google Calendar API operations.
Lightweight alternative to the full Google Workspace MCP server.
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Optional

from auth import get_valid_access_token

CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"


def get_local_timezone() -> str:
    """Get the local timezone as an IANA timezone string."""
    try:
        # Python 3.9+ has zoneinfo, try to get local timezone
        local_offset = datetime.now().astimezone().strftime('%z')
        # Return offset in format like +05:30 or -08:00
        return local_offset[:3] + ':' + local_offset[3:]
    except Exception:
        return '+00:00'  # Fallback to UTC


def to_utc_iso(dt_string: str) -> str:
    """
    Convert a datetime string to UTC ISO format.
    Handles: ISO with timezone, ISO without timezone (assumes local), or already UTC.
    """
    if not dt_string:
        return dt_string

    # Already has Z suffix - it's UTC
    if dt_string.endswith('Z'):
        return dt_string

    # Has timezone offset already
    if '+' in dt_string[-6:] or (dt_string[-6:].count('-') > 0 and ':' in dt_string[-6:]):
        return dt_string

    # No timezone - assume local and add offset
    local_offset = get_local_timezone()
    return f"{dt_string}{local_offset}"


def api_request(method: str, endpoint: str, data: Optional[dict] = None, params: Optional[dict] = None) -> dict:
    """Make an authenticated request to the Google Calendar API."""
    token = get_valid_access_token()
    if not token:
        return {"error": "Failed to get access token"}

    url = f"{CALENDAR_API_BASE}/{endpoint}"
    if params:
        url += "?" + urllib.parse.urlencode(params)

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    body = json.dumps(data).encode('utf-8') if data else None

    try:
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=30) as response:
            response_text = response.read().decode('utf-8')
            if response_text:
                return json.loads(response_text)
            return {"success": True}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else str(e)
        try:
            error_json = json.loads(error_body)
            error_message = error_json.get("error", {}).get("message", error_body)
        except json.JSONDecodeError:
            error_message = error_body
        return {"error": f"HTTP {e.code}: {error_message}"}
    except urllib.error.URLError as e:
        return {"error": f"Request failed: {e.reason}"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON response"}


def list_calendars() -> dict:
    """List all calendars the user has access to."""
    result = api_request("GET", "users/me/calendarList")
    if "error" in result:
        return result

    calendars = result.get("items", [])
    return [{"id": c.get("id"), "summary": c.get("summary"), "primary": c.get("primary", False)} for c in calendars]


def get_primary_calendar_id() -> str:
    """Get the primary calendar ID."""
    calendars = list_calendars()
    if isinstance(calendars, dict) and "error" in calendars:
        return "primary"

    for cal in calendars:
        if cal.get("primary"):
            return cal.get("id", "primary")
    return "primary"


def list_events(calendar_id: Optional[str] = None, time_min: Optional[str] = None,
                time_max: Optional[str] = None, max_results: int = 50) -> dict:
    """List events from a calendar."""
    if not calendar_id:
        calendar_id = get_primary_calendar_id()

    # Default time range: now to 30 days from now (using timezone-aware datetime)
    if not time_min:
        time_min = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    else:
        time_min = to_utc_iso(time_min)
    if not time_max:
        time_max = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat().replace('+00:00', 'Z')
    else:
        time_max = to_utc_iso(time_max)

    params = {
        "timeMin": time_min,
        "timeMax": time_max,
        "maxResults": max_results,
        "singleEvents": "true",
        "orderBy": "startTime"
    }

    result = api_request("GET", f"calendars/{urllib.parse.quote(calendar_id, safe='')}/events", params=params)
    if "error" in result:
        return result

    events = result.get("items", [])
    return [
        {
            "id": e.get("id"),
            "summary": e.get("summary"),
            "start": e.get("start"),
            "end": e.get("end"),
            "description": e.get("description"),
            "location": e.get("location"),
            "attendees": e.get("attendees"),
            "htmlLink": e.get("htmlLink"),
            "status": e.get("status")
        }
        for e in events if e.get("status") != "cancelled"
    ]


def get_event(event_id: str, calendar_id: Optional[str] = None) -> dict:
    """Get details of a specific event."""
    if not calendar_id:
        calendar_id = get_primary_calendar_id()

    return api_request("GET", f"calendars/{urllib.parse.quote(calendar_id, safe='')}/events/{event_id}")


def create_event(summary: str, start: str, end: str, calendar_id: Optional[str] = None,
                 description: Optional[str] = None, location: Optional[str] = None,
                 attendees: Optional[list] = None) -> dict:
    """Create a new calendar event. Times without timezone are assumed to be local."""
    if not calendar_id:
        calendar_id = get_primary_calendar_id()

    # Ensure times have timezone info (assume local if not specified)
    start_dt = to_utc_iso(start)
    end_dt = to_utc_iso(end)

    event_data = {
        "summary": summary,
        "start": {"dateTime": start_dt},
        "end": {"dateTime": end_dt}
    }

    if description:
        event_data["description"] = description
    if location:
        event_data["location"] = location
    if attendees:
        event_data["attendees"] = [{"email": email} for email in attendees]

    return api_request("POST", f"calendars/{urllib.parse.quote(calendar_id, safe='')}/events", data=event_data)


def update_event(event_id: str, calendar_id: Optional[str] = None, summary: Optional[str] = None,
                 start: Optional[str] = None, end: Optional[str] = None,
                 description: Optional[str] = None, location: Optional[str] = None,
                 attendees: Optional[list] = None) -> dict:
    """Update an existing calendar event. Times without timezone are assumed to be local."""
    if not calendar_id:
        calendar_id = get_primary_calendar_id()

    # First get the current event to preserve fields
    current = get_event(event_id, calendar_id)
    if "error" in current:
        return current

    # Build update data
    event_data = {}
    if summary is not None:
        event_data["summary"] = summary
    else:
        event_data["summary"] = current.get("summary")

    if start is not None:
        event_data["start"] = {"dateTime": to_utc_iso(start)}
    else:
        event_data["start"] = current.get("start")

    if end is not None:
        event_data["end"] = {"dateTime": to_utc_iso(end)}
    else:
        event_data["end"] = current.get("end")

    if description is not None:
        event_data["description"] = description
    elif current.get("description"):
        event_data["description"] = current.get("description")

    if location is not None:
        event_data["location"] = location
    elif current.get("location"):
        event_data["location"] = current.get("location")

    if attendees is not None:
        event_data["attendees"] = [{"email": email} for email in attendees]
    elif current.get("attendees"):
        event_data["attendees"] = current.get("attendees")

    return api_request("PUT", f"calendars/{urllib.parse.quote(calendar_id, safe='')}/events/{event_id}", data=event_data)


def delete_event(event_id: str, calendar_id: Optional[str] = None) -> dict:
    """Delete a calendar event."""
    if not calendar_id:
        calendar_id = get_primary_calendar_id()

    result = api_request("DELETE", f"calendars/{urllib.parse.quote(calendar_id, safe='')}/events/{event_id}")
    if "error" not in result:
        return {"message": f"Successfully deleted event {event_id}"}
    return result


def find_free_time(attendees: list, time_min: str, time_max: str, duration_minutes: int) -> dict:
    """Find free time slots for the given attendees."""
    # Build freebusy request
    items = []
    for email in attendees:
        if email.lower() == "me":
            items.append({"id": get_primary_calendar_id()})
        else:
            items.append({"id": email})

    request_data = {
        "timeMin": time_min,
        "timeMax": time_max,
        "items": items
    }

    result = api_request("POST", "freeBusy", data=request_data)
    if "error" in result:
        return result

    # Collect all busy times
    busy_times = []
    calendars = result.get("calendars", {})
    for cal_id, cal_data in calendars.items():
        for busy in cal_data.get("busy", []):
            busy_times.append({
                "start": datetime.fromisoformat(busy["start"].replace("Z", "+00:00")),
                "end": datetime.fromisoformat(busy["end"].replace("Z", "+00:00"))
            })

    # Sort busy times by start
    busy_times.sort(key=lambda x: x["start"])

    # Merge overlapping intervals
    merged = []
    for busy in busy_times:
        if not merged:
            merged.append(busy)
        elif busy["start"] <= merged[-1]["end"]:
            merged[-1]["end"] = max(merged[-1]["end"], busy["end"])
        else:
            merged.append(busy)

    # Find first available slot
    start_time = datetime.fromisoformat(time_min.replace("Z", "+00:00"))
    end_time = datetime.fromisoformat(time_max.replace("Z", "+00:00"))
    duration = timedelta(minutes=duration_minutes)

    # Check before first busy period
    if not merged or start_time + duration <= merged[0]["start"]:
        slot_end = start_time + duration
        return {
            "start": start_time.isoformat().replace("+00:00", "Z"),
            "end": slot_end.isoformat().replace("+00:00", "Z")
        }

    # Check gaps between busy periods
    for i in range(len(merged) - 1):
        gap_start = merged[i]["end"]
        gap_end = merged[i + 1]["start"]
        if gap_end - gap_start >= duration:
            slot_end = gap_start + duration
            return {
                "start": gap_start.isoformat().replace("+00:00", "Z"),
                "end": slot_end.isoformat().replace("+00:00", "Z")
            }

    # Check after last busy period
    if merged:
        last_end = merged[-1]["end"]
        if last_end + duration <= end_time:
            slot_end = last_end + duration
            return {
                "start": last_end.isoformat().replace("+00:00", "Z"),
                "end": slot_end.isoformat().replace("+00:00", "Z")
            }

    return {"error": "No available free time found in the specified range"}


def respond_to_event(event_id: str, response_status: str, calendar_id: Optional[str] = None,
                     send_notification: bool = True) -> dict:
    """Respond to a calendar event invitation (accept, decline, tentative)."""
    if not calendar_id:
        calendar_id = get_primary_calendar_id()

    if response_status not in ["accepted", "declined", "tentative"]:
        return {"error": "Invalid response status. Use: accepted, declined, or tentative"}

    # Get the current event
    event = get_event(event_id, calendar_id)
    if "error" in event:
        return event

    attendees = event.get("attendees", [])
    if not attendees:
        return {"error": "Event has no attendees"}

    # Find self in attendees and update response
    self_found = False
    for attendee in attendees:
        if attendee.get("self"):
            attendee["responseStatus"] = response_status
            self_found = True
            break

    if not self_found:
        return {"error": "You are not an attendee of this event"}

    # Update the event
    params = {"sendNotifications": str(send_notification).lower()}
    result = api_request(
        "PATCH",
        f"calendars/{urllib.parse.quote(calendar_id, safe='')}/events/{event_id}?" + urllib.parse.urlencode(params),
        data={"attendees": attendees}
    )

    if "error" not in result:
        return {
            "eventId": result.get("id"),
            "summary": result.get("summary"),
            "responseStatus": response_status,
            "message": f"Successfully {response_status} the meeting invitation"
        }
    return result


def main():
    parser = argparse.ArgumentParser(description="Google Calendar API operations")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # list-calendars
    subparsers.add_parser("list-calendars", help="List all calendars")

    # list-events
    list_events_parser = subparsers.add_parser("list-events", help="List events from a calendar")
    list_events_parser.add_argument("--calendar", help="Calendar ID (default: primary)")
    list_events_parser.add_argument("--time-min", help="Start time (ISO 8601)")
    list_events_parser.add_argument("--time-max", help="End time (ISO 8601)")
    list_events_parser.add_argument("--max-results", type=int, default=50, help="Max events to return")

    # get-event
    get_event_parser = subparsers.add_parser("get-event", help="Get details of a specific event")
    get_event_parser.add_argument("event_id", help="Event ID")
    get_event_parser.add_argument("--calendar", help="Calendar ID (default: primary)")

    # create-event
    create_event_parser = subparsers.add_parser("create-event", help="Create a new event")
    create_event_parser.add_argument("summary", help="Event title")
    create_event_parser.add_argument("start", help="Start time (ISO 8601, e.g., 2024-01-15T10:30:00Z)")
    create_event_parser.add_argument("end", help="End time (ISO 8601)")
    create_event_parser.add_argument("--calendar", help="Calendar ID (default: primary)")
    create_event_parser.add_argument("--description", help="Event description")
    create_event_parser.add_argument("--location", help="Event location")
    create_event_parser.add_argument("--attendees", nargs="+", help="Attendee email addresses")

    # update-event
    update_event_parser = subparsers.add_parser("update-event", help="Update an existing event")
    update_event_parser.add_argument("event_id", help="Event ID")
    update_event_parser.add_argument("--calendar", help="Calendar ID (default: primary)")
    update_event_parser.add_argument("--summary", help="New event title")
    update_event_parser.add_argument("--start", help="New start time (ISO 8601)")
    update_event_parser.add_argument("--end", help="New end time (ISO 8601)")
    update_event_parser.add_argument("--description", help="New description")
    update_event_parser.add_argument("--location", help="New location")
    update_event_parser.add_argument("--attendees", nargs="+", help="New attendee email addresses")

    # delete-event
    delete_event_parser = subparsers.add_parser("delete-event", help="Delete an event")
    delete_event_parser.add_argument("event_id", help="Event ID")
    delete_event_parser.add_argument("--calendar", help="Calendar ID (default: primary)")

    # find-free-time
    find_free_parser = subparsers.add_parser("find-free-time", help="Find free time slots")
    find_free_parser.add_argument("--attendees", nargs="+", required=True, help="Attendee emails (use 'me' for yourself)")
    find_free_parser.add_argument("--time-min", required=True, help="Start of search range (ISO 8601)")
    find_free_parser.add_argument("--time-max", required=True, help="End of search range (ISO 8601)")
    find_free_parser.add_argument("--duration", type=int, required=True, help="Meeting duration in minutes")

    # respond-to-event
    respond_parser = subparsers.add_parser("respond-to-event", help="Respond to an event invitation")
    respond_parser.add_argument("event_id", help="Event ID")
    respond_parser.add_argument("response", choices=["accepted", "declined", "tentative"], help="Response status")
    respond_parser.add_argument("--calendar", help="Calendar ID (default: primary)")
    respond_parser.add_argument("--no-notify", action="store_true", help="Don't send notification to organizer")

    args = parser.parse_args()

    if args.command == "list-calendars":
        result = list_calendars()
    elif args.command == "list-events":
        result = list_events(args.calendar, args.time_min, args.time_max, args.max_results)
    elif args.command == "get-event":
        result = get_event(args.event_id, args.calendar)
    elif args.command == "create-event":
        result = create_event(args.summary, args.start, args.end, args.calendar,
                              args.description, args.location, args.attendees)
    elif args.command == "update-event":
        result = update_event(args.event_id, args.calendar, args.summary, args.start, args.end,
                              args.description, args.location, args.attendees)
    elif args.command == "delete-event":
        result = delete_event(args.event_id, args.calendar)
    elif args.command == "find-free-time":
        result = find_free_time(args.attendees, args.time_min, args.time_max, args.duration)
    elif args.command == "respond-to-event":
        result = respond_to_event(args.event_id, args.response, args.calendar, not args.no_notify)
    else:
        result = {"error": f"Unknown command: {args.command}"}

    print(json.dumps(result, indent=2))

    if isinstance(result, dict) and "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
