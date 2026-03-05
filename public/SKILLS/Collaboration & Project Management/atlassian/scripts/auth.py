#!/usr/bin/env python3
"""
Authentication management for Atlassian Cloud APIs (Jira + Confluence).

Supports two authentication methods:
  1. OAuth 2.1 via Atlassian MCP server (recommended)
     - Dynamic client registration (RFC 7591)
     - Authorization Code + PKCE (S256)
     - Tokens stored in system keyring
  2. API token with Basic auth (fallback)
     - Email + API token stored in system keyring or env vars

Credentials stored in system keyring:
  - macOS: Keychain
  - Windows: Windows Credential Locker
  - Linux: Secret Service API (GNOME Keyring, KDE Wallet)

Usage:
    python3 auth.py login --oauth     # OAuth 2.1 via MCP server
    python3 auth.py login             # API token (email + token)
    python3 auth.py status
    python3 auth.py logout
"""

import argparse
import base64
import hashlib
import html
import http.server
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

KEYCHAIN_SERVICE = "atlassian-skill"
KEYCHAIN_ACCOUNT = "default"

# OAuth 2.1 endpoints (from Atlassian MCP server)
OAUTH_METADATA_URL = "https://mcp.atlassian.com/.well-known/oauth-authorization-server"
OAUTH_REGISTER_URL = "https://cf.mcp.atlassian.com/v1/register"
OAUTH_AUTHORIZE_URL = "https://mcp.atlassian.com/v1/authorize"
OAUTH_TOKEN_URL = "https://cf.mcp.atlassian.com/v1/token"
MCP_ENDPOINT = "https://mcp.atlassian.com/v1/mcp"

# Local callback server
CALLBACK_HOST = "127.0.0.1"
CALLBACK_PORT = 39827  # arbitrary high port

# Try importing keyring
try:
    import keyring
    HAS_KEYRING = True
except ImportError:
    HAS_KEYRING = False

# Try importing dotenv
try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


def _load_env():
    """Load environment variables from .env file if python-dotenv is available."""
    if load_dotenv is not None:
        skill_dir = Path(__file__).parent.parent
        env_file = skill_dir / ".env"
        if env_file.exists():
            load_dotenv(env_file)
        elif Path(".env").exists():
            load_dotenv()


_load_env()


# ─── Storage ────────────────────────────────────────────────────────────────

