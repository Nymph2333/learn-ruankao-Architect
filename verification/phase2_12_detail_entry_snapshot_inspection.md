# Phase 2.12 Detail-entry Snapshot Inspection

**Timestamp:** `2026-05-26T07-26-55-362Z`
**Inspection date:** 2026-05-26
**Phase:** 2.12 – Detail-entry raw snapshot inspection

---

## 1. Snapshot Summary

All 16 expected raw artifacts are present for timestamp `2026-05-26T07-26-55-362Z`:

| Artifact | Path | Present |
|---|---|---|
| metadata | `raw/metadata/…Z.json` | ✅ |
| dom-text | `raw/dom-text/…Z.txt` | ✅ |
| html | `raw/html/…Z.html` | ✅ |
| screenshot (final) | `raw/screenshots/…Z.png` | ✅ |
| debug before | `raw/screenshots/debug/…Z-before-detail-entry.png` | ✅ |
| debug after | `raw/screenshots/debug/…Z-after-detail-entry.png` | ✅ |
| containers | `raw/containers/…Z.json` | ✅ |
| accessibility fallback | `raw/accessibility/…Z.json` | ✅ |
| storage keys | `raw/storage/…Z.json` | ✅ |
| xhr-000 | `raw/xhr/…Z-000.json` | ✅ |
| xhr-001 | `raw/xhr/…Z-001.json` | ✅ |
| xhr-002 | `raw/xhr/…Z-002.json` | ✅ |
| xhr-003 | `raw/xhr/…Z-003.json` | ✅ |
| xhr-004 | `raw/xhr/…Z-004.json` | ✅ |
| xhr-005 | `raw/xhr/…Z-005.json` | ✅ |
| xhr-006 | `raw/xhr/…Z-006.json` | ✅ |

No `.gitignore` exclusion detected. All artifacts available for inspection.

**Critical finding (preview):** The detail page IS rendered and the content container is `.knowInfo.ql-editor`. However, the content captured is about `码距` (1.1 校验码), **not** 1.3 指令系统CISC和RISC. The crawler navigated to the correct route (`#/konwledgeInfo?id=1821374468115795969`) but the rendered knowledge item belongs to node 1.1, indicating a click-targeting mismatch. Phase 3 is **not** yet justified.

---

## 2. Metadata Findings

Full metadata field analysis:

| Field | Value | Interpretation |
|---|---|---|
| `final_url` | `https://ruankaodaren.com/exam/#/konwledgeInfo?id=1821374468115795969` | Route changed successfully to detail page. Note spelling: `konwledgeInfo` (not `knowledgeInfo`) |
| `auth_state_used` | `true` | Auth state loaded from `.auth/ruankaodaren.storageState.json` |
| `knowledge_node_click_success` | `true` | Row "1.3 指令系统CISC和RISC" was selected in directory |
| `knowledge_node_click_text` | `"1.3 指令系统CISC和RISC"` | Correct target row was clicked |
| `detail_entry_attempted` | `true` | Crawler attempted to click "去掌握" |
| `detail_entry_success` | `true` | "去掌握" was found and clicked |
| `detail_entry_text` | `"去掌握"` | Button text matched |
| `detail_entry_route_changed` | `true` | URL changed from `#/knowlegde` to `#/konwledgeInfo?id=…` |
| `body_text_length_before_detail_entry` | `687` | Captured after clicking 1.3 row but before clicking "去掌握". Contains directory + "去掌握" button text |
| `body_text_length_after_detail_entry` | `521` | **Shorter than before** — see Section 10 for analysis |
| `post_detail_content_signal` | `true` | Paragraph text `码距` was detected in body (positive signal, but wrong node) |
| `container_text_path` | `sources/ruankaodaren/raw/containers/…Z.json` | Containers snapshot saved |
| `accessibility_snapshot_available` | `false` | Playwright accessibility API not used; fallback saved |
| `accessibility_snapshot_path` | `sources/ruankaodaren/raw/accessibility/…Z.json` | Fallback DOM role/text summary saved |
| `storage_keys_path` | `sources/ruankaodaren/raw/storage/…Z.json` | LocalStorage/SessionStorage key names saved |
| `xhr_count` | `7` | 7 XHR requests captured |

