#!/usr/bin/env python3
"""
Outline Wiki CLI - Search, read, and manage Outline wiki documents.

This script provides a command-line interface to interact with any Outline wiki instance.
Supports document search, reading, creation, updates, and collection management.

Usage:
    python3 outline.py search "query"
    python3 outline.py read <document-id>
    python3 outline.py list-collections
    python3 outline.py list-documents --collection-id <id>
    python3 outline.py get-collection <collection-id>
    python3 outline.py create --title "Title" --collection-id <id> [--text "content"]
    python3 outline.py update <document-id> --title "New Title"
    python3 outline.py export <document-id>
    python3 outline.py auth-info

Environment Variables:
    OUTLINE_API_KEY     - Required: Your Outline API key
    OUTLINE_API_URL     - Optional: API URL (default: https://app.getoutline.com/api)
    OUTLINE_TIMEOUT     - Optional: Request timeout in seconds (default: 30)
"""

import argparse
import json
import os
import sys
from dataclasses import dataclass
from typing import Any, Optional
from pathlib import Path

try:
    import httpx
except ImportError:
    print("Error: httpx is required. Install with: pip install httpx", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


# Load environment variables from .env file
def load_env():
    """Load environment variables from .env file if python-dotenv is available."""
    if load_dotenv is not None:
        # Try skill directory first, then current directory
        skill_dir = Path(__file__).parent.parent
        env_file = skill_dir / ".env"
        if env_file.exists():
            load_dotenv(env_file)
        elif Path(".env").exists():
            load_dotenv()


load_env()


@dataclass
class OutlineConfig:
    """Configuration for Outline API client."""
    api_url: str
    api_key: str
    timeout: int = 30


@dataclass
class OutlineDocument:
    """Represents an Outline document."""
    id: str
    title: str
    text: str
    url: str
    url_id: str
    collection_id: Optional[str] = None
    parent_document_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    published_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "OutlineDocument":
        return cls(
            id=data.get("id", ""),
            title=data.get("title", ""),
            text=data.get("text", ""),
            url=data.get("url", ""),
            url_id=data.get("urlId", ""),
            collection_id=data.get("collectionId"),
            parent_document_id=data.get("parentDocumentId"),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
            published_at=data.get("publishedAt"),
        )


@dataclass
class OutlineCollection:
    """Represents an Outline collection."""
    id: str
    name: str
    description: Optional[str] = None
    document_structure: Optional[list] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "OutlineCollection":
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            description=data.get("description"),
            document_structure=data.get("documentStructure"),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
        )


class OutlineAPIError(Exception):
    """Raised when Outline API returns an error."""
    pass


