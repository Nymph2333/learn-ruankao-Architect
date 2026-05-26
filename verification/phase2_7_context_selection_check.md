# Phase 2.7 Context Selection Check

## Background

The authenticated crawler can use `.auth/ruankaodaren.storageState.json`, and the page no longer appears to be a login page. However, the latest inspected snapshot still ended at:

```text
https://ruankaodaren.com/exam/#/switchAccounts/switchAccounts
```

That page is an exam/category selection context, not the final knowledge-base content page.

## Stage Goal

Phase 2.7 adds a normal user-equivalent context selection step to the crawler.

When the crawler detects a route that looks like account or context selection, it may click visible page elements matching:

- `系统架构设计师`
- `架构设计师`
- `高级`

After a context click, the crawler revisits:

```text
https://ruankaodaren.com/exam/#/knowlegde
```

It then saves the same raw snapshot assets as before.

## Prohibited Actions

The crawler must not:

- bypass login
- crack or infer private interfaces
- forge API requests
- submit account credentials
- parse knowledge-point body content
- render Markdown
- generate `docs/` knowledge documents

Only normal browser navigation and clicking are allowed.

## Metadata Fields

Phase 2.7 adds these metadata fields:

| Field | Meaning |
| --- | --- |
| `context_selection_attempted` | Whether the crawler detected a context-selection route and tried normal selection clicks |
| `context_selection_success` | Whether a normal click plus revisit appeared to move beyond context selection or show knowledge-related content signals |
| `context_selection_text` | The visible text clicked for context selection, or `null` |
| `post_context_url` | The URL after context selection and knowledge-route revisit |
| `knowledge_api_seen` | Whether any captured XHR / Fetch URL contains `/api/knowledge` or `knowledge` |
| `knowledge_content_signal` | Whether page text or captured response body contains conservative knowledge-related signal terms |

These fields are diagnostic. They do not mean that Phase 3 parsing is allowed.

## Success Criteria

A successful Phase 2.7 run should show:

- `auth_state_used = true`
- `context_selection_attempted = true` when the crawler starts from `switchAccounts`
- `context_selection_success = true` after selecting the target context
- `post_context_url` no longer stuck on the selection route, or the visible page contains knowledge-related content signals
- `knowledge_api_seen = true` if the knowledge API is requested
- raw HTML, screenshot, XHR, and metadata are saved under `sources/ruankaodaren/raw/`

## Failure Handling

If context selection fails:

- Keep the raw snapshot.
- Keep metadata diagnostics.
- Do not start parser implementation.
- Use the screenshot, final URL, and XHR list to refine Phase 2 crawler behavior.
- Avoid adding API shortcuts or credential automation.

Phase 3 remains blocked until a raw snapshot actually reaches the target knowledge-base page.
