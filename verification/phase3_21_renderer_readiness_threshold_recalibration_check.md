# Phase 3.21 Renderer Readiness Threshold Recalibration Check

## 1. Background

Phase 3.20 (detail interaction surface discovery) proved that the knowledge node
`13.3 软件架构风格` is a **genuinely short-text card** (`content_access_pattern = static_low_text`).

Key Phase 3.20 evidence:
- `stabilization.text_length = 61` chars — stable across rounds
- `interaction_candidate_count = 196`; `safe_candidate_count = 2`; both clicked
- `max text delta after clicks = +43` — no hidden rich content revealed
- `alternate_container_max_text_length = 69` — no alternate container is significantly richer
- `recommended_next_action = manual_review_required`

Conclusion: the low text is **not** a timing issue, not a hidden tab/collapse problem,
and not an alternate-container problem. The node itself is a short card.

## 2. Problem

The pre–Phase 3.21 `audit:sample-quality` gate uses hard thresholds:

```
total_text_length < 80  →  not_ready_low_text
text_blocks < 2 or total_text_length < 120  →  not_ready_low_text
```

This logic incorrectly rejects **verified short-text leaf nodes** that:
- are stable according to the stabilization probe,
- have no secondary interaction that reveals richer content,
- have no alternate container with significantly longer text, and
- match the target semantically.

These nodes are real exam content — they are simply short by nature (concept definitions,
key terms, or brief architectural principles). Blocking them from Phase 4 consideration
prevents a valid class of knowledge points from being rendered.

## 3. Objective

Phase 3.21 recalibrates renderer readiness by:

1. Introducing a `ContentShapeV2` taxonomy that distinguishes *verified* short cards from
   genuinely incomplete or unstable content.
2. Introducing a `ReadinessClass` taxonomy that replaces the binary `ready`/`not_ready`
   gate with a graduated classification.
3. Defining rules that allow `STATIC_LOW_TEXT_VERIFIED` nodes (backed by Phase 3.20
   discovery evidence) to be classified as `renderer_ready_short_card` or
   `renderer_ready_manual_review` with `eligible_for_phase4_baseline = true`.
4. Updating `audit:sample-quality` and `report:sample-coverage` to consume the new audit.

**This phase does NOT implement a renderer, generate Markdown, perform OCR, or enter Phase 4.**

## 4. Content Shape Taxonomy

| Shape | Description |
|---|---|
| `SHORT_TEXT_CARD` | Leaf node with short text; may or may not have discovery evidence |
| `HTML_RICH_TEXT` | Leaf node with rich text (≥ 2 text blocks, ≥ 120 chars) |
| `MIXED_TEXT_IMAGE` | Leaf node with both text blocks and image_refs |
| `IMAGE_ASSET_CARD` | Image-dominant node with minimal text |
| `STATIC_LOW_TEXT_VERIFIED` | Low text but Phase 3.20 discovery confirms it is the real content |
| `UNSTABLE_OR_INCOMPLETE` | Content appears incomplete or unstable (text_length = 0, no discovery) |
| `TARGET_MISMATCH` | Title or body does not match the target knowledge node |
| `DIAGNOSTIC_ONLY` | Chapter overview or diagnostic artifact; not a leaf knowledge point |

## 5. Renderer Readiness Classes

| Class | Description |
|---|---|
| `renderer_ready_text` | Rich text leaf; standard concept card rendering allowed |
| `renderer_ready_short_card` | Verified short card; renderer must not inflate/pad content |
| `renderer_ready_with_asset_refs` | Text + asset refs; preserve links, no OCR |
| `renderer_ready_manual_review` | Plausible candidate; human review required before rendering |
| `not_ready_target_mismatch` | Title/body mismatch; quarantine until corrected |
| `not_ready_unstable` | Content not yet stable or confirmed |
| `not_ready_diagnostic` | Chapter-level or debug artifact; not eligible for rendering |
| `not_ready_quarantined` | Quarantined by manifest or constraint violation |

## 6. Rules

**A. Quarantine always wins.**
If a sample is in the quarantine manifest, `readiness_class = not_ready_quarantined`,
`eligible_for_phase4_baseline = false`. No exceptions.

**B. `STATIC_LOW_TEXT_VERIFIED` can be eligible for Phase 4 baseline** if all of:
   - Semantic alignment is `matched` or `likely_matched` (or no semantic audit item present)
   - Phase 3.20 discovery report exists for same title or target
   - `content_access_pattern = static_low_text`
   - No secondary interaction increased text significantly (delta < threshold)
   - No alternate container has significantly longer content
   - Sample is not quarantined

   → `readiness_class = renderer_ready_short_card`, `eligible_for_phase4_baseline = true`

**C. Low text without discovery evidence remains `not_ready`.**
`SHORT_TEXT_CARD` without a matching Phase 3.20 discovery report →
`readiness_class = not_ready_unstable`, `eligible = false`.

**D. Target/body mismatch → quarantine.**
If semantic alignment reports `mismatch`, `readiness_class = not_ready_target_mismatch`,
`eligible = false`.

**E. Image refs → preserve asset refs, no OCR.**
`MIXED_TEXT_IMAGE` with alignment matched →
`readiness_class = renderer_ready_with_asset_refs`, `preserve_asset_refs = true`.

## 7. Commands

```bash
# Run the Phase 3.21 renderer readiness audit (new)
pnpm audit:renderer-readiness

# Run the existing sample quality audit (updated to consume readiness audit)
pnpm audit:sample-quality

# Run the coverage report (updated with readiness distributions)
pnpm report:sample-coverage

# Validate intermediate JSON against schema
pnpm validate:intermediate

# Validate asset manifests
pnpm validate:assets

# TypeScript type-check (no emit)
pnpm typecheck

# Verify repository structure
pnpm verify
```

## 8. Success Criteria

All of the following must be satisfied:

- [ ] `scripts/audit-ruankaodaren-renderer-readiness.ts` exists and passes typecheck
- [ ] `verification/phase3_21_renderer_readiness_threshold_recalibration_check.md` exists
- [ ] `pnpm audit:renderer-readiness` runs and outputs
  `verification/generated/phase3_21_renderer_readiness_audit.json`
- [ ] Audit outputs `content_shape` and `readiness_class` for every sample
- [ ] `STATIC_LOW_TEXT_VERIFIED` rule is explicitly recorded in audit output
- [ ] `audit:sample-quality` reads readiness audit if present and updates Phase 4 gate
- [ ] `report:sample-coverage` includes `renderer_readiness_classes`, `content_shape`,
  `eligible_for_phase4_baseline_count`, and `static_low_text_verified_count`
- [ ] Phase 4 is NOT automatically unlocked unless ≥ 3 eligible baselines exist
- [ ] `pnpm typecheck` passes
- [ ] `pnpm verify` passes

## 9. Constraints

- No OCR was used.
- No `encrypt=1` was decrypted.
- No Markdown knowledge documents were generated.
- No image tables were reconstructed.
- No new samples were acquired.
- No full-site batch crawl was performed.
- Phase 4 implementation was not entered.

Phase 3.22 promotes a discovery-verified static-low-text node into the intermediate sample pool to test short-card renderer readiness.
