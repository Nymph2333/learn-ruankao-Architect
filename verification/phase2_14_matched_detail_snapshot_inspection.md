# Phase 2.14 Matched Detail Snapshot Inspection

## 1. Snapshot Selection

**Timestamp:** `2026-05-26T09-40-21-903Z`

Selection criteria verified:

| Field | Value | Pass |
|---|---|---|
| `final_url` | `https://ruankaodaren.com/exam/#/konwledgeInfo?id=1821374468119990275` | ✅ contains `konwledgeInfo` |
| `detail_entry_strategy` | `target_scoped` | ✅ |
| `detail_entry_route_changed` | `true` | ✅ |
| `knowledge_node_click_text` | `1.3 指令系统CISC和RISC` | ✅ |
| `detail_content_target_alignment` | `unknown` | ⚠️ see §4 |
| `detail_content_text_length` | `96` | ⚠️ see §4 |

This is the most recent metadata and is confirmed as the Phase 2.13 success sample. All prior metadata entries with the same or newer timestamps have `detail_entry_route_changed = false`.

---

## 2. Metadata Findings

- `auth_state_used` = `true` — authenticated session used
- `detail_entry_attempted` = `true`, `detail_entry_success` = `true`
- `detail_entry_text` = `去掌握` — correct button text clicked
- `detail_entry_url_before` = `#/knowlegde`, `detail_entry_url_after` = `#/konwledgeInfo?id=1821374468119990275`
- `detail_entry_scope_text_preview` = `1.3 指令系统CISC和RISC掌握程度0 / 1去掌握` — scope correctly identified
- `detail_entry_click_index` = `0`
- `knowledge_node_click_attempted` = `false` — Phase 2.13 does NOT click the row before detail entry; it uses a decoy pre-select instead. The field is `false` by design.
- `body_text_length_before_detail_entry` = `687` (list page with chapter expanded), `body_text_length_after_detail_entry` = `507` (detail page: navigation + sparse content)
- `post_detail_content_signal` = `true`
- `accessibility_snapshot_available` = `false` — accessibility API timed out or was unavailable; fallback to DOM snapshot used
- `console_error_count` = `0`, `console_warning_count` = `0`
- `network_event_count` = `36`
- `xhr_count` = `7`
- `outer_html_paths` = 6 files including `knowInfo_ql-editor.html` ✅

---

## 3. Screenshot Findings

### Before detail-entry
- Shows the full knowledge directory list (`#/knowlegde`)
- 18 chapters visible with progress counters (0/N pattern)
- Chapter 1 expanded showing 7 leaf nodes (1.1–1.7)
- "去掌握" buttons visible on 1.1, 1.2, 1.3, 1.6, 1.7 (VIP items 1.4, 1.5 lack buttons)
- Clean list page, no dialogs or overlays

### After detail-entry
- Left navigation: **"1.3 指令系统CISC和RISC" highlighted in blue** ✅
- Top toolbar: 未掌握 / 已掌握 toggle, font size controls (标准/大/特大), right panel (知识卡/背诵/掌握)
- Main content area:
  - **Paragraph 1** (fill-in-blank style): "CISC是复杂指令系统：＿＿，＿＿、＿＿，由＿＿实现。"
  - **Paragraph 2** (fill-in-blank style): "RISC是精简指令系统：＿＿，使用频率接近，主要依靠＿＿(通用寄存器、硬布线逻辑控制)。"
  - **"二者各方面区分如下图："**
  - **CISC vs RISC comparison table** — rendered as a watermarked external JPEG image, with columns: 指令系统类型 / 指令 / 寻址方式 / 实现方式 / 其它, rows for CISC（复杂）and RISC（精简）
- Navigation buttons at bottom: 上一题 / 下一章
- No loading spinners, dialogs, or blank areas

**Table visual form:** External image (JPEG). Watermark "软考达人" is visible in background. Content is readable in screenshot but **not encoded as HTML text or HTML table**.

---

## 4. DOM Text Findings

**dom-text file:** `sources/ruankaodaren/raw/dom-text/2026-05-26T09-40-21-903Z.txt`

Content analysis:

| Check | Present |
|---|---|
| "1.3 指令系统CISC和RISC" | ✅ (in navigation list) |
| CISC | ✅ |
| RISC | ✅ |
| "复杂指令系统" | ✅ |
| "精简指令系统" | ✅ |
| "兼容性强", "指令繁多", "微程序" | ✅ |
| "二者各方面区分如下图：" | ✅ |
| Table cell text (指令, 寻址方式, 实现方式, etc.) | ❌ — absent |
| "数量多", "使用频率差别大", "可变长格式" | ❌ — absent (inside image) |

