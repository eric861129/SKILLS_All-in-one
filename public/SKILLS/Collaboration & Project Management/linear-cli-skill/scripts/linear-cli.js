#!/usr/bin/env node
import { LinearClient } from "@linear/sdk"
import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { readFileSync } from "fs"
// Get the directory of the linear executable (parent of scripts/)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const linearDir = join(__dirname, "..")
// Load environment variables from .env file next to linear executable
config({ path: join(linearDir, ".env") })
function parseArgs(argv) {
  const args = []
  const flags = {}
  let resource = ""
  let action = ""
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const nextArg = argv[i + 1]
      if (nextArg && !nextArg.startsWith("-")) {
        // Support multiple values for the same flag (e.g., --label foo --label bar)
        if (flags[key]) {
          // Convert to array if not already
          if (!Array.isArray(flags[key])) {
            flags[key] = [flags[key]]
          }
          flags[key].push(nextArg)
        } else {
          flags[key] = nextArg
        }
        i++
      } else {
        flags[key] = true
      }
    } else if (arg.startsWith("-")) {
      flags[arg.slice(1)] = true
    } else if (!resource) {
      resource = arg
    } else if (!action) {
      action = arg
    } else {
      args.push(arg)
    }
  }
  return { resource, action, args, flags }
}
function showHelp() {
  console.log(`linear-cli - CLI for working with Linear

Usage: linear-cli <resource> <action> [arguments] [options]

Resources:
  issue      Work with issues
  user       Work with users
  team       Work with teams
  project    Work with projects

Global Options:
  -h, --help    Show help
  --json        Output raw JSON

Run 'linear-cli <resource> --help' for resource-specific help
Run 'linear-cli <resource> <action> --help' for action-specific help

Examples:
  linear-cli issue list
  linear-cli issue view ENG-123
  linear-cli issue create "Fix bug" --team <team-id>
  linear-cli user list`)
}
function showUserHelp() {
  console.log(`Usage: linear-cli user <action>

Actions:
  list    List all users

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli user list
  linear-cli user list --json`)
}
function showTeamHelp() {
  console.log(`Usage: linear-cli team <action>

Actions:
  list    List all teams

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli team list
  linear-cli team list --json`)
}
function showProjectHelp() {
  console.log(`Usage: linear-cli project <action>

Actions:
  list    List all projects

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli project list
  linear-cli project list --json`)
}
function showIssueHelp() {
  console.log(`Usage: linear-cli issue <action> [arguments] [options]

Actions:
  list                            List issues with filters
  view <id-or-key>                Get detailed information about an issue
  create <title>                  Create a new issue
  update <id-or-key>              Update an issue
  delete <id-or-key>              Delete an issue (moves to trash)
  comment <id-or-key> <text>      Add a comment to an issue

Global Options:
  --json       Output raw JSON
  -h, --help   Show help

Run 'linear-cli issue <action> --help' for action-specific help`)
}
function showIssueListHelp() {
  console.log(`Usage: linear-cli issue list [options]

List issues with filters

Options:
  --team <id>       Filter by team ID
  --assignee <id>   Filter by assignee user ID
  --status <name>   Filter by status name
  --limit <n>       Limit results (default: 50)
  --json            Output raw JSON
  -h, --help        Show help

Examples:
  linear-cli issue list
  linear-cli issue list --team <team-id>
  linear-cli issue list --status "In Progress" --limit 10`)
}
function showIssueViewHelp() {
  console.log(`Usage: linear-cli issue view <id-or-key> [options]

Get detailed information about an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli issue view ENG-123
  linear-cli issue view <issue-uuid> --json`)
}
function showIssueCreateHelp() {
  console.log(`Usage: linear-cli issue create <title> [options]

Create a new issue

Arguments:
  title                 Issue title

Options:
  --team <id>           Team ID (required)
  --body <text>         Issue description (use --body-file for long text)
  --body-file <file>    Read description from file (use "-" for stdin)
  --assignee <id>       Assignee user ID (use "@me" for yourself)
  --label <name>        Label name(s) - can be specified multiple times or comma-separated
  --project <id>        Project ID to assign the issue to
  --parent <id>         Parent issue ID (for creating sub-issues)
  --priority <n>        Priority (0=None, 1=Urgent/P0, 2=High/P1, 3=Medium/P2, 4=Low/P3)
  --estimate <n>        Story point estimate
  --due-date <date>     Due date (YYYY-MM-DD format)
  --status <name>       Initial status (e.g. "Backlog", "Todo", "In Progress")
  --json                Output raw JSON
  -h, --help            Show help

Examples:
  linear-cli issue create "Fix bug" --team <team-id>
  linear-cli issue create "New feature" --team <team-id> --body "Details" --priority 2
  linear-cli issue create "Task" --team <team-id> --label bug --label p0
  echo "Long description" | linear-cli issue create "Title" --team <team-id> --body-file -
  linear-cli issue create "Sub-task" --team <team-id> --parent PROJ-123 --assignee @me`)
}
function showIssueUpdateHelp() {
  console.log(`Usage: linear-cli issue update <id-or-key> [options]

Update an issue

Arguments:
  id-or-key             Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --status <name>       Update status
  --assignee <id>       Update assignee (use "@me" for yourself)
  --priority <n>        Update priority (0=None, 1=Urgent/P0, 2=High/P1, 3=Medium/P2, 4=Low/P3)
  --title <text>        Update title
  --body <text>         Update description
  --body-file <file>    Read description from file (use "-" for stdin)
  --label <name>        Add label(s) - can be specified multiple times or comma-separated
  --project <id>        Assign to project
  --parent <id>         Set parent issue (for creating sub-issues)
  --estimate <n>        Update story point estimate
  --due-date <date>     Set due date (YYYY-MM-DD format)
  --json                Output raw JSON
  -h, --help            Show help

Examples:
  linear-cli issue update ENG-123 --status "In Progress"
  linear-cli issue update ENG-123 --assignee @me --priority 1
  linear-cli issue update ENG-123 --label bug --label urgent`)
}
function showIssueDeleteHelp() {
  console.log(`Usage: linear-cli issue delete <id-or-key> [options]

Delete an issue (moves to trash)

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli issue delete ENG-123
  linear-cli issue delete <issue-uuid>`)
}
function showIssueCommentHelp() {
  console.log(`Usage: linear-cli issue comment <id-or-key> <text> [options]

Add a comment to an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)
  text         Comment text

Options:
  --json       Output raw JSON (comment details)
  -h, --help   Show help

Examples:
  linear-cli issue comment ENG-123 "This looks good"
  linear-cli issue comment ENG-123 "Fixed in PR #42" --json`)
}
function getLinearClient() {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) {
    console.error(`Error: LINEAR_API_KEY not found

Please provide your Linear API key in one of these ways:

1. Environment variable:
   export LINEAR_API_KEY="your-api-key"

2. Create a .env file next to the linear executable:
   echo 'LINEAR_API_KEY=your-api-key' > ${linearDir}/.env

Get your API key from: https://linear.app/settings/api
Go to Settings > API > Personal API keys > Create key`)
    process.exit(1)
  }
  try {
    return new LinearClient({ apiKey })
  } catch (error) {
    console.error(`Error: Failed to initialize Linear client

Make sure @linear/sdk is installed:
  cd linear/
  npm install`)
    process.exit(1)
  }
}

