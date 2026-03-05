#!/usr/bin/env python3
"""
MCP (Model Context Protocol) client for Atlassian Cloud.

Communicates with the Atlassian MCP server at https://mcp.atlassian.com/v1/mcp
using JSON-RPC 2.0 over Streamable HTTP (POST with SSE or JSON responses).

Requires OAuth 2.1 authentication — run `python auth.py login --oauth` first.

Protocol sequence:
  1. POST initialize → server returns capabilities + Mcp-Session-Id
  2. POST notifications/initialized → server returns 202
  3. POST tools/list → server returns available tools
  4. POST tools/call → server returns tool results
"""

import json
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from auth import get_auth_header, get_auth_type, get_mcp_endpoint

MCP_PROTOCOL_VERSION = "2025-03-26"


class MCPError(Exception):
    """Raised when the MCP server returns an error."""
    pass


class MCPClient:
    """Client for the Atlassian MCP server (JSON-RPC 2.0 over HTTP)."""

    def __init__(self, endpoint: str, auth_header: str):
        self.endpoint = endpoint
        self._auth_header = auth_header
        self._session_id: Optional[str] = None
        self._request_id = 0
        self._initialized = False

    def _next_id(self) -> int:
        self._request_id += 1
        return self._request_id

    def _make_request(self, method: str, params: Optional[dict] = None,
                      is_notification: bool = False) -> Any:
        """
        Send a JSON-RPC 2.0 request to the MCP server.

        Args:
            method: JSON-RPC method name (e.g. "initialize", "tools/list")
            params: Method parameters
            is_notification: If True, no id field (server returns 202)

        Returns:
            Parsed result from the JSON-RPC response, or None for notifications
        """
        payload: Dict[str, Any] = {
            "jsonrpc": "2.0",
            "method": method,
        }
        if params:
            payload["params"] = params
        if not is_notification:
            payload["id"] = self._next_id()

        body = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(self.endpoint, data=body, method="POST")
        req.add_header("User-Agent", "atlassian-skill/3.0")
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json, text/event-stream")
        req.add_header("Authorization", self._auth_header)
        if self._session_id:
            req.add_header("Mcp-Session-Id", self._session_id)

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                # Capture session ID from response headers
                session_id = resp.headers.get("Mcp-Session-Id")
                if session_id:
                    self._session_id = session_id

                # Notifications return 202 with no body
                if resp.status == 202:
                    return None

                content_type = resp.headers.get("Content-Type", "")
                raw = resp.read().decode("utf-8")

                if "text/event-stream" in content_type:
                    return self._parse_sse(raw)
                else:
                    return self._parse_json_rpc(raw)

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")
            # Sanitize auth header from error messages
            if self._auth_header:
                token_part = self._auth_header.split(" ", 1)[-1]
                error_body = error_body.replace(token_part, "***")
            raise MCPError(f"HTTP {e.code}: {error_body}")
        except urllib.error.URLError as e:
            raise MCPError(f"Connection failed: {e.reason}")

    def _parse_json_rpc(self, raw: str) -> Any:
        """Parse a JSON-RPC 2.0 response."""
        data = json.loads(raw)
        if "error" in data:
            err = data["error"]
            raise MCPError(f"MCP error {err.get('code', '?')}: {err.get('message', raw)}")
        return data.get("result")

    def _parse_sse(self, raw: str) -> Any:
        """Parse Server-Sent Events response, extracting the last JSON-RPC message."""
        last_result = None
        for line in raw.split("\n"):
            line = line.strip()
            if line.startswith("data:"):
                data_str = line[5:].strip()
                if not data_str:
                    continue
                try:
                    data = json.loads(data_str)
                    if "error" in data:
                        err = data["error"]
                        raise MCPError(
                            f"MCP error {err.get('code', '?')}: {err.get('message', data_str)}")
                    if "result" in data:
                        last_result = data["result"]
                except json.JSONDecodeError:
                    continue
        if last_result is None:
            raise MCPError("No valid JSON-RPC result in SSE response")
        return last_result

    def initialize(self) -> dict:
        """
        Initialize the MCP session.

        Returns:
            Server capabilities dict
        """
        result = self._make_request("initialize", {
            "protocolVersion": MCP_PROTOCOL_VERSION,
            "capabilities": {},
            "clientInfo": {
                "name": "atlassian-skill",
                "version": "3.0",
            },
        })

        # Send initialized notification
        self._make_request("notifications/initialized", is_notification=True)
        self._initialized = True
        return result

    def _ensure_initialized(self):
        """Initialize the session if not already done."""
        if not self._initialized:
            self.initialize()

    def list_tools(self) -> List[dict]:
        """List available MCP tools."""
        self._ensure_initialized()
        result = self._make_request("tools/list")
        return result.get("tools", []) if result else []

    def call_tool(self, tool_name: str, arguments: Optional[dict] = None) -> Any:
        """
        Call an MCP tool.

        Args:
            tool_name: Name of the tool (e.g. "jira_search_issues")
            arguments: Tool-specific arguments

        Returns:
            Tool result (parsed from content array)
        """
        self._ensure_initialized()
        params: Dict[str, Any] = {"name": tool_name}
        params["arguments"] = arguments if arguments is not None else {}

        result = self._make_request("tools/call", params)
        if not result:
            return None

        # MCP tools/call returns {content: [{type, text}], isError}
        if result.get("isError"):
            content = result.get("content", [])
            error_text = "\n".join(c.get("text", "") for c in content if c.get("type") == "text")
            raise MCPError(f"Tool error: {error_text or 'Unknown error'}")

        # Extract text content
        content = result.get("content", [])
        texts = [c.get("text", "") for c in content if c.get("type") == "text"]
        combined = "\n".join(texts)

        # Try to parse as JSON
        try:
            return json.loads(combined)
        except (json.JSONDecodeError, ValueError):
            return combined


