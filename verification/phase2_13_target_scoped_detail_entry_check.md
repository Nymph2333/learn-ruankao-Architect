# Phase 2.13 Target-scoped Detail Entry Check

## 1. Background

Phase 2.12 inspection confirmed that the crawler successfully enters the detail route
(`#/konwledgeInfo?id=...`) and content is rendered inside `.knowInfo.ql-editor`. However, the
crawler clicked the wrong item. The target knowledge node was **1.3 指令系统CISC和RISC**, but the
after-screenshot and rendered content showed **1.1 校验码的码距**.

Root cause: `clickDetailEntryCandidate()` performed a global DOM search for "去掌握"-like text and
clicked the first match in DOM order, which corresponded to node 1.1, not 1.3.

## 2. Objective

Replace the global click with a **target-scoped strategy** that locates the "去掌握" button that
belongs specifically to the row/container of the selected knowledge node (`knowledge_node_click_text`).

Three strategies are attempted in order:

1. **target_scoped** — walk DOM ancestors of the element containing `knowledge_node_click_text`
   until a container also containing an action label ("去掌握" etc.) is found; click the action
   element within that container via coordinates.
2. **nearby_sibling** — find the row marked with the CSS selected-state class
   (`.item-choose:not(.item-choose-false)`) and walk its ancestors similarly.
3. **global_fallback** — original behaviour; emits a WARNING in metadata and logs.

## 3. Prohibited Actions

- Do **not** decrypt `encrypt=1` API responses.
- Do **not** forge or spoof API requests.
- Do **not** implement a parser (Phase 3 is still forbidden).
- Do **not** generate Markdown knowledge documents.
- Do **not** modify or rewrite 软考 content.
- Do **not** attempt to reverse-engineer the encryption scheme.

## 4. Implementation Summary

### A. Target-scoped detail entry (`clickDetailEntryScopedOrFallback`)

- Introduced `DetailEntryScopedClickResult` type carrying `strategy`, `scopeFound`,
  `scopeTextLength`, `scopeTextPreview`, `clickIndex`.
- `clickDetailEntryGlobalFallback` replaces the old `clickDetailEntryCandidate` (same logic).
- `clickDetailEntryScopedOrFallback(page, knowledgeNodeClickText)` implements all three strategies
  using `page.evaluate()` for DOM traversal and `page.mouse.click()` for coordinates.
- `harvestDetailEntry` now accepts `knowledgeNodeClickText` and calls the scoped function.

### B. Expanded container selectors

`CONTAINER_SELECTORS` extended from 13 to 22 entries, adding:

```
.knowInfo
.ql-editor
.knowInfo.ql-editor
.topicDetails
.topicDetails .ql-editor
.questionInfo
.questionContent
.rich-text
.html-content
```

### C. `.knowInfo.ql-editor` capture

`collectContainerText` now returns extended records including `exists`, `count`,
`outer_html_length`, and `outer_html_path` for every selector. For selectors with `text_length > 0`
the `outerHTML` is saved to `sources/ruankaodaren/raw/outer-html/`.

### D. outerHTML capture

New directory `sources/ruankaodaren/raw/outer-html/`. Files named
`<timestamp>-<safe-selector>.html`. `saveContainerSnapshot` returns `outerHtmlPaths`.

### E. Request timeline

New directory `sources/ruankaodaren/raw/network/`. File `<timestamp>-timeline.json` contains every
request and response event observed during the crawl session (method, url, status, resource_type,
content_type, timestamp).

### F. Console logs

New directory `sources/ruankaodaren/raw/console/`. File `<timestamp>.json` collects every
`page.on("console")` event with timestamp, type, and text.

### G. Target alignment detection (`detectContentAlignment`)

After entering the detail page the `.knowInfo.ql-editor` innerText (or body text as fallback) is
checked against `knowledge_node_click_text`:

- **matched** — text contains the target node identifier (e.g. "1.3").
- **mismatched** — text contains a different node number and not the target.
- **unknown** — cannot determine.

Result is recorded in metadata but does **not** abort the crawl.

### H. Wait and scroll enhancements

`scrollPageAndContentContainers` now:

1. Waits **10 000 ms** (up from 5 000 ms) after entering the detail page.
2. Scrolls `window` to bottom then back to top.
3. Iterates over extended scroll-selector list (`.knowInfo`, `.ql-editor`, `.topicDetails`,
   `.el-main`, `.ant-layout-content`, `main`, `article`, plus remaining CONTAINER_SELECTORS).
4. Waits an additional **2 000 ms** after the scroll loop.

## 5. Metadata Fields

New fields added to the metadata JSON (Phase 2.13):

| Field | Type | Description |
|---|---|---|
| `phase2_13_target_scoped_detail_entry_enabled` | `true` | Marker that Phase 2.13 logic is active |
| `detail_entry_strategy` | `"target_scoped"\|"nearby_sibling"\|"global_fallback"\|"failed"` | Which strategy succeeded |
| `detail_entry_target_text` | `string\|null` | The `knowledge_node_click_text` passed to the scoped click |
| `detail_entry_scope_found` | `boolean` | Whether a scoped ancestor container was located |
| `detail_entry_scope_text_length` | `number` | Length of the scope container text |
| `detail_entry_scope_text_preview` | `string` | First 200 chars of scope container text |
| `detail_entry_click_index` | `number` | Index of the action element clicked within scope |
| `detail_content_target_alignment` | `"matched"\|"mismatched"\|"unknown"` | Content alignment result |
| `detail_content_detected_title` | `string\|null` | Node identifier found in content |
| `detail_content_text_length` | `number` | Length of alignment-source text |
| `detail_content_text_preview` | `string` | First 200 chars of alignment-source text |
| `outer_html_paths` | `string[]` | Repo-relative paths to saved outerHTML files |
| `network_timeline_path` | `string` | Path to network timeline JSON |
| `network_event_count` | `number` | Total request+response events captured |
| `console_log_path` | `string` | Path to console log JSON |
| `console_error_count` | `number` | Console errors observed |
| `console_warning_count` | `number` | Console warnings observed |

## 6. Success Criteria

All of the following must be satisfied for Phase 2.13 to be considered successful:

- `auth_state_used = true`
- `knowledge_node_click_success = true`
- `detail_entry_success = true`
- `detail_entry_strategy = "target_scoped"` or `"nearby_sibling"` (not `"global_fallback"`)
- `detail_content_text_length > 0`
- `.knowInfo.ql-editor` entry in `containers` snapshot has `text_length > 0`
- `outer_html_paths` is non-empty
- `detail_content_target_alignment = "matched"`

If `detail_content_target_alignment = "mismatched"`, Phase 3 remains **forbidden**.

## 7. Failure Handling

### If still mismatched after Phase 2.13

- Phase 3 remains forbidden.
- Continue fixing the click association.
- Next options: capture DOM ancestry bounding boxes, use URL/ID from the selected row to confirm
  which `去掌握` belongs to the target, or use the id attribute from the knowledge node element.

### If matched but content is incomplete

- Phase 3 remains forbidden.
- Investigate multi-item pagination ("上一题"/"下一题") to harvest all sub-items.
- Increase scroll/wait time further.
- Check for lazy-loaded content behind additional clicks.

### Even if Phase 2.13 fully succeeds

Phase 3 must **not** begin until a separate **Phase 2.14 inspection** has reviewed the new
snapshots and confirmed content quality and stability.
