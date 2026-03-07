# Presentation Patterns

How to present recommendations effectively.

## Core Principle

**A recommendation without explanation is just a list.**

People trust recommendations when they understand why something was chosen for them. Personalized explanations transform "here's a list" into "here's why this is perfect for you."

---

## Confidence Interpretation

### Score Ranges

The API returns a confidence score (0-1) for each recommendation. Interpret and present accordingly:

| Score | Label | Presentation Approach |
|-------|-------|----------------------|
| 0.90+ | Strong match | Lead with this, present confidently |
| 0.70-0.89 | Good match | Present with confidence, minor caveats okay |
| 0.50-0.69 | Moderate match | Include caveats, explain potential misalignment |
| 0.30-0.49 | Weak match | Only include if specifically relevant, heavy caveats |
| <0.30 | Poor match | Generally omit |

### Ordering Strategy

1. **Lead with strong matches** (0.9+)
2. **Fill middle with good matches** (0.7-0.89)
3. **Include moderate matches sparingly** (0.5-0.69)
4. **Consider including one "stretch" pick** if user seems open to exploration

### When to Include Low-Confidence Items

Include weak matches only when:
- User explicitly asked for variety/diversity
- Strong matches are few
- The item fills a specific gap
- User seems adventurous

Always caveat heavily:
> "This one's a bit different from your usual preferences, but if you're feeling adventurous..."

---

## Explanation Structure

### The Three-Part Explanation

Every recommendation explanation should address:

1. **The Match** - Why this fits their stated preferences
2. **The Connection** - How it relates to things they've liked
3. **The Caveat** - Any potential misalignment (optional, for moderate matches)

### The Match

Connect directly to stated preferences:

> "Given your love of dark comedies, [Movie] should resonate. It has that same absurdist humor you responded to in [Previous Movie]."

**Patterns:**
- "Given your preference for X..."
- "Since you enjoy X..."
- "This aligns with your interest in X..."
- "Based on your appreciation for X..."

### The Connection

Draw lines to items in their history:

> "Similar to [Liked Item], this has [shared trait]. But where [Liked Item] was [difference], this [difference]."

**Patterns:**
- "Similar to X in that it..."
- "If you liked X, you'll probably enjoy this because..."
- "This has the same [trait] you appreciated in X..."
- "Reminds me of X but with [twist]..."

### The Caveat

For moderate-confidence recommendations, acknowledge uncertainty:

> "The pacing is slower than what you typically prefer, but the character development might make up for it."

**Patterns:**
- "That said, [potential issue]..."
- "One thing to note: [caveat]..."
- "It's [potential mismatch], which might/might not work for you..."
- "Fair warning: [issue]..."

---

## Presentation Templates

### Strong Match (0.9+)

```
[Item Name]

This is a strong match for you. [Core explanation connecting to preferences].
[Connection to history item]. [Brief additional context if helpful].
```

**Example:**
> **The Grand Budapest Hotel**
>
> This is a strong match for you. It has that same blend of whimsy and melancholy you loved in Moonrise Kingdom, with visually stunning compositions and dark undertones. The ensemble cast and layered storytelling should appeal to your appreciation for complexity.

### Good Match (0.7-0.89)

```
[Item Name]

[Explanation of match]. [Connection to preferences or history].
[Optional brief caveat or context].
```

**Example:**
> **Jojo Rabbit**
>
> This balances dark comedy with surprising emotional depth—right in your wheelhouse. Similar to your appreciation for Parasite's tonal shifts, this moves between absurdist humor and genuine heart. It's more overtly comedic than your typical picks, but the substance is there.

### Moderate Match (0.5-0.69)

```
[Item Name]

[Acknowledge this is less certain]. [Explain why it's included despite moderate confidence].
[Clear caveat about potential mismatch]. [What might make it work].
```

**Example:**
> **Marriage Story**
>
> This one's a bit of a stretch from your usual preferences—it's more straightforward drama than the quirky fare you typically enjoy. But given your appreciation for complex characters and authentic emotional beats, it might resonate. Fair warning: it's emotionally heavy throughout, without the comic relief you often prefer.

### Stretch Pick

```
[Item Name] (Stretch pick)

Something different from your usual preferences, but [reason for inclusion].
[Honest assessment of fit]. [What might surprise them].
```

**Example:**
> **Portrait of a Lady on Fire** (Stretch pick)
>
> Something different from your usual preferences, but bear with me. It's a slower, more contemplative piece than you typically go for. However, your appreciation for visual storytelling and authentic emotion might make this land. It trusts the audience's patience—which seems like something you'd appreciate.

---

## Conversational Flow

### Initial Presentation

Start with your top 2-3 recommendations:

> "Based on what you've told me, here are some recommendations:
>
> **[Top Pick]** - [One-line hook]
>
> **[Second Pick]** - [One-line hook]
>
> **[Third Pick]** - [One-line hook]
>
> Want me to tell you more about any of these, or should I suggest some alternatives?"