def create_mcp_client() -> MCPClient:
    """
    Create an authenticated MCP client.
    Exits with helpful error if OAuth is not configured.
    """
    auth_type = get_auth_type()
    if auth_type != "oauth":
        print("Error: MCP client requires OAuth authentication.", file=sys.stderr)
        print("Run: python scripts/auth.py login --oauth", file=sys.stderr)
        sys.exit(1)

    endpoint = get_mcp_endpoint()
    if not endpoint:
        print("Error: No MCP endpoint configured.", file=sys.stderr)
        sys.exit(1)

    auth_header = get_auth_header()
    if not auth_header:
        print("Error: Failed to get OAuth token. Re-authenticate with:", file=sys.stderr)
        print("  python scripts/auth.py login --oauth", file=sys.stderr)
        sys.exit(1)

    return MCPClient(endpoint=endpoint, auth_header=auth_header)


# ─── Shared MCP wrapper with cloudId management ────────────────────────────

# Tools that don't require cloudId
_NO_CLOUD_ID = {"atlassianUserInfo", "getAccessibleAtlassianResources", "search", "fetch"}


class AtlassianMCPClient:
    """Base MCP client with automatic cloudId injection.

    Subclass or use directly for Jira/Confluence MCP operations.
    """

    def __init__(self, product_name: str = "Atlassian"):
        self.mcp = create_mcp_client()
        self._cloud_id: Optional[str] = None
        self._product_name = product_name

    def _get_cloud_id(self) -> str:
        """Get the Atlassian Cloud ID (required for most MCP tools)."""
        if self._cloud_id:
            return self._cloud_id
        result = self.mcp.call_tool("getAccessibleAtlassianResources")
        if isinstance(result, list) and result:
            self._cloud_id = result[0].get("id", "")
        elif isinstance(result, dict):
            resources = result.get("resources", [result])
            if resources:
                self._cloud_id = resources[0].get("id", "")
        if not self._cloud_id:
            raise RuntimeError(
                f"No accessible Atlassian resources found. "
                f"Ensure your OAuth consent includes {self._product_name} access.")
        return self._cloud_id

    def call(self, tool_name: str, arguments: Optional[dict] = None) -> Any:
        """Call an MCP tool with automatic cloudId injection."""
        args = dict(arguments) if arguments else {}
        if tool_name not in _NO_CLOUD_ID and "cloudId" not in args:
            args["cloudId"] = self._get_cloud_id()
        return self.mcp.call_tool(tool_name, args)

    def list_tools(self) -> List[dict]:
        """List all available MCP tools."""
        return self.mcp.list_tools()


def mcp_output(result: Any, as_json: bool = False):
    """Output MCP tool result to stdout."""
    if as_json:
        if isinstance(result, (dict, list)):
            print(json.dumps(result, indent=2, default=str))
        else:
            print(json.dumps({"result": str(result)}, indent=2))
    else:
        if isinstance(result, str):
            print(result)
        elif isinstance(result, (dict, list)):
            print(json.dumps(result, indent=2, default=str))
        else:
            print(result)
