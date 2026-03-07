# API Reference

Complete documentation for the TasteRay Recommendation API.

## Base URL

```
https://api.tasteray.com
```

## Authentication

All requests require an API key passed in the `X-API-Key` header:

```http
X-API-Key: your-api-key
```

API keys can be obtained from the TasteRay dashboard. Keys are scoped to specific verticals based on your subscription.

---

## POST /v1/recommend

Get personalized recommendations based on context.

### Request

```http
POST /v1/recommend
Content-Type: application/json
X-API-Key: your-api-key
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vertical` | string | Yes | Domain: `movies`, `restaurants`, `products`, `travel`, `jobs` |
| `context` | object | Yes | User context for personalization |
| `count` | integer | No | Number of recommendations (1-20, default: 5) |
| `explain` | boolean | No | Include explanations (default: false) |
| `diversity` | float | No | Diversity factor 0-1 (default: 0.3) |

### Context Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `preferences` | array | Yes | List of preference strings |
| `profile` | string | No | Psychological profile text |
| `constraints` | object | No | Vertical-specific constraints |
| `history` | array | No | Past items with ratings |

### Preferences Array

Array of strings describing likes and dislikes:

```json
"preferences": [
  "dark comedies",
  "complex anti-heroes",
  "dislikes: jump scares",
  "dislikes: predictable endings"
]
```

- Positive preferences are plain strings
- Negative preferences are prefixed with `dislikes:`
- Maximum 50 preference strings
- Each string maximum 200 characters

### Profile String

Free-form text describing the user's psychological profile:

```json
"profile": "Values authenticity over polish. Drawn to outsider narratives and stories about people who don't fit in. Appreciates moral ambiguity."
```

- Maximum 2000 characters
- Can include insights from elicitation skill
- More context improves recommendation quality

### Constraints Object

Vertical-specific hard filters. See Constraints by Vertical section below.

### History Array

Previous items with ratings:

```json
"history": [
  {
    "item": "Parasite",
    "rating": 5,
    "id": "tt6751668"
  },
  {
    "item": "The Lobster",
    "rating": 4,
    "id": "tt3464902"
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item` | string | Yes | Item name |
| `rating` | integer | Yes | Rating 1-5 |
| `id` | string | No | External ID (IMDB, Yelp, etc.) |
| `timestamp` | string | No | ISO 8601 datetime |

- Maximum 50 history items
- More recent items are weighted higher
- Both positive and negative ratings improve accuracy

### Response

```json
{
  "recommendations": [
    {
      "item": "The Grand Budapest Hotel",
      "id": "tt2278388",
      "confidence": 0.92,
      "explanation": "Strong match for your preference for dark comedies with visual style. Similar quirky-yet-melancholic tone to films you've rated highly.",
      "metadata": {
        "year": 2014,
        "director": "Wes Anderson",
        "runtime_minutes": 99
      }
    }
  ],
  "context_quality": 0.85,
  "request_id": "req_abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `recommendations` | array | Ordered list of recommendations |
| `context_quality` | float | 0-1 score indicating context richness |
| `request_id` | string | Unique ID for debugging |

### Recommendation Object

| Field | Type | Description |
|-------|------|-------------|
| `item` | string | Item name |
| `id` | string | External identifier |
| `confidence` | float | Match confidence 0-1 |
| `explanation` | string | Why this matches (if `explain: true`) |
| `metadata` | object | Vertical-specific metadata |

### Example Request

```bash
curl -X POST https://api.tasteray.com/v1/recommend \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "vertical": "movies",
    "context": {
      "preferences": ["dark comedies", "complex characters"],
      "profile": "Values authenticity. Drawn to outsider narratives.",
      "constraints": {
        "max_length_minutes": 120,
        "release_year_min": 2010
      },
      "history": [
        {"item": "Parasite", "rating": 5, "id": "tt6751668"}
      ]
    },
    "count": 5,
    "explain": true
  }'
```

---

## POST /v1/explain

Get a detailed explanation for why a specific item matches the user's context.

### Request

```http
POST /v1/explain
Content-Type: application/json
X-API-Key: your-api-key
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `vertical` | string | Yes | Domain vertical |
| `item` | string | Yes | Item name |
| `id` | string | No | External item ID |
| `context` | object | Yes | Same context object as /recommend |

### Response

```json
{
  "item": "Parasite",
  "id": "tt6751668",
  "confidence": 0.95,
  "explanation": {
    "summary": "Exceptional match across multiple dimensions.",
    "preference_matches": [
      {
        "preference": "dark comedies",
        "match_strength": 0.9,
        "reasoning": "Blends social satire with dark humor throughout."
      },
      {
        "preference": "complex characters",
        "match_strength": 0.95,
        "reasoning": "Every character has depth and motivation beyond surface."
      }
    ],
    "profile_matches": [
      {
        "trait": "outsider narratives",
        "match_strength": 0.85,
        "reasoning": "Centers on a family navigating between social worlds."
      }
    ],
    "history_similarities": [
      {
        "item": "The Lobster",
        "similarity": 0.78,
        "shared_traits": ["dark satire", "class commentary"]
      }
    ],
    "potential_concerns": [
      "Contains some intense scenes of violence that may be jarring."
    ]
  },
  "request_id": "req_def456"
}
```

### Example Request

```bash
curl -X POST https://api.tasteray.com/v1/explain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "vertical": "movies",
    "item": "Parasite",
    "id": "tt6751668",
    "context": {
      "preferences": ["dark comedies", "complex characters"],
      "profile": "Values authenticity. Drawn to outsider narratives."
    }
  }'
```

