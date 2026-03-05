#!/usr/bin/env python3
"""
Confluence Wiki CLI - Search, read, and manage Confluence wiki pages.

Supports two backends:
  - MCP: OAuth-authenticated calls to Atlassian MCP server (tools/call)
  - REST: API token-authenticated calls to Confluence REST API v2

Usage:
    python3 confluence.py search "query"
    python3 confluence.py read <page-id>
    python3 confluence.py list-spaces
    python3 confluence.py get-space <space-id>
    python3 confluence.py list-pages --space-id <space-id>
    python3 confluence.py create --title "Title" --space-id <id> [--body "<p>content</p>"]
    python3 confluence.py update <page-id> --title "New Title"
    python3 confluence.py get-children <page-id>
    python3 confluence.py auth-info
    python3 confluence.py list-tools   # MCP only: show available tools
"""

import argparse
import html
import json
import re
import sys
from dataclasses import dataclass
from typing import Any, Dict, Optional

from api_client import AtlassianAPIError, AtlassianClient, create_rest_client, get_backend, output_result


# ─── Data Models ─────────────────────────────────────────────────────────────

@dataclass
class ConfluencePage:
    """Represents a Confluence page."""
    id: str
    title: str
    space_id: Optional[str] = None
    status: Optional[str] = None
    body: Optional[str] = None
    version_number: Optional[int] = None
    parent_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    url: Optional[str] = None

    @classmethod
    def from_v2_dict(cls, data: dict, base_url: str = "") -> "ConfluencePage":
        """Create from v2 API response."""
        body_content = None
        if "body" in data:
            body_obj = data["body"]
            if "storage" in body_obj:
                body_content = body_obj["storage"].get("value", "")
            elif "view" in body_obj:
                body_content = body_obj["view"].get("value", "")
            elif "atlas_doc_format" in body_obj:
                body_content = body_obj["atlas_doc_format"].get("value", "")

        version_num = None
        if "version" in data:
            version_num = data["version"].get("number")

        page_url = None
        if base_url and data.get("_links", {}).get("webui"):
            page_url = base_url.rstrip("/") + data["_links"]["webui"]

        return cls(
            id=str(data.get("id", "")),
            title=data.get("title", ""),
            space_id=data.get("spaceId"),
            status=data.get("status"),
            body=body_content,
            version_number=version_num,
            parent_id=data.get("parentId"),
            created_at=data.get("createdAt"),
            updated_at=data.get("version", {}).get("createdAt"),
            url=page_url,
        )

    @classmethod
    def from_v1_search(cls, data: dict, base_url: str = "") -> "ConfluencePage":
        """Create from v1 search API response."""
        body_content = None
        if "body" in data:
            body_obj = data["body"]
            if "storage" in body_obj:
                body_content = body_obj["storage"].get("value", "")
            elif "view" in body_obj:
                body_content = body_obj["view"].get("value", "")

        version_num = None
        if "version" in data:
            version_num = data["version"].get("number")

        page_url = None
        if base_url and data.get("_links", {}).get("webui"):
            page_url = base_url.rstrip("/") + data["_links"]["webui"]

        return cls(
            id=str(data.get("id", "")),
            title=data.get("title", ""),
            space_id=data.get("space", {}).get("id") if isinstance(data.get("space"), dict) else None,
            status=data.get("status"),
            body=body_content,
            version_number=version_num,
            parent_id=None,
            created_at=None,
            updated_at=data.get("version", {}).get("when"),
            url=page_url,
        )


@dataclass
class ConfluenceSpace:
    """Represents a Confluence space."""
    id: str
    key: str
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    homepage_id: Optional[str] = None

    @classmethod
    def from_v2_dict(cls, data: dict) -> "ConfluenceSpace":
        return cls(
            id=str(data.get("id", "")),
            key=data.get("key", ""),
            name=data.get("name", ""),
            description=data.get("description", {}).get("plain", {}).get("value") if isinstance(data.get("description"), dict) else data.get("description"),
            type=data.get("type"),
            status=data.get("status"),
            homepage_id=str(data.get("homepageId", "")) if data.get("homepageId") else None,
        )


# ─── Helpers ─────────────────────────────────────────────────────────────────