class OutlineClient:
    """HTTP client for Outline wiki API."""

    def __init__(self, config: OutlineConfig):
        self.config = config
        self.client = httpx.Client(
            base_url=config.api_url,
            timeout=config.timeout,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {config.api_key}",
            },
        )

    def _request(self, endpoint: str, data: Optional[dict] = None) -> dict:
        """Make a POST request to the Outline API."""
        try:
            response = self.client.post(endpoint, json=data or {})
            response.raise_for_status()
            result = response.json()
            if result.get("ok") is False:
                raise OutlineAPIError(result.get("error", "Unknown API error"))
            return result
        except httpx.HTTPStatusError as e:
            error_body = e.response.text
            try:
                error_json = e.response.json()
                error_msg = error_json.get("message", error_json.get("error", error_body))
            except Exception:
                error_msg = error_body
            raise OutlineAPIError(f"HTTP {e.response.status_code}: {error_msg}")
        except httpx.RequestError as e:
            raise OutlineAPIError(f"Request failed: {e}")

    def test_connection(self) -> bool:
        """Test connection to Outline API."""
        try:
            result = self._request("/auth.info")
            return result.get("ok", False)
        except OutlineAPIError:
            return False

    def get_auth_info(self) -> dict:
        """Get authentication info."""
        result = self._request("/auth.info")
        return result.get("data", {})

    def search_documents(
        self,
        query: str,
        collection_id: Optional[str] = None,
        limit: int = 25,
        offset: int = 0,
        include_archived: bool = False,
        include_drafts: bool = False,
    ) -> dict:
        """Search for documents."""
        params = {
            "query": query,
            "limit": min(limit, 100),
            "offset": offset,
            "includeArchived": include_archived,
            "includeDrafts": include_drafts,
        }
        if collection_id:
            params["collectionId"] = collection_id

        result = self._request("/documents.search", params)

        # Search results have documents nested in a 'document' field with additional context
        documents = []
        for item in result.get("data", []):
            if "document" in item:
                # Extract the nested document and add search context
                doc_data = item["document"]
                doc_data["_context"] = item.get("context", "")
                doc_data["_ranking"] = item.get("ranking", 0)
                documents.append(OutlineDocument.from_dict(doc_data))
            else:
                documents.append(OutlineDocument.from_dict(item))

        return {
            "documents": documents,
            "collections": [OutlineCollection.from_dict(c) for c in result.get("collections", [])],
            "pagination": result.get("pagination", {}),
        }

    def get_document(self, document_id: str) -> OutlineDocument:
        """Get a specific document by ID."""
        result = self._request("/documents.info", {"id": document_id})
        return OutlineDocument.from_dict(result.get("data", {}))

    def list_collections(self, limit: int = 25, offset: int = 0) -> dict:
        """List all collections."""
        result = self._request("/collections.list", {"limit": min(limit, 100), "offset": offset})
        return {
            "collections": [OutlineCollection.from_dict(c) for c in result.get("data", [])],
            "pagination": result.get("pagination", {}),
        }

    def list_documents(
        self,
        collection_id: Optional[str] = None,
        limit: int = 25,
        offset: int = 0,
    ) -> dict:
        """List documents, optionally filtered by collection."""
        params = {"limit": min(limit, 100), "offset": offset}
        if collection_id:
            params["collectionId"] = collection_id

        result = self._request("/documents.list", params)
        return {
            "documents": [OutlineDocument.from_dict(d) for d in result.get("data", [])],
            "pagination": result.get("pagination", {}),
        }

    def get_collection(self, collection_id: str) -> OutlineCollection:
        """Get a specific collection by ID."""
        result = self._request("/collections.info", {"id": collection_id})
        return OutlineCollection.from_dict(result.get("data", {}))

    def create_document(
        self,
        title: str,
        collection_id: str,
        text: Optional[str] = None,
        parent_document_id: Optional[str] = None,
        template_id: Optional[str] = None,
        publish: bool = True,
    ) -> OutlineDocument:
        """Create a new document."""
        params = {
            "title": title,
            "collectionId": collection_id,
            "publish": publish,
        }
        if text:
            params["text"] = text
        if parent_document_id:
            params["parentDocumentId"] = parent_document_id
        if template_id:
            params["templateId"] = template_id

        result = self._request("/documents.create", params)
        return OutlineDocument.from_dict(result.get("data", {}))

    def update_document(
        self,
        document_id: str,
        title: Optional[str] = None,
        text: Optional[str] = None,
        publish: Optional[bool] = None,
    ) -> OutlineDocument:
        """Update an existing document."""
        params = {"id": document_id}
        if title is not None:
            params["title"] = title
        if text is not None:
            params["text"] = text
        if publish is not None:
            params["publish"] = publish

        result = self._request("/documents.update", params)
        return OutlineDocument.from_dict(result.get("data", {}))

    def export_document(self, document_id: str) -> str:
        """Export document as markdown."""
        result = self._request("/documents.export", {"id": document_id, "format": "markdown"})
        return result.get("data", "")

    def close(self):
        """Close the HTTP client."""
        self.client.close()


def get_config() -> OutlineConfig:
    """Get configuration from environment variables."""
    api_key = os.environ.get("OUTLINE_API_KEY", "")
    if not api_key:
        print("Error: OUTLINE_API_KEY environment variable is required.", file=sys.stderr)
        print("\nTo set up:", file=sys.stderr)
        print("1. Get your API key from your Outline wiki settings", file=sys.stderr)
        print("2. Set the environment variable: export OUTLINE_API_KEY=your-key", file=sys.stderr)
        print("   Or create a .env file with: OUTLINE_API_KEY=your-key", file=sys.stderr)
        sys.exit(1)

    api_url = os.environ.get("OUTLINE_API_URL", "https://app.getoutline.com/api")
    try:
        timeout = int(os.environ.get("OUTLINE_TIMEOUT", "30"))
    except ValueError:
        timeout = 30

    return OutlineConfig(api_url=api_url, api_key=api_key, timeout=timeout)


def format_document(doc: OutlineDocument, verbose: bool = False) -> str:
    """Format a document for display."""
    lines = [
        f"Title: {doc.title}",
        f"ID: {doc.id}",
        f"URL: {doc.url}",
    ]
    if doc.collection_id:
        lines.append(f"Collection: {doc.collection_id}")
    if doc.updated_at:
        lines.append(f"Updated: {doc.updated_at}")
    if verbose and doc.text:
        lines.append(f"\n--- Content ---\n{doc.text}")
    return "\n".join(lines)