def _get_keyring_config():
    """Get stored config from keyring."""
    if not HAS_KEYRING:
        return None
    try:
        data_str = keyring.get_password(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
        if not data_str:
            return None
        return json.loads(data_str)
    except json.JSONDecodeError:
        return None
    except Exception as e:
        print(f"Warning: keyring read failed: {e}", file=sys.stderr)
        return None


def _save_keyring_config(config):
    """Save config to keyring."""
    if not HAS_KEYRING:
        return False
    try:
        keyring.set_password(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT, json.dumps(config))
        return True
    except Exception as e:
        print(f"Warning: keyring write failed: {e}", file=sys.stderr)
        return False


def _clear_keyring_config():
    """Clear stored credentials from keyring."""
    if not HAS_KEYRING:
        return False
    try:
        keyring.delete_password(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)
        return True
    except Exception as e:
        print(f"Warning: keyring clear failed: {e}", file=sys.stderr)
        return False


def _get_env_config():
    """Get API token config from environment variables."""
    base_url = os.environ.get("ATLASSIAN_URL", "")
    email = os.environ.get("ATLASSIAN_EMAIL", "")
    api_token = os.environ.get("ATLASSIAN_API_TOKEN", "")

    if base_url and email and api_token:
        return {
            "auth_type": "api_token",
            "base_url": base_url.rstrip("/"),
            "email": email,
            "api_token": api_token,
        }
    return None


# ─── PKCE helpers ───────────────────────────────────────────────────────────

def _generate_pkce():
    """Generate PKCE code_verifier and code_challenge (S256)."""
    code_verifier = secrets.token_urlsafe(64)[:128]
    digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
    code_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return code_verifier, code_challenge


# ─── OAuth callback server ──────────────────────────────────────────────────

class _OAuthCallbackHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler that captures the OAuth authorization code callback."""

    auth_code = None
    auth_error = None
    state_received = None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        if "code" in params:
            _OAuthCallbackHandler.auth_code = params["code"][0]
            _OAuthCallbackHandler.state_received = params.get("state", [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<html><body><h2>Authorization successful!</h2>"
                             b"<p>You can close this browser tab and return to the terminal.</p>"
                             b"</body></html>")
        elif "error" in params:
            _OAuthCallbackHandler.auth_error = params.get("error_description",
                                                           params.get("error", ["Unknown error"]))[0]
            self.send_response(400)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            error_msg = html.escape(_OAuthCallbackHandler.auth_error)
            self.wfile.write(f"<html><body><h2>Authorization failed</h2>"
                             f"<p>{error_msg}</p></body></html>".encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):  # type: ignore[override]
        pass  # suppress HTTP logs


def _wait_for_callback(server, timeout=120):
    """Run the callback server until we get a response or timeout."""
    server.timeout = 1
    deadline = time.time() + timeout
    while time.time() < deadline:
        server.handle_request()
        if _OAuthCallbackHandler.auth_code or _OAuthCallbackHandler.auth_error:
            break


# ─── OAuth flow ─────────────────────────────────────────────────────────────

def _http_json_request(url, data=None, method=None, headers=None):
    """Make an HTTP request and return parsed JSON response."""
    if data is not None:
        if isinstance(data, dict):
            body = json.dumps(data).encode("utf-8")
            content_type = "application/json"
        else:
            body = data.encode("utf-8") if isinstance(data, str) else data
            content_type = "application/x-www-form-urlencoded"
        if method is None:
            method = "POST"
    else:
        body = None
        content_type = None
        if method is None:
            method = "GET"

    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("User-Agent", "atlassian-skill/3.0")
    req.add_header("Accept", "application/json")
    if content_type:
        req.add_header("Content-Type", content_type)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        try:
            error_json = json.loads(error_body)
            msg = error_json.get("error_description", error_json.get("error", error_body))
        except Exception:
            msg = error_body
        raise RuntimeError(f"HTTP {e.code}: {msg}")


def _register_oauth_client(redirect_uri):
    """Dynamically register a public OAuth client (RFC 7591)."""
    registration_data = {
        "client_name": "atlassian-skill-cli",
        "redirect_uris": [redirect_uri],
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": "none",
    }
    return _http_json_request(OAUTH_REGISTER_URL, data=registration_data)


def _exchange_code_for_tokens(client_id, auth_code, redirect_uri, code_verifier):
    """Exchange authorization code for tokens at the token endpoint."""
    token_data = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "client_id": client_id,
        "code": auth_code,
        "redirect_uri": redirect_uri,
        "code_verifier": code_verifier,
    })
    return _http_json_request(OAUTH_TOKEN_URL, data=token_data)


def _refresh_access_token(client_id, refresh_token):
    """Use refresh token to get a new access token."""
    token_data = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "client_id": client_id,
        "refresh_token": refresh_token,
    })
    return _http_json_request(OAUTH_TOKEN_URL, data=token_data)


def oauth_login():
    """Run the full OAuth 2.1 + PKCE login flow."""
    redirect_uri = f"http://{CALLBACK_HOST}:{CALLBACK_PORT}/callback"

    # Step 1: Dynamic client registration
    print("Registering OAuth client...", file=sys.stderr)
    try:
        reg = _register_oauth_client(redirect_uri)
    except RuntimeError as e:
        print(f"Error: Client registration failed: {e}", file=sys.stderr)
        sys.exit(1)

    client_id = reg.get("client_id")
    if not client_id:
        print("Error: No client_id returned from registration.", file=sys.stderr)
        sys.exit(1)

    # Step 2: Generate PKCE values
    code_verifier, code_challenge = _generate_pkce()
    state = secrets.token_urlsafe(32)

    # Step 3: Build authorization URL
    auth_params = urllib.parse.urlencode({
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "state": state,
    })
    auth_url = f"{OAUTH_AUTHORIZE_URL}?{auth_params}"

    # Step 4: Start local callback server
    _OAuthCallbackHandler.auth_code = None
    _OAuthCallbackHandler.auth_error = None
    _OAuthCallbackHandler.state_received = None

    server = http.server.HTTPServer((CALLBACK_HOST, CALLBACK_PORT), _OAuthCallbackHandler)

    # Step 5: Open browser for authorization
    print(f"\nOpening browser for Atlassian authorization...", file=sys.stderr)
    print(f"If the browser doesn't open, visit this URL:\n{auth_url}\n", file=sys.stderr)
    webbrowser.open(auth_url)

    # Step 6: Wait for callback
    print("Waiting for authorization (2 minute timeout)...", file=sys.stderr)
    try:
        _wait_for_callback(server, timeout=120)
    finally:
        server.server_close()

    if _OAuthCallbackHandler.auth_error:
        print(f"Error: Authorization failed: {_OAuthCallbackHandler.auth_error}", file=sys.stderr)
        sys.exit(1)

    if not _OAuthCallbackHandler.auth_code:
        print("Error: No authorization code received (timed out).", file=sys.stderr)
        sys.exit(1)

    # Validate state
    if _OAuthCallbackHandler.state_received != state:
        print("Error: State mismatch — possible CSRF attack.", file=sys.stderr)
        sys.exit(1)

    # Step 7: Exchange code for tokens
    print("Exchanging code for tokens...", file=sys.stderr)
    try:
        tokens = _exchange_code_for_tokens(
            client_id,
            _OAuthCallbackHandler.auth_code,
            redirect_uri,
            code_verifier,
        )
    except RuntimeError as e:
        print(f"Error: Token exchange failed: {e}", file=sys.stderr)
        sys.exit(1)

    access_token = tokens.get("access_token")
    refresh_token = tokens.get("refresh_token")
    expires_in = tokens.get("expires_in", 3600)

    if not access_token:
        print("Error: No access_token in response.", file=sys.stderr)
        sys.exit(1)

    # Step 8: Store in keyring
    config = {
        "auth_type": "oauth",
        "client_id": client_id,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": int(time.time()) + expires_in,
        "mcp_endpoint": MCP_ENDPOINT,
    }

    if _save_keyring_config(config):
        print("OAuth login successful!")
        print(f"Token expires in {expires_in // 60} minutes.")
        if refresh_token:
            print("Refresh token stored — will auto-refresh when expired.")
        print("Credentials stored in system keyring.")
    else:
        print("Error: Failed to store credentials in keyring.", file=sys.stderr)
        sys.exit(1)


def ensure_valid_oauth_token():
    """
    Check if the OAuth token is expired and refresh if needed.
    Returns the config with a valid access_token, or None if refresh fails.
    """
    config = _get_keyring_config()
    if not config or config.get("auth_type") != "oauth":
        return config

    expires_at = config.get("expires_at", 0)
    # Refresh if token expires within 60 seconds
    if time.time() < expires_at - 60:
        return config

    refresh_token = config.get("refresh_token")
    if not refresh_token:
        return None

    try:
        tokens = _refresh_access_token(config["client_id"], refresh_token)
    except RuntimeError:
        return None

    config["access_token"] = tokens.get("access_token", config["access_token"])
    if tokens.get("refresh_token"):
        config["refresh_token"] = tokens["refresh_token"]
    config["expires_at"] = int(time.time()) + tokens.get("expires_in", 3600)

    _save_keyring_config(config)
    return config


# ─── Validation (API token) ─────────────────────────────────────────────────

def _validate_credentials(base_url, email, api_token):
    """Validate API token credentials by calling Jira /rest/api/3/myself."""
    url = f"{base_url.rstrip('/')}/rest/api/3/myself"
    creds = base64.b64encode(f"{email}:{api_token}".encode()).decode()
    headers = {
        "Authorization": f"Basic {creds}",
        "Accept": "application/json",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        req.add_header("User-Agent", "atlassian-skill/3.0")
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:200]
        print(f"  Validation failed (HTTP {e.code}): {body}", file=sys.stderr)
        return None
    except (urllib.error.URLError, Exception) as e:
        print(f"  Validation failed: {e}", file=sys.stderr)
        return None


# ─── Public API (used by api_client.py and domain scripts) ──────────────────

def get_auth_type():
    """
    Get the current authentication type.

    Returns:
        "oauth" | "api_token" | None
    """
    config = get_config()
    if not config:
        return None
    return config.get("auth_type", "api_token")


def get_config():
    """
    Get Atlassian config. Priority: keyring > environment variables.

    For OAuth: returns dict with auth_type, client_id, access_token, refresh_token, etc.
    For API token: returns dict with auth_type, base_url, email, api_token.
    Returns None if not configured.
    """
    config = _get_keyring_config()
    if config:
        # Ensure auth_type is set (backward compat with old configs)
        if "auth_type" not in config:
            config["auth_type"] = "api_token"
        # Auto-refresh OAuth tokens
        if config.get("auth_type") == "oauth":
            config = ensure_valid_oauth_token()
        return config

    config = _get_env_config()
    if config:
        return config

    return None


def get_auth_header():
    """
    Get the auth header value.

    For OAuth: returns "Bearer <access_token>"
    For API token: returns "Basic <base64(email:token)>"
    """
    config = get_config()
    if not config:
        return None

    if config.get("auth_type") == "oauth":
        access_token = config.get("access_token")
        if access_token:
            return f"Bearer {access_token}"
        return None

    # API token path
    email = config.get("email", "")
    api_token = config.get("api_token", "")
    if email and api_token:
        creds = base64.b64encode(f"{email}:{api_token}".encode()).decode()
        return f"Basic {creds}"
    return None


def get_base_url():
    """Get the Atlassian instance base URL (API token auth only)."""
    config = get_config()
    if not config:
        return None
    return config.get("base_url")


def get_mcp_endpoint():
    """Get the MCP endpoint URL (OAuth auth only)."""
    config = get_config()
    if not config or config.get("auth_type") != "oauth":
        return None
    return config.get("mcp_endpoint", MCP_ENDPOINT)


def require_config():
    """
    Get config or exit with helpful error message.

    Returns:
        dict with auth config
    """
    config = get_config()
    if config:
        return config

    print("Error: Not authenticated.", file=sys.stderr)
    print("\nTo authenticate, choose one of:", file=sys.stderr)
    if HAS_KEYRING:
        print("\n  Option 1 (recommended): OAuth via Atlassian MCP server", file=sys.stderr)
        print("  python scripts/auth.py login --oauth", file=sys.stderr)
        print("\n  Option 2: API token via keyring", file=sys.stderr)
        print("  python scripts/auth.py login", file=sys.stderr)
    print("\n  Option 3: Set environment variables", file=sys.stderr)
    print("  export ATLASSIAN_URL=https://your-domain.atlassian.net", file=sys.stderr)
    print("  export ATLASSIAN_EMAIL=your-email@example.com", file=sys.stderr)
    print("  export ATLASSIAN_API_TOKEN=your-api-token", file=sys.stderr)
    print("\n  Get your API token at:", file=sys.stderr)
    print("  https://id.atlassian.com/manage-profile/security/api-tokens", file=sys.stderr)
    sys.exit(1)


# ─── CLI ────────────────────────────────────────────────────────────────────

def cmd_login(args):
    """Handle login command."""
    if args.oauth:
        if not HAS_KEYRING:
            print("Error: keyring package required for OAuth. Install with: pip install keyring",
                  file=sys.stderr)
            sys.exit(1)
        oauth_login()
        return

    # API token login
    if not HAS_KEYRING:
        print("Error: keyring package not installed.", file=sys.stderr)
        print("Install with: pip install keyring", file=sys.stderr)
        print("Or use environment variables instead (see .env.example).", file=sys.stderr)
        sys.exit(1)

    base_url = args.url
    if not base_url:
        base_url = input("Atlassian URL (e.g. https://your-domain.atlassian.net): ").strip()
    if not base_url:
        print("URL is required.", file=sys.stderr)
        sys.exit(1)
    base_url = base_url.rstrip("/")

    email = args.email
    if not email:
        email = input("Email: ").strip()
    if not email:
        print("Email is required.", file=sys.stderr)
        sys.exit(1)

    api_token = args.token
    if not api_token:
        import getpass
        api_token = getpass.getpass("API token: ").strip()
    if not api_token:
        print("API token is required.", file=sys.stderr)
        sys.exit(1)

    print("Validating credentials...", file=sys.stderr)
    user = _validate_credentials(base_url, email, api_token)
    if not user:
        print("Error: Invalid credentials. Check your URL, email, and API token.", file=sys.stderr)
        sys.exit(1)

    config = {
        "auth_type": "api_token",
        "base_url": base_url,
        "email": email,
        "api_token": api_token,
    }
    if _save_keyring_config(config):
        print(f"Login successful!")
        print(f"User: {user.get('displayName', 'Unknown')}")
        print(f"Instance: {base_url}")
        print(f"Credentials stored in system keyring.")
    else:
        print("Failed to store credentials in keyring.", file=sys.stderr)
        sys.exit(1)


def cmd_logout(_args):
    """Handle logout command."""
    if _clear_keyring_config():
        print("Logged out successfully. Credentials removed from keyring.")
    else:
        print("No credentials to clear (or keyring not available).")


def cmd_status(_args):
    """Handle status command."""
    config = get_config()
    if not config:
        print("Status: Not authenticated")
        print("\nRun: python scripts/auth.py login --oauth  (OAuth)")
        print("  or: python scripts/auth.py login           (API token)")
        sys.exit(1)

    auth_type = config.get("auth_type", "api_token")
    source = "keyring" if _get_keyring_config() else "environment variables"

    print(f"Status: Authenticated")
    print(f"Auth type: {auth_type}")
    print(f"Source: {source}")

    if auth_type == "oauth":
        expires_at = int(config.get("expires_at", 0))
        remaining = expires_at - int(time.time())
        if remaining > 0:
            print(f"Token expires in: {remaining // 60}m {remaining % 60}s")
        else:
            print(f"Token: expired (will auto-refresh)")
        has_refresh = "yes" if config.get("refresh_token") else "no"
        print(f"Refresh token: {has_refresh}")
        print(f"MCP endpoint: {config.get('mcp_endpoint', MCP_ENDPOINT)}")
    else:
        base_url = config.get("base_url", "unknown")
        email = config.get("email", "unknown")
        print(f"Instance: {base_url}")
        print(f"Email: {email}")

        # Validate connection
        print("\nTesting connection...", file=sys.stderr)
        user = _validate_credentials(base_url, email, config.get("api_token", ""))
        if user:
            print(f"Connection: OK")
            print(f"User: {user.get('displayName', 'Unknown')}")
        else:
            print(f"Connection: FAILED (credentials may be expired)")


def main():
    parser = argparse.ArgumentParser(description="Atlassian authentication management")
    subparsers = parser.add_subparsers(dest="command")

    login_parser = subparsers.add_parser("login", help="Authenticate with Atlassian Cloud")
    login_parser.add_argument("--oauth", action="store_true",
                              help="Use OAuth 2.1 via Atlassian MCP server (recommended)")
    login_parser.add_argument("--url", help="Atlassian instance URL (API token mode)")
    login_parser.add_argument("--email", help="Account email (API token mode)")
    login_parser.add_argument("--token", help="API token (API token mode)")

    subparsers.add_parser("logout", help="Clear stored credentials")
    subparsers.add_parser("status", help="Check authentication status")

    args = parser.parse_args()

    if args.command == "login":
        cmd_login(args)
    elif args.command == "logout":
        cmd_logout(args)
    elif args.command == "status":
        cmd_status(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