Additional fields present but not in Phase 2.11 summary:
- `source_url`: `#/knowlegde` (the starting URL before navigation — note: final URL is `#/konwledgeInfo`)
- `content_hash`: sha1 of HTML snapshot
- `login_required_signal`: `false` — no login gate detected

---

## 3. DOM Text Findings

Full dom-text content (`521` chars):

```
首页 / 软考题库 / 机考 / 知识库 / APP / 软考达人6012 / 编号：CDZ1183102976
第1章 计算机硬件
1.1 校验码 / 1.2 计算机硬件和指令 / 1.3 指令系统CISC和RISC / …
第2章–第18章 (collapsed)
未掌握 / 已掌握 / 1 / 2 / 3 / 标准 / 大 / 特大

码距：就单个编码A:00而言，其码距为1，因为其只需要改变一位就变成另一个编码。
在两个编码中，从A码到B码转换所需要改变的位数称为码距，如A:00要转换为B:11，
码距为2。一般来说，码距越大，越利于纠错和检错。

上一题 / 下一题 / 1 / 知识卡 / 背诵 / 掌握 / 小程序刷题软件 / 关注"柴丁"获取备考资料
```

Keyword checks:

| Term | Present | Context |
|---|---|---|
| "1.3 指令系统CISC和RISC" | ✅ | Navigation sidebar only, not content |
| CISC | ✅ | Navigation sidebar only |
| RISC | ✅ | Navigation sidebar only |
| 复杂指令集 | ❌ | Not present |
| 精简指令集 | ❌ | Not present |
| 指令系统 | ✅ | Navigation sidebar only |
| 定义性正文 | ❌ | No CISC/RISC definition paragraph |
| 长段落 | ❌ | Only one short sentence about 码距 |
| 表格文字 | ❌ | No table text |
| 码距 content | ✅ | **One paragraph, belongs to 1.1 校验码** |

**Verdict:** dom-text is **NOT** suitable as parser input for 1.3 CISC/RISC. The actual rendered paragraph is about `码距` (a 1.1 校验码 topic), not CISC/RISC. The only CISC/RISC text is in the sidebar navigation. The knowledge content IS present (one paragraph rendered) but is the wrong knowledge node.

---

## 4. HTML Findings

HTML structure summary:

- **SPA type:** Vue 2 with Element UI (`data-v-*` scoped attributes, `.el-button`, `.el-dialog`, `.el-icon-*`)
- **App shell:** `<div id="app">` → `<div class="main-container">` → `<section class="app-main">`
- **Content area:** `<div class="answerBodycen">` → `<div class="jjy-scroll">` → `<div class="topicDetails">`
- **Knowledge content container (critical):**
  ```html
  <div class="knowInfo ql-editor ql-editor3 lgccquestfont1">
    <p>
      <strong>码距：</strong>就单个编码A:00而言，其码距为
      <a class="underline-placeholder">1</a>，…
      <a class="underline-placeholder">改变的位数</a>称为码距，…
      <a class="underline-placeholder">2</a>。…
      <a class="underline-placeholder">纠错和检错</a>。
    </p>
  </div>
  ```
- **Left sidebar:** `.leftLogo` → `.chapterExercises` tree — navigation only
- **Right sidebar:** `.rightLogo` — QR codes only
- **Answer sheet:** `.answerCards` with 3 numbered buttons (1/2/3) and 未掌握/已掌握 legend

Key structural findings:

