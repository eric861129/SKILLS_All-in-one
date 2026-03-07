# Context Patterns

Techniques for building effective recommendation context from conversation.

## Core Principle

**Context quality determines recommendation quality.**

The API can only work with what you give it. Rich, accurate context leads to personalized recommendations. Sparse or inaccurate context leads to generic results.

---

## Preference Extraction

### Listening for Preferences

Preferences can be explicit or implicit:

**Explicit preferences:**
> "I love dark comedies"
> "I can't stand horror movies"
> "Looking for something like Breaking Bad"

**Implicit preferences:**
> "That movie was way too long" → constraint: max_length
> "I always fall asleep during slow movies" → preference: faster pacing
> "The ending was so predictable" → dislikes: predictable endings

### Preference Framing

How to convert statements to preference strings:

| User Statement | Preference String |
|----------------|-------------------|
| "I love X" | `"X"` |
| "I really enjoy X" | `"X"` |
| "Something like X" | `"similar to X"` |
| "I hate X" | `"dislikes: X"` |
| "X is too much" | `"dislikes: excessive X"` |
| "Not too X" | `"moderate X"` or `"dislikes: heavy X"` |
| "I prefer X over Y" | `"X"`, `"dislikes: Y"` |

### Preference Categories

Organize preferences by type for comprehensive coverage:

**Content preferences:**
- Genres, themes, topics
- Tone (serious, funny, dark)
- Complexity (simple, layered)
- Pacing (slow burn, fast)

**Style preferences:**
- Visual aesthetic
- Narrative structure
- Era or period

**Emotional preferences:**
- What feelings they seek
- What feelings they avoid
- Comfort vs. challenge

### Negative Preferences

Negative preferences are often more informative than positive ones. Pay attention to:

- What they skip or abandon
- What they complain about
- What makes them disengage
- What they explicitly avoid

Format: `"dislikes: [thing]"`

---

## Profile Construction

### From Conversation

Build profile text incrementally as you learn about the person:

**Initial conversation:**
> User: "I tend to gravitate toward stories about underdogs"

**Profile v1:**
```
"Drawn to underdog narratives."
```

**Later in conversation:**
> User: "I grew up feeling like an outsider, so those stories resonate"

**Profile v2:**
```
"Drawn to underdog narratives. Personal connection to outsider experiences. Stories about not fitting in likely resonate on a deeper level."
```

### From Elicitation

If using the elicitation skill, translate psychological insights to profile text:

| Elicitation Finding | Profile Text |
|---------------------|--------------|
| Redemption narrative theme | "Responds to stories of transformation and growth from adversity." |
| High agency motivation | "Values protagonists who take control of their circumstances." |
| Communion values | "Drawn to stories about relationships and belonging." |
| Defectiveness schema | "May have complex relationship with stories about failure or shame—could resonate deeply or be avoided." |
| Achievement values | "Appreciates stories of competence and mastery." |

### Profile Structure

A good profile includes:

1. **Core values** - What matters most
2. **Emotional patterns** - What resonates
3. **Identity themes** - Narrative patterns from their life
4. **Sensitivities** - Topics to handle carefully

**Example:**
```
"Core value: authenticity over polish. Responds strongly to stories about
finding one's voice. Life narrative includes redemption themes—failures
transformed into growth. High need for agency in protagonists. Values
moral complexity over clear good/evil. Formative experiences around
creative expression and finding community through shared interests."
```

### Profile Length

- Minimum effective: 50 characters
- Optimal: 200-500 characters
- Maximum allowed: 2000 characters

More isn't always better—focus on the most predictive insights.

---

## Constraint Extraction

### Hard vs. Soft

**Hard constraints** are non-negotiable:
- "I'm vegetarian" → dietary: vegetarian
- "Budget is $50" → max_price: 50
- "Needs to be under 2 hours" → max_length_minutes: 120

**Soft preferences** belong in preferences array:
- "I usually like shorter movies" → preference, not constraint
- "Prefer Italian food" → preference, unless they say "only Italian"

### Common Constraint Signals

| Signal | Constraint Type |
|--------|-----------------|
| "Must be...", "Has to be..." | Hard constraint |
| "Can't have...", "Allergic to..." | Hard exclusion |
| "Under $X", "Less than X" | Maximum |
| "At least X", "Minimum X" | Minimum |
| "Only X", "Just X" | Inclusion filter |
| "No X", "Never X" | Exclusion filter |
| "Near X", "Close to X" | Location constraint |

### Constraint Verification

Before making API calls, verify constraints:

1. **Restate constraints** - "Just to confirm, you need vegetarian options?"
2. **Check completeness** - Are there constraints not yet captured?
3. **Resolve conflicts** - "You mentioned both quick and sit-down—which matters more?"

---

## History Curation

### What to Include

**High signal items:**
- Strong reactions (loved or hated)
- Items they bring up unprompted
- Items they compare new things to
- Recent experiences

