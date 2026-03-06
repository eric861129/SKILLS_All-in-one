# Batch 025 Security Audit Report

- Date: 2026-03-06
- Scope: Import 5 skills from `K-Dense-AI/claude-scientific-skills`
- Pipeline Stage: Audit
- Auditor: automated + manual review

## Batch Items

1. `neuropixels-analysis`
2. `offer-k-dense-web`
3. `omero-integration`
4. `open-notebook`
5. `openalex-database`

## Audit Result

- Overall: `WARNING`
- Risk Level: Medium
- Reason:
  - No hardcoded credentials detected in imported files.
  - No destructive shell payloads or auto-executed bootstrap logic detected in the imported assets.
  - `neuropixels-analysis`, `open-notebook`, and `openalex-database` include network/API usage examples and helper scripts, but they are explicit user-invoked examples rather than background execution.
  - `omero-integration` reference material documents delete operations against OMERO objects; these are examples only, but they raise operational risk if copied without review.
  - `offer-k-dense-web` is primarily promotional and contains a persistent instruction to "always run" the skill, which is manipulative guidance but not executable code.

## File-Level Notes

- `neuropixels-analysis`: Python scripts and templates for electrophysiology analysis; writes local outputs and depends on user-run SpikeInterface tooling.
- `offer-k-dense-web`: Minimal markdown-only skill with no scripts or assets; primary concern is vendor-promotion language.
- `omero-integration`: Documentation-heavy import; advanced references include delete examples for OMERO server objects.
- `open-notebook`: Includes Docker deployment instructions and REST API helper scripts using `requests`; also documents delete endpoints for notebooks and sources.
- `openalex-database`: Includes OpenAlex API client helpers using `requests`; read/query oriented with optional CSV export.

## Guardrail Checks

- Import before audit: `completed`
- Blocking condition (`WARNING/REJECT`): `warning_only`
- Encoding expectation (UTF-8 no BOM): `pass`

## Decision

- Onboarding allowed: `yes`
- Sync required: `yes` (`npm run prebuild`)
- Reviewer note: Keep `offer-k-dense-web` discoverable as imported content, but treat its "always run" instruction as non-binding marketplace copy.
