# Phase 3.20 Detail Interaction Surface Discovery Check

## 1. Background

Phase 3.19 proved that the SPA detail route change timing is not the root problem. After adding `waitForStableDetailContent()`, all 8 probed targets showed `stabilization_status = stable_but_low_text` with `.knowInfo.ql-editor` text lengths of only 53–61 characters. The content DOM stabilizes quickly (~2 seconds), but the stabilized content is very short.

This means the content is genuinely present in the DOM as rendered, but either:
- The full content is hidden behind secondary UI interactions (tabs, collapse panels, expand buttons, "查看解析", "查看答案", etc.)
- The full content lives in a different container than `.ql-editor`
- The page shows only a short summary, with full content requiring further navigation
- The content is truly short for some knowledge categories (static_low_text)

## 2. Objective

Phase 3.20 diagnoses WHY stabilized `.ql-editor` text is low by:

1. Scanning all visible interaction candidates (buttons, links, tabs, collapse, pagination, forms) on the detail page after stabilization
2. Classifying each candidate as `safe`, `medium`, or `unsafe` to click
3. Performing up to 3 non-destructive safe clicks and comparing before/after content state
4. Scanning 29 alternate container selectors for text length and image count
5. Detecting iframes and shadow DOM presence
6. Concluding whether full content access requires secondary interaction, alternate containers, or if the content is genuinely short

## 3. Scope

### Allowed

- Entering a single detail page using existing auth state and live replay
- Scanning all visible interaction candidates on the stable detail page
- Clicking up to 3 candidates classified as `risk = safe`
- Comparing text length delta, image count delta, URL change, and stabilization result after each click
- Scanning alternate containers for text and image presence
- Outputting a discovery report (JSON + Markdown) to `verification/generated/`

### Prohibited

- Formal sample acquisition (no intermediate JSON in `data/intermediate/`)
- Intermediate sample generation
- Markdown renderer or knowledge doc generation
- OCR on screenshots
- Decrypting `encrypt=1` XHR responses
- Reconstructing image-based tables
- Full-site bulk crawling
- Phase 4 entry

## 4. Interaction Safety Policy

### Safe to click (risk = safe)

Text matching any of:
`查看`, `查看详情`, `详情`, `展开`, `展开全部`, `更多`, `解析`, `查看解析`, `答案`, `查看答案`, `知识点`, `下一题`, `下一个`, `继续`, `学习`, `内容`, `全部`

### Must not click (risk = unsafe)

Text matching any of:
`删除`, `重置`, `退出`, `登录`, `切换账号`, `提交`, `保存`, `收藏`, `掌握`, `未掌握`, `已掌握`, `返回`, `首页`

### Everything else

Classified as `risk = medium` — not clicked in this phase.

### Click rules

- Maximum 3 safe candidates clicked per run
- Before each click: record body text length, `.knowInfo.ql-editor` text length, img count, URL, screenshot
- After each click: wait for `networkidle`, call `waitForStableDetailContent`, record post-click snapshot
- Compare: text length delta, img count delta, URL changed, stabilization status
- If URL changed after click: call `page.goBack()` to restore state
- If tab/collapse toggled: do not force restore

## 5. Alternate Container Policy

The following 29 selectors are scanned on the stable detail page. Each reports:
- `exists`: whether any element matches
- `count`: number of matching elements
- `text_length`: innerText length of first match
- `img_count`: number of `<img>` elements within first match
- `visible`: whether the element has non-zero bounding box
- `text_preview`: first 120 characters of innerText

Selectors scanned:

```
body, main, article, [role="main"],
.knowInfo, .ql-editor, .knowInfo.ql-editor,
.topicDetails, .questionInfo, .questionContent,
.analysis, .answer, .explanation, .solution,
.content, .detail, .markdown, .rich-text, .html-content,
.el-main, .ant-layout-content, .page-content,
.card, .panel, .collapse, .tab-pane
```

## 6. Commands

```sh
# Run detail interaction discovery for a specific target
pnpm discover:detail-interactions -- --target "13.3 软件架构风格"

# Run secondary interactions probe (reads phase3_20 reports)
pnpm probe:secondary-interactions

# Type check
pnpm typecheck

# Structure verification
pnpm verify

# Quality audits (existing)
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
```

## 7. Success Criteria

### Minimum

- `discover:detail-interactions` script runs without error
- Discovery report generated in `verification/generated/phase3_20_detail_interaction_discovery_<target>.json` and `.md`
- Interaction candidates are classified (safe / medium / unsafe)
- Safe click count does not exceed 3
- All 29 alternate containers have scan results
- `pnpm typecheck` passes
- `pnpm verify` passes

### Ideal

- A secondary interaction (e.g. "查看解析", "展开") is found and clicking it increases text length significantly (> 100 chars delta)
- An alternate container (e.g. `.analysis`, `.explanation`) has text_length > 200
- `content_access_pattern` becomes `secondary_interaction_required` or `alternate_container_found`
- `recommended_next_action` becomes `probe_secondary_interactions` or `update_container_selectors`

### Acceptable fallback

- If no secondary interaction and no alternate container is found:
  - `content_access_pattern = static_low_text` or `unknown`
  - `recommended_next_action = manual_review_required`
  - Do NOT enter acquisition
  - Consider testing a different knowledge category (one with more text content expected)

## 8. Output Files

```
verification/generated/phase3_20_detail_interaction_discovery_<safe-target>.json
verification/generated/phase3_20_detail_interaction_discovery_<safe-target>.md
```

Where `<safe-target>` = title with `[^A-Za-z0-9\u4e00-\u9fff]+` replaced by `_`, trimmed, max 60 chars.

## 9. Conclusion Classification

```json
{
  "content_access_pattern":
    "static_low_text |
     secondary_interaction_required |
     alternate_container_found |
     image_or_asset_dominant |
     unknown",

  "recommended_next_action":
    "adjust_renderer_baseline_threshold |
     probe_secondary_interactions |
     update_container_selectors |
     asset_policy_required |
     manual_review_required"
}
```

Phase 3.21 recalibrates renderer readiness because Phase 3.20 showed some knowledge nodes are genuinely static low-text cards.