def strip_html_tags(text: str) -> str:
    """Strip HTML tags and decode entities for readable output."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = html.unescape(clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


# ─── REST Client ─────────────────────────────────────────────────────────────

class ConfluenceClient:
    """Confluence API client wrapping shared AtlassianClient."""

    def __init__(self, client: AtlassianClient):
        self.client = client
        self.base_url = client.base_url
        wiki_base = self.base_url
        if not wiki_base.endswith("/wiki"):
            wiki_base = f"{wiki_base}/wiki"
        self.wiki_base = wiki_base
        self.api_url = f"{wiki_base}/api/v2"
        self.v1_api_url = f"{wiki_base}/rest/api"

    def get_current_user(self) -> dict:
        url = f"{self.wiki_base}/rest/api/user/current"
        return self.client.get(url)

    def search(self, cql: str, limit: int = 25, start: int = 0) -> dict:
        """Search content using CQL (v1 API)."""
        url = f"{self.v1_api_url}/content/search"
        params = {
            "cql": cql,
            "limit": min(limit, 100),
            "start": start,
            "expand": "version,space",
        }
        result = self.client.get(url, params=params)
        pages = [ConfluencePage.from_v1_search(r, self.wiki_base) for r in result.get("results", [])]
        return {
            "pages": pages,
            "total_size": result.get("totalSize", 0),
            "start": result.get("start", 0),
            "limit": result.get("limit", limit),
        }

    def get_page(self, page_id: str) -> ConfluencePage:
        url = f"{self.api_url}/pages/{page_id}"
        params = {"body-format": "storage"}
        result = self.client.get(url, params=params)
        return ConfluencePage.from_v2_dict(result, self.wiki_base)

    def list_spaces(self, limit: int = 25, cursor: Optional[str] = None) -> dict:
        url = f"{self.api_url}/spaces"
        params: dict = {"limit": min(limit, 250)}
        if cursor:
            params["cursor"] = cursor
        result = self.client.get(url, params=params)
        spaces = [ConfluenceSpace.from_v2_dict(s) for s in result.get("results", [])]
        return {
            "spaces": spaces,
            "next_cursor": result.get("_links", {}).get("next"),
        }

    def get_space(self, space_id: str) -> ConfluenceSpace:
        url = f"{self.api_url}/spaces/{space_id}"
        params = {"description-format": "plain"}
        result = self.client.get(url, params=params)
        return ConfluenceSpace.from_v2_dict(result)

    def list_pages(self, space_id: str, limit: int = 25, cursor: Optional[str] = None, status: str = "current") -> dict:
        url = f"{self.api_url}/spaces/{space_id}/pages"
        params: dict = {"limit": min(limit, 250), "status": status}
        if cursor:
            params["cursor"] = cursor
        result = self.client.get(url, params=params)
        pages = [ConfluencePage.from_v2_dict(p, self.wiki_base) for p in result.get("results", [])]
        return {
            "pages": pages,
            "next_cursor": result.get("_links", {}).get("next"),
        }

    def create_page(self, space_id: str, title: str, body: Optional[str] = None,
                    parent_id: Optional[str] = None, status: str = "current") -> ConfluencePage:
        url = f"{self.api_url}/pages"
        payload: dict = {
            "spaceId": space_id,
            "status": status,
            "title": title,
            "body": {
                "representation": "storage",
                "value": body or "",
            },
        }
        if parent_id:
            payload["parentId"] = parent_id
        result = self.client.post(url, payload)
        return ConfluencePage.from_v2_dict(result, self.wiki_base)

    def update_page(self, page_id: str, title: Optional[str] = None,
                    body: Optional[str] = None, status: str = "current") -> ConfluencePage:
        """Update a page. Automatically handles version increment."""
        current = self.get_page(page_id)
        new_version = (current.version_number or 0) + 1

        url = f"{self.api_url}/pages/{page_id}"
        payload = {
            "id": page_id,
            "status": status,
            "title": title if title is not None else current.title,
            "version": {
                "number": new_version,
                "message": "Updated via Confluence CLI",
            },
            "body": {
                "representation": "storage",
                "value": body if body is not None else (current.body or ""),
            },
        }
        result = self.client.put(url, payload)
        return ConfluencePage.from_v2_dict(result, self.wiki_base)

    def get_children(self, page_id: str, limit: int = 25, cursor: Optional[str] = None) -> dict:
        url = f"{self.api_url}/pages/{page_id}/children"
        params: dict = {"limit": min(limit, 250)}
        if cursor:
            params["cursor"] = cursor
        result = self.client.get(url, params=params)
        pages = [ConfluencePage.from_v2_dict(p, self.wiki_base) for p in result.get("results", [])]
        return {
            "pages": pages,
            "next_cursor": result.get("_links", {}).get("next"),
        }


# ─── MCP Backend ─────────────────────────────────────────────────────────────

from mcp_client import AtlassianMCPClient, MCPError, mcp_output as _mcp_output  # noqa: E402


class ConfluenceMCPClient(AtlassianMCPClient):
    """Confluence operations via Atlassian MCP server tools."""

    def __init__(self):
        super().__init__(product_name="Confluence")


def run_mcp_command(args):
    """Execute a Confluence command via MCP backend."""
    client = ConfluenceMCPClient()
    cmd = args.command

    if cmd == "list-tools":
        tools = client.list_tools()
        if getattr(args, "json", False):
            _mcp_output(tools, as_json=True)
        else:
            conf_tools = [t for t in tools if "confluence" in t.get("name", "").lower()
                          or t.get("name", "") in ("search", "fetch",
                                                    "atlassianUserInfo",
                                                    "getAccessibleAtlassianResources")]
            print(f"Available Confluence-related MCP tools ({len(conf_tools)}):\n")
            for t in conf_tools:
                desc = t.get("description", "")[:80]
                print(f"  {t.get('name', '?')}")
                if desc:
                    print(f"    {desc}")
                print()
        return

    if cmd == "auth-info":
        result = client.call("atlassianUserInfo")
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "search":
        cql = args.query
        cql_operators = ["=", "~", "AND", "OR", "NOT", "IN", "order by"]
        if not any(op in cql for op in cql_operators):
            cql = f'type=page AND text~"{cql}"'

        result = client.call("searchConfluenceUsingCql", {
            "cql": cql,
            "limit": args.limit,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "read":
        result = client.call("getConfluencePage", {
            "pageId": args.page_id,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "list-spaces":
        result = client.call("getConfluenceSpaces", {
            "limit": args.limit,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "get-space":
        # MCP doesn't have a direct get-space tool, use getConfluenceSpaces with filter
        try:
            space_id_int = int(args.space_id)
        except ValueError:
            print(f"Error: Space ID must be numeric, got '{args.space_id}'.", file=sys.stderr)
            sys.exit(1)
        result = client.call("getConfluenceSpaces", {
            "ids": [space_id_int],
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "list-pages":
        result = client.call("getPagesInConfluenceSpace", {
            "spaceId": args.space_id,
            "limit": args.limit,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "create":
        tool_args: Dict[str, Any] = {
            "spaceId": args.space_id,
            "title": args.title,
            "body": args.body if args.body else "",  # MCP requires body
        }
        if args.parent_id:
            tool_args["parentId"] = args.parent_id
        result = client.call("createConfluencePage", tool_args)
        if getattr(args, "json", False):
            _mcp_output(result, as_json=True)
        else:
            print("Page created successfully!")
            if isinstance(result, dict):
                print(f"Title: {result.get('title', '')}")
                print(f"ID: {result.get('id', '')}")
            else:
                print(result)
        return

    if cmd == "update":
        tool_args_update: Dict[str, Any] = {
            "pageId": args.page_id,
        }
        if args.title:
            tool_args_update["title"] = args.title
        if args.body:
            tool_args_update["body"] = args.body
        else:
            # MCP requires body — fetch current page body if not provided
            page = client.call("getConfluencePage", {"pageId": args.page_id})
            if isinstance(page, dict) and "body" in page:
                body = page["body"]
                adf = {
                    "type": body.get("type", "doc"),
                    "version": body.get("version", 1),
                    "content": body.get("content", []),
                }
                tool_args_update["body"] = json.dumps(adf)
                tool_args_update["contentFormat"] = "adf"
            else:
                print("Error: Could not fetch current page body. Provide --body.", file=sys.stderr)
                sys.exit(1)
        result = client.call("updateConfluencePage", tool_args_update)
        if getattr(args, "json", False):
            _mcp_output(result, as_json=True)
        else:
            print("Page updated successfully!")
            if isinstance(result, dict):
                print(f"Title: {result.get('title', '')}")
            else:
                print(result)
        return

    if cmd == "get-children":
        result = client.call("getConfluencePageDescendants", {
            "pageId": args.page_id,
            "limit": args.limit,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    print(f"Error: Unknown command '{cmd}'.", file=sys.stderr)
    sys.exit(1)


# ─── Formatting ──────────────────────────────────────────────────────────────

def format_page(page: ConfluencePage, verbose: bool = False) -> str:
    lines = [
        f"Title: {page.title}",
        f"ID: {page.id}",
    ]
    if page.url:
        lines.append(f"URL: {page.url}")
    if page.space_id:
        lines.append(f"Space: {page.space_id}")
    if page.status:
        lines.append(f"Status: {page.status}")
    if page.version_number:
        lines.append(f"Version: {page.version_number}")
    if page.updated_at:
        lines.append(f"Updated: {page.updated_at}")
    if verbose and page.body:
        readable = strip_html_tags(page.body)
        lines.append(f"\n--- Content ---\n{readable}")
    return "\n".join(lines)


def format_space(space: ConfluenceSpace) -> str:
    lines = [
        f"Name: {space.name}",
        f"Key: {space.key}",
        f"ID: {space.id}",
    ]
    if space.type:
        lines.append(f"Type: {space.type}")
    if space.description:
        lines.append(f"Description: {space.description}")
    if space.homepage_id:
        lines.append(f"Homepage: {space.homepage_id}")
    return "\n".join(lines)


# ─── REST Command Handlers ──────────────────────────────────────────────────

def cmd_search(args, client: ConfluenceClient):
    cql = args.query
    cql_operators = ["=", "~", "AND", "OR", "NOT", "IN", "order by"]
    if not any(op in cql for op in cql_operators):
        cql = f'type=page AND text~"{cql}"'

    result = client.search(cql=cql, limit=args.limit, start=args.offset)

    if args.json:
        output_result({
            "pages": [p.__dict__ for p in result["pages"]],
            "total_size": result["total_size"],
            "start": result["start"],
            "limit": result["limit"],
        }, as_json=True)
    else:
        pages = result["pages"]
        if not pages:
            print(f"No pages found for query: {args.query}")
            return
        print(f"Found {len(pages)} page(s) (total: {result['total_size']}):\n")
        for i, page in enumerate(pages, 1):
            print(f"{i}. {page.title}")
            print(f"   ID: {page.id}")
            if page.url:
                print(f"   URL: {page.url}")
            if page.updated_at:
                print(f"   Updated: {page.updated_at}")
            print()


def cmd_read(args, client: ConfluenceClient):
    page = client.get_page(args.page_id)
    if args.json:
        output_result(page.__dict__, as_json=True)
    else:
        print(format_page(page, verbose=True))


def cmd_list_spaces(args, client: ConfluenceClient):
    result = client.list_spaces(limit=args.limit)
    if args.json:
        output_result({"spaces": [s.__dict__ for s in result["spaces"]]}, as_json=True)
    else:
        spaces = result["spaces"]
        if not spaces:
            print("No spaces found.")
            return
        print(f"Found {len(spaces)} space(s):\n")
        for space in spaces:
            print(format_space(space))
            print()


def cmd_get_space(args, client: ConfluenceClient):
    space = client.get_space(args.space_id)
    if args.json:
        output_result(space.__dict__, as_json=True)
    else:
        print(format_space(space))


def cmd_list_pages(args, client: ConfluenceClient):
    result = client.list_pages(space_id=args.space_id, limit=args.limit)
    if args.json:
        output_result({"pages": [p.__dict__ for p in result["pages"]]}, as_json=True)
    else:
        pages = result["pages"]
        if not pages:
            print("No pages found.")
            return
        print(f"Found {len(pages)} page(s):\n")
        for page in pages:
            print(f"- {page.title}")
            print(f"  ID: {page.id}")
            if page.url:
                print(f"  URL: {page.url}")
            print()


def cmd_create(args, client: ConfluenceClient):
    status = "draft" if args.draft else "current"
    page = client.create_page(
        space_id=args.space_id,
        title=args.title,
        body=args.body,
        parent_id=args.parent_id,
        status=status,
    )
    if args.json:
        output_result(page.__dict__, as_json=True)
    else:
        print("Page created successfully!\n")
        print(format_page(page))


def cmd_update(args, client: ConfluenceClient):
    page = client.update_page(
        page_id=args.page_id,
        title=args.title,
        body=args.body,
    )
    if args.json:
        output_result(page.__dict__, as_json=True)
    else:
        print("Page updated successfully!\n")
        print(format_page(page))


def cmd_get_children(args, client: ConfluenceClient):
    result = client.get_children(page_id=args.page_id, limit=args.limit)
    if args.json:
        output_result({"pages": [p.__dict__ for p in result["pages"]]}, as_json=True)
    else:
        pages = result["pages"]
        if not pages:
            print("No child pages found.")
            return
        print(f"Found {len(pages)} child page(s):\n")
        for page in pages:
            print(f"- {page.title}")
            print(f"  ID: {page.id}")
            if page.url:
                print(f"  URL: {page.url}")
            print()


def cmd_auth_info(args, client: ConfluenceClient):
    try:
        user = client.get_current_user()
    except AtlassianAPIError as e:
        print(f"Error: Unable to connect to Confluence API. {e}", file=sys.stderr)
        sys.exit(1)

    if args.json:
        output_result(user, as_json=True)
    else:
        print("Authentication successful!\n")
        print(f"User: {user.get('displayName', 'Unknown')}")
        print(f"Email: {user.get('email', 'N/A')}")
        print(f"Type: {user.get('type', 'Unknown')}")
        print(f"URL: {client.wiki_base}")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Confluence Wiki CLI - Search, read, and manage Confluence wiki pages.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    def add_json_flag(subparser):
        subparser.add_argument("--json", action="store_true", help="Output as JSON")

    # search
    search_parser = subparsers.add_parser("search", help="Search pages using CQL")
    search_parser.add_argument("query", help="Search query or CQL expression")
    search_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    search_parser.add_argument("--offset", type=int, default=0, help="Pagination offset")
    add_json_flag(search_parser)

    # read
    read_parser = subparsers.add_parser("read", help="Read a page")
    read_parser.add_argument("page_id", help="Page ID")
    add_json_flag(read_parser)

    # list-spaces
    list_spaces_parser = subparsers.add_parser("list-spaces", help="List all spaces")
    list_spaces_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    add_json_flag(list_spaces_parser)

    # get-space
    get_space_parser = subparsers.add_parser("get-space", help="Get space details")
    get_space_parser.add_argument("space_id", help="Space ID")
    add_json_flag(get_space_parser)

    # list-pages
    list_pages_parser = subparsers.add_parser("list-pages", help="List pages in a space")
    list_pages_parser.add_argument("--space-id", required=True, help="Space ID")
    list_pages_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    add_json_flag(list_pages_parser)

    # create
    create_parser = subparsers.add_parser("create", help="Create a new page")
    create_parser.add_argument("--title", required=True, help="Page title")
    create_parser.add_argument("--space-id", required=True, help="Space ID")
    create_parser.add_argument("--body", help="Page content (Confluence storage format / HTML)")
    create_parser.add_argument("--parent-id", help="Parent page ID")
    create_parser.add_argument("--draft", action="store_true", help="Create as draft")
    add_json_flag(create_parser)

    # update
    update_parser = subparsers.add_parser("update", help="Update a page")
    update_parser.add_argument("page_id", help="Page ID")
    update_parser.add_argument("--title", help="New title")
    update_parser.add_argument("--body", help="New content (Confluence storage format / HTML)")
    add_json_flag(update_parser)

    # get-children
    children_parser = subparsers.add_parser("get-children", help="Get child pages")
    children_parser.add_argument("page_id", help="Parent page ID")
    children_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    add_json_flag(children_parser)

    # auth-info
    auth_parser = subparsers.add_parser("auth-info", help="Test authentication and show user info")
    add_json_flag(auth_parser)

    # list-tools (MCP only)
    tools_parser = subparsers.add_parser("list-tools", help="List available MCP tools (OAuth only)")
    add_json_flag(tools_parser)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    try:
        backend = get_backend()

        if backend == "mcp":
            run_mcp_command(args)
        else:
            atlassian_client = create_rest_client()
            client = ConfluenceClient(atlassian_client)
            try:
                commands = {
                    "search": cmd_search,
                    "read": cmd_read,
                    "list-spaces": cmd_list_spaces,
                    "get-space": cmd_get_space,
                    "list-pages": cmd_list_pages,
                    "create": cmd_create,
                    "update": cmd_update,
                    "get-children": cmd_get_children,
                    "auth-info": cmd_auth_info,
                }
                handler = commands.get(args.command)
                if handler:
                    handler(args, client)
                elif args.command == "list-tools":
                    print("Error: list-tools is only available with OAuth authentication.", file=sys.stderr)
                    print("Run: python scripts/auth.py login --oauth", file=sys.stderr)
                    sys.exit(1)
                else:
                    parser.print_help()
                    sys.exit(1)
            finally:
                atlassian_client.close()

    except AtlassianAPIError as e:
        print(f"API Error: {e}", file=sys.stderr)
        sys.exit(1)
    except MCPError as e:
        print(f"MCP Error: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nCancelled.", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
