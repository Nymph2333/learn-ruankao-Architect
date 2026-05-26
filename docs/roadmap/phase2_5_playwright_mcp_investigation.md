# Phase 2.5: Playwright MCP Investigation

## Purpose

Playwright MCP may be used as an interactive investigation tool for understanding the rendered behavior of the target SPA page. It is not part of the formal crawler pipeline and must not replace reproducible scripts.

This phase is documentation-only. It does not enter Phase 3.

## Tool Boundary

### Playwright Script

`scripts/crawl-ruankaodaren.ts` is the reproducible crawler asset.

It is responsible for producing auditable raw snapshots under:

- `sources/ruankaodaren/raw/html/`
- `sources/ruankaodaren/raw/xhr/`
- `sources/ruankaodaren/raw/screenshots/`
- `sources/ruankaodaren/raw/metadata/`

The script output is the only acceptable raw snapshot artifact for the crawler pipeline.

### Playwright MCP

Playwright MCP is an interactive exploration tool.

It may be used to inspect:

- DOM structure after SPA rendering
- XHR and Fetch behavior
- visible login-required signals
- lazy-loading behavior
- route changes and client-side navigation behavior

MCP observations are useful for deciding what the crawler or a future parser specification should account for. They are not source data.

## Required Promotion Path

Any useful MCP finding must be converted into one of the following durable project assets:

- an update to `scripts/crawl-ruankaodaren.ts`
- a future parser specification
- a future verification checklist

Examples:

- If MCP reveals that useful XHR data loads only after scrolling, that behavior must be encoded in the crawler script or recorded in a parser/crawler specification.
- If MCP reveals a login-required state, the script must preserve the visible snapshot and metadata signal without trying to log in.
- If MCP reveals a stable DOM landmark, it may inform a future parser spec, but it must not become an implicit assumption stored only in an MCP session.

## Source Snapshot Policy

MCP session output must not be treated as an official source snapshot.

Official source snapshots must be reproducible and stored with:

- `source_url`
- `captured_at`
- `content_hash`

Interactive MCP observations may guide implementation, but they do not satisfy the source preservation policy.

## Non-Goals

This phase does not implement:

- parser logic
- schema validation for parsed content
- Markdown rendering
- generated knowledge documents
- exam-content rewriting

No Phase 3 work is included here.
