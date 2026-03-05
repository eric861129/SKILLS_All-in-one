#!/usr/bin/env python3
"""
Jira CLI - Search, create, update, and manage Jira issues.

Supports two backends:
  - MCP: OAuth-authenticated calls to Atlassian MCP server (tools/call)
  - REST: API token-authenticated calls to Jira REST API v3

Usage:
    python3 jira.py search "project = DEV AND status = Open"
    python3 jira.py get DEV-123
    python3 jira.py create --project DEV --summary "Bug title" --type Bug
    python3 jira.py update DEV-123 --summary "New title"
    python3 jira.py transition DEV-123 "In Progress"
    python3 jira.py comment DEV-123 --add "A comment"
    python3 jira.py comment DEV-123 --list
    python3 jira.py list-projects
    python3 jira.py list-statuses DEV
    python3 jira.py auth-info
    python3 jira.py list-tools   # MCP only: show available tools
"""

import argparse
import sys
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from api_client import AtlassianAPIError, AtlassianClient, create_rest_client, get_backend, output_result


# ─── Data Models ─────────────────────────────────────────────────────────────

@dataclass
class JiraIssue:
    """Represents a Jira issue."""
    key: str
    summary: str
    status: str
    issue_type: str
    project_key: str
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    labels: List[str] = field(default_factory=list)
    created: Optional[str] = None
    updated: Optional[str] = None
    url: Optional[str] = None
    parent_key: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict, base_url: str = "") -> "JiraIssue":
        fields = data.get("fields", {})
        assignee = fields.get("assignee")
        reporter = fields.get("reporter")
        priority = fields.get("priority")
        status = fields.get("status", {})
        issue_type = fields.get("issuetype", {})
        project = fields.get("project", {})
        parent = fields.get("parent")

        description = None
        desc_field = fields.get("description")
        if desc_field:
            if isinstance(desc_field, str):
                description = desc_field
            elif isinstance(desc_field, dict):
                description = _extract_adf_text(desc_field)

        key = data.get("key", "")
        return cls(
            key=key,
            summary=fields.get("summary", ""),
            status=status.get("name", "") if status else "",
            issue_type=issue_type.get("name", "") if issue_type else "",
            project_key=project.get("key", "") if project else "",
            assignee=assignee.get("displayName", assignee.get("emailAddress", "")) if assignee else None,
            reporter=reporter.get("displayName", reporter.get("emailAddress", "")) if reporter else None,
            priority=priority.get("name", "") if priority else None,
            description=description,
            labels=fields.get("labels", []),
            created=fields.get("created"),
            updated=fields.get("updated"),
            url=f"{base_url}/browse/{key}" if base_url else None,
            parent_key=parent.get("key") if parent else None,
        )


@dataclass
class JiraComment:
    """Represents a Jira comment."""
    id: str
    author: str
    body: str
    created: str
    updated: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "JiraComment":
        author = data.get("author", {})
        body_field = data.get("body", "")
        if isinstance(body_field, dict):
            body = _extract_adf_text(body_field)
        else:
            body = body_field

        return cls(
            id=data.get("id", ""),
            author=author.get("displayName", author.get("emailAddress", "")),
            body=body,
            created=data.get("created", ""),
            updated=data.get("updated"),
        )


# ─── ADF Helpers ─────────────────────────────────────────────────────────────

def _extract_adf_text(adf: dict) -> str:
    """Extract plain text from Atlassian Document Format."""
    if not isinstance(adf, dict):
        return str(adf)

    texts = []
    if adf.get("type") == "text":
        return adf.get("text", "")

    for node in adf.get("content", []):
        if isinstance(node, dict):
            if node.get("type") == "text":
                texts.append(node.get("text", ""))
            elif node.get("type") == "hardBreak":
                texts.append("\n")
            elif "content" in node:
                texts.append(_extract_adf_text(node))

            if node.get("type") in ("paragraph", "heading", "bulletList", "orderedList"):
                texts.append("\n")

    return "".join(texts).strip()


def _text_to_adf(text: str) -> dict:
    """Convert plain text to Atlassian Document Format."""
    paragraphs = text.split("\n\n") if "\n\n" in text else [text]
    content = []
    for para in paragraphs:
        if para.strip():
            content.append({
                "type": "paragraph",
                "content": [{"type": "text", "text": para.strip()}],
            })
    return {"type": "doc", "version": 1, "content": content}