**Why `detail_content_text_length` = 96:**  
The `.knowInfo.ql-editor` container's `innerText` is exactly 96 characters:
```
CISC是复杂指令系统：兼容性强，指令繁多、长度可变，由微程序实现。

RISC是精简指令系统：指令少，使用频率接近，主要依靠硬件实现(通用寄存器、硬布线逻辑控制)。

二者各方面区分如下图：
```
The CISC/RISC comparison table is encoded entirely as an external image. Its content contributes 0 characters to `innerText`.

**Why `detail_content_target_alignment` = `unknown`:**  
The alignment check looks for `knowledge_node_click_text` ("1.3 指令系统CISC和RISC") inside the `.knowInfo.ql-editor` text. The text of that container does not include the title "1.3 指令系统CISC和RISC" — it begins directly with "CISC是复杂指令系统…". Hence alignment cannot be confirmed automatically. The content is nevertheless correct.

**DOM text assessment:** DOM text is **insufficient as a standalone parser input**. It captures the definition paragraphs but entirely misses the comparison table.

---

## 5. Container Snapshot Findings

**containers file:** `sources/ruankaodaren/raw/containers/2026-05-26T09-40-21-903Z.json`

| Selector | exists | count | text_length | Notes |
|---|---|---|---|---|
| `body` | ✅ | 1 | 507 | Full page including nav; noisy |
| `main` | ❌ | 0 | 0 | No `<main>` element |
| `article` | ❌ | 0 | 0 | No `<article>` element |
| `[role="main"]` | ❌ | 0 | 0 | No ARIA main landmark |
| `.el-main` | ❌ | 0 | 0 | Element UI main not used |
| `.knowInfo` | ✅ | 1 | 96 | Same as `.knowInfo.ql-editor`; correct content; outerHTML saved |
| `.ql-editor` | ✅ | 1 | 96 | Same element |
| `.knowInfo.ql-editor` | ✅ | 1 | 96 | **Best isolated parser target**; outerHTML = 787 bytes |
| `.topicDetails` | ✅ | 1 | 105 | Wrapper including font-size controls + `.knowInfo.ql-editor`; outerHTML = 1391 bytes |
| `.topicDetails .ql-editor` | ✅ | 1 | 96 | Same as `.knowInfo.ql-editor` |
| All others | ❌ | 0 | 0 | Not present |

**Best parser source selector: `.knowInfo.ql-editor`** — cleanest isolation, no UI chrome, outerHTML is 787 bytes, confirmed present and stable.

`.topicDetails` is the next best option if page-level context (font controls, wrapper structure) is needed.

---

## 6. OuterHTML Findings

**File:** `sources/ruankaodaren/raw/outer-html/2026-05-26T09-40-21-903Z-knowInfo_ql-editor.html` (787 bytes)

Full content:
```html
<div data-v-03f718d5="" class="knowInfo ql-editor ql-editor3 lgccquestfont1">
  <p><strong>CISC是复杂指令系统：</strong>
    <a class="underline-placeholder">兼容性强</a>，
    <a class="underline-placeholder">指令繁多</a>、
    <a class="underline-placeholder">长度可变</a>，由
    <a class="underline-placeholder">微程序</a>实现。
  </p>
  <p>RISC是精简指令系统：
    <a class="underline-placeholder">指令少</a>，使用频率接近，主要依靠
    <a class="underline-placeholder">硬件实现</a>(通用寄存器、硬布线逻辑控制)。
  </p>
  <p>二者各方面区分如下图：</p>
  <p>
    <img style="max-width:100%;height:auto;display:block;margin-top:0;margin-bottom:0;"
         src="https://image-t.chaiding.com/ruankao/20240808/d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao">
  </p>
</div>
```

**Structure analysis:**

| Check | Finding |
|---|---|
| HTML table for CISC/RISC comparison | ❌ None |
| Text paragraphs | ✅ 3 paragraphs |
| `<img>` tag | ✅ 1 — the comparison table |
| `canvas` | ❌ None |
| `SVG` | ❌ None |
| base64 data URL | ❌ None |
| External image URL | ✅ `https://image-t.chaiding.com/ruankao/20240808/d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao` |
| Quill classes | ✅ `ql-editor`, `ql-editor3`, `lgccquestfont1` |
| `<strong>` bold | ✅ on "CISC是复杂指令系统：" |
| `<a class="underline-placeholder">` key terms | ✅ 6 elements: 兼容性强, 指令繁多, 长度可变, 微程序, 指令少, 硬件实现 |

**Extractable from outerHTML:**

