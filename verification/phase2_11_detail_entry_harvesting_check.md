# Phase 2.11 Detail Entry Harvesting Check

## Background

Phase 2.9 can expand the knowledge directory and select a visible knowledge-point row. Phase 2.10 confirmed that this still leaves the page in a directory/list state: the selected row is highlighted, but the screenshot and DOM text do not show a complete knowledge-point body.

## Stage Goal

Phase 2.11 attempts one more normal user-equivalent interaction after the row is selected: clicking a visible study, enter, view, detail, start, practice, or mastery-style action control.

The crawler then waits for route, XHR, and DOM updates, scrolls the page and likely content containers, and saves additional raw diagnostic snapshots.

## Prohibited Actions

The crawler must not:

- bypass login
- crack or infer private interfaces
- reverse or decrypt `encrypt = 1` data
- forge API requests
- submit account credentials
- parse knowledge-point body content
- render Markdown
- generate knowledge documents
- enter Phase 3 implementation

Only normal visible-page clicking and scrolling are allowed.

## Container Snapshot

Phase 2.11 saves:

```text
sources/ruankaodaren/raw/containers/<timestamp>.json
```

This records `innerText` from known page and content selectors such as `body`, `main`, `article`, `[role="main"]`, `.content`, `.markdown`, `.detail`, `.knowledge`, `.el-main`, `.ant-layout-content`, `.page-content`, `.v-md-editor-preview`, and `.markdown-body`.

The purpose is to distinguish a list page from a detail/content page without writing a parser.

## Accessibility Snapshot

Phase 2.11 saves:

```text
sources/ruankaodaren/raw/accessibility/<timestamp>.json
```

If a Playwright accessibility snapshot API is not available in the current TypeScript crawler, the file stores a DOM role/text fallback summary and records `accessibility_snapshot_available = false`.

The purpose is to inspect page semantics and actionable controls without depending only on CSS selectors.

## Storage Key Names

Phase 2.11 saves:

```text
sources/ruankaodaren/raw/storage/<timestamp>.json
```

Only `localStorage` and `sessionStorage` key names are saved. Values are intentionally excluded to avoid leaking tokens, private account state, or other sensitive data.

## Before/After Screenshot Comparison

Phase 2.11 saves debug screenshots:

```text
sources/ruankaodaren/raw/screenshots/debug/<timestamp>-before-detail-entry.png
sources/ruankaodaren/raw/screenshots/debug/<timestamp>-after-detail-entry.png
```

These files make it possible to compare the selected-row state with the post-action state before deciding whether a content/detail page was reached.

## Metadata Fields

Phase 2.11 adds:

| Field | Meaning |
| --- | --- |
| `detail_entry_attempted` | Whether the detail-entry harvesting step ran |
| `detail_entry_success` | Whether a visible entry click produced route or body-text growth |
| `detail_entry_text` | The clicked entry text, or `null` |
| `detail_entry_url_before` | URL before detail-entry click |
| `detail_entry_url_after` | URL after detail-entry click and waits |
| `detail_entry_route_changed` | Whether the URL changed |
| `body_text_length_before_detail_entry` | Visible body text length before entry click |
| `body_text_length_after_detail_entry` | Visible body text length after entry click and scrolling |
| `container_text_path` | Path to container text snapshot |
| `accessibility_snapshot_path` | Path to accessibility or fallback snapshot |
| `accessibility_snapshot_available` | Whether true accessibility snapshot API output was available |
| `storage_keys_path` | Path to storage key-name snapshot |
| `before_detail_screenshot_path` | Debug screenshot before entry click |
| `after_detail_screenshot_path` | Debug screenshot after entry click |
| `post_detail_content_signal` | Conservative body/container/accessibility/XHR diagnostic signal |

These fields are diagnostic only.

## Success Criteria

At minimum, a successful Phase 2.11 run should satisfy:

- `auth_state_used = true`
- `knowledge_node_click_success = true`
- `detail_entry_attempted = true`
- `detail_entry_success = true` or `post_detail_content_signal = true`
- `body_text_length_after_detail_entry > body_text_length_before_detail_entry`
- `container_text_path` exists
- `storage_keys_path` exists
- `after_detail_screenshot_path` exists

Even when these are true, Phase 3 must not start automatically. A Phase 2.12 inspection must first confirm whether the new raw snapshot actually contains complete, stable knowledge content.

## Failure Handling

If detail entry does not reach body content:

- keep all raw snapshots
- inspect before/after screenshots
- inspect container text lengths
- inspect storage key names only
- refine Phase 2 interaction strategy
- do not decode encrypted payloads
- do not write parser logic
- do not generate Markdown

Phase 3 remains blocked until a later inspection confirms usable source material.
