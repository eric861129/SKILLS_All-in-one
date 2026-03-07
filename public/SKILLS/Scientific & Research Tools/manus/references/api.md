# Manus API Reference

Base URL: `https://api.manus.ai`
Authentication: `API_KEY` header

## Tasks

### Create Task
`POST /v1/tasks`

**Request:**
```json
{
  "prompt": "string (required)",
  "agentProfile": "manus-1.6-lite | manus-1.6 | manus-1.6-max",
  "taskMode": "chat | adaptive | agent",
  "taskId": "string (for multi-turn)",
  "projectId": "string",
  "attachments": [],
  "connectors": [],
  "createShareableLink": false,
  "hideInTaskList": false,
  "interactiveMode": false,
  "locale": "en-US"
}
```

**Response:**
```json
{
  "task_id": "string",
  "task_title": "string",
  "task_url": "string",
  "share_url": "string (if createShareableLink=true)"
}
```

### Get Task
`GET /v1/tasks/{task_id}`

**Response:**
```json
{
  "id": "string",
  "object": "task",
  "created_at": "unix timestamp",
  "updated_at": "unix timestamp",
  "status": "pending | running | completed | failed",
  "model": "string",
  "metadata": {
    "task_title": "string",
    "task_url": "string"
  },
  "output": [
    {
      "id": "string",
      "role": "user | assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {"type": "output_text", "text": "string"},
        {"type": "output_file", "fileName": "string", "fileUrl": "string", "mimeType": "string"}
      ]
    }
  ],
  "credit_usage": 0,
  "error": "string (if failed)"
}
```

### List Tasks
`GET /v1/tasks`

### Update Task
`PUT /v1/tasks/{task_id}`

### Delete Task
`DELETE /v1/tasks/{task_id}`

## Projects

### Create Project
`POST /v1/projects`

**Request:**
```json
{
  "name": "string (required)",
  "instruction": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "instruction": "string",
  "created_at": "unix timestamp"
}
```

### List Projects
`GET /v1/projects`

## Files

### Create File Upload
`POST /v1/files`

**Request:**
```json
{
  "filename": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "object": "file",
  "filename": "string",
  "status": "pending",
  "upload_url": "presigned S3 URL",
  "upload_expires_at": "unix timestamp",
  "created_at": "unix timestamp"
}
```

Upload file to `upload_url` via PUT request within 3 minutes.

### List Files
`GET /v1/files`

### Get File
`GET /v1/files/{file_id}`

### Delete File
`DELETE /v1/files/{file_id}`

## Webhooks

### Create Webhook
`POST /v1/webhooks`

### Delete Webhook
`DELETE /v1/webhooks/{webhook_id}`

**Webhook Events:**
- `task_created` - Task initialized
- `task_progress` - Status updates during execution
- `task_stopped` - Completed or needs input (`stop_reason`: `finish` or `ask`)