| Item | Extractable |
|---|---|
| Title (from page nav) | ✅ "1.3 指令系统CISC和RISC" |
| Definition paragraphs | ✅ Full text via `innerText` |
| Key terms (fill-in-blank underline) | ✅ `<a class="underline-placeholder">` elements |
| Comparison table text | ❌ Inside image — not in DOM |
| Image URL (table) | ✅ `src` attribute stable CDN URL |
| Image alt text | ❌ `alt=""` empty |

**Image URL pattern:** `https://image-t.chaiding.com/ruankao/YYYYMMDD/<hash>.jpg-ruankao`  
The `-ruankao` suffix is a CDN image processing variant. The URL is deterministic and stable.

**Table content is image — implications:**
- Cannot directly use a text parser to recover comparison table cells
- Phase 3 **must not** assume full text coverage
- Table content requires: (a) asset download + storage, (b) manual review, or (c) OCR policy (explicitly out of scope)
- The image URL IS extractable and stable → Phase 2.15 asset capture can download the binary

---

## 7. XHR Findings

All 7 XHR requests:

| # | Method | URL | Status | encrypt |
|---|---|---|---|---|
| 000 | GET | `/api/tenant/info` | 200 | N/A (no encrypt field) |
| 001 | GET | `/api/user_info/info` | 200 | N/A |
| 002 | POST | `/api/repository_info/list` | 200 | `1` |
| 003 | GET | `/api/tenant/info` | 200 | N/A |
| 004 | POST | `/api/user_log` | 200 | N/A |
| 005 | POST | `/api/repository_info/list` | 200 | `1` |
| 006 | POST | `/api/repository_item/list` | 200 | `1` |

**Key observations:**
- `repository_item/list` (006) is the most relevant API — it likely returns the knowledge item detail content. Its `data` field is `encrypt=1` with a base64-like ciphertext string.
- `repository_info/list` (002, 005) returns the knowledge tree structure — also `encrypt=1`.
- No direct `/api/konwledgeInfo` or `/api/knowledge_detail` endpoint visible.
- All content APIs use `encrypt=1`. Raw API responses cannot serve as parser input.
- Only DOM-based extraction is viable.

---

## 8. Network Timeline Findings

36 network events captured. Relevant findings:

**XHR requests (page lifecycle):**  
`tenant/info` → `user_info/info` → `repository_info/list` (list page) → `repository_info/list` (detail page) → `repository_item/list` (detail content) → `user_log`

**Image requests (confirmed):**

| URL | Purpose |
|---|---|
| `image-t.chaiding.com/ruankao/20240808/d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao` | **CISC/RISC comparison table** ✅ |
| `image-t.chaiding.com/ruankao/20240929/7fcb8d4d141b4604888b42c9484942eb.png` | Font-size icon (标准/大/特大 UI) |
| `image-t.chaiding.com/ruankao/20240624/5032f8cd592d4355b0f4027b365b542f-1.png` | UI asset |
| `image-t.chaiding.com/ruankao/20240621/d1d1083cd25d403c9489e735333d0069.png` | UI asset |
| `image-t.chaiding.com/ruankaokao/logo_new2.png` | Logo |
| `image-t.chaiding.com/ruankao/avatar/6.png` | User avatar |
| `image-t.chaiding.com/ruankaokao/gh_cc42ecdf296e_344.jpg` | WeChat QR code |

The table image request (`d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao`) is confirmed present in the network timeline, fired during the detail page render. Its URL matches the `<img src>` in the outerHTML exactly.

---

## 9. Console Findings

**Console log file:** `sources/ruankaodaren/raw/console/2026-05-26T09-40-21-903Z.json`

- Content: empty array `[]`
- `console_error_count` = `0`
- `console_warning_count` = `0`
- No resource load failures, no Vue errors, no route errors, no image load failures

The page loaded cleanly with zero console output.

---

## 10. Storage Findings

**localStorage keys** (values not read):

```
token, kconfig, typeinfoType, typeinfoId, typeinfoName, userInfo,
Hm_lvt_0017e2651c17603a18fb86f48a0af507, sys, fontPc, uuid
```

**sessionStorage keys:**
```
Hm_lpvt_0017e2651c17603a18fb86f48a0af507
```

No keys suggest client-side content caching:
- `token` — auth token
- `kconfig` — likely knowledge config (type/ID selection)
- `typeinfoType`, `typeinfoId`, `typeinfoName` — context selection (系统架构设计师)
- `userInfo` — user profile
- `Hm_lvt_*`, `Hm_lpvt_*` — Baidu Analytics tracking
- `sys`, `fontPc`, `uuid` — UI settings and device ID

No `repository`, `knowledge`, `detail`, `cache`, `vuex`, `pinia`, or content-related keys. Content is **not cached in frontend storage** and must be captured from DOM.

---

## 11. Content Source Classification

**Classification: `MIXED_TEXT_IMAGE`**

