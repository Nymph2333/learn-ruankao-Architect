# Phase 3.6 Content-ready Leaf Acquisition Check

## 1. Background

Phase 3.5 solved leaf-level enforcement, but the newly acquired `3.1 数据库系统常识` sample was judged `not_ready_low_text`.

Leaf-level shape alone is therefore insufficient. A renderer baseline needs leaf samples with enough text, rich HTML, or asset references to exercise renderer policy without generating Markdown in this phase.

## 2. Objective

This phase selects and acquires content-ready leaf samples. The goal is to validate whether controlled leaf samples can support a future Markdown renderer baseline.

It is not a Markdown renderer, not a full-site crawl, and not knowledge document generation.

## 3. Scope

Allowed:

- Select targets from the Phase 3.5 leaf candidate report.
- Acquire at most 3 controlled leaf samples.
- Run parse, intermediate validation, asset capture, asset validation, coverage, and audit.
- Generate a candidate selection report.

Prohibited:

- Full-site crawling.
- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatic image-table reconstruction.
- Rewriting exam content.
- Entering Phase 4.

## 4. Content-ready Rules

- `ready`: leaf sample with at least 2 text blocks and total text length at least 120, or HTML rich text with total text length at least 100.
- `ready_with_asset_refs`: leaf sample with at least 1 image reference and at least 1 text block; renderer must preserve asset references and must not OCR or reconstruct image tables.
- `not_ready_low_text`: leaf sample with too little text and no image references.
- `diagnostic_sample`: a captured sample that is useful for crawler/parser diagnostics but does not count as a renderer baseline.

## 5. Commands

```bash
pnpm select:content-ready-candidates
pnpm run:sample-acquisition
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 6. Success Criteria

- `select:content-ready-candidates` is runnable.
- `verification/generated/phase3_6_content_ready_candidate_selection.md` is generated.
- `verification/generated/phase3_6_content_ready_candidate_selection.json` is generated.
- `run:sample-acquisition` does not count low-text leaf samples as content-ready success.
- `audit:sample-quality` blocks Phase 4 unless `ready + ready_with_asset_refs >= 3`.
- `pnpm typecheck` passes.
- `pnpm verify` passes.

Ideal state:

- `ready + ready_with_asset_refs >= 3`.
- `phase4_renderer_allowed = true`.

If candidates are insufficient:

- `phase4_renderer_allowed` remains `false`.
- `required_before_phase4` clearly lists what is still missing.

## 7. Failure Handling

If candidate acquisition fails:

- Record the failure.
- Do not generate fake samples.
- Do not enter the renderer.

If a captured leaf sample is low text:

- Preserve it as a diagnostic sample.
- Do not count it as a renderer baseline.

Phase 3.7 adds semantic alignment audit and quarantine because Phase 3.6 found schema-valid but body-mismatched samples.