# ─── REST Client ─────────────────────────────────────────────────────────────

class JiraClient:
    """Jira REST API v3 client wrapping shared AtlassianClient."""

    def __init__(self, client: AtlassianClient):
        self.client = client
        self.base_url = client.base_url
        self.api_url = f"{self.base_url}/rest/api/3"

    def _request(self, method: str, endpoint: str, data: Optional[dict] = None, params: Optional[dict] = None) -> dict:
        url = f"{self.api_url}{endpoint}"
        return self.client.request(method, url, data=data, params=params)

    def get_myself(self) -> dict:
        return self._request("GET", "/myself")

    def search_issues(self, jql: str, limit: int = 50, fields: Optional[List[str]] = None,
                       next_page_token: Optional[str] = None) -> dict:
        default_fields = ["summary", "status", "issuetype", "project", "assignee",
                          "reporter", "priority", "labels", "created", "updated", "parent"]
        params = {
            "jql": jql,
            "maxResults": min(limit, 100),
            "fields": ",".join(fields or default_fields),
        }
        if next_page_token:
            params["nextPageToken"] = next_page_token
        return self._request("GET", "/search/jql", params=params)

    def get_issue(self, issue_key: str) -> dict:
        return self._request("GET", f"/issue/{issue_key}")

    def create_issue(self, project_key: str, summary: str, issue_type: str,
                     description: Optional[str] = None, priority: Optional[str] = None,
                     assignee_id: Optional[str] = None, labels: Optional[List[str]] = None,
                     parent_key: Optional[str] = None) -> dict:
        fields: Dict[str, Any] = {
            "project": {"key": project_key},
            "summary": summary,
            "issuetype": {"name": issue_type},
        }
        if description:
            fields["description"] = _text_to_adf(description)
        if priority:
            fields["priority"] = {"name": priority}
        if assignee_id:
            fields["assignee"] = {"accountId": assignee_id}
        if labels:
            fields["labels"] = labels
        if parent_key:
            fields["parent"] = {"key": parent_key}

        return self._request("POST", "/issue", data={"fields": fields})

    def update_issue(self, issue_key: str, summary: Optional[str] = None,
                     description: Optional[str] = None, priority: Optional[str] = None,
                     assignee_id: Optional[str] = None, labels: Optional[List[str]] = None) -> dict:
        fields: Dict[str, Any] = {}
        if summary is not None:
            fields["summary"] = summary
        if description is not None:
            fields["description"] = _text_to_adf(description)
        if priority is not None:
            fields["priority"] = {"name": priority}
        if assignee_id is not None:
            fields["assignee"] = {"accountId": assignee_id}
        if labels is not None:
            fields["labels"] = labels

        return self._request("PUT", f"/issue/{issue_key}", data={"fields": fields})

    def get_transitions(self, issue_key: str) -> List[dict]:
        result = self._request("GET", f"/issue/{issue_key}/transitions")
        return result.get("transitions", [])

    def transition_issue(self, issue_key: str, transition_id: str) -> dict:
        return self._request("POST", f"/issue/{issue_key}/transitions",
                             data={"transition": {"id": transition_id}})

    def get_comments(self, issue_key: str, limit: int = 50, offset: int = 0) -> dict:
        params = {"maxResults": min(limit, 100), "startAt": offset, "orderBy": "-created"}
        return self._request("GET", f"/issue/{issue_key}/comment", params=params)

    def add_comment(self, issue_key: str, body: str) -> dict:
        return self._request("POST", f"/issue/{issue_key}/comment",
                             data={"body": _text_to_adf(body)})

    def list_projects(self, limit: int = 50, offset: int = 0) -> List[dict]:
        params = {"maxResults": min(limit, 100), "startAt": offset}
        result = self._request("GET", "/project/search", params=params)
        return result.get("values", [])

    def get_statuses_for_project(self, project_key: str) -> list:
        result = self._request("GET", f"/project/{project_key}/statuses")
        return result if isinstance(result, list) else []

    def find_user(self, query: str) -> list:
        params = {"query": query, "maxResults": 10}
        result = self._request("GET", "/user/search", params=params)
        return result if isinstance(result, list) else []


# ─── MCP Backend ─────────────────────────────────────────────────────────────

