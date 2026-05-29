# Phase 4.5 Human Review Signoff Package and Controlled Expansion Plan

## 1. Background

After Phase 4.4, the three baseline official Markdown documents pass renderer quality checks with zero boundary violations, but all three still require human review.

## 2. Objective

This phase generates a human review signoff package and a controlled expansion plan. It does not continue rendering.

## 3. Scope

Allowed:
- Read official baseline docs.
- Read quality audit and human review checklist artifacts.
- Generate review status files.
- Generate a controlled expansion plan.

Prohibited:
- Automatically approving documents.
- Adding official Markdown.
- Full knowledge-base batch rendering.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.

## 4. Review Status Policy

- Default status is `pending_review`.
- `auto_approval = false`.
- All `required_checks` default to `false`.
- `phase4_6_expansion_allowed = false`.
- Expansion is allowed only after a human reviewer explicitly updates all required checks and review statuses.

## 5. Controlled Expansion Policy

Phase 4.6 can only be a controlled dry-run expansion to 3-5 additional reachable leaf nodes. It is not full knowledge-base generation.

Every future candidate must:
- Come from a validated reachable-leaf source.
- Enter the renderer baseline manifest.
- Have a renderer policy.
- Pass render dry-run before official rendering.
- Preserve the forbidden-input policy.

## 6. Commands

```bash
pnpm build:human-review-status
pnpm validate:human-review-status
pnpm build:controlled-expansion-plan
pnpm validate:controlled-expansion-plan
pnpm validate:baseline-set-render
pnpm validate:render-quality-audit
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- Human review status JSON and Markdown are generated.
- Every `review_status = pending_review`.
- `auto_approval = false`.
- `phase4_6_expansion_allowed = false`.
- Controlled expansion plan is generated.
- `recommended_next_phase = manual_human_review`.
- Validation scripts pass.
- No new official Markdown is generated.
- `typecheck` and `verify` pass.

## 8. Failure Handling

If any item is automatically accepted:
- Fail.

If expansion is allowed while review is pending:
- Fail.

If the plan allows full knowledge-base batch rendering:
- Fail.