| Component | Source | Extractable |
|---|---|---|
| Knowledge title | Page navigation DOM | ✅ |
| Definition paragraphs (CISC/RISC) | `.knowInfo.ql-editor` text | ✅ |
| Key terms (fill-in-blank underlines) | `<a class="underline-placeholder">` | ✅ |
| Comparison table text | External JPEG image | ❌ DOM only |
| Comparison table image URL | `<img src>` attribute | ✅ |
| Table image binary | CDN resource | ✅ (requires Phase 2.15 download) |

The text portion (definitions + key terms) is stably encoded as Quill HTML in `.knowInfo.ql-editor`. The CISC/RISC comparison table — the most information-dense part — is an external image with no `alt` text. The site uses a "fill-in-blank" presentation pattern where key terms are wrapped in `<a class="underline-placeholder">` for interactive recall exercises.

---

## 12. Parser Feasibility

**Phase 3 is feasible with explicit scope limitations.**

Evidence supporting Phase 3:
- `.knowInfo.ql-editor` is a stable, isolable container (1 element per page, consistent selector)
- outerHTML is compact (787 bytes) and well-structured Quill HTML
- Text content is parseable HTML: `<p>`, `<strong>`, `<a class="underline-placeholder">`
- Image URL is deterministic and extractable from `<img src>`
- Page structure is stable across crawl runs (same selector, same ID format)
- No ShadowDOM, no canvas, no SVG, no inline base64 assets

**Phase 3 must be limited to:**
1. Extract title from knowledge node identifier (e.g., `knowledge_node_click_text`)
2. Extract text paragraphs from `.knowInfo.ql-editor innerText`
3. Extract key terms from `<a class="underline-placeholder">` elements
4. Extract image URLs from `<img src>` attributes
5. Store image URLs as asset references (no download in Phase 3)
6. Output: intermediate JSON with `title`, `text_paragraphs`, `key_terms`, `image_refs`, `source_outer_html`

**Phase 3 must NOT:**
- Attempt to parse image content as text
- Use OCR
- Auto-reconstruct table structure from image
- Generate Markdown knowledge documents (that is Phase 4+)

**Table content policy:**
- Image `src` = `https://image-t.chaiding.com/ruankao/20240808/d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao`
- Mark as `asset_ref` in intermediate JSON with `type: "comparison_table_image"`
- Actual table cell text is deferred to: Phase 2.15 asset capture → manual review → optional later OCR policy (not in current scope)

---

## 13. Recommended Next Step

**Option A — Proceed to Phase 3 parser design (recommended with caveats)**

Phase 3 scope:
- Design raw-to-intermediate JSON parser
- Input: `.knowInfo.ql-editor` outerHTML
- Output: structured intermediate JSON with title, paragraphs, key_terms, image_refs
- Parser does NOT attempt to recover image table content
- Image URLs stored as `asset_ref` entries for future Phase 2.15 processing

**Option B — Phase 2.15 asset capture (can run in parallel or first)**

Before or alongside Phase 3:
- For each `<img src>` in `.knowInfo.ql-editor`, download the image binary
- Save to `sources/ruankaodaren/raw/assets/<timestamp>-<hash>.jpg`
- Record dimensions, file size, URL, surrounding paragraph context
- Update containers snapshot to include `asset_count` and `asset_paths`
- This enriches Phase 3 intermediate output with downloadable table images

**Recommendation:** Phase 2.15 asset capture first (low risk, expands data completeness), then Phase 3. Or define Phase 3 with an explicit asset_ref field and proceed in parallel.

---

## 14. Risks and Unknowns

| Risk | Severity | Notes |
|---|---|---|
| Table content not parseable as text | **High** | Core CISC/RISC comparison is image-only |
| `alt=""` on all images | **Medium** | No alt text fallback for accessibility or parsing |
| `detail_content_target_alignment` = `unknown` | **Low** | Cosmetic: content is correct, alignment check needs title injection |
| `-ruankao` CDN suffix behavior | **Low** | May be an image processor variant; test direct URL access before Phase 2.15 |
| `knowledge_node_click_attempted = false` in metadata | **Low** | By design (decoy pre-select); but may mislead future readers; consider adding a note |
| Other knowledge nodes may have different structures | **Medium** | Only 1.3 inspected; nodes with no images may have pure text; nodes with multiple images may have different layout |
| VIP-locked nodes (1.4, 1.5) have no `去掌握` button | **Medium** | Crawler cannot enter detail for VIP-locked items; Phase 3 must handle missing items |
| Watermark on table image | **Low** | Does not affect machine parsing; OCR explicitly excluded from scope |
| `body_text_length` decreased from list (687) to detail (507) | **Informational** | Expected: detail page has less nav text; table content is in image not DOM |
