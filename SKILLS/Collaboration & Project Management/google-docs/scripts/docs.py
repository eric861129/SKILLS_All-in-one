#!/usr/bin/env python3
"""
Google Docs API operations.
Lightweight alternative to the full Google Workspace MCP server.
"""

import argparse
import json
import re
import sys
import urllib.request
import urllib.error
import urllib.parse
from typing import Optional

from auth import get_valid_access_token

DOCS_API_BASE = "https://docs.googleapis.com/v1"
DRIVE_API_BASE = "https://www.googleapis.com/drive/v3"


def api_request(method: str, url: str, data: Optional[dict] = None, params: Optional[dict] = None) -> dict:
    """Make an authenticated request to Google APIs."""
    token = get_valid_access_token()
    if not token:
        return {"error": "Failed to get access token"}

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


def extract_doc_id(doc_id_or_url: str) -> str:
    """Extract document ID from a URL or return the ID as-is."""
    # Pattern to match Google Docs URLs
    patterns = [
        r'docs\.google\.com/document/d/([a-zA-Z0-9_-]+)',
        r'^([a-zA-Z0-9_-]+)$'
    ]
    for pattern in patterns:
        match = re.search(pattern, doc_id_or_url)
        if match:
            return match.group(1)
    return doc_id_or_url


def create_doc(title: str, markdown: Optional[str] = None, folder_name: Optional[str] = None) -> dict:
    """Create a new Google Doc, optionally with markdown content."""
    if markdown:
        # Create doc via Drive API with HTML content (converted from markdown)
        # For simplicity, we'll create a blank doc and then insert text
        # Full markdown support would require HTML conversion like the MCP server
        result = api_request(
            "POST",
            f"{DOCS_API_BASE}/documents",
            data={"title": title}
        )

        if "error" in result:
            return result

        doc_id = result.get("documentId")
        if doc_id and markdown:
            # Insert the markdown as plain text (basic implementation)
            insert_result = insert_text(doc_id, markdown)
            if "error" in insert_result:
                return {"documentId": doc_id, "title": title, "warning": "Doc created but text insertion failed"}

        return {"documentId": doc_id, "title": result.get("title", title)}
    else:
        # Create blank doc
        result = api_request(
            "POST",
            f"{DOCS_API_BASE}/documents",
            data={"title": title}
        )

        if "error" in result:
            return result

        return {"documentId": result.get("documentId"), "title": result.get("title", title)}


def find_docs(query: str, page_size: int = 10, page_token: Optional[str] = None) -> dict:
    """Find Google Docs by title search using Drive API."""
    # Build the query for Drive API
    # Search for documents with the query in the name
    drive_query = f"mimeType='application/vnd.google-apps.document' and name contains '{query}' and trashed=false"

    params = {
        "q": drive_query,
        "pageSize": page_size,
        "fields": "nextPageToken, files(id, name, modifiedTime, createdTime)"
    }
    if page_token:
        params["pageToken"] = page_token

    result = api_request("GET", f"{DRIVE_API_BASE}/files", params=params)

    if "error" in result:
        return result

    return {
        "files": result.get("files", []),
        "nextPageToken": result.get("nextPageToken")
    }


def get_text(document_id: str) -> dict:
    """Get the text content of a Google Doc."""
    doc_id = extract_doc_id(document_id)

    params = {
        "fields": "title,body.content"
    }

    result = api_request("GET", f"{DOCS_API_BASE}/documents/{doc_id}", params=params)

    if "error" in result:
        return result

    # Extract text from the document structure
    text = ""
    body_content = result.get("body", {}).get("content", [])

    for element in body_content:
        text += _read_structural_element(element)

    return {
        "documentId": doc_id,
        "title": result.get("title", ""),
        "text": text
    }


def _read_structural_element(element: dict) -> str:
    """Extract text from a structural element."""
    text = ""
    if "paragraph" in element:
        for p_element in element["paragraph"].get("elements", []):
            if "textRun" in p_element:
                text += p_element["textRun"].get("content", "")
    elif "table" in element:
        for row in element["table"].get("tableRows", []):
            for cell in row.get("tableCells", []):
                for cell_content in cell.get("content", []):
                    text += _read_structural_element(cell_content)
    return text


