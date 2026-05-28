# Phase 3.25 Renderer Input Contract Freeze Check

## 1. Background

Phase 3.24 raised the unique renderer baseline title count to 3. Phase 4 now has planning conditions, but renderer implementation must not start until the input contract is frozen.

## 2. Objective

This phase freezes the renderer input contract so Phase 4 has a single auditable boundary for allowed files, fields, policies, and prohibitions.

## 3. Scope

Allowed:
- Read the renderer baseline manifest.
- Build the renderer input contract.
- Validate the renderer input contract.
- Define Phase 4 allowed inputs and forbidden inputs.

Prohibited:
- Markdown renderer implementation.
- `docs/` knowledge generation.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.

## 4. Allowed Inputs

- renderer baseline manifest
- intermediate JSON
- asset manifest
- downloaded asset files

## 5. Forbidden Inputs

- raw HTML direct read
- raw XHR direct read
- web requests
- OCR
- encrypted XHR decryption
- image table reconstruction
- content invention

## 6. Renderer Policy

- `short_card`: render verified short content without padding or invented explanation.
- `asset_card`: preserve asset references; do not OCR or reconstruct image tables.
- `concept_card`: render validated intermediate text fields only.
- `manual_review_card`: hold or mark items that need human review before rendering.
- `preserve_asset_refs`: asset-bearing cards must retain references to downloaded asset files or manifests.
- `manual_review_required`: asset cards and short cards may require human review before publication.

## 7. Phase 4 Entry Conditions

- Unique baseline title count is at least 3.
- Renderer input contract validates successfully.
- All baseline item constraints are safe.
- All baseline items have renderer policy.

## 8. Commands

```bash
pnpm build:renderer-baseline
pnpm build:renderer-input-contract
pnpm validate:renderer-input-contract
pnpm audit:renderer-readiness
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 9. Success Criteria

- Renderer input contract JSON is generated.
- Renderer input contract Markdown report is generated.
- `validate:renderer-input-contract` passes.
- `baseline_items >= 3`.
- Canonical titles are unique.
- Forbidden inputs are complete.
- `typecheck` and `verify` pass.

## 10. Failure Handling

If the baseline manifest is not ready:
- Do not generate a fake contract.
- Exit with a clear error.
- Do not enter Phase 4.

If a baseline item lacks `renderer_policy`:
- Fail validation.
- Do not infer a policy automatically.

Phase 4.0 adds a renderer scaffold and single-sample dry run that consumes only the frozen renderer input contract.