### Deep Dive on Request

When they ask for more about a specific item, use `/v1/explain`:

> "Tell me more about [Item]."

Response:
> "[Item] specifically matches your preferences because:
>
> - **[Preference 1]**: [How it matches]
> - **[Preference 2]**: [How it matches]
>
> It's similar to [History Item] in that [connection]. The main difference is [difference].
>
> One thing to be aware of: [potential concern from API response]."

### Handling Rejection

When a recommendation doesn't land:

> "Not quite what I'm looking for."

Response:
> "Got it—what about it missed the mark? Was it [hypothesis A] or [hypothesis B]? That'll help me refine the next suggestions."

Use their feedback to:
1. Add negative preferences
2. Adjust constraints
3. Recalibrate

### Iteration

After refinement:

> "Based on that feedback, here's a different direction:
>
> **[New Pick]** - This addresses your concern about [issue]. [Why it's different]."

---

## Vertical-Specific Presentation

### Movies & TV

**Include in presentation:**
- Runtime
- Release year
- Where to watch
- Content warnings if relevant

**Example:**
> **Knives Out** (2019, 2h 10m, streaming on Netflix)
>
> A sharp, witty mystery that plays with genre conventions. Given your love of clever plots and ensemble casts, this should be satisfying. It's got that same gleeful intelligence you enjoyed in The Grand Budapest Hotel.

### Restaurants

**Include in presentation:**
- Cuisine type
- Price range
- Distance/location
- Key highlights

**Example:**
> **Cafe Gratitude** (Vegan, $$, 0.5 miles away)
>
> This hits your plant-based requirement with creative, flavor-forward dishes. The vibe is casual but thoughtful—good for the relaxed dinner you described. They're known for their grain bowls and house-made cashew cheese.

### Products

**Include in presentation:**
- Price
- Key features
- How it compares to alternatives

**Example:**
> **Sony WH-1000XM5** ($350)
>
> Best-in-class noise cancellation with the comfort for long listening sessions you mentioned needing. Given your priority on sound quality over extra features, this edges out the Bose 700s. Battery life is excellent at 30 hours.

### Travel

**Include in presentation:**
- Best time to visit
- Budget alignment
- Why it fits their travel style

**Example:**
> **Lisbon, Portugal** (Best: March-May)
>
> This fits your budget of $150/day while delivering the mix of culture, food, and walkability you're after. More manageable than Barcelona but equally rich in history. The neighborhood of Alfama has the authentic local feel you mentioned wanting.

### Jobs

**Include in presentation:**
- Company and role clarity
- Why it matches their priorities
- Potential concerns

**Example:**
> **Senior Engineer at Stripe**
>
> Matches your priority of working on technically challenging problems at scale. The engineering culture aligns with your preference for autonomy and ownership. It's larger than you mentioned preferring, but the team structure maintains that small-team feel.

---

## Handling Edge Cases

### No Good Matches

When the API returns low-confidence results across the board:

> "I'm not finding strong matches with the current criteria. A few options:
>
> 1. **Loosen constraints** - [Specific constraint that might be too narrow]
> 2. **Different direction** - Maybe we're looking in the wrong space entirely
> 3. **More context** - Tell me more about [gap in context]
>
> Which would you like to explore?"

### Conflicting Preferences

When preferences seem contradictory:

> "I'm noticing some tension—you want [A] but also [B], which don't often go together. Help me understand: which matters more in this case?"

### Missing Context

When context is too sparse for quality recommendations:

> "I can give you some suggestions, but they'd be more personalized if I knew [specific gap]. Mind sharing [question]?"

### Post-Recommendation Feedback Loop

Always invite feedback:

> "How did [recommendation] work out?"

Use feedback for future recommendations:
- Positive: Reinforce associated preferences
- Negative: Add to dislikes, refine understanding

---

## Anti-Patterns in Presentation

### The Raw Dump

**Bad:**
> "Here are your recommendations: Movie A, Movie B, Movie C."

**Good:**
> "Based on your love of dark comedies, here are some picks: [with explanations]"

### The Generic Explanation

**Bad:**
> "This is a highly rated movie that many people enjoy."

**Good:**
> "This matches your preference for complex characters and moral ambiguity."

### The Overconfident Stretch

**Bad:**
> "You'll definitely love this!" (for a 0.55 confidence score)

**Good:**
> "This might work for you—it's different from your usual picks, but..."

### The Caveat Dump

**Bad:**
> "This has violence, bad language, slow pacing, and a 3-hour runtime—but you might like it!"

**Good:**
> "One thing to note: the pacing is deliberate. If you're in the mood to settle in, it rewards patience."

### Ignoring the History

**Bad:**
> "Here's a comedy you might like."

**Good:**
> "This has that same absurdist edge you loved in The Lobster."
