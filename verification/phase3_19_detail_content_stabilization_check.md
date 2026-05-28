# Phase 3.19 Detail Content Stabilization Check

## 1. Background

Phase 3.18 confirmed that all 8 probed targets navigated to correct unique `konwledgeInfo?id=...` URLs (live_replay_pass_count = 8, preflight_pass_count = 8). However, `recommended_count = 0` because `.ql-editor` content was captured too early after the route change. Examples:

- `13.3 软件架构风格`: `.ql-editor` only ~61 chars
- `3.6 关系数据库的规范化`: only ~25 chars
- Most targets showed body_text_length_after_detail_entry in the 490–608 chars range

Root cause: The Vue detail component lazily renders content after the SPA route changes. The crawler saved the raw snapshot before `.ql-editor` content stabilized.

## 2. Objective

Add a `waitForStableDetailContent()` polling gate in `scripts/lib/ruankaodaren-dom-explorer.ts` that:
- Polls `.knowInfo.ql-editor`, `.knowInfo`, `.ql-editor`, `.topicDetails`, etc. after detail route change
- Waits until text length, img count, and outer HTML length are stable across 3 consecutive rounds
- Only then saves the raw snapshot (outerHTML, dom-text, probe artifact)

## 3. Scope

Allowed:
- Adding `waitForStableDetailContent()` to `scripts/lib/ruankaodaren-dom-explorer.ts`
- Updating `scripts/crawl-ruankaodaren.ts` to call stabilization after `harvestDetailEntry`
- Updating `scripts/probe-ruankaodaren-content-rich-candidates.ts` to use stabilization status
- Updating `scripts/preflight-ruankaodaren-sample.ts` to output stabilization evidence
- Updating `scripts/run-ruankaodaren-sample-acquisition.ts` to gate on stabilization status
- Creating `scripts/test-ruankaodaren-detail-stabilization.ts` for single-target testing
- Writing `verification/generated/phase3_19_detail_stabilization_*.json/.md`

Forbidden:
- Formal acquisition (writing to `data/intermediate/ruankaodaren/samples/`)
- Intermediate sample generation
- Markdown renderer
- OCR
- Decrypting `encrypt=1`
- Automatically reconstructing image tables
- Full-site batch crawl
- Entering Phase 4

## 4. Stabilization Rules

`waitForStableDetailContent()` polls the page every 1000ms for up to 15000ms, checking these selectors in order:
`.knowInfo.ql-editor`, `.knowInfo`, `.ql-editor`, `.topicDetails`, `.topicDetails .ql-editor`, `.questionInfo`, `.questionContent`

For each selector found, it tracks text_length, img_count, and outer_html_length across rounds.

Status outcomes:

| Status | Condition |
|---|---|
| `stable_rich` | text_length ≥ 120, stable across 3 consecutive rounds |
| `stable_with_assets` | img_count ≥ 1 AND text_length ≥ 40, stable across 3 consecutive rounds |
| `stable_but_low_text` | text_length > 0 but < 120, stable across 3 consecutive rounds |
| `timeout_no_container` | Timeout reached without finding any non-empty selector |
| `timeout_unstable` | Timeout reached; container found but content kept changing |

## 5. Commands

```bash
# Test stabilization for a single target
pnpm test:detail-stabilization -- --target "13.3 软件架构风格"

# Re-run content-rich probe with stabilization gate
pnpm probe:content-rich-candidates

# Apply probe recommendations to config
pnpm apply:probe-recommendations

# Typecheck
pnpm typecheck

# Verify structure
pnpm verify

# Audit semantic alignment
pnpm audit:semantic-alignment

# Audit sample quality
pnpm audit:sample-quality

# Report sample coverage
pnpm report:sample-coverage

# Validate intermediate JSON
pnpm validate:intermediate

# Validate asset manifests
pnpm validate:assets
```

## 6. Success Criteria

Minimum success:
- `test:detail-stabilization` script runs and records stabilization status
- Crawler metadata includes all 8 `detail_content_stabilization_*` fields
- Probe uses `stabilization_status` in recommendation logic
- `stable_but_low_text` and timeout targets are NOT recommended
- `typecheck` and `verify` pass

Ideal success:
- At least one probe target achieves `stable_rich` or `stable_with_assets`
- `recommended_count >= 2`
- Config written with Phase 3.20 recommended targets

## 7. Failure Handling

If `timeout_no_container` or `timeout_unstable`:
- Raw snapshot is still saved (do not discard)
- Metadata records timeout status
- Probe rejects this target: `reject_reason = "detail_content_not_stable"`
- Acquisition skips parse: `reject_reason = "detail_content_not_ready"`
- Do not generate samples

If `stable_but_low_text`:
- Target is not recommended
- `reject_reason = "stable_but_low_text"`
- Do not enter renderer baseline

Phase 3.20 adds detail interaction surface discovery because Phase 3.19 showed content stabilizes but remains low-text.
