# Phase 2.8 Knowledge Route Raw Snapshot Inspection

## Snapshot Summary

Latest inspected snapshot timestamp:

```text
2026-05-26T06-51-05-389Z
```

Inspected raw files:

| Raw Area | File | Size | Status |
| --- | --- | ---: | --- |
| Metadata | `sources/ruankaodaren/raw/metadata/2026-05-26T06-51-05-389Z.json` | 2857 bytes | Present |
| HTML | `sources/ruankaodaren/raw/html/2026-05-26T06-51-05-389Z.html` | 554607 bytes | Present |
| Screenshot | `sources/ruankaodaren/raw/screenshots/2026-05-26T06-51-05-389Z.png` | 83573 bytes | Present |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-51-05-389Z-000.json` | 515 bytes | Present |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-51-05-389Z-001.json` | 774 bytes | Present |
| XHR | `sources/ruankaodaren/raw/xhr/2026-05-26T06-51-05-389Z-002.json` | 56953 bytes | Present |

The crawler reached the knowledge route and captured a visible knowledge-directory page. It did not capture a knowledge article/detail page.

## Metadata Findings

| Field | Value |
| --- | --- |
| `source_url` | `https://ruankaodaren.com/exam/#/knowlegde` |
| `captured_at` | `2026-05-26T06:51:05.389Z` |
| `final_url` | `https://ruankaodaren.com/exam/#/knowlegde` |
| `page_title` | `软考达人—专业的软考刷题题库，软考历年真题，软考模拟考试，软考考前押题。柴丁科技` |
| `xhr_count` | `3` |
| `login_required_signal` | `false` |
| `auth_state_used` | `true` |
| `context_selection_attempted` | `false` |
| `context_selection_success` | `false` |
| `context_selection_text` | `null` |
| `post_context_url` | `https://ruankaodaren.com/exam/#/knowlegde` |
| `knowledge_api_seen` | `false` |
| `knowledge_content_signal` | `true` |
| `content_hash` | `3c7597ca537b4e83bb6bcea99aba51e76dab1f9ef8a89239ba63687eab862282` |

Answer: `final_url` is already `#/knowlegde`.

The `knowledge_api_seen = false` value is consistent with the captured XHR URLs: none of them contain `/api/knowledge` or `knowledge`.

## HTML Findings

The HTML is not only an empty SPA shell. It contains rendered DOM for the knowledge-route page.

Observed signals:

- Vue/root application structure is present.
- Rendered visible text is present.
- Knowledge navigation text is present.
- Target exam text is present.
- Chapter-like labels are present; regex inspection found 18 `第N章`-style labels.
- Repeated progress/mastery UI text is present.
- No direct article/detail body was verified.
- No obvious `正文` label was found.
- No login-required text such as `立即登录`, `未登录`, or `请先登录` was found.
- `switchAccounts` was not present in the HTML.

Assessment:

The HTML contains a real knowledge-directory DOM, including chapter directory rows. It does not currently show a selected knowledge point, article body, detailed explanation, or Markdown-like content.

## XHR Findings

Three XHR / Fetch snapshots were captured:

| File | Method | Request URL | Body Shape |
| --- | --- | --- | --- |
| `2026-05-26T06-51-05-389Z-000.json` | GET | `https://ruankaodaren.com/api/tenant/info` | JSON wrapper, `data` is encrypted/string data |
| `2026-05-26T06-51-05-389Z-001.json` | GET | `https://ruankaodaren.com/api/user_info/info` | JSON wrapper, `data` is encrypted/string data |
| `2026-05-26T06-51-05-389Z-002.json` | POST | `https://ruankaodaren.com/api/repository_info/list` | JSON wrapper, large encrypted/string data |

Top-level response wrapper fields observed:

- `msg`
- `code`
- `data`
- `encrypt`
- `timestamp`

All three responses returned status `200`. The response bodies reported `code = 200`, `msg = success`, and `encrypt = 1`.

Field availability inspection:

| Field Type | Finding |
| --- | --- |
| Tree fields: `name`, `children`, `id`, `parentId` | Not directly visible in parsed JSON because `data` is a string |
| Body fields: `title`, `content`, `text`, `markdown`, `html`, `detail` | Not directly visible |
| Exam category fields | Not directly visible as structured fields |
| User status fields | User endpoint exists, but status fields are not directly visible as structured fields |