def format_collection(col: OutlineCollection) -> str:
    """Format a collection for display."""
    lines = [
        f"Name: {col.name}",
        f"ID: {col.id}",
    ]
    if col.description:
        lines.append(f"Description: {col.description}")
    if col.document_structure:
        lines.append(f"Documents: {len(col.document_structure)}")
    return "\n".join(lines)


def output_result(data: Any, as_json: bool = False):
    """Output result in requested format."""
    if as_json:
        if hasattr(data, "__dataclass_fields__"):
            data = {k: v for k, v in data.__dict__.items() if v is not None}
        print(json.dumps(data, indent=2, default=str))
    else:
        print(data)


# Command handlers
def cmd_search(args, client: OutlineClient):
    """Handle search command."""
    result = client.search_documents(
        query=args.query,
        collection_id=args.collection_id,
        limit=args.limit,
        offset=args.offset,
    )

    if args.json:
        output = {
            "documents": [d.__dict__ for d in result["documents"]],
            "collections": [c.__dict__ for c in result["collections"]],
            "pagination": result["pagination"],
        }
        output_result(output, as_json=True)
    else:
        docs = result["documents"]
        if not docs:
            print(f"No documents found for query: {args.query}")
            return

        print(f"Found {len(docs)} document(s):\n")
        for i, doc in enumerate(docs, 1):
            preview = doc.text[:200] + "..." if doc.text and len(doc.text) > 200 else doc.text or ""
            print(f"{i}. {doc.title}")
            print(f"   ID: {doc.id}")
            print(f"   URL: {doc.url}")
            if preview:
                print(f"   Preview: {preview[:100]}...")
            print()


def cmd_read(args, client: OutlineClient):
    """Handle read command."""
    doc = client.get_document(args.document_id)

    if args.json:
        output_result(doc.__dict__, as_json=True)
    else:
        print(format_document(doc, verbose=True))


def cmd_list_collections(args, client: OutlineClient):
    """Handle list-collections command."""
    result = client.list_collections(limit=args.limit, offset=args.offset)

    if args.json:
        output = {
            "collections": [c.__dict__ for c in result["collections"]],
            "pagination": result["pagination"],
        }
        output_result(output, as_json=True)
    else:
        collections = result["collections"]
        if not collections:
            print("No collections found.")
            return

        print(f"Found {len(collections)} collection(s):\n")
        for col in collections:
            print(format_collection(col))
            print()


def cmd_list_documents(args, client: OutlineClient):
    """Handle list-documents command."""
    result = client.list_documents(
        collection_id=args.collection_id,
        limit=args.limit,
        offset=args.offset,
    )

    if args.json:
        output = {
            "documents": [d.__dict__ for d in result["documents"]],
            "pagination": result["pagination"],
        }
        output_result(output, as_json=True)
    else:
        docs = result["documents"]
        if not docs:
            print("No documents found.")
            return

        print(f"Found {len(docs)} document(s):\n")
        for doc in docs:
            print(f"- {doc.title}")
            print(f"  ID: {doc.id}")
            print(f"  URL: {doc.url}")
            print()


def cmd_get_collection(args, client: OutlineClient):
    """Handle get-collection command."""
    col = client.get_collection(args.collection_id)

    if args.json:
        output_result(col.__dict__, as_json=True)
    else:
        print(format_collection(col))
        if col.document_structure:
            print(f"\nDocument Structure ({len(col.document_structure)} top-level docs):")
            for doc in col.document_structure[:10]:
                print(f"  - {doc.get('title', 'Untitled')} ({doc.get('id', 'no-id')})")
            if len(col.document_structure) > 10:
                print(f"  ... and {len(col.document_structure) - 10} more")


def cmd_create(args, client: OutlineClient):
    """Handle create command."""
    doc = client.create_document(
        title=args.title,
        collection_id=args.collection_id,
        text=args.text,
        parent_document_id=args.parent_id,
        template_id=args.template_id,
        publish=not args.draft,
    )

    if args.json:
        output_result(doc.__dict__, as_json=True)
    else:
        print("Document created successfully!\n")
        print(format_document(doc))


def cmd_update(args, client: OutlineClient):
    """Handle update command."""
    publish = None
    if args.publish:
        publish = True
    elif args.unpublish:
        publish = False

    doc = client.update_document(
        document_id=args.document_id,
        title=args.title,
        text=args.text,
        publish=publish,
    )

    if args.json:
        output_result(doc.__dict__, as_json=True)
    else:
        print("Document updated successfully!\n")
        print(format_document(doc))