def append_text(document_id: str, text: str) -> dict:
    """Append text to the end of a Google Doc."""
    doc_id = extract_doc_id(document_id)

    # First, get the document to find the end index
    params = {"fields": "body.content"}
    doc_result = api_request("GET", f"{DOCS_API_BASE}/documents/{doc_id}", params=params)

    if "error" in doc_result:
        return doc_result

    # Find the end index
    body_content = doc_result.get("body", {}).get("content", [])
    if body_content:
        last_element = body_content[-1]
        end_index = last_element.get("endIndex", 1)
    else:
        end_index = 1

    # Insert at the end (before the final newline)
    location_index = max(1, end_index - 1)

    # Batch update to insert text
    requests = [
        {
            "insertText": {
                "location": {"index": location_index},
                "text": text
            }
        }
    ]

    result = api_request(
        "POST",
        f"{DOCS_API_BASE}/documents/{doc_id}:batchUpdate",
        data={"requests": requests}
    )

    if "error" in result:
        return result

    return {"success": True, "documentId": doc_id, "message": "Text appended successfully"}


def insert_text(document_id: str, text: str) -> dict:
    """Insert text at the beginning of a Google Doc."""
    doc_id = extract_doc_id(document_id)

    # Insert at index 1 (beginning of document content)
    requests = [
        {
            "insertText": {
                "location": {"index": 1},
                "text": text
            }
        }
    ]

    result = api_request(
        "POST",
        f"{DOCS_API_BASE}/documents/{doc_id}:batchUpdate",
        data={"requests": requests}
    )

    if "error" in result:
        return result

    return {"success": True, "documentId": doc_id, "message": "Text inserted successfully"}


def replace_text(document_id: str, find_text: str, replace_with: str) -> dict:
    """Replace all occurrences of text in a Google Doc."""
    doc_id = extract_doc_id(document_id)

    # Use replaceAllText request
    requests = [
        {
            "replaceAllText": {
                "containsText": {
                    "text": find_text,
                    "matchCase": True
                },
                "replaceText": replace_with
            }
        }
    ]

    result = api_request(
        "POST",
        f"{DOCS_API_BASE}/documents/{doc_id}:batchUpdate",
        data={"requests": requests}
    )

    if "error" in result:
        return result

    # Get the number of replacements made
    replies = result.get("replies", [])
    occurrences_changed = 0
    if replies:
        occurrences_changed = replies[0].get("replaceAllText", {}).get("occurrencesChanged", 0)

    return {
        "success": True,
        "documentId": doc_id,
        "occurrencesChanged": occurrences_changed,
        "message": f"Replaced {occurrences_changed} occurrence(s)"
    }


def main():
    parser = argparse.ArgumentParser(description="Google Docs API operations")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # create
    create_parser = subparsers.add_parser("create", help="Create a new Google Doc")
    create_parser.add_argument("title", help="Title for the new document")
    create_parser.add_argument("--content", help="Initial content (plain text or markdown)")

    # find
    find_parser = subparsers.add_parser("find", help="Find docs by title search")
    find_parser.add_argument("query", help="Search query")
    find_parser.add_argument("--limit", type=int, default=10, help="Max results to return")
    find_parser.add_argument("--page-token", help="Pagination token")

    # get-text
    get_text_parser = subparsers.add_parser("get-text", help="Get text content of a doc")
    get_text_parser.add_argument("document_id", help="Document ID or URL")

    # append-text
    append_text_parser = subparsers.add_parser("append-text", help="Append text to a doc")
    append_text_parser.add_argument("document_id", help="Document ID or URL")
    append_text_parser.add_argument("text", help="Text to append")

    # insert-text
    insert_text_parser = subparsers.add_parser("insert-text", help="Insert text at beginning of a doc")
    insert_text_parser.add_argument("document_id", help="Document ID or URL")
    insert_text_parser.add_argument("text", help="Text to insert")

    # replace-text
    replace_text_parser = subparsers.add_parser("replace-text", help="Replace text in a doc")
    replace_text_parser.add_argument("document_id", help="Document ID or URL")
    replace_text_parser.add_argument("find", help="Text to find")
    replace_text_parser.add_argument("replace", help="Replacement text")

    args = parser.parse_args()

    if args.command == "create":
        result = create_doc(args.title, args.content)
    elif args.command == "find":
        result = find_docs(args.query, args.limit, args.page_token)
    elif args.command == "get-text":
        result = get_text(args.document_id)
    elif args.command == "append-text":
        result = append_text(args.document_id, args.text)
    elif args.command == "insert-text":
        result = insert_text(args.document_id, args.text)
    elif args.command == "replace-text":
        result = replace_text(args.document_id, args.find, args.replace)
    else:
        result = {"error": f"Unknown command: {args.command}"}

    print(json.dumps(result, indent=2))

    if isinstance(result, dict) and "error" in result:
        sys.exit(1)


if __name__ == "__main__":
    main()