---

## GET /v1/usage

Check API usage and quota.

### Request

```http
GET /v1/usage
X-API-Key: your-api-key
```

### Response

```json
{
  "tier": "pro",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "usage": {
    "requests_today": 127,
    "requests_this_period": 2847,
    "requests_limit_daily": 5000,
    "requests_limit_period": null
  },
  "rate_limit": {
    "requests_per_minute": 60,
    "current_minute_usage": 3
  }
}
```

---

## Constraints by Vertical

### Movies

| Constraint | Type | Description |
|------------|------|-------------|
| `max_length_minutes` | integer | Maximum runtime |
| `min_length_minutes` | integer | Minimum runtime |
| `release_year_min` | integer | Earliest release year |
| `release_year_max` | integer | Latest release year |
| `genres` | array | Include only these genres |
| `exclude_genres` | array | Exclude these genres |
| `languages` | array | ISO 639-1 language codes |
| `streaming_services` | array | Available on these services |
| `mpaa_rating_max` | string | Maximum rating (G, PG, PG-13, R, NC-17) |

### Restaurants

| Constraint | Type | Description |
|------------|------|-------------|
| `location` | object | `{lat, lng, radius_miles}` |
| `cuisine` | array | Cuisine types to include |
| `exclude_cuisine` | array | Cuisine types to exclude |
| `price_range` | array | Price levels 1-4 (e.g., `[2, 3]`) |
| `dietary` | array | Dietary options required |
| `open_now` | boolean | Currently open |
| `open_at` | string | Open at specific time (ISO 8601) |
| `min_rating` | float | Minimum aggregate rating |
| `reservations` | boolean | Accepts reservations |

**Dietary options:** `vegetarian`, `vegan`, `gluten-free`, `halal`, `kosher`, `dairy-free`, `nut-free`

### Products

| Constraint | Type | Description |
|------------|------|-------------|
| `category` | string | Product category |
| `max_price` | float | Maximum price |
| `min_price` | float | Minimum price |
| `brands` | array | Include only these brands |
| `brand_exclude` | array | Exclude these brands |
| `features_required` | array | Must have these features |
| `features_preferred` | array | Nice to have features |
| `condition` | string | `new`, `refurbished`, `used` |
| `availability` | string | `in_stock`, `preorder` |

### Travel

| Constraint | Type | Description |
|------------|------|-------------|
| `budget_per_day` | float | Daily budget in USD |
| `budget_total` | float | Total trip budget |
| `dates` | object | `{start, end}` ISO 8601 |
| `duration_days` | integer | Trip length |
| `climate` | string | `warm`, `cold`, `moderate`, `tropical` |
| `accessibility` | array | Accessibility requirements |
| `visa_free_for` | string | Country code for visa requirements |
| `exclude_regions` | array | Regions to avoid |
| `interests` | array | Activity interests |

**Interests:** `beach`, `mountains`, `culture`, `history`, `nightlife`, `nature`, `adventure`, `food`, `shopping`, `relaxation`

### Jobs

| Constraint | Type | Description |
|------------|------|-------------|
| `location` | string | City or region |
| `remote` | string | `remote`, `hybrid`, `onsite` |
| `salary_min` | integer | Minimum salary |
| `salary_max` | integer | Maximum salary |
| `experience_level` | string | `entry`, `mid`, `senior`, `executive` |
| `company_size` | array | `startup`, `mid`, `enterprise` |
| `industry` | array | Industry sectors |
| `industry_exclude` | array | Industries to avoid |
| `benefits_required` | array | Required benefits |

---

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request - invalid parameters |
| 401 | Unauthorized - invalid or missing API key |
| 403 | Forbidden - insufficient permissions |
| 404 | Not found - invalid endpoint |
| 429 | Too many requests - rate limited |
| 500 | Internal server error |
| 503 | Service unavailable |

### Error Response Format

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 30 seconds.",
    "details": {
      "limit": 60,
      "window": "1m",
      "retry_after": 30
    }
  },
  "request_id": "req_xyz789"
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `invalid_vertical` | Unknown vertical specified |
| `missing_preferences` | Context must include preferences |
| `invalid_constraints` | Constraint format invalid for vertical |
| `history_limit_exceeded` | More than 50 history items |
| `rate_limit_exceeded` | Too many requests |
| `quota_exceeded` | Daily or period quota exceeded |
| `invalid_api_key` | API key invalid or expired |
| `insufficient_permissions` | Key not authorized for this vertical |

---

## Rate Limits

| Tier | Requests/minute | Requests/day | Verticals |
|------|-----------------|--------------|-----------|
| Free | 10 | 100 | 1 |
| Pro | 60 | 5,000 | All |
| Enterprise | 300 | Unlimited | All |

### Rate Limit Headers

All responses include rate limit headers:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 1704067200
```

When rate limited, the response includes:

```http
Retry-After: 30
```

---

## Best Practices

### Context Quality

- Include at least 3 preferences for meaningful results
- Add history items with both high and low ratings
- Use profile text when available from elicitation
- Specify constraints to filter irrelevant results

### Performance

- Cache responses for repeated queries
- Use `count` to limit results to what you need
- Set `explain: false` if explanations aren't needed
- Batch requests when possible

### Error Handling

- Implement exponential backoff for 429 and 5xx errors
- Log `request_id` for debugging
- Have fallback behavior for API unavailability
- Validate constraints before sending
