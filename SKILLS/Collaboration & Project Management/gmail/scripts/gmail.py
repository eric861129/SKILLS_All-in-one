#!/usr/bin/env python3
"""
Gmail API operations.
Lightweight alternative to the full Google Workspace MCP server.
"""

import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from email.message import EmailMessage
from typing import Optional

from auth import get_valid_access_token

GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1"


def api_request(method: str, endpoint: str, data: Optional[dict] = None, params: Optional[dict] = None) -> dict:
    """Make an authenticated request to the Gmail API."""
    token = get_valid_access_token()
    if not token:
        return {"error": "Failed to get access token"}

    url = f"{GMAIL_API_BASE}/{endpoint}"
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


def create_mime_message(to: str, subject: str, body: str,
                        cc: Optional[str] = None, bcc: Optional[str] = None,
                        is_html: bool = False, from_addr: Optional[str] = None,
                        attachments: Optional[list] = None) -> str:
    """Create a base64url-encoded MIME message for Gmail API using email module."""
    msg = EmailMessage()
    msg['To'] = to
    msg['Subject'] = subject

    if from_addr:
        msg['From'] = from_addr

    if cc:
        msg['Cc'] = cc

    if bcc:
        msg['Bcc'] = bcc

    # Set content with proper subtype
    if is_html:
        msg.set_content(body, subtype='html')
    else:
        msg.set_content(body)

    # Add attachments
    if attachments:
        for filepath in attachments:
            filepath = os.path.expanduser(filepath)
            if not os.path.isfile(filepath):
                raise FileNotFoundError(f"Attachment not found: {filepath}")
            filename = os.path.basename(filepath)
            mime_type, _ = mimetypes.guess_type(filepath)
            if mime_type is None:
                mime_type = 'application/octet-stream'
            maintype, subtype = mime_type.split('/', 1)
            with open(filepath, 'rb') as f:
                file_data = f.read()
            msg.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=filename)

    # Encode to base64url format required by Gmail API
    return base64.urlsafe_b64encode(msg.as_bytes()).decode('ascii')


def decode_base64url(data: str) -> str:
    """Decode base64url-encoded data."""
    # Add back padding if needed
    padded = data.replace("-", "+").replace("_", "/")
    while len(padded) % 4:
        padded += "="
    return base64.b64decode(padded).decode('utf-8', errors='replace')


def extract_body(payload: dict) -> str:
    """Extract body text from a message payload."""
    body = ""

    # Check for plain text or HTML in the main part
    if payload.get("body", {}).get("data"):
        body = decode_base64url(payload["body"]["data"])

    # Check parts for multipart messages
    if payload.get("parts"):
        for part in payload["parts"]:
            mime_type = part.get("mimeType", "")
            if mime_type == "text/plain" and part.get("body", {}).get("data"):
                body = decode_base64url(part["body"]["data"])
                break  # Prefer plain text
            elif mime_type == "text/html" and part.get("body", {}).get("data") and not body:
                body = decode_base64url(part["body"]["data"])
            elif part.get("parts"):
                # Recursive for nested parts
                nested_body = extract_body(part)
                if nested_body:
                    body = nested_body
                    break

    return body


def search(query: Optional[str] = None, max_results: int = 10,
           page_token: Optional[str] = None, label_ids: Optional[list] = None,
           include_spam_trash: bool = False) -> dict:
    """Search for emails using Gmail query syntax."""
    params = {"maxResults": max_results}

    if query:
        params["q"] = query
    if page_token:
        params["pageToken"] = page_token
    if label_ids:
        params["labelIds"] = ",".join(label_ids)
    if include_spam_trash:
        params["includeSpamTrash"] = "true"

    result = api_request("GET", "users/me/messages", params=params)

    if "error" in result:
        return result

    return {
        "messages": result.get("messages", []),
        "nextPageToken": result.get("nextPageToken"),
        "resultSizeEstimate": result.get("resultSizeEstimate")
    }