1. **Content container class:** `.knowInfo` with `.ql-editor` — this is a **Quill rich text editor** render output. This is the stable extraction target.
2. **Fill-in-the-blank format:** Content uses `<a class="underline-placeholder">` elements for fill-in blanks, with the answers already inline in the DOM. This is a **cloze/fill-blank** format, not a prose knowledge article.
3. **No `konwledgeInfo` in DOM text:** The route is `#/konwledgeInfo?id=…` but the HTML itself does not contain this string as a DOM attribute — it's purely a hash route.
4. **No markdown or `.v-md-editor-preview`:** Content is Quill-rendered HTML, not Markdown.
5. **SPA skeleton confirmed:** All JS loaded from `/exam/static/js/`. Content is client-rendered after API response.
6. **Buttons present:** 上一题 (disabled), 下一题, 知识卡, 背诵, 掌握 — these indicate navigation through multiple items per knowledge node.

---

## 5. Container Snapshot Findings

Container selector results:

| Selector | text_length | Notes |
|---|---|---|
| `body` | 521 | Only populated selector; all content mixed with nav |
| `main` | 0 | Not used by this SPA |
| `article` | 0 | Not used |
| `[role="main"]` | 0 | Not used |
| `.content` | 0 | Not used |
| `.markdown` | 0 | Not used |
| `.detail` | 0 | Not used |
| `.knowledge` | 0 | Not used |
| `.el-main` | 0 | Not used |
| `.ant-layout-content` | 0 | Not used (Ant Design not present) |
| `.page-content` | 0 | Not used |
| `.v-md-editor-preview` | 0 | Not used (no Vditor) |
| `.markdown-body` | 0 | Not used |

**Critical gap:** The containers snapshot did **not** include `.knowInfo`, `.ql-editor`, or `.answerBodycen`. These are the actual content containers revealed by HTML inspection. All checked selectors returned 0, making the containers snapshot misleading — it appears no specific container exists when in fact the content is in `.knowInfo.ql-editor`.

**Recommended container selectors for Phase 2.13:**
- `.knowInfo` — primary content container
- `.ql-editor` — Quill render output
- `.knowInfo.ql-editor` — combined
- `.answerBodycen` — outer detail layout
- `.topicDetails` — inner detail area
- `.jjy-scroll` — scrollable content area

---

## 6. Accessibility Findings

`accessibility_snapshot_available: false`

**Reason (from fallback JSON):** "Playwright Page accessibility API is not used by this TypeScript crawler; saved DOM role/text fallback instead."

Fallback DOM role/text summary contains:

| Tag | Role | Text |
|---|---|---|
| `div` | `button` | (empty) |
| `div` × 3 | `dialog` | (empty dialogs, `display:none`) |
| `button` × 3 | — | "1", "2", "3" |
| `a` | — | "1", "改变的位数", "2", "纠错和检错" |
| `button` × 2 | — | "上一题", "下一题" |

**Findings:**
- The `<a>` elements with text "改变的位数" and "纠错和检错" are the inline answers inside `<a class="underline-placeholder">` in the Quill content. These ARE rendered and accessible.
- No structured headings (`h1`–`h6`) detected in the fallback.
- Three dialogs are hidden (`display:none`).
- The fallback confirms fill-in-the-blank answer text is in the DOM.
- No structural hierarchy is useful from this fallback for parser design.

**Verdict:** Accessibility fallback provides minimal structural signal. The fill-in-blank answers are accessible as `<a>` text. No heading structure detected.

---

## 7. Storage Findings

**LocalStorage keys** (values not read per policy):

| Key | Relevance |
|---|---|
| `token` | Auth token — expected |
| `kconfig` | Likely "knowledge config" — could contain display preferences |
| `typeinfoType` | Exam type selection (e.g., "系统架构设计师") |
| `typeinfoId` | Exam type ID |
| `typeinfoName` | Exam type name |
| `userInfo` | User profile — expected |
| `Hm_lvt_…` | Baidu analytics — irrelevant |
| `sys` | System config |
| `fontPc` | Font size preference (matches the 标准/大/特大 UI) |
| `uuid` | Client UUID |

**SessionStorage keys:**
- `Hm_lpvt_…` — Baidu analytics only