// Helper to read file or stdin
function readBodyFile(path) {
  if (path === "-" || path === true) {
    // Read from stdin (path might be true if --body-file is passed without value)
    try {
      return readFileSync(0, "utf-8")
    } catch (error) {
      console.error("Error: Could not read from stdin")
      process.exit(1)
    }
  } else {
    // Read from file
    try {
      return readFileSync(path, "utf-8")
    } catch (error) {
      console.error(`Error: Could not read file: ${path}`)
      process.exit(1)
    }
  }
}

// Helper to parse label input (supports comma-separated or array)
function parseLabels(labelInput) {
  if (!labelInput) return []

  const labels = Array.isArray(labelInput) ? labelInput : [labelInput]
  const result = []

  for (const label of labels) {
    // Split by comma in case user does --label "bug,feature"
    const split = label.split(",").map((l) => l.trim()).filter(Boolean)
    result.push(...split)
  }

  return result
}

// Helper to resolve assignee (handle @me)
async function resolveAssignee(client, assigneeInput) {
  if (!assigneeInput) return null
  if (assigneeInput === "@me") {
    const viewer = await client.viewer
    return viewer.id
  }
  return assigneeInput
}

// Helper to find labels by name for a team
async function findLabels(client, teamId, labelNames) {
  const graphQLClient = client.client

  // Get all labels for the team
  const response = await graphQLClient.rawRequest(
    `query getTeamLabels($teamId: String!) {
      team(id: $teamId) {
        labels {
          nodes {
            id
            name
          }
        }
      }
    }`,
    { teamId }
  )

  const availableLabels = response.data.team.labels.nodes
  const labelIds = []
  const notFound = []

  for (const labelName of labelNames) {
    const label = availableLabels.find(
      (l) => l.name.toLowerCase() === labelName.toLowerCase()
    )
    if (label) {
      labelIds.push(label.id)
    } else {
      notFound.push(labelName)
    }
  }

  if (notFound.length > 0) {
    console.error(`Error: Label(s) not found: ${notFound.join(", ")}`)
    console.error(`\nAvailable labels for this team:`)
    if (availableLabels.length === 0) {
      console.error("  (no labels available)")
    } else {
      for (const label of availableLabels) {
        console.error(`  - ${label.name}`)
      }
    }
    process.exit(1)
  }

  return labelIds
}
async function listUsers(flags) {
  const client = getLinearClient()
  const users = await client.users()
  if (flags.json) {
    console.log(JSON.stringify(users.nodes, null, 2))
    return
  }
  console.log("Users\n")
  for (const user of users.nodes) {
    console.log(`#${user.id}\t${user.name}\t${user.email}`)
  }
}
async function listTeams(flags) {
  const client = getLinearClient()
  const teams = await client.teams()
  if (flags.json) {
    console.log(JSON.stringify(teams.nodes, null, 2))
    return
  }
  console.log("Teams\n")
  for (const team of teams.nodes) {
    console.log(`#${team.id}\t${team.name}\t${team.key}`)
  }
}
async function listProjects(flags) {
  const client = getLinearClient()
  const projects = await client.projects()
  if (flags.json) {
    console.log(JSON.stringify(projects.nodes, null, 2))
    return
  }
  console.log("Projects\n")
  for (const project of projects.nodes) {
    console.log(`#${project.id}\t${project.name}\t${project.state}`)
  }
}
async function listIssues(flags) {
  const client = getLinearClient()

  // Build filter JSON
  const filter = {}
  if (flags.team) {
    filter.team = { id: { eq: flags.team } }
  }
  if (flags.assignee) {
    filter.assignee = { id: { eq: flags.assignee } }
  }
  if (flags.status) {
    filter.state = { name: { eq: flags.status } }
  }
  const limit = flags.limit ? parseInt(flags.limit, 10) : 50

  // Use GraphQL to preload all relations in a single query
  const graphQLClient = client.client
  const response = await graphQLClient.rawRequest(
    `query listIssues($first: Int!, $filter: IssueFilter, $orderBy: PaginationOrderBy!) {
      issues(first: $first, filter: $filter, orderBy: $orderBy) {
        nodes {
          id
          identifier
          title
          state {
            name
          }
          assignee {
            name
            email
          }
        }
      }
    }`,
    {
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      orderBy: "updatedAt"
    }
  )

  const issues = response.data.issues.nodes

  if (flags.json) {
    console.log(JSON.stringify(issues, null, 2))
    return
  }

  console.log("Issues\n")
  for (const issue of issues) {
    const assigneeName = issue.assignee?.name || "Unassigned"
    console.log(`#${issue.identifier}\t${issue.title}\t${issue.state?.name}\t${assigneeName}`)
  }
}
async function getIssue(identifier, flags) {
  const client = getLinearClient()
  const graphQLClient = client.client

  let issue
  try {
    if (identifier.includes("-")) {
      // Looks like an identifier (ENG-123)
      const [teamKey, issueNumber] = identifier.toUpperCase().split("-")
      const response = await graphQLClient.rawRequest(
        `query getIssueByIdentifier($teamKey: String!, $issueNumber: Float!) {
          issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $issueNumber } }) {
            nodes {
              id
              identifier
              title
              description
              priority
              estimate
              dueDate
              createdAt
              updatedAt
              state {
                name
              }
              assignee {
                name
                email
              }
              team {
                name
                key
              }
              parent {
                identifier
                title
              }
              project {
                id
                name
              }
              labels {
                nodes {
                  name
                }
              }
              comments {
                nodes {
                  body
                  createdAt
                  user {
                    name
                  }
                }
              }
            }
          }
        }`,
        { teamKey, issueNumber: parseInt(issueNumber) }
      )
      issue = response.data.issues.nodes[0]
    } else {
      // Assume it's a UUID
      const response = await graphQLClient.rawRequest(
        `query getIssueById($id: String!) {
          issue(id: $id) {
            id
            identifier
            title
            description
            priority
            estimate
            dueDate
            createdAt
            updatedAt
            state {
              name
            }
            assignee {
              name
              email
            }
            team {
              name
              key
            }
            parent {
              identifier
              title
            }
            project {
              id
              name
            }
            labels {
              nodes {
                name
              }
            }
            comments {
              nodes {
                body
                createdAt
                user {
                  name
                }
              }
            }
          }
        }`,
        { id: identifier }
      )
      issue = response.data.issue
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }

  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }

  if (flags.json) {
    console.log(JSON.stringify(issue, null, 2))
    return
  }

  const priorityMap = {
    0: "None",
    1: "Urgent (P0)",
    2: "High (P1)",
    3: "Medium (P2)",
    4: "Low (P3)",
  }

  console.log(`Issue: #${issue.identifier}\n`)
  console.log(`Title:\t\t${issue.title}`)
  console.log(`Status:\t\t${issue.state?.name || "Unknown"}`)
  console.log(`Assignee:\t${issue.assignee ? `${issue.assignee.name} (${issue.assignee.email})` : "Unassigned"}`)
  console.log(`Team:\t\t${issue.team.name} (${issue.team.key})`)
  console.log(`Priority:\t${priorityMap[issue.priority] || "None"}`)
  console.log(`Labels:\t\t${issue.labels.nodes.map((l) => l.name).join(", ") || "None"}`)
  if (issue.parent) {
    console.log(`Parent:\t\t#${issue.parent.identifier} - ${issue.parent.title}`)
  }
  if (issue.project) {
    console.log(`Project:\t${issue.project.name}`)
  }
  if (issue.estimate) {
    console.log(`Estimate:\t${issue.estimate} points`)
  }
  if (issue.dueDate) {
    console.log(`Due Date:\t${issue.dueDate}`)
  }
  console.log(`Created:\t${new Date(issue.createdAt).toISOString().split("T")[0]}`)
  console.log(`Updated:\t${new Date(issue.updatedAt).toISOString().split("T")[0]}`)

  if (issue.description) {
    console.log(`\nDescription:`)
    console.log(issue.description)
  }

  if (issue.comments.nodes.length > 0) {
    console.log(`\nComments:`)
    for (const comment of issue.comments.nodes) {
      const date = new Date(comment.createdAt).toISOString().split("T")[0]
      console.log(`  [${date}] ${comment.user?.name}: ${comment.body}`)
    }
  }
}
async function addComment(identifier, text, flags) {
  const client = getLinearClient()
  // Find issue first
  let issue
  try {
    if (identifier.includes("-")) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split("-")[1]) } } })
      issue = issues.nodes.find((i) => i.identifier === identifier.toUpperCase())
    } else {
      issue = await client.issue(identifier)
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  const response = await client.createComment({
    issueId: issue.id,
    body: text,
  })
  const comment = await response.comment
  if (flags.json) {
    console.log(JSON.stringify(comment, null, 2))
    return
  }
  console.log(`✓ Comment added to #${issue.identifier}`)
}
async function updateIssue(identifier, flags) {
  const client = getLinearClient()
  // Find issue first
  let issue
  try {
    if (identifier.includes("-")) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split("-")[1]) } } })
      issue = issues.nodes.find((i) => i.identifier === identifier.toUpperCase())
    } else {
      issue = await client.issue(identifier)
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  const updates = {}

  // Handle status
  if (flags.status) {
    // Find state by name
    const team = await issue.team
    const states = await team.states()
    const state = states.nodes.find((s) => s.name.toLowerCase() === flags.status.toLowerCase())
    if (state) {
      updates.stateId = state.id
    } else {
      console.error(`Error: Status '${flags.status}' not found`)
      process.exit(1)
    }
  }

  // Handle assignee with @me support
  const assigneeId = await resolveAssignee(client, flags.assignee)
  if (assigneeId) {
    updates.assigneeId = assigneeId
  }

  // Handle priority
  if (flags.priority !== undefined) {
    updates.priority = parseInt(flags.priority, 10)
  }

  // Handle title
  if (flags.title) {
    updates.title = flags.title
  }

  // Handle body/description
  if (flags["body-file"]) {
    updates.description = readBodyFile(flags["body-file"])
  } else if (flags.body) {
    updates.description = flags.body
  }

  // Handle labels
  const labelNames = parseLabels(flags.label)
  if (labelNames.length > 0) {
    const team = await issue.team
    const labelIds = await findLabels(client, team.id, labelNames)
    updates.labelIds = labelIds
  }

  // Handle project
  if (flags.project) {
    updates.projectId = flags.project
  }

  // Handle parent
  if (flags.parent) {
    let parentIssue
    try {
      if (flags.parent.includes("-")) {
        const issues = await client.issues({
          filter: { number: { eq: parseInt(flags.parent.split("-")[1]) } },
        })
        parentIssue = issues.nodes.find((i) => i.identifier === flags.parent.toUpperCase())
      } else {
        parentIssue = await client.issue(flags.parent)
      }
    } catch (error) {
      console.error(`Error: Parent issue not found: ${flags.parent}`)
      process.exit(1)
    }
    if (!parentIssue) {
      console.error(`Error: Parent issue not found: ${flags.parent}`)
      process.exit(1)
    }
    updates.parentId = parentIssue.id
  }

  // Handle estimate
  if (flags.estimate !== undefined) {
    updates.estimate = parseFloat(flags.estimate)
  }

  // Handle due date
  if (flags["due-date"]) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(flags["due-date"])) {
      console.error(`Error: Invalid date format. Use YYYY-MM-DD (e.g., 2025-12-31)`)
      process.exit(1)
    }
    updates.dueDate = flags["due-date"]
  }

  if (Object.keys(updates).length === 0) {
    console.error(`Error: No updates specified

Run 'linear-cli update --help' for available options`)
    process.exit(1)
  }
  const response = await client.updateIssue(issue.id, updates)
  const updatedIssue = await response.issue
  if (flags.json) {
    console.log(JSON.stringify(updatedIssue, null, 2))
    return
  }
  console.log(`✓ Issue #${issue.identifier} updated`)
}
async function createIssue(title, flags) {
  const client = getLinearClient()
  if (!flags.team) {
    console.error(`Error: --team flag is required

Run 'linear-cli create --help' for usage`)
    process.exit(1)
  }
  const input = {
    teamId: flags.team,
    title,
  }

  // Handle body/description
  if (flags["body-file"]) {
    input.description = readBodyFile(flags["body-file"])
  } else if (flags.body) {
    input.description = flags.body
  }

  // Handle assignee with @me support
  const assigneeId = await resolveAssignee(client, flags.assignee)
  if (assigneeId) {
    input.assigneeId = assigneeId
  }

  // Handle labels
  const labelNames = parseLabels(flags.label)
  if (labelNames.length > 0) {
    const labelIds = await findLabels(client, flags.team, labelNames)
    input.labelIds = labelIds
  }

  // Handle project
  if (flags.project) {
    input.projectId = flags.project
  }

  // Handle parent (for sub-issues)
  if (flags.parent) {
    // Need to resolve parent identifier to ID
    let parentIssue
    try {
      if (flags.parent.includes("-")) {
        const issues = await client.issues({
          filter: { number: { eq: parseInt(flags.parent.split("-")[1]) } },
        })
        parentIssue = issues.nodes.find((i) => i.identifier === flags.parent.toUpperCase())
      } else {
        parentIssue = await client.issue(flags.parent)
      }
    } catch (error) {
      console.error(`Error: Parent issue not found: ${flags.parent}`)
      process.exit(1)
    }
    if (!parentIssue) {
      console.error(`Error: Parent issue not found: ${flags.parent}`)
      process.exit(1)
    }
    input.parentId = parentIssue.id
  }

  // Handle priority
  if (flags.priority !== undefined) {
    input.priority = parseInt(flags.priority, 10)
  }

  // Handle estimate
  if (flags.estimate !== undefined) {
    input.estimate = parseFloat(flags.estimate)
  }

  // Handle due date
  if (flags["due-date"]) {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(flags["due-date"])) {
      console.error(`Error: Invalid date format. Use YYYY-MM-DD (e.g., 2025-12-31)`)
      process.exit(1)
    }
    input.dueDate = flags["due-date"]
  }

  // Handle status
  if (flags.status) {
    // Find state by name
    const team = await client.team(flags.team)
    const states = await team.states()
    const state = states.nodes.find((s) => s.name.toLowerCase() === flags.status.toLowerCase())
    if (state) {
      input.stateId = state.id
    } else {
      console.error(`Error: Status '${flags.status}' not found`)
      process.exit(1)
    }
  }

  const response = await client.createIssue(input)
  const issue = await response.issue
  if (!issue) {
    console.error("Error: Failed to create issue")
    process.exit(1)
  }
  if (flags.json) {
    console.log(JSON.stringify(issue, null, 2))
    return
  }
  console.log(`✓ Issue created: #${issue.identifier}`)
  console.log(`  Title: ${issue.title}`)
  console.log(`  URL: ${issue.url}`)
}
async function deleteIssue(identifier, flags) {
  const client = getLinearClient()
  // Find issue first
  let issue
  try {
    if (identifier.includes("-")) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split("-")[1]) } } })
      issue = issues.nodes.find((i) => i.identifier === identifier.toUpperCase())
    } else {
      issue = await client.issue(identifier)
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  const response = await client.deleteIssue(issue.id)
  const success = await response.success
  if (flags.json) {
    console.log(JSON.stringify({ success }, null, 2))
    return
  }
  if (success) {
    console.log(`✓ Issue #${issue.identifier} deleted (moved to trash)`)
  } else {
    console.error(`Error: Failed to delete issue #${issue.identifier}`)
    process.exit(1)
  }
}
async function main() {
  const { resource, action, args, flags } = parseArgs(process.argv)

  // Handle help flags
  if (flags.h || flags.help) {
    if (!resource) {
      showHelp()
      process.exit(0)
    }

    switch (resource) {
      case "user":
        showUserHelp()
        break
      case "team":
        showTeamHelp()
        break
      case "project":
        showProjectHelp()
        break
      case "issue":
        if (!action) {
          showIssueHelp()
        } else {
          switch (action) {
            case "list":
              showIssueListHelp()
              break
            case "view":
              showIssueViewHelp()
              break
            case "create":
              showIssueCreateHelp()
              break
            case "update":
              showIssueUpdateHelp()
              break
            case "delete":
              showIssueDeleteHelp()
              break
            case "comment":
              showIssueCommentHelp()
              break
            default:
              showIssueHelp()
          }
        }
        break
      default:
        showHelp()
    }
    process.exit(0)
  }

  try {
    // Route commands
    switch (resource) {
      case "user":
        if (action === "list") {
          await listUsers(flags)
        } else {
          console.error(`Error: Unknown action '${action}' for resource 'user'

Run 'linear-cli user --help' for usage`)
          process.exit(1)
        }
        break

      case "team":
        if (action === "list") {
          await listTeams(flags)
        } else {
          console.error(`Error: Unknown action '${action}' for resource 'team'

Run 'linear-cli team --help' for usage`)
          process.exit(1)
        }
        break

      case "project":
        if (action === "list") {
          await listProjects(flags)
        } else {
          console.error(`Error: Unknown action '${action}' for resource 'project'

Run 'linear-cli project --help' for usage`)
          process.exit(1)
        }
        break

      case "issue":
        switch (action) {
          case "list":
            await listIssues(flags)
            break

          case "view":
            if (args.length === 0) {
              console.error(`Error: Missing issue identifier

Run 'linear-cli issue view --help' for usage`)
              process.exit(1)
            }
            await getIssue(args[0], flags)
            break

          case "create":
            if (args.length === 0) {
              console.error(`Error: Missing issue title

Run 'linear-cli issue create --help' for usage`)
              process.exit(1)
            }
            await createIssue(args.join(" "), flags)
            break

          case "update":
            if (args.length === 0) {
              console.error(`Error: Missing issue identifier

Run 'linear-cli issue update --help' for usage`)
              process.exit(1)
            }
            await updateIssue(args[0], flags)
            break

          case "delete":
            if (args.length === 0) {
              console.error(`Error: Missing issue identifier

Run 'linear-cli issue delete --help' for usage`)
              process.exit(1)
            }
            await deleteIssue(args[0], flags)
            break

          case "comment":
            if (args.length < 2) {
              console.error(`Error: Missing required arguments

Run 'linear-cli issue comment --help' for usage`)
              process.exit(1)
            }
            await addComment(args[0], args.slice(1).join(" "), flags)
            break

          default:
            if (action) {
              console.error(`Error: Unknown action '${action}' for resource 'issue'

Run 'linear-cli issue --help' for usage`)
            } else {
              console.error(`Error: Missing action for resource 'issue'

Run 'linear-cli issue --help' for usage`)
            }
            process.exit(1)
        }
        break

      default:
        if (resource) {
          console.error(`Error: Unknown resource '${resource}'

Run 'linear-cli --help' for usage`)
          process.exit(1)
        } else {
          showHelp()
        }
    }
  } catch (error) {
    if (error.message?.includes("API key")) {
      console.error(`Error: Invalid LINEAR_API_KEY

Check your API key is valid: https://linear.app/settings/api`)
    } else {
      console.error(`Error: ${error.message || "Unknown error occurred"}`)
    }
    process.exit(1)
  }
}
main()