def get_message(message_id: str, format: str = "full") -> dict:
    """Get full content of a message."""
    params = {"format": format}
    result = api_request("GET", f"users/me/messages/{message_id}", params=params)

    if "error" in result:
        return result

    # Extract useful information based on format
    if format in ("metadata", "full"):
        headers = result.get("payload", {}).get("headers", [])
        get_header = lambda name: next((h["value"] for h in headers if h["name"] == name), None)

        subject = get_header("Subject")
        from_addr = get_header("From")
        to_addr = get_header("To")
        date = get_header("Date")

        # Extract body for full format
        body = ""
        if format == "full" and result.get("payload"):
            body = extract_body(result["payload"])

        return {
            "id": result.get("id"),
            "threadId": result.get("threadId"),
            "labelIds": result.get("labelIds"),
            "snippet": result.get("snippet"),
            "subject": subject,
            "from": from_addr,
            "to": to_addr,
            "date": date,
            "body": body or result.get("snippet")
        }

    return result


def send_email(to: str, subject: str, body: str,
               cc: Optional[str] = None, bcc: Optional[str] = None,
               is_html: bool = False, from_addr: Optional[str] = None,
               attachments: Optional[list] = None) -> dict:
    """Send an email."""
    mime_message = create_mime_message(to, subject, body, cc, bcc, is_html, from_addr, attachments)

    result = api_request("POST", "users/me/messages/send", data={"raw": mime_message})

    if "error" in result:
        return result

    return {
        "id": result.get("id"),
        "threadId": result.get("threadId"),
        "labelIds": result.get("labelIds"),
        "status": "sent"
    }


def create_draft(to: str, subject: str, body: str,
                 cc: Optional[str] = None, bcc: Optional[str] = None,
                 is_html: bool = False, from_addr: Optional[str] = None,
                 attachments: Optional[list] = None) -> dict:
    """Create a draft email."""
    mime_message = create_mime_message(to, subject, body, cc, bcc, is_html, from_addr, attachments)

    result = api_request("POST", "users/me/drafts", data={
        "message": {"raw": mime_message}
    })

    if "error" in result:
        return result

    return {
        "id": result.get("id"),
        "message": {
            "id": result.get("message", {}).get("id"),
            "threadId": result.get("message", {}).get("threadId"),
            "labelIds": result.get("message", {}).get("labelIds")
        },
        "status": "draft_created"
    }


def send_draft(draft_id: str) -> dict:
    """Send a draft email."""
    result = api_request("POST", "users/me/drafts/send", data={"id": draft_id})

    if "error" in result:
        return result

    return {
        "id": result.get("id"),
        "threadId": result.get("threadId"),
        "labelIds": result.get("labelIds"),
        "status": "sent"
    }


def modify_message(message_id: str, add_labels: Optional[list] = None,
                   remove_labels: Optional[list] = None) -> dict:
    """Modify message labels (archive, mark read, star, etc.)."""
    data = {}
    if add_labels:
        data["addLabelIds"] = add_labels
    if remove_labels:
        data["removeLabelIds"] = remove_labels

    result = api_request("POST", f"users/me/messages/{message_id}/modify", data=data)

    if "error" in result:
        return result

    return {
        "id": result.get("id"),
        "threadId": result.get("threadId"),
        "labelIds": result.get("labelIds"),
        "status": "modified"
    }


def list_labels() -> dict:
    """List all Gmail labels."""
    result = api_request("GET", "users/me/labels")

    if "error" in result:
        return result

    labels = result.get("labels", [])
    return {
        "labels": [
            {
                "id": label.get("id"),
                "name": label.get("name"),
                "type": label.get("type"),
                "messageListVisibility": label.get("messageListVisibility"),
                "labelListVisibility": label.get("labelListVisibility")
            }
            for label in labels
        ]
    }