def cmd_export(args, client: OutlineClient):
    """Handle export command."""
    markdown = client.export_document(args.document_id)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(markdown)
        print(f"Exported to: {args.output}")
    elif args.json:
        output_result({"document_id": args.document_id, "markdown": markdown, "format": "markdown"}, as_json=True)
    else:
        print(markdown)


def cmd_auth_info(args, client: OutlineClient):
    """Handle auth-info command."""
    if not client.test_connection():
        print("Error: Unable to connect to Outline API. Check your API key and URL.", file=sys.stderr)
        sys.exit(1)

    info = client.get_auth_info()

    if args.json:
        output_result(info, as_json=True)
    else:
        user = info.get("user", {})
        team = info.get("team", {})
        print("Authentication successful!\n")
        print(f"User: {user.get('name', 'Unknown')} ({user.get('email', 'no email')})")
        print(f"Team: {team.get('name', 'Unknown')}")
        print(f"URL: {team.get('url', 'Unknown')}")


def main():
    parser = argparse.ArgumentParser(
        description="Outline Wiki CLI - Search, read, and manage Outline wiki documents.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Helper to add common --json flag to subparsers
    def add_json_flag(subparser):
        subparser.add_argument("--json", action="store_true", help="Output as JSON")

    # search command
    search_parser = subparsers.add_parser("search", help="Search documents")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--collection-id", help="Filter by collection ID")
    search_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    search_parser.add_argument("--offset", type=int, default=0, help="Pagination offset")
    add_json_flag(search_parser)

    # read command
    read_parser = subparsers.add_parser("read", help="Read a document")
    read_parser.add_argument("document_id", help="Document ID")
    add_json_flag(read_parser)

    # list-collections command
    list_col_parser = subparsers.add_parser("list-collections", help="List all collections")
    list_col_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    list_col_parser.add_argument("--offset", type=int, default=0, help="Pagination offset")
    add_json_flag(list_col_parser)

    # list-documents command
    list_doc_parser = subparsers.add_parser("list-documents", help="List documents")
    list_doc_parser.add_argument("--collection-id", help="Filter by collection ID")
    list_doc_parser.add_argument("--limit", type=int, default=25, help="Max results (default: 25)")
    list_doc_parser.add_argument("--offset", type=int, default=0, help="Pagination offset")
    add_json_flag(list_doc_parser)

    # get-collection command
    get_col_parser = subparsers.add_parser("get-collection", help="Get collection details")
    get_col_parser.add_argument("collection_id", help="Collection ID")
    add_json_flag(get_col_parser)

    # create command
    create_parser = subparsers.add_parser("create", help="Create a new document")
    create_parser.add_argument("--title", required=True, help="Document title")
    create_parser.add_argument("--collection-id", required=True, help="Collection ID")
    create_parser.add_argument("--text", help="Document content (markdown)")
    create_parser.add_argument("--parent-id", help="Parent document ID")
    create_parser.add_argument("--template-id", help="Template ID to use")
    create_parser.add_argument("--draft", action="store_true", help="Create as draft (unpublished)")
    add_json_flag(create_parser)

    # update command
    update_parser = subparsers.add_parser("update", help="Update a document")
    update_parser.add_argument("document_id", help="Document ID")
    update_parser.add_argument("--title", help="New title")
    update_parser.add_argument("--text", help="New content (markdown)")
    update_parser.add_argument("--publish", action="store_true", help="Publish the document")
    update_parser.add_argument("--unpublish", action="store_true", help="Unpublish the document")
    add_json_flag(update_parser)

    # export command
    export_parser = subparsers.add_parser("export", help="Export document as markdown")
    export_parser.add_argument("document_id", help="Document ID")
    export_parser.add_argument("--output", "-o", help="Output file path")
    add_json_flag(export_parser)

    # auth-info command
    auth_parser = subparsers.add_parser("auth-info", help="Test authentication and show user info")
    add_json_flag(auth_parser)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    try:
        config = get_config()
        client = OutlineClient(config)

        try:
            commands = {
                "search": cmd_search,
                "read": cmd_read,
                "list-collections": cmd_list_collections,
                "list-documents": cmd_list_documents,
                "get-collection": cmd_get_collection,
                "create": cmd_create,
                "update": cmd_update,
                "export": cmd_export,
                "auth-info": cmd_auth_info,
            }

            handler = commands.get(args.command)
            if handler:
                handler(args, client)
            else:
                parser.print_help()
                sys.exit(1)
        finally:
            client.close()

    except OutlineAPIError as e:
        print(f"API Error: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nCancelled.", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
