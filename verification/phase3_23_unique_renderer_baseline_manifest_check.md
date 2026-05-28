# Phase 3.23 Unique Renderer Baseline Manifest Check

## 1. Background

Phase 3.22 promoted `13.3 软件架构风格` as a `STATIC_LOW_TEXT_VERIFIED` short-card sample.
The renderer readiness audit then produced:

- `eligible_for_phase4_baseline = 5`
- But only **2 unique titles**:
  - `1.3 指令系统CISC和RISC`
  - `13.3 软件架构风格`

The 5 eligible samples include 4 samples of `13.3 软件架构风格` (one acquisition per run), all with identical content.
Counting them separately inflates the baseline count and must not be used as Phase 4 evidence.

Phase 3.21's `buildGate()` already checks `uniqueEligibleTitles.size < 3`, so it would have correctly blocked Phase 4.
However, the raw `eligible_for_phase4_baseline` counter (= 5) was misleading.

Phase 3.23 adds a canonical unique-title baseline manifest to make the deduplication explicit and stable.

Phase 3.24 attempts to promote one additional unique renderer-ready title using discovery-first promotion.

## 2. Objective

Build a **unique-title renderer baseline manifest** (`phase3_23_renderer_baseline_manifest.json`) that:

1. Groups all eligible samples by canonical title.
2. Selects one canonical sample per title using a deterministic priority rule.
3. Lists duplicate samples as excluded references (not deleted).
4. Computes `unique_title_count` and `phase4_input_contract_ready` as authoritative Phase 4 gate inputs.

This manifest is then consumed by `audit:sample-quality` and `report:sample-coverage` to replace the raw eligible count.

## 3. Scope

**Allowed:**
- Reading renderer readiness audit + existing intermediate samples
- Selecting canonical sample per title
- Generating baseline manifest JSON + Markdown summary
- Updating Phase 4 gate logic in quality audit and coverage reporter

**Prohibited:**
- New acquisition / crawling
- Markdown renderer
- OCR
- Decrypting `encrypt=1`
- Automatically restoring image tables
- Full-site batch crawling
- Entering Phase 4 implementation

## 4. Canonical Selection Rules

For each group of eligible samples sharing the same canonical title, one sample is selected
as canonical using the following priority (highest priority first):

1. **Non-quarantined** preferred over quarantined.
   - For `STATIC_LOW_TEXT_VERIFIED` with soft quarantine reasons (`low_text`, `duplicate_actual_content`, `duplicate_same_title`), the least-duplicate reason wins:
     - `low_text` (score 1) > `duplicate_actual_content` (score 2) > `duplicate_same_title` (score 3)
2. **`renderer_ready_with_asset_refs`** preferred over **`renderer_ready_short_card`** for image-bearing titles.
3. **Has asset manifest** preferred (asset manifest present = score 0, absent = score 1).
4. **Latest timestamp** preferred (lexicographic descending).
5. **Highest text_length** as final tiebreaker.

All non-canonical samples for a title are written to `duplicate_sample_paths[]` in the canonical item,
and also appear in `excluded_items[]` with reason `duplicate_same_title`, `duplicate_actual_content`, or `duplicate_of_canonical`.

## 5. Phase 4 Gate Policy

The Phase 4 renderer design gate is **blocked** until:

- `unique_title_count >= 3`
- `phase4_input_contract_ready = true`
- All `baseline_items` have `renderer_policy` defined
- All `MIXED_TEXT_IMAGE` / `IMAGE_ASSET_CARD` items have `preserve_asset_refs = true`
- `constraint_violations_total = 0`

The `audit:sample-quality` script (`audit-ruankaodaren-sample-quality.ts`) reads the baseline manifest first.
If it exists, the manifest's `required_before_phase4` and `unique_title_count` override the legacy Phase 3.21 gate logic.
If the manifest does not exist, it falls back to the Phase 3.21 gate with a console warning.

**Duplicate samples never count toward the baseline.** The baseline count equals `unique_title_count`.

## 6. Commands

```bash
pnpm build:renderer-baseline
pnpm audit:renderer-readiness
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

**Minimum success:**
- `pnpm build:renderer-baseline` runs without error
- `verification/generated/phase3_23_renderer_baseline_manifest.json` generated
- `verification/generated/phase3_23_renderer_baseline_manifest.md` generated
- `baseline_count = unique_title_count`
- `unique_title_count = 2` (current: `1.3 指令系统CISC和RISC` + `13.3 软件架构风格`)
- `phase4_input_contract_ready = false`
- `phase4_renderer_allowed = false` (unchanged)
- `pnpm typecheck` passes
- `pnpm verify` passes

**Ideal success:**
- All duplicate `13.3 软件架构风格` samples appear in `excluded_items` or `duplicate_sample_paths`
- `report:sample-coverage` reports `unique_renderer_baseline_count = 2`
- `report:sample-coverage` reports `phase4_candidate_status = blocked_insufficient_unique_renderer_baseline` (via `blocked_insufficient_renderer_eligible`)

## 8. Failure Handling

- If `phase3_21_renderer_readiness_audit.json` does not exist: `build:renderer-baseline` exits with error code 1.
- If a sample has no eligible items: `baseline_count = 0`, `phase4_input_contract_ready = false`.
- If `phase3_23_renderer_baseline_manifest.json` cannot be read by `audit:sample-quality`: falls back to Phase 3.21 gate with warning.