def main():
    parser = argparse.ArgumentParser(description="Gmail API operations")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # search
    search_parser = subparsers.add_parser("search", help="Search for emails")
    search_parser.add_argument("query", nargs="?", help="Gmail search query (e.g., 'from:someone@example.com is:unread')")
    search_parser.add_argument("--limit", type=int, default=10, help="Max results to return (default: 10)")
    search_parser.add_argument("--page-token", help="Pagination token")
    search_parser.add_argument("--label", action="append", dest="labels", help="Filter by label (can repeat)")
    search_parser.add_argument("--include-spam-trash", action="store_true", help="Include spam and trash")

    # get
    get_parser = subparsers.add_parser("get", help="Get full content of a message")
    get_parser.add_argument("message_id", help="Message ID")
    get_parser.add_argument("--format", choices=["minimal", "full", "raw", "metadata"], default="full",
                           help="Response format (default: full)")

    # send
    send_parser = subparsers.add_parser("send", help="Send an email")
    send_parser.add_argument("--to", required=True, help="Recipient email address(es), comma-separated")
    send_parser.add_argument("--subject", required=True, help="Email subject")
    send_parser.add_argument("--body", required=True, help="Email body")
    send_parser.add_argument("--cc", help="CC email address(es), comma-separated")
    send_parser.add_argument("--bcc", help="BCC email address(es), comma-separated")
    send_parser.add_argument("--html", action="store_true", help="Send as HTML email")
    send_parser.add_argument("--from", dest="from_addr", help="Send from alias email address (must be configured in Gmail)")
    send_parser.add_argument("--attach", action="append", dest="attachments", help="File path to attach (can repeat for multiple files)")

    # create-draft
    draft_parser = subparsers.add_parser("create-draft", help="Create a draft email")
    draft_parser.add_argument("--to", required=True, help="Recipient email address(es), comma-separated")
    draft_parser.add_argument("--subject", required=True, help="Email subject")
    draft_parser.add_argument("--body", required=True, help="Email body")
    draft_parser.add_argument("--cc", help="CC email address(es), comma-separated")
    draft_parser.add_argument("--bcc", help="BCC email address(es), comma-separated")
    draft_parser.add_argument("--html", action="store_true", help="Create as HTML email")
    draft_parser.add_argument("--from", dest="from_addr", help="Send from alias email address (must be configured in Gmail)")
    draft_parser.add_argument("--attach", action="append", dest="attachments", help="File path to attach (can repeat for multiple files)")

    # send-draft
    send_draft_parser = subparsers.add_parser("send-draft", help="Send a draft email")
    send_draft_parser.add_argument("draft_id", help="Draft ID")

    # modify
    modify_parser = subparsers.add_parser("modify", help="Modify message labels")
    modify_parser.add_argument("message_id", help="Message ID")
    modify_parser.add_argument("--add-label", action="append", dest="add_labels",
                               help="Label to add (can repeat). Common: STARRED, IMPORTANT, UNREAD")
    modify_parser.add_argument("--remove-label", action="append", dest="remove_labels",
                               help="Label to remove (can repeat). Common: INBOX (archive), UNREAD (mark read)")

    # list-labels
    subparsers.add_parser("list-labels", help="List all Gmail labels")

    args = parser.parse_args()

    if args.command == "search":
        result = search(args.query, args.limit, args.page_token, args.labels, args.include_spam_trash)
    elif args.command == "get":
        result = get_message(args.message_id, args.format)
    elif args.command == "send":
        result = send_email(args.to, args.subject, args.body, args.cc, args.bcc, args.html, args.from_addr, args.attachments)
    elif args.command == "create-draft":
        result = create_draft(args.to, args.subject, args.body, args.cc, args.bcc, args.html, args.from_addr, args.attachments)
    elif args.command == "send-draft":
        result = send_draft(args.draft_id)
    elif args.command == "modify":
        result = modify_message(args.message_id, args.add_labels, args.remove_labels)
    elif args.command == "list-labels":
        result = list_labels()
    else:
        result = {"error": f"Unknown command: {args.command}"}

    print(json.dumps(result, indent=2))

    if isinstance(result, dict) and "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