Assessment:

XHR does not currently expose directly parseable tree or body fields. The large `repository_info/list` response is likely relevant, but its useful payload is stored in an encrypted/string `data` field. Phase 3 should not begin by assuming the current XHR wrapper is directly parseable.

## Screenshot Findings

The screenshot exists and shows the knowledge-route page.

Visual classification:

- Knowledge directory page: yes
- Empty page: no
- Exam selection page: no
- Login page: no
- Error page: no

The page shows the selected exam context and a list of chapter rows with progress/mastery UI. It does not show a specific knowledge article/detail body.

## Knowledge Content Availability

Current snapshot availability:

| Content Type | Available? | Evidence |
| --- | --- | --- |
| Knowledge route | Yes | `final_url = https://ruankaodaren.com/exam/#/knowlegde` |
| Knowledge directory DOM | Yes | HTML and screenshot show chapter-directory rows |
| Chapter titles | Yes | HTML contains repeated chapter-style labels |
| Knowledge point titles | Not confirmed | Current screenshot shows chapter rows, not expanded leaf nodes |
| Article/detail body | No | No verified body/detail text or content fields |
| Direct JSON tree | No | XHR payload `data` is a string with `encrypt = 1` |
| Direct JSON body content | No | No visible `title`, `content`, `text`, `markdown`, `html`, or `detail` fields |

Possible reasons `knowledge_api_seen = false`:

- The app uses API paths such as `/api/repository_info/list` instead of `/api/knowledge`.
- The knowledge-directory request may occur before or outside the current response signal filter.
- The current route loads only the directory page and does not trigger article/detail loading.
- A directory node may need to be clicked before content-bearing APIs fire.
- Some data may be cached in `localStorage` or `sessionStorage`.
- Some data may be embedded in or decoded by the JavaScript bundle.
- The response payload may be encrypted/string-encoded and decoded client-side after receipt.

## Parser Feasibility

Phase 3 should not start from this snapshot yet.

Reasoning:

- The crawler now reaches the correct route.
- The screenshot and HTML prove the directory page is visible.
- The current HTML may be enough to inspect chapter-directory layout, but not enough for knowledge-body reconstruction.
- The XHR wrappers do not expose directly parseable tree/body fields because the useful `data` payload appears as encrypted/string data.
- No selected knowledge point or article body has been captured.

Starting Phase 3 now would risk building a parser for a directory screen rather than the actual knowledge content model.

## Recommended Next Step

Continue with Phase 2 crawler enhancement before Phase 3.

Recommended crawler improvements:

1. Add a normal click step on the first visible chapter row.
2. After expansion, wait for network idle and an additional SPA render delay.
3. If child nodes appear, click the first visible leaf knowledge point.
4. Capture a new raw snapshot after the click sequence.
5. Add metadata diagnostics for:
   - `directory_expansion_attempted`
   - `directory_expansion_success`
   - `knowledge_node_click_attempted`
   - `knowledge_node_click_success`
   - `post_node_click_url`
   - content-bearing XHR URL list
6. Optionally capture non-sensitive `localStorage` / `sessionStorage` key names only, not values, if needed to locate client-side data flow.

The crawler must continue using normal browser interactions only. It must not forge API calls, bypass login, decode private payloads by guesswork, or parse knowledge content in the crawler.

## Risks and Unknowns

- The current directory HTML may not contain all child knowledge points until a chapter is expanded.
- The large `repository_info/list` payload may require client-side decoding that is outside Phase 2.
- Content-bearing requests may be triggered only after clicking a chapter or leaf node.
- Content may be rendered from browser storage or JS bundle state rather than a plainly named XHR endpoint.
- The current `knowledge_content_signal = true` is only a diagnostic text signal; it does not prove that article content is available.
- Phase 3 remains blocked until a raw snapshot contains either a visible knowledge-point detail page or directly inspectable content-bearing data.

This report does not implement parser logic, renderer logic, or generated knowledge documents. It does not enter Phase 3.

Phase 2.9 has been added to collect post-interaction DOM text snapshots.
