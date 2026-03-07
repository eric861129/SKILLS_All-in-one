#!/usr/bin/env python3
"""
Google Chat API operations.
Lightweight alternative to the full Google Workspace MCP server.
"""

import argparse
import json
import mimetypes
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional

from auth import get_valid_access_token

CHAT_API_BASE = "https://chat.googleapis.com/v1"
CHAT_UPLOAD_BASE = "https://chat.googleapis.com/upload/v1"


def api_request(method: str, endpoint: str, data: Optional[dict] = None, params: Optional[dict] = None) -> dict:
    """Make an authenticated request to the Google Chat API."""
    token = get_valid_access_token()
    if not token:
        return {"error": "Failed to get access token"}

    url = f"{CHAT_API_BASE}/{endpoint}"
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
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else str(e)
        return {"error": f"HTTP {e.code}: {error_body}"}
    except urllib.error.URLError as e:
        return {"error": f"Request failed: {e.reason}"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON response"}


def upload_attachment(space_name: str, file_path: str, text: str = "") -> dict:
    """Send a message with a file attachment (two-step: upload then send)."""
    import requests as req_lib

    token = get_valid_access_token()
    if not token:
        return {"error": "Failed to get access token"}

    if not os.path.isfile(file_path):
        return {"error": f"File not found: {file_path}"}

    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    filename = os.path.basename(file_path)
    headers = {"Authorization": f"Bearer {token}"}

    # Step 1: Upload the file to get an attachment token
    upload_url = f"{CHAT_UPLOAD_BASE}/{space_name}/attachments:upload"
    metadata = json.dumps({"filename": filename})

    with open(file_path, 'rb') as f:
        upload_resp = req_lib.post(
            upload_url,
            headers=headers,
            files={
                "metadata": ("metadata", metadata, "application/json"),
                "file": (filename, f, mime_type),
            },
            params={"uploadType": "multipart"},
            timeout=60,
        )

    if upload_resp.status_code != 200:
        return {"error": f"Upload failed HTTP {upload_resp.status_code}: {upload_resp.text}"}

    upload_data = upload_resp.json()
    attachment_token = upload_data.get("attachmentDataRef", {}).get("attachmentUploadToken")
    if not attachment_token:
        return {"error": "Upload succeeded but no attachment token returned"}

    # Step 2: Send message with the attachment reference
    msg_url = f"{CHAT_API_BASE}/{space_name}/messages"
    msg_data = {
        "text": text,
        "attachment": [{
            "contentName": filename,
            "contentType": mime_type,
            "attachmentDataRef": {
                "attachmentUploadToken": attachment_token
            }
        }]
    }

    msg_resp = req_lib.post(
        msg_url,
        headers={**headers, "Content-Type": "application/json"},
        data=json.dumps(msg_data),
        timeout=30,
    )

    if msg_resp.status_code != 200:
        return {"error": f"Send failed HTTP {msg_resp.status_code}: {msg_resp.text}"}

    return msg_resp.json()


def list_spaces() -> dict:
    """List all spaces the user is a member of."""
    result = api_request("GET", "spaces")
    return result.get("spaces", []) if "spaces" in result else result


def find_space_by_name(display_name: str) -> dict:
    """Find a space by its display name."""
    spaces = list_spaces()
    if isinstance(spaces, dict) and "error" in spaces:
        return spaces

    matching = [s for s in spaces if s.get("displayName") == display_name]
    if matching:
        return {"spaces": matching}
    return {"error": f"No space found with display name: {display_name}"}


def get_messages(space_name: str, page_size: int = 25, page_token: Optional[str] = None,
                 order_by: str = "createTime desc") -> dict:
    """Get messages from a space."""
    params = {"pageSize": page_size, "orderBy": order_by}
    if page_token:
        params["pageToken"] = page_token

    return api_request("GET", f"{space_name}/messages", params=params)


def send_message(space_name: str, text: str, attachment: Optional[str] = None) -> dict:
    """Send a message to a space, optionally with a file attachment."""
    if attachment:
        return upload_attachment(space_name, attachment, text)
    return api_request("POST", f"{space_name}/messages", data={"text": text})


def send_dm(email: str, text: str, attachment: Optional[str] = None) -> dict:
    """Send a direct message to a user by email, optionally with a file attachment."""
    # First, set up or find the DM space
    space_data = {
        "space": {"spaceType": "DIRECT_MESSAGE"},
        "memberships": [{"member": {"name": f"users/{email}", "type": "HUMAN"}}]
    }
    space_result = api_request("POST", "spaces:setup", data=space_data)

    if "error" in space_result:
        return space_result

    space_name = space_result.get("name")
    if not space_name:
        return {"error": "Failed to create DM space"}

    # Send the message (with or without attachment)
    if attachment:
        return upload_attachment(space_name, attachment, text)
    return api_request("POST", f"{space_name}/messages", data={"text": text})


def find_dm_by_email(email: str) -> dict:
    """Find or create a DM space with a user."""
    space_data = {
        "space": {"spaceType": "DIRECT_MESSAGE"},
        "memberships": [{"member": {"name": f"users/{email}", "type": "HUMAN"}}]
    }
    return api_request("POST", "spaces:setup", data=space_data)


def list_threads(space_name: str, page_size: int = 25, page_token: Optional[str] = None) -> dict:
    """List threads from a space."""
    params = {"pageSize": page_size, "orderBy": "createTime desc"}
    if page_token:
        params["pageToken"] = page_token

    result = api_request("GET", f"{space_name}/messages", params=params)

    if "error" in result:
        return result

    # Group messages by thread
    messages = result.get("messages", [])
    seen_threads = set()
    threads = []

    for msg in messages:
        thread_name = msg.get("thread", {}).get("name")
        if thread_name and thread_name not in seen_threads:
            threads.append(msg)
            seen_threads.add(thread_name)

    return {"threads": threads, "nextPageToken": result.get("nextPageToken")}


def setup_space(display_name: str, user_emails: list) -> dict:
    """Create a new space with members."""
    memberships = [
        {"member": {"name": f"users/{email}", "type": "HUMAN"}}
        for email in user_emails
    ]
    space_data = {
        "space": {"spaceType": "SPACE", "displayName": display_name},
        "memberships": memberships
    }
    return api_request("POST", "spaces:setup", data=space_data)


def main():
    parser = argparse.ArgumentParser(description="Google Chat API operations")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # list-spaces
    subparsers.add_parser("list-spaces", help="List all spaces")

    # find-space
    find_space_parser = subparsers.add_parser("find-space", help="Find a space by display name")
    find_space_parser.add_argument("name", help="Display name of the space")

    # get-messages
    get_messages_parser = subparsers.add_parser("get-messages", help="Get messages from a space")
    get_messages_parser.add_argument("space", help="Space name (e.g., spaces/AAAA123)")
    get_messages_parser.add_argument("--limit", type=int, default=25, help="Max messages to return")
    get_messages_parser.add_argument("--page-token", help="Pagination token")

    # send-message
    send_message_parser = subparsers.add_parser("send-message", help="Send a message to a space")
    send_message_parser.add_argument("space", help="Space name (e.g., spaces/AAAA123)")
    send_message_parser.add_argument("text", nargs="?", default="", help="Message text")
    send_message_parser.add_argument("--attachment", help="Path to file to attach")

    # send-dm
    send_dm_parser = subparsers.add_parser("send-dm", help="Send a direct message")
    send_dm_parser.add_argument("email", help="Recipient email address")
    send_dm_parser.add_argument("text", nargs="?", default="", help="Message text")
    send_dm_parser.add_argument("--attachment", help="Path to file to attach")

    # find-dm
    find_dm_parser = subparsers.add_parser("find-dm", help="Find or create DM space")
    find_dm_parser.add_argument("email", help="User's email address")

    # list-threads
    list_threads_parser = subparsers.add_parser("list-threads", help="List threads in a space")
    list_threads_parser.add_argument("space", help="Space name")
    list_threads_parser.add_argument("--limit", type=int, default=25, help="Max threads to return")

    # setup-space
    setup_space_parser = subparsers.add_parser("setup-space", help="Create a new space")
    setup_space_parser.add_argument("name", help="Display name for the space")
    setup_space_parser.add_argument("emails", nargs="+", help="Member email addresses")

    args = parser.parse_args()

    if args.command == "list-spaces":
        result = list_spaces()
    elif args.command == "find-space":
        result = find_space_by_name(args.name)
    elif args.command == "get-messages":
        result = get_messages(args.space, args.limit, args.page_token)
    elif args.command == "send-message":
        result = send_message(args.space, args.text, getattr(args, 'attachment', None))
    elif args.command == "send-dm":
        result = send_dm(args.email, args.text, getattr(args, 'attachment', None))
    elif args.command == "find-dm":
        result = find_dm_by_email(args.email)
    elif args.command == "list-threads":
        result = list_threads(args.space, args.limit)
    elif args.command == "setup-space":
        result = setup_space(args.name, args.emails)
    else:
        result = {"error": f"Unknown command: {args.command}"}

    print(json.dumps(result, indent=2))

    if isinstance(result, dict) and "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
