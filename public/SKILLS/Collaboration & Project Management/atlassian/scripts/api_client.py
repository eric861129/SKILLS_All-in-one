#!/usr/bin/env python3
"""
Shared client layer for Atlassian Cloud APIs (Jira + Confluence).

Supports two backends:
  - MCP: OAuth-authenticated calls to the Atlassian MCP server (tools/call)
  - REST: API token-authenticated calls to the Atlassian REST API (httpx)

Domain scripts (jira.py, confluence.py) use `get_backend()` to determine
which backend is active, then call accordingly.
"""

import json
import sys
from typing import Any, Dict, Optional

from auth import get_auth_header, get_auth_type, require_config

# httpx is deferred — only needed for REST backend (API token auth).
# MCP-only users (OAuth) don't need httpx installed.
httpx = None


def _ensure_httpx():
    """Import httpx on demand so MCP-only users don't need it installed."""
    global httpx
    if httpx is None:
        try:
            import httpx as _httpx  # type: ignore[no-redef]
            httpx = _httpx
        except ImportError:
            print("Error: httpx is required for REST backend. Install with: pip install httpx", file=sys.stderr)
            sys.exit(1)


class AtlassianAPIError(Exception):
    """Raised when an Atlassian API returns an error."""
    pass


class AtlassianClient:
    """HTTP client for Atlassian REST APIs (API token auth)."""

    def __init__(self, base_url: str, auth_header: str, timeout: int = 30):
        _ensure_httpx()
        self.base_url = base_url.rstrip("/")
        self._auth_header = auth_header
        self.client = httpx.Client(
            timeout=timeout,
            headers={
                "Accept": "application/json",
                "Authorization": auth_header,
            },
        )

    def request(
        self,
        method: str,
        url: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> dict:
        """Make an authenticated HTTP request."""
        try:
            headers = {"Content-Type": "application/json"} if data is not None else None
            response = self.client.request(
                method, url, params=params, json=data, headers=headers,
            )

            if response.status_code == 204:
                return {}

            response.raise_for_status()

            if response.content:
                return response.json()
            return {}

        except httpx.HTTPStatusError as e:
            error_body = e.response.text
            try:
                error_json = e.response.json()
                errors = error_json.get("errorMessages", [])
                field_errors = error_json.get("errors", {})
                message = error_json.get("message", "")

                parts = []
                if message:
                    parts.append(message)
                if errors:
                    parts.extend(errors)
                if field_errors and isinstance(field_errors, dict):
                    parts.extend(f"{k}: {v}" for k, v in field_errors.items())
                error_msg = "; ".join(parts) if parts else error_body
            except Exception:
                error_msg = error_body

            if self._auth_header:
                token_part = self._auth_header.split(" ", 1)[-1]
                error_msg = error_msg.replace(token_part, "***")

            raise AtlassianAPIError(f"HTTP {e.response.status_code}: {error_msg}")
        except httpx.RequestError as e:
            raise AtlassianAPIError(f"Request failed: {e}")

    def get(self, url: str, params: Optional[dict] = None) -> dict:
        """Make a GET request."""
        return self.request("GET", url, params=params)

    def post(self, url: str, data: dict) -> dict:
        """Make a POST request with JSON body."""
        return self.request("POST", url, data=data)

    def put(self, url: str, data: dict) -> dict:
        """Make a PUT request with JSON body."""
        return self.request("PUT", url, data=data)

    def close(self):
        """Close the HTTP client."""
        self.client.close()


def get_backend() -> str:
    """
    Determine which backend to use based on auth type.

    Returns:
        "mcp" for OAuth authentication (uses MCP tools)
        "rest" for API token authentication (uses REST API)
    """
    auth_type = get_auth_type()
    if auth_type == "oauth":
        return "mcp"
    return "rest"


def create_rest_client(timeout: int = 30) -> AtlassianClient:
    """
    Create an authenticated REST API client.
    Exits with helpful error if not authenticated with API token.
    """
    config = require_config()
    if config.get("auth_type") == "oauth":
        print("Error: REST client requires API token authentication.", file=sys.stderr)
        print("Current auth type is OAuth. Use MCP backend instead,", file=sys.stderr)
        print("or re-authenticate: python scripts/auth.py login", file=sys.stderr)
        sys.exit(1)

    auth_header = get_auth_header()
    if not auth_header:
        print("Error: Failed to build auth header.", file=sys.stderr)
        sys.exit(1)
    return AtlassianClient(
        base_url=config["base_url"],
        auth_header=auth_header,
        timeout=timeout,
    )


# Keep backward compat alias
create_client = create_rest_client


def output_result(data: Any, as_json: bool = False):
    """Output result in requested format."""
    if as_json:
        if hasattr(data, "__dataclass_fields__"):
            data = {k: v for k, v in data.__dict__.items() if v is not None}
        print(json.dumps(data, indent=2, default=str))
    else:
        print(data)
