# Phase 3.18 Content-rich Candidate Probe Check

## 1. Background

Phase 3.17 hardened the parser and fixed text extraction for `8.8 典型信息系统架构模型` (text length 11 → 128, text_blocks 1 → 15). However, `renderer_eligible_count` remains at 1 because the newly acquired samples (3.3, 5.1, 8.8) are quarantined due to `low_text` or `target_body_mismatch`. Parser extraction is no longer the primary blocker.

The root cause is that the existing probe targets render too little text in `.knowInfo.ql-editor`. We need to identify leaves that are content-rich before committing to formal acquisition.

## 2. Objective

This phase probes up to 8 candidate leaf knowledge points from the Phase 3.11 reachable leaf catalog to evaluate their content richness (text length, image count, topic alignment) before entering formal acquisition.

## 3. Scope

Allowed:
- Read `verification/generated/phase3_11_reachable_leaf_catalog.json`
- Enter detail pages for up to 8 candidate leaves
- Read raw `outerHTML`, dom-text, and screenshots from probe crawls
- Extract `.knowInfo.ql-editor` text using cheerio (no rendering)
- Generate probe diagnostic artifacts in `data/intermediate/ruankaodaren/probes/`
- Write `verification/generated/phase3_18_content_rich_probe.json` and `.md`
- Write Phase 3.19 recommended targets to `config/ruankaodaren-sample-targets.yaml`

Forbidden:
- Writing formal intermediate JSON to `data/intermediate/ruankaodaren/samples/`
- Markdown renderer
- OCR
- Decrypting `encrypt=1`
- Automatically reconstructing image tables
- Full-site batch crawl
- Entering Phase 4

## 4. Probe Rules

### Live Replay Gate

Each probe uses `pnpm crawl:ruankaodaren -- --target "<title>" --require-leaf`. A probe passes the live replay gate if a new metadata file appears with `detail_entry_route_changed: true`.

### Preflight Gate

A probe passes the preflight gate if the new metadata has a valid `outer_html_paths` entry containing `knowInfo_ql-editor`.

### Content Richness Classification

- `high`: `knowInfo_text_length >= 200` OR (`image_count >= 1` AND `knowInfo_text_length >= 80`)
- `medium`: `knowInfo_text_length >= 120` OR (`image_count >= 1` AND `knowInfo_text_length >= 40`)
- `low`: `knowInfo_text_length < 80` AND `image_count = 0`

### Alignment Classification

- `matched`: title keywords clearly appear in knowInfo text or image surrounding text
- `likely_matched`: section/title partially matches and no conflicting tokens
- `weak_unknown`: content too short but no conflict
- `mismatched`: content contains conflicting topic tokens from known stale cache signals (`码距`, `纠错`, `检错`)

### Recommendation Policy

`recommended_for_acquisition = true` if:
- `content_richness` is `high` or `medium`
- `alignment_status` is `matched` or `likely_matched`

## 5. Commands

```bash
pnpm probe:content-rich-candidates
pnpm apply:probe-recommendations
pnpm typecheck
pnpm verify
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
```

## 6. Success Criteria

Minimum:
- `probe:content-rich-candidates` is runnable
- `verification/generated/phase3_18_content_rich_probe.md` and `.json` are generated
- Each probe result has `content_richness`, `alignment_status`, `recommended_for_acquisition`
- `apply:probe-recommendations` is runnable
- `pnpm typecheck` and `pnpm verify` pass

Ideal:
- `recommended_count >= 2`
- At least 2 high or medium richness probes

If `recommended_count = 0`:
- Do not enter acquisition
- Report reason
- Review probe artifacts manually

## 7. Failure Handling

If a probe crawl fails:
- Record `live_replay_success: false`, `preflight_pass: false`
- Set `content_richness: "low"`, `recommended_for_acquisition: false`
- Do not parse or generate any sample
- Continue to next candidate

If content is low_text after probing:
- Do not recommend
- Do not enter renderer baseline

## 8. Actual Run Results (Phase 3.18 Execution)

### Shell Argument Bug Found and Fixed

The initial probe script used `spawnSync("pnpm", [..., title, ...], { shell: true })` with an array. With `shell: true`, Node.js joins the array with spaces before passing to the shell, causing a title like `"13.3 软件架构风格"` to be split into two separate args (`"13.3"` and `"软件架构风格"`). The crawler received only `"13.3"` as the target and fell back to auto-discovery.

**Fix applied**: Changed to `spawnSync(fullCommandString, { shell: true })` where the title is embedded as a double-quoted string, matching the pattern used in `run-ruankaodaren-sample-acquisition.ts`. After the fix, the crawler correctly receives the full title (`catalog resolver: 13.3 软件架构风格 (exact_full_title)`).

### Probe Run Summary (Post-Fix)

| Field | Value |
|-------|-------|
| `probed_count` | 8 |
| `live_replay_pass_count` | 8 |
| `preflight_pass_count` | 8 |
| `high_richness_count` | 0 |
| `medium_richness_count` | 2 (10.2 需求工程, 12.2 软件配置管理) |
| `recommended_count` | 0 |

All 8 probes reached the correct `konwledgeInfo?id=...` URLs (each target produced a unique ID), confirming correct navigation. No probe reached the wrong target.

### Root Cause: SPA Rendering Timing

Despite correct navigation, `knowInfo_text_length` remains very low:

- `13.3 软件架构风格`: 61 chars (1 sentence partially rendered)
- `3.6 关系数据库的规范化`: 25 chars
- `10.2 需求工程`: 152 chars (3 sentences partially rendered, medium)
- Others: < 80 chars

The crawler saves `.knowInfo.ql-editor` outerHTML immediately after the route changes to `#/konwledgeInfo?id=...`. The SPA Vue component starts rendering but has not loaded all content blocks by the time the snapshot is taken. `body text length after detail entry` is consistently 490–608 characters across all targets, indicating minimal DOM content.

Inspection of the saved outerHTML confirms partial renders:
- `13.3 软件架构风格`: one sentence about software architecture structure (61 chars)
- `10.2 需求工程`: three sentences about software development lifecycle (152 chars)

The full knowledge point content (expected to be much larger given KP counts: 59 for 13.3, 23 for 10.2) is not present.

### Alignment

All 8 probes show `alignment_status: weak_unknown`. The exact title token (e.g., `"需求工程"`) does not appear verbatim in the partially-rendered content (e.g., 10.2 has `"需求分析"` but not `"需求工程"`). Since `recommended_for_acquisition` requires `matched` or `likely_matched` alignment, all probes are rejected.

### Gate Status

- `renderer_eligible_count` = 1 — unchanged
- `phase4_renderer_allowed` = false — Phase 4 remains blocked
- `apply:probe-recommendations` — output "No recommended targets to add." (correct)

### Recommendation for Phase 3.19

The primary blocker for Phase 3.18 probing was **SPA rendering timing**, not wrong target navigation or parser extraction. Phase 3.19 must address:

1. **Crawler wait enhancement**: after `detail_entry_route_changed`, wait for `.knowInfo .ql-editor` content to stabilize (e.g., poll text length until it stops growing, or wait for minimum threshold like 200 chars), with timeout.
2. **Token matching relaxation**: for alignment check, consider partial/bi-gram matching so that "需求分析" counts as evidence for "需求工程" target.
3. **Do not enter formal acquisition until crawler wait fix is confirmed by probe re-run.**

Phase 3.19 adds detail content stabilization because Phase 3.18 showed the SPA route changed before .ql-editor content stabilized.