**Findings:**
- No `knowledge`, `repository`, `article`, `content`, `detail`, `vuex`, `pinia`, or `cache` keys found.
- `kconfig` **may** contain knowledge configuration including current node/item state — warrants investigation in Phase 2.13.
- `typeinfoType/Id/Name` confirms context selection (系统架构设计师) is stored in localStorage.
- No evidence of knowledge content cached in localStorage.

---

## 8. XHR Findings

All 7 captured XHR requests:

| # | File | URL | Method | Status | Content-Type | Encrypt |
|---|---|---|---|---|---|---|
| 000 | `…-000.json` | `/api/tenant/info` | GET | 200 | application/json | 1 |
| 001 | `…-001.json` | `/api/user_info/info` | GET | 200 | application/json | 1 |
| 002 | `…-002.json` | `/api/repository_info/list` | POST | 200 | application/json | 1 |
| 003 | `…-003.json` | `/api/user_log` | POST | 200 | application/json | `data: null` |
| 004 | `…-004.json` | `/api/tenant/info` | GET | 200 | application/json | 1 |
| 005 | `…-005.json` | `/api/repository_info/list` | POST | 200 | application/json | 1 |
| 006 | `…-006.json` | `/api/repository_item/list` | POST | 200 | application/json | 1 |

**Keyword matches:**
- `repository` — present in 002, 005, 006
- `info` — present in 000, 001, 004
- `list` — present in 002, 005, 006
- `konwledgeInfo` / `knowledgeInfo` — **NOT present** in any XHR URL
- `detail` / `content` / `knowledge` / `article` — **NOT present** as endpoint segments

**Response body analysis:**
- 000, 001, 004: `encrypt=1`, `data` is Base64-like string — opaque
- 002, 005: `POST /api/repository_info/list` — encrypt=1, response ~55KB each — likely the full knowledge tree structure, encrypted
- 006: `POST /api/repository_item/list` — encrypt=1, response ~55KB — likely individual knowledge items (cards), encrypted
- 003: `POST /api/user_log` — `data: null` — activity logging, no content

**Critical finding:** No dedicated XHR for `konwledgeInfo?id=1821374468115795969` was captured. The detail page content is likely rendered from the already-fetched `repository_item/list` response (XHR-006, ~55KB, encrypted). The SPA loads all items in one encrypted batch, then renders the selected item client-side.

**All XHR responses use `encrypt=1`** (except user_log). No unencrypted content is available via XHR. Per project policy, no decryption or reverse engineering is attempted.

---

## 9. Screenshot Findings

### Before detail-entry (`…-before-detail-entry.png`)

- Shows the knowledge directory page (`#/knowlegde`)
- Context: "系统架构设计师" is selected (shown in top-left breadcrumb)
- Full chapter list visible (章1–章18) with mastery progress counters
- Row "1.3 指令系统CISC和RISC" is **highlighted blue** (selected), showing "0/1" progress and a "去掌握" link
- Other rows (1.1, 1.2, 1.6, 1.7) also show "去掌握" links
- **Verdict:** Correct pre-entry state — 1.3 is selected, click target is "去掌握"

### After detail-entry (`…-after-detail-entry.png` and final screenshot)

- Shows the detail page (`#/konwledgeInfo?id=1821374468115795969`)
- Left sidebar now shows simplified chapter tree (no progress counters)
- **Left sidebar highlights: "1.1 校验码"** (blue), NOT "1.3 指令系统CISC和RISC"
- Content area displays:
  ```
  码距：就单个编码A:00而言，其码距为＿，因为其只需要改变一位就变成另一个编码。
  在两个编码中，从A码到B码转换所需要＿＿＿＿ 称为码距，如A:00要转换为B:11，
  码距为＿。一般来说，码距越大，越利于＿＿＿＿。
  ```