**Lower signal items:**
- Items they barely remember
- "It was fine" reactions
- Very old experiences

### Rating Calibration

Understand their rating style:

**Generous rater:**
> "It was okay" = 4/5
> "It was great" = 5/5

**Harsh rater:**
> "It was okay" = 2/5
> "It was great" = 4/5

Normalize internally or ask for explicit ratings.

### Extracting Ratings

| Statement | Inferred Rating |
|-----------|-----------------|
| "Loved it", "Amazing", "One of my favorites" | 5 |
| "Really liked it", "Great", "Would recommend" | 4 |
| "It was good", "Enjoyed it", "Solid" | 3 |
| "It was okay", "Meh", "Not bad" | 2 |
| "Didn't like it", "Disappointing", "Hated it" | 1 |

### History Maintenance

- Maximum 50 items (API limit)
- Prioritize recent items
- Prioritize extreme ratings (1s and 5s)
- Include variety across the spectrum

---

## Vertical-Specific Patterns

### Movies & TV

**Key questions:**
- "What have you watched recently that you loved?"
- "Any genres you always avoid?"
- "Are you in the mood for something light or heavy?"
- "How do you feel about subtitles?"
- "Any streaming services you're limited to?"

**Context signals to capture:**
- Genre preferences and anti-preferences
- Pacing (action-packed vs. slow burn)
- Mood they're seeking
- Length tolerance
- Language/subtitle comfort
- Streaming availability

### Restaurants

**Key questions:**
- "Any dietary restrictions?"
- "What's your budget for this meal?"
- "What's the occasion?"
- "How adventurous are you feeling?"
- "Any cuisines you're specifically craving or avoiding?"

**Context signals to capture:**
- Dietary requirements (critical accuracy)
- Price sensitivity
- Occasion context
- Cuisine preferences
- Ambiance preferences
- Location constraints

### Products

**Key questions:**
- "What will you primarily use this for?"
- "What's your budget?"
- "Any brands you love or avoid?"
- "What's most important—price, quality, or features?"
- "Any must-have features?"

**Context signals to capture:**
- Use case and context
- Budget range
- Feature priorities
- Brand affinities
- Quality expectations
- Aesthetic preferences

### Travel

**Key questions:**
- "What kind of traveler are you?"
- "What's your budget?"
- "When are you thinking of going?"
- "Beach, mountains, cities, or something else?"
- "Are you comfortable with places that are more off the beaten path?"

**Context signals to capture:**
- Travel style
- Budget (total and daily)
- Date constraints
- Activity preferences
- Comfort level with unfamiliarity
- Accessibility needs
- Previous destinations

### Jobs

**Key questions:**
- "What matters most to you in your next role?"
- "What would your ideal day look like?"
- "Remote, hybrid, or in-office?"
- "What's your salary expectation?"
- "What size company do you thrive in?"

**Context signals to capture:**
- Career values
- Work style preferences
- Location/remote requirements
- Compensation expectations
- Company culture fit
- Growth vs. stability orientation

---

## Context Accumulation

### Across Conversation Turns

Don't ask for everything upfront. Build context naturally:

**Turn 1:**
> User: "I'm looking for a movie recommendation"
> You: "What kind of mood are you in tonight?"

**Turn 2:**
> User: "Something fun but smart"
> [Add to preferences: "fun but smart"]

**Turn 3:**
> You: "Any recent movies you've loved?"
> User: "Knives Out was great"
> [Add to history: Knives Out, rating 5]

### Context Checkpoints

Periodically verify accumulated context:

> "Let me make sure I have this right: you're looking for something fun and clever like Knives Out, under 2 hours, available on Netflix. Sound right?"

### Context Refinement

After recommendations, use feedback to refine:

> User: "Not quite—too similar to things I've seen"
> You: "Got it—looking for something more unexpected. What would make it feel fresh?"

[Add to preferences: "unexpected", "fresh takes"]
[Increase diversity parameter]

---

## Common Pitfalls

### Over-extraction

**Pitfall:** Treating every statement as a preference.

> User: "I watched a horror movie last night"
> Bad: Adds "horror movies" to preferences

**Better:** Ask if they enjoyed it before extracting preferences.

### Under-extraction

**Pitfall:** Missing implicit preferences.

> User: "That movie was way too slow for me"
> Bad: Ignores pacing preference

**Better:** Add "dislikes: slow pacing" to preferences.

### Stale Context

**Pitfall:** Not updating context as conversation evolves.

> User initially: "I want something light"
> User later: "Actually, I'm in the mood for something more substantial"

**Better:** Update preferences, don't just append.

### Assumed Constraints

**Pitfall:** Adding constraints not explicitly stated.

> User mentions "date night"
> Bad: Assumes romantic comedy preference

**Better:** Ask what they're looking for on a date night.