from mcp_client import AtlassianMCPClient, MCPError, mcp_output as _mcp_output  # noqa: E402


class JiraMCPClient(AtlassianMCPClient):
    """Jira operations via Atlassian MCP server tools."""

    def __init__(self):
        super().__init__(product_name="Jira")


def run_mcp_command(args):
    """Execute a Jira command via MCP backend."""
    client = JiraMCPClient()
    cmd = args.command

    if cmd == "list-tools":
        tools = client.list_tools()
        if getattr(args, "json", False):
            _mcp_output(tools, as_json=True)
        else:
            jira_tools = [t for t in tools if "jira" in t.get("name", "").lower()
                          or t.get("name", "") in ("search", "fetch",
                                                    "atlassianUserInfo",
                                                    "getAccessibleAtlassianResources")]
            print(f"Available Jira-related MCP tools ({len(jira_tools)}):\n")
            for t in jira_tools:
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
        result = client.call("searchJiraIssuesUsingJql", {
            "jql": args.jql,
            "maxResults": args.limit,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "get":
        result = client.call("getJiraIssue", {
            "issueIdOrKey": args.issue_key,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "create":
        tool_args: Dict[str, Any] = {
            "projectKey": args.project,
            "summary": args.summary,
            "issueTypeName": args.type,
        }
        if args.description:
            tool_args["description"] = args.description
        if args.assignee:
            # Look up account ID first
            user_result = client.call("lookupJiraAccountId", {
                "searchString": args.assignee,
            })
            if isinstance(user_result, list) and user_result:
                tool_args["assignee_account_id"] = user_result[0].get("accountId", "")
            elif isinstance(user_result, dict) and user_result.get("accountId"):
                tool_args["assignee_account_id"] = user_result["accountId"]
        result = client.call("createJiraIssue", tool_args)
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "update":
        fields: Dict[str, Any] = {}
        if args.summary:
            fields["summary"] = args.summary
        if args.description:
            fields["description"] = _text_to_adf(args.description)
        if args.priority:
            fields["priority"] = {"name": args.priority}
        if args.labels:
            fields["labels"] = [l.strip() for l in args.labels.split(",")]
        if args.assignee:
            user_result = client.call("lookupJiraAccountId", {
                "searchString": args.assignee,
            })
            if isinstance(user_result, list) and user_result:
                fields["assignee"] = {"accountId": user_result[0].get("accountId", "")}
        if not fields:
            print("Error: Provide at least one field to update (--summary, --description, --priority, --labels, --assignee).", file=sys.stderr)
            sys.exit(1)
        result = client.call("editJiraIssue", {
            "issueIdOrKey": args.issue_key,
            "fields": fields,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "transition":
        # Get available transitions first
        transitions = client.call("getTransitionsForJiraIssue", {
            "issueIdOrKey": args.issue_key,
        })
        trans_list = transitions if isinstance(transitions, list) else transitions.get("transitions", [])
        target = args.status.lower()
        match = None
        for t in trans_list:
            if t.get("name", "").lower() == target:
                match = t
                break
        if not match:
            available = [t.get("name", "") for t in trans_list]
            print(f"Error: Transition '{args.status}' not available.", file=sys.stderr)
            print(f"Available: {', '.join(available)}", file=sys.stderr)
            sys.exit(1)
        result = client.call("transitionJiraIssue", {
            "issueIdOrKey": args.issue_key,
            "transition": {"id": match["id"]},
        })
        if getattr(args, "json", False):
            _mcp_output(result, as_json=True)
        else:
            print(f"Issue {args.issue_key} transitioned to '{match.get('name')}'.")
        return

    if cmd == "comment":
        if getattr(args, "add", None):
            result = client.call("addCommentToJiraIssue", {
                "issueIdOrKey": args.issue_key,
                "commentBody": args.add,
            })
            if getattr(args, "json", False):
                _mcp_output(result, as_json=True)
            else:
                print(f"Comment added to {args.issue_key}.")
        elif getattr(args, "list", False):
            # Get issue to see comments
            result = client.call("getJiraIssue", {
                "issueIdOrKey": args.issue_key,
                "fields": ["comment"],
            })
            _mcp_output(result, getattr(args, "json", False))
        else:
            print("Error: Use --add to add a comment or --list to list comments.", file=sys.stderr)
            sys.exit(1)
        return

    if cmd == "list-projects":
        result = client.call("getVisibleJiraProjects", {
            "maxResults": args.limit,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    if cmd == "list-statuses":
        result = client.call("getJiraProjectIssueTypesMetadata", {
            "projectIdOrKey": args.project_key,
        })
        _mcp_output(result, getattr(args, "json", False))
        return

    print(f"Error: Unknown command '{cmd}'.", file=sys.stderr)
    sys.exit(1)


# ─── Formatting ──────────────────────────────────────────────────────────────

def format_issue(issue: JiraIssue, verbose: bool = False) -> str:
    lines = [
        f"Key: {issue.key}",
        f"Summary: {issue.summary}",
        f"Status: {issue.status}",
        f"Type: {issue.issue_type}",
        f"Project: {issue.project_key}",
    ]
    if issue.priority:
        lines.append(f"Priority: {issue.priority}")
    if issue.assignee:
        lines.append(f"Assignee: {issue.assignee}")
    if issue.reporter:
        lines.append(f"Reporter: {issue.reporter}")
    if issue.labels:
        lines.append(f"Labels: {', '.join(issue.labels)}")
    if issue.parent_key:
        lines.append(f"Parent: {issue.parent_key}")
    if issue.updated:
        lines.append(f"Updated: {issue.updated}")
    if issue.url:
        lines.append(f"URL: {issue.url}")
    if verbose and issue.description:
        lines.append(f"\n--- Description ---\n{issue.description}")
    return "\n".join(lines)


# ─── REST Command Handlers ──────────────────────────────────────────────────

def cmd_search(args, client: JiraClient):
    result = client.search_issues(jql=args.jql, limit=args.limit)
    issues = [JiraIssue.from_dict(i, client.base_url) for i in result.get("issues", [])]
    total = result.get("total", 0)

    if args.json:
        output_result({
            "issues": [i.__dict__ for i in issues],
            "total": total,
            "startAt": result.get("startAt", 0),
            "maxResults": result.get("maxResults", 0),
        }, as_json=True)
    else:
        if not issues:
            print(f"No issues found for JQL: {args.jql}")
            return
        count = total if total else len(issues)
        print(f"Found {count} issue(s):\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. [{issue.key}] {issue.summary}")
            print(f"   Status: {issue.status} | Type: {issue.issue_type} | Priority: {issue.priority or 'None'}")
            if issue.assignee:
                print(f"   Assignee: {issue.assignee}")
            print()


def cmd_get(args, client: JiraClient):
    data = client.get_issue(args.issue_key)
    issue = JiraIssue.from_dict(data, client.base_url)
    if args.json:
        output_result(issue.__dict__, as_json=True)
    else:
        print(format_issue(issue, verbose=True))


def cmd_create(args, client: JiraClient):
    labels = [l.strip() for l in args.labels.split(",")] if args.labels else None

    assignee_id = None
    if args.assignee:
        users = client.find_user(args.assignee)
        if users:
            assignee_id = users[0].get("accountId")
        else:
            print(f"Warning: Could not find user '{args.assignee}', creating without assignee.", file=sys.stderr)

    result = client.create_issue(
        project_key=args.project,
        summary=args.summary,
        issue_type=args.type,
        description=args.description,
        priority=args.priority,
        assignee_id=assignee_id,
        labels=labels,
        parent_key=args.parent,
    )

    issue_key = result.get("key", "")
    if args.json:
        output_result({
            "key": issue_key,
            "id": result.get("id", ""),
            "self": result.get("self", ""),
            "url": f"{client.base_url}/browse/{issue_key}" if issue_key else None,
        }, as_json=True)
    else:
        print(f"Issue created successfully: {issue_key}")
        if issue_key:
            print(f"URL: {client.base_url}/browse/{issue_key}")


def cmd_update(args, client: JiraClient):
    if not any([args.summary, args.description, args.priority, args.labels, args.assignee]):
        print("Error: Provide at least one field to update (--summary, --description, --priority, --labels, --assignee).", file=sys.stderr)
        sys.exit(1)

    labels = [l.strip() for l in args.labels.split(",")] if args.labels else None

    assignee_id = None
    if args.assignee:
        users = client.find_user(args.assignee)
        if users:
            assignee_id = users[0].get("accountId")
        else:
            print(f"Warning: Could not find user '{args.assignee}', skipping assignee update.", file=sys.stderr)

    client.update_issue(
        issue_key=args.issue_key,
        summary=args.summary,
        description=args.description,
        priority=args.priority,
        assignee_id=assignee_id,
        labels=labels,
    )

    if args.json:
        data = client.get_issue(args.issue_key)
        issue = JiraIssue.from_dict(data, client.base_url)
        output_result(issue.__dict__, as_json=True)
    else:
        print(f"Issue {args.issue_key} updated successfully.")


def cmd_transition(args, client: JiraClient):
    transitions = client.get_transitions(args.issue_key)

    target = args.status.lower()
    match = None
    for t in transitions:
        if t.get("name", "").lower() == target:
            match = t
            break

    if not match:
        available = [t.get("name", "") for t in transitions]
        if args.json:
            output_result({
                "error": f"Transition '{args.status}' not available",
                "available_transitions": available,
            }, as_json=True)
        else:
            print(f"Error: Transition '{args.status}' not available for {args.issue_key}.", file=sys.stderr)
            print(f"Available transitions: {', '.join(available)}", file=sys.stderr)
        sys.exit(1)

    client.transition_issue(args.issue_key, match["id"])

    if args.json:
        output_result({
            "issue_key": args.issue_key,
            "transition": match.get("name"),
            "transition_id": match.get("id"),
        }, as_json=True)
    else:
        print(f"Issue {args.issue_key} transitioned to '{match.get('name')}'.")


def cmd_comment(args, client: JiraClient):
    if args.add:
        result = client.add_comment(args.issue_key, args.add)
        comment = JiraComment.from_dict(result)
        if args.json:
            output_result(comment.__dict__, as_json=True)
        else:
            print(f"Comment added to {args.issue_key}.")
            print(f"Author: {comment.author}")
            print(f"Created: {comment.created}")
    elif args.list:
        result = client.get_comments(args.issue_key, limit=args.limit)
        comments = [JiraComment.from_dict(c) for c in result.get("comments", [])]
        total = result.get("total", 0)
        if args.json:
            output_result({
                "comments": [c.__dict__ for c in comments],
                "total": total,
            }, as_json=True)
        else:
            if not comments:
                print(f"No comments on {args.issue_key}.")
                return
            print(f"Comments on {args.issue_key} ({total} total):\n")
            for c in comments:
                print(f"--- {c.author} ({c.created}) ---")
                print(c.body)
                print()
    else:
        print("Error: Use --add to add a comment or --list to list comments.", file=sys.stderr)
        sys.exit(1)


def cmd_list_projects(args, client: JiraClient):
    projects = client.list_projects(limit=args.limit)
    if args.json:
        output = [{
            "key": p.get("key", ""),
            "name": p.get("name", ""),
            "id": p.get("id", ""),
            "style": p.get("style", ""),
            "lead": p.get("lead", {}).get("displayName", "") if p.get("lead") else None,
        } for p in projects]
        output_result(output, as_json=True)
    else:
        if not projects:
            print("No projects found.")
            return
        print(f"Found {len(projects)} project(s):\n")
        for p in projects:
            lead = p.get("lead", {})
            lead_name = lead.get("displayName", "") if lead else ""
            print(f"  {p.get('key', '')}: {p.get('name', '')}")
            if lead_name:
                print(f"    Lead: {lead_name}")
            print()


def cmd_list_statuses(args, client: JiraClient):
    statuses_data = client.get_statuses_for_project(args.project_key)
    if args.json:
        output = []
        for issue_type in statuses_data:
            entry = {
                "issue_type": issue_type.get("name", ""),
                "statuses": [{"name": s.get("name", ""), "id": s.get("id", "")}
                             for s in issue_type.get("statuses", [])],
            }
            output.append(entry)
        output_result(output, as_json=True)
    else:
        if not statuses_data:
            print(f"No statuses found for project {args.project_key}.")
            return
        print(f"Statuses for project {args.project_key}:\n")
        for issue_type in statuses_data:
            print(f"  {issue_type.get('name', 'Unknown')}:")
            for s in issue_type.get("statuses", []):
                print(f"    - {s.get('name', '')} (ID: {s.get('id', '')})")
            print()


def cmd_auth_info(args, client: JiraClient):
    try:
        user = client.get_myself()
    except AtlassianAPIError:
        print("Error: Unable to connect to Jira API. Check your credentials and URL.", file=sys.stderr)
        sys.exit(1)

    if args.json:
        output_result({
            "display_name": user.get("displayName", ""),
            "email": user.get("emailAddress", ""),
            "account_id": user.get("accountId", ""),
            "active": user.get("active", False),
            "url": client.base_url,
        }, as_json=True)
    else:
        print("Authentication successful!\n")
        print(f"User: {user.get('displayName', 'Unknown')}")
        print(f"Email: {user.get('emailAddress', 'Unknown')}")
        print(f"Account ID: {user.get('accountId', 'Unknown')}")
        print(f"Active: {user.get('active', False)}")
        print(f"Instance: {client.base_url}")


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Jira CLI - Search, create, update, and manage Jira issues.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    def add_json_flag(subparser):
        subparser.add_argument("--json", action="store_true", help="Output as JSON")

    # search
    search_parser = subparsers.add_parser("search", help="Search issues with JQL")
    search_parser.add_argument("jql", help="JQL query string")
    search_parser.add_argument("--limit", type=int, default=50, help="Max results (default: 50)")
    search_parser.add_argument("--offset", type=int, default=0, help="Pagination offset")
    add_json_flag(search_parser)

    # get
    get_parser = subparsers.add_parser("get", help="Get issue details")
    get_parser.add_argument("issue_key", help="Issue key (e.g. DEV-123)")
    add_json_flag(get_parser)

    # create
    create_parser = subparsers.add_parser("create", help="Create a new issue")
    create_parser.add_argument("--project", required=True, help="Project key (e.g. DEV)")
    create_parser.add_argument("--summary", required=True, help="Issue summary")
    create_parser.add_argument("--type", required=True, help="Issue type (e.g. Bug, Story, Task)")
    create_parser.add_argument("--description", help="Issue description")
    create_parser.add_argument("--priority", help="Priority (e.g. High, Medium, Low)")
    create_parser.add_argument("--assignee", help="Assignee email or display name")
    create_parser.add_argument("--labels", help="Comma-separated labels")
    create_parser.add_argument("--parent", help="Parent issue key for sub-tasks")
    add_json_flag(create_parser)

    # update
    update_parser = subparsers.add_parser("update", help="Update an issue")
    update_parser.add_argument("issue_key", help="Issue key (e.g. DEV-123)")
    update_parser.add_argument("--summary", help="New summary")
    update_parser.add_argument("--description", help="New description")
    update_parser.add_argument("--priority", help="New priority")
    update_parser.add_argument("--assignee", help="New assignee email or display name")
    update_parser.add_argument("--labels", help="Comma-separated labels (replaces existing)")
    add_json_flag(update_parser)

    # transition
    transition_parser = subparsers.add_parser("transition", help="Transition issue status")
    transition_parser.add_argument("issue_key", help="Issue key (e.g. DEV-123)")
    transition_parser.add_argument("status", help="Target status name (e.g. 'In Progress', 'Done')")
    add_json_flag(transition_parser)

    # comment
    comment_parser = subparsers.add_parser("comment", help="Add or list comments")
    comment_parser.add_argument("issue_key", help="Issue key (e.g. DEV-123)")
    comment_parser.add_argument("--add", help="Comment text to add")
    comment_parser.add_argument("--list", action="store_true", help="List comments")
    comment_parser.add_argument("--limit", type=int, default=50, help="Max comments to list (default: 50)")
    add_json_flag(comment_parser)

    # list-projects
    projects_parser = subparsers.add_parser("list-projects", help="List accessible projects")
    projects_parser.add_argument("--limit", type=int, default=50, help="Max results (default: 50)")
    add_json_flag(projects_parser)

    # list-statuses
    statuses_parser = subparsers.add_parser("list-statuses", help="List statuses for a project")
    statuses_parser.add_argument("project_key", help="Project key (e.g. DEV)")
    add_json_flag(statuses_parser)

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
            client = JiraClient(atlassian_client)
            try:
                commands = {
                    "search": cmd_search,
                    "get": cmd_get,
                    "create": cmd_create,
                    "update": cmd_update,
                    "transition": cmd_transition,
                    "comment": cmd_comment,
                    "list-projects": cmd_list_projects,
                    "list-statuses": cmd_list_statuses,
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