- Fill-in-the-blank format with underlines visible for blank positions
- Right toolbar: 知识卡, 背诵, 掌握 buttons; item counter "1"
- Bottom: 上一题 (disabled, item 1 of list), 下一题 (active)
- No loading spinner, no skeleton, no blank — content IS rendered

**Key observations:**
1. **Wrong knowledge node rendered.** Sidebar shows "1.1 校验码" is active, not "1.3 CISC/RISC". The `id=1821374468115795969` corresponds to 1.1's first item, not 1.3's.
2. **Fill-in-the-blank format confirmed.** Content uses blank lines for answers, not prose paragraphs.
3. **Multiple items per node.** "下一题" is active, indicating more items exist under the current node.
4. **No CISC/RISC content visible.** No content about instruction sets is shown.

---

## 10. Content Completeness Assessment

### Q: Is complete knowledge-point body text present?

**No.** The body text belongs to knowledge node 1.1 (码距), not 1.3 (CISC/RISC). Even for 1.1, only item 1 of 3 is captured (selector "1" of "3" visible in before-screenshot showing "0/3"). The full knowledge-point text requires iterating through all items via "下一题".

### Q: Is this only a detail-page shell?

**No.** The content is genuinely rendered — `.knowInfo.ql-editor` contains actual text. It is not a loading placeholder or blank shell.

### Q: Is it only title, buttons, mastery state?

**No.** One knowledge paragraph is rendered. However it is in fill-in-the-blank format, not a prose article.

### Q: Is stable parser input present?

**Partially.** The container `.knowInfo.ql-editor` is a stable selector. The content is Quill-rendered HTML with `<p>`, `<strong>`, and `<a class="underline-placeholder">` elements. However:
- The captured item is the wrong knowledge node (1.1, not 1.3)
- Only item 1 of multiple items is captured
- The format is cloze/fill-blank, not a markdown or prose document

### Q: Why is body_text_length_after (521) < body_text_length_before (687)?

The before-entry body text (687 chars) was captured from the directory page AFTER selecting 1.3 but BEFORE clicking "去掌握". That page included the full directory with "去掌握" button labels in the DOM. The after-entry body text (521 chars) is from the detail page, which shows a smaller left sidebar (no progress counters, no "去掌握" labels) and just one short knowledge paragraph. The reduction is explained by layout change, not by content failure.

**The shorter text does NOT mean the page failed to render content.** The detail page rendered successfully but the rendered paragraph is simply shorter than the full directory listing.

### Summary

| Criterion | Status |
|---|---|
| Detail page routed correctly | ✅ `#/konwledgeInfo?id=…` |
| Content rendered in DOM | ✅ `.knowInfo.ql-editor` present and populated |
| Content is for 1.3 CISC/RISC | ❌ Content is for 1.1 码距 |
| Full items captured for node | ❌ Item 1 of 3 only (for 1.1) |
| Content is prose/markdown | ❌ Fill-in-the-blank Quill format |
| All XHR unencrypted | ❌ All encrypt=1 |
| Container snapshot covers content | ❌ `.knowInfo/.ql-editor` not in containers snapshot |
| Stable parser input available | ❌ Wrong node, incomplete items |

---

## 11. Parser Feasibility

**Phase 3 is NOT recommended. Prohibition continues.**

Evidence for prohibition:

1. **Wrong knowledge node captured.** The crawler clicked "去掌握" on the 1.3 row but the ID `1821374468115795969` resolves to 1.1 content. Phase 3 parser cannot be designed on data from the wrong node.

2. **Incomplete item capture.** Even if the node were correct, only 1 item of a multi-item node was captured. Phase 3 requires all items per node.

3. **Fill-in-the-blank format not validated.** The content format (`<a class="underline-placeholder">` inline answers) is a cloze format, not a prose knowledge document. Parser design must account for reconstructing full sentences from the blanks-inline HTML.

4. **Content container not in containers snapshot.** The `.knowInfo.ql-editor` selector was not tested in the Phase 2.11 crawler. Container coverage is incomplete.

