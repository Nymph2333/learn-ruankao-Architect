# Phase 3.3 Controlled Multi-sample Acquisition Check

## 1. Background

Phase 3.2 infrastructure is complete: the crawler accepts a `--target` hint, the parser can read the latest successful snapshot, intermediate validation exists, asset capture exists, and coverage reporting exists.

Current empirical coverage is still too narrow. The repository has only one confirmed sample, `1.3 指令系统CISC和RISC`, classified as `MIXED_TEXT_IMAGE`. One sample cannot prove the parser contract generalizes across other knowledge-point shapes.

## 2. Objective

This phase performs controlled acquisition of 3-5 samples to validate the parser contract against more than one knowledge point form.

The goal is empirical contract validation, not full-site crawling and not generation of learning Markdown.

## 3. Scope

Allowed:

- Read the sample target configuration.
- Run crawl / parse / validate / asset capture / coverage against pending targets.
- Generate an acquisition run report under `verification/generated/`.

Prohibited:

- Full-site crawling.
- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatic image-table reconstruction.
- Rewriting exam content.
- Entering Phase 4.

## 4. Target Policy

- At most 3 new pending targets may be attempted in one run.
- A target may be a broad `title_hint`, such as `数据库`, `网络`, or `架构`.
- Every run must record the actual `knowledge_node_click_text` hit by the crawler.
- Failed targets must not produce fake intermediate JSON, fake asset manifests, or invented sample metadata.

## 5. Commands

```bash
pnpm run:sample-acquisition
pnpm validate:intermediate
pnpm validate:assets
pnpm report:sample-coverage
pnpm typecheck
pnpm verify
```

## 6. Success Criteria

Minimum:

- `run:sample-acquisition` is runnable.
- At least 1 new sample is captured successfully, or the run report clearly explains why all pending targets failed.
- The existing CISC/RISC sample still passes `validate:intermediate`.
- Asset manifests still pass `validate:assets`.
- A coverage report is generated.
- Coverage report total sample count is at least 1.
- `pnpm typecheck` passes.
- `pnpm verify` passes.

Ideal:

- Total sample count is at least 3.
- At least 2 classification types are represented.
- Constraint violations = 0.

## 7. Failure Handling

If a target cannot be found:

- Record `target_not_found` or the crawler failure reason.
- Do not generate fake sample data.

If a click opens the wrong detail page:

- Record `target_mismatch`.
- Do not treat it as the intended sample unless the actual title is explicitly recorded and reviewed as the actual sample.

If image asset download fails:

- Record `asset_capture_failed`.
- Do not OCR.
- Do not reconstruct image tables.
