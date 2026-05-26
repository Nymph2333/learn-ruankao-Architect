# Phase 2 Raw Snapshot Inspection

## Snapshot Summary

Latest inspected snapshot timestamp:

```text
2026-05-26T06-34-58-138Z
```

Inspected files:

| Raw Area | File | Size | Finding |
| --- | --- | ---: | --- |
| HTML | `sources/ruankaodaren/raw/html/2026-05-26T06-34-58-138Z.html` | 530535 bytes | Rendered SPA page captured, but not knowledge article content |
| Screenshot | `sources/ruankaodaren/raw/screenshots/2026-05-26T06-34-58-138Z.png` | 62358 bytes | Visible authenticated page captured |
| Metadata | `sources/ruankaodaren/raw/metadata/2026-05-26T06-34-58-138Z.json` | 3419 bytes | Auth state used; final URL still points to switchAccounts route |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-34-58-138Z-000.json` | 515 bytes | JSON wrapper for tenant info endpoint |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-34-58-138Z-001.json` | 446 bytes | JSON wrapper for repository info endpoint |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-34-58-138Z-002.json` | 774 bytes | JSON wrapper for user info endpoint |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-34-58-138Z-003.json` | 9020 bytes | JSON wrapper for knowledge list endpoint |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-34-58-138Z-004.json` | 433 bytes | JSON wrapper for user log endpoint |

Metadata summary:

| Field | Value |
| --- | --- |
| `source_url` | `https://ruankaodaren.com/exam/#/knowlegde` |
| `captured_at` | `2026-05-26T06:34:58.138Z` |
| `final_url` | `https://ruankaodaren.com/exam/#/switchAccounts/switchAccounts` |
| `page_title` | `软考达人—专业的软考刷题题库，软考历年真题，软考模拟考试，软考考前押题。柴丁科技` |
| `xhr_count` | `5` |
| `login_required_signal` | `false` |
| `auth_state_used` | `true` |
| `auth_state_path` | `.auth/ruankaodaren.storageState.json` |
| `content_hash` | `fd8c17c50770cb2b66d8564118c56995119457bd9c4315c6df1616fd6614d73b` |

Key conclusion: the authenticated storage state is being used, but the SPA still lands on the `switchAccounts` route rather than the target knowledge-base route.

## HTML Findings

The latest HTML file exists and is a full rendered SPA snapshot.

Observed structural signals:

- The HTML contains a Vue root and rendered page shell.
- The HTML contains the knowledge-base navigation label.
- The HTML contains the selected exam category label.
- The HTML does not contain direct `/api/knowledge/list` endpoint text.
- The HTML does not contain obvious article-body markers such as chapter/body labels.
- The HTML does not contain `switchAccounts` as literal text, even though metadata reports the final URL route as `switchAccounts`.

Assessment:

The HTML appears to represent the authenticated exam/category selection page, not the knowledge-base article body. It is not currently a good primary source for Phase 3 parser implementation.

## XHR Findings

Five XHR / Fetch response snapshots were captured. All inspected responses are JSON wrappers with status `200`.

Endpoint-level findings:

| File | Method | Endpoint | Structural Finding |
| --- | --- | --- | --- |
| `2026-05-26T06-34-58-138Z-000.json` | GET | `/api/tenant/info` | Tenant metadata wrapper; no chapter/content fields detected |
| `2026-05-26T06-34-58-138Z-001.json` | POST | `/api/repository_info/list` | Repository endpoint wrapper; no body `data` field detected in the wrapper |
| `2026-05-26T06-34-58-138Z-002.json` | GET | `/api/user_info/info` | User metadata wrapper; no chapter/content fields detected |
| `2026-05-26T06-34-58-138Z-003.json` | GET | `/api/knowledge/list` | Tree-like JSON data detected with `name` and `children` fields |
| `2026-05-26T06-34-58-138Z-004.json` | POST | `/api/user_log` | Logging endpoint wrapper; no chapter/content fields detected |

The `/api/knowledge/list` response is the most important Phase 3 clue. Its body contains an array with nested `children` and repeated `name` fields. The inspected key counts include:

- `name`: 23
- `children`: 23
- `title`: 0
- `content`: 0

Assessment:

XHR contains useful interface-path and tree-structure clues, but the currently captured `knowledge/list` payload does not appear to contain knowledge article body text. It looks more like a navigational or category tree than final knowledge-point content.

## Screenshot Findings

The latest screenshot exists:

```text
sources/ruankaodaren/raw/screenshots/2026-05-26T06-34-58-138Z.png
```

The screenshot shows:

- authenticated site chrome with a visible user identity area
- navigation including the knowledge-base section
- exam/category selection content
- no login form
- no error page
- no visible knowledge article body

Assessment:

The screenshot confirms that login state is active enough to show authenticated navigation and account context. It also confirms that the crawler has not yet reached the actual knowledge-base content page for the target exam.

## Login / Access Findings

Metadata confirms:

- `auth_state_used = true`
- `auth_state_path = ".auth/ruankaodaren.storageState.json"`
- `login_required_signal = false`

This means the crawler successfully loaded the local storage state and the conservative login detector did not see login-required text in the rendered body.

However:

- `final_url` is still `https://ruankaodaren.com/exam/#/switchAccounts/switchAccounts`
- the visible page is still an exam/category selection page

Assessment:

The remaining blocker is not basic login failure. The crawler likely needs a normal post-login navigation step, such as selecting the target exam/category or waiting for route restoration, before the target knowledge-base route can render its content.

## Parser Feasibility

Parser feasibility remains blocked for knowledge-content extraction.

Current evidence:

- HTML is not a reliable knowledge-body source yet.
- Screenshot does not show the target knowledge-base body.
- XHR contains a promising `/api/knowledge/list` endpoint and tree-like fields.
- XHR does not yet show article body fields such as `content`.
- The final route is still `switchAccounts`.

A Phase 3 parser should not be implemented against this snapshot alone.

## Recommended Phase 3 Strategy

Do not enter Phase 3 implementation yet.

Recommended next step remains Phase 2.x crawler refinement, not parser work:

1. Use the authenticated state that already works.
2. Add a normal, user-equivalent navigation path after login state loads.
3. Reach the target exam's knowledge-base page before snapshotting final artifacts.
4. Capture the resulting XHR set and screenshot.
5. Re-run this inspection on that newer snapshot.

Once a snapshot actually reaches the knowledge-base content page, Phase 3 should prioritize XHR JSON if the content-bearing endpoint is visible. The current `/api/knowledge/list` endpoint suggests XHR is likely more promising than HTML, but it is not yet enough because it appears to contain navigation/category structure rather than final knowledge content.

If a future authenticated snapshot still shows only category trees and no content-bearing XHR, the crawler may need additional normal interactions such as selecting a category, clicking a tree node, or triggering lazy-loaded article content before Phase 3 begins.

## Risks and Unknowns

- The authenticated session is active, but route state still lands on `switchAccounts`.
- It is unknown which normal click or route transition is required to reach the target knowledge page.
- The `/api/knowledge/list` endpoint may be only a first-level navigation endpoint.
- Content-bearing endpoints may load only after selecting an exam category or a knowledge tree node.
- HTML currently contains page shell/category content, not verified knowledge article body.
- XHR currently contains structure clues, not verified article body content.
- Starting Phase 3 now would risk building a parser for the wrong page state.

This report does not implement parser logic, renderer logic, or generated knowledge documents. It does not enter Phase 3.
