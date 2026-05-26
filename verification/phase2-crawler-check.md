# Phase 2 Crawler Check

This checklist verifies only the raw snapshot crawler for the public Ruankao Daren knowledge-base page.

## Scope

- Phase 2 implements `scripts/crawl-ruankaodaren.ts`.
- The crawler opens `https://ruankaodaren.com/exam/#/knowlegde` with Playwright.
- The crawler saves rendered raw artifacts only.
- The crawler does not parse knowledge content.
- The crawler does not render Markdown.
- The crawler does not generate `docs/` knowledge documents.

## Required Raw Output Directories

- `sources/ruankaodaren/raw/html/`
- `sources/ruankaodaren/raw/xhr/`
- `sources/ruankaodaren/raw/screenshots/`
- `sources/ruankaodaren/raw/metadata/`

## Required Raw Metadata

Every crawl run must preserve:

- `source_url`
- `captured_at`
- `content_hash`

The run metadata must include:

- HTML snapshot path
- screenshot path
- XHR snapshot count
- page title
- final URL
- conservative login-required signal

## No-Login-Bypass Policy

The crawler must only perform normal public-page access.

It must not:

- bypass login
- crack or infer private interfaces
- evade authorization checks
- use credentials
- modify browser state to gain access

If a page appears to require login, the crawler should mark `login_required_signal = true` and still save the visible raw snapshot.

## Non-Goals For This Phase

- No parser.
- No schema validation beyond raw metadata shape.
- No Markdown renderer.
- No generated knowledge-point documents.
- No rewritten or invented exam content.
