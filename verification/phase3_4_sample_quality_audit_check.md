# Phase 3.4 Sample Quality Audit Check

## 1. Background

Phase 3.3 has acquired 3 intermediate samples. Schema validation passes, asset manifests validate, and coverage reports show zero hard-constraint violations.

However, passing schema validation does not prove renderer readiness. The current sample set may include chapter-level samples and target-alignment risks, including cases where a broad hint such as `数据库` or `网络` opens a chapter-level target rather than a leaf knowledge point.

## 2. Objective

This phase determines whether the existing intermediate samples are strong enough to support Markdown renderer design.

The output is a quality audit and renderer readiness gate. It is not a renderer and does not generate learning Markdown.

## 3. Scope

Allowed:

- Audit intermediate JSON.
- Audit asset manifest associations.
- Determine sample shape.
- Determine renderer readiness.
- Generate a readiness gate report.

Prohibited:

- Generate Markdown.
- OCR.
- Decrypt `encrypt=1`.
- Automatically reconstruct image tables.
- Full-site crawling.
- Enter Phase 4.

## 4. Audit Dimensions

- identity
- content volume
- target alignment
- content shape
- asset integrity
- renderer readiness
- overall gate

## 5. Commands

```bash
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 6. Success Criteria

- `audit:sample-quality` is runnable.
- `verification/generated/phase3_4_sample_quality_audit.json` is generated.
- `verification/generated/phase3_4_sample_quality_audit.md` is generated.
- Every sample has a readiness decision.
- The overall gate explicitly sets `phase4_renderer_allowed` to `true` or `false`.
- `pnpm typecheck` passes.
- `pnpm verify` passes.

## 7. Failure Handling

If samples are insufficient:

- Do not fabricate samples.
- Do not enter the renderer.
- Clearly list `required_before_phase4`.

If an asset manifest is missing:

- Mark the risk.
- Do not automatically delete `image_ref`.
- Do not generate a fake manifest.

Phase 3.5 adds leaf-level target acquisition hardening before Phase 4 renderer can be considered.