5. **All XHRs encrypted.** No unencrypted API source is available. The parser can only operate on DOM/HTML, not on API responses.

6. **No CISC/RISC content captured at all.** The target knowledge point (1.3) has zero captured content.

---

## 12. Recommended Next Step

### Phase 2.13: Crawler Enhancement

Priority order:

**P0 — Fix navigation target (critical bug):**
The crawler clicked "去掌握" on the 1.3 row but the resulting page shows 1.1 content. Investigate:
- Whether the "去掌握" click is hitting the first visible button in DOM order rather than the one associated with the selected row
- Log the `href`/`onclick` target of the "去掌握" button before clicking
- Add explicit row matching: after clicking 1.3, find the "去掌握" button within the same row container (`chapterExercises-title` → sibling)

**P1 — Capture all items per knowledge node:**
The detail page has "上一题" / "下一题" navigation. After entering a node, iterate all items by clicking "下一题" until disabled, capturing HTML/dom-text at each step.

**P1 — Add `.knowInfo` and `.ql-editor` to container selectors:**
The containers snapshot currently returns all zeros for specific selectors. Add to the container snapshot query list:
- `.knowInfo`
- `.ql-editor`
- `.knowInfo.ql-editor`
- `.answerBodycen`
- `.topicDetails`
- `.jjy-scroll`

**P2 — Capture `outerHTML` of content container:**
After entering the detail page, explicitly extract and save `document.querySelector('.knowInfo.ql-editor').outerHTML` as a dedicated artifact.

**P2 — Wait longer after navigation:**
After clicking "去掌握" and route change, add a minimum 3–5 second wait before capturing. The current snapshot may be capturing immediately after route change.

**P2 — Capture console logs:**
Add `page.on('console', …)` listener and save console output. SPA routing/data-loading errors will appear here.

**P3 — Investigate `kconfig` localStorage key:**
The `kconfig` key may contain the current knowledge configuration (node selection, item index). Reading its structure (not value) could reveal how item IDs are organized.

**P3 — Check for additional XHR after navigation:**
The 7 captured XHRs may not include a detail-specific API call fired after the route change. Add XHR interception window that spans from "去掌握" click to content-rendered state. Look specifically for any call containing `konwledgeInfo`, `item/detail`, or a numeric ID.

**P3 — Detect and handle multiple items:**
After confirming correct node navigation, use the item counter (e.g., "1 / N") to determine total items, then iterate. This is required for complete node coverage.

**P4 — Full-page screenshot:**
Current screenshots are viewport-only. Use `fullPage: true` to ensure no content is cut off below the fold.

---

## 13. Risks and Unknowns

| Risk | Severity | Notes |
|---|---|---|
| Crawler clicks wrong "去掌握" button | **High** | Confirmed: 1.3 selected but 1.1 content rendered. Root cause: DOM order vs. visual selection |
| All API responses encrypted | **High** | `encrypt=1` on all data endpoints. HTML DOM is the only extraction path |
| Knowledge content is fill-in-blank only | **Medium** | May not contain complete knowledge text if the SPA only stores cloze format |
| Multi-item nodes require iteration | **Medium** | "下一题" navigation required; unknown total item count per node |
| `.knowInfo.ql-editor` is Quill output | **Low–Medium** | Quill HTML is parseable; `<a class="underline-placeholder">` answers are inline in DOM. Manageable for parser |
| Session expiry during crawl | **Low** | Auth state present; `token` in localStorage confirmed active |
| SPA lazy-loading race condition | **Low** | Content was rendered within capture window; not a blank skeleton. Longer wait may be unnecessary |
| `repository_item/list` (XHR-006) may contain all node items | **Unknown** | 55KB encrypted response. If decryptable in future, could provide batch access to all items |
| `kconfig` localStorage value structure | **Unknown** | May contain node/item index state. Worth logging key structure |

---

Phase 2.13 has been added to fix global detail-entry misclicks and capture .knowInfo.ql-editor content.
