# Phase 4.4 Renderer Policy Refinement Check

## 1. Background

Phase 4.3 found that all three baseline docs were `pass_with_warnings` without boundary violations.

## 2. Objective

Refine renderer policy and template expression without expanding the render scope.

## 3. Scope

Allowed:
- Modify renderer templates.
- Re-render the same three baseline docs.
- Re-run quality audit.
- Generate a refinement report.

Prohibited:
- Adding a fourth official Markdown file.
- Full knowledge-base batch rendering.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.

## 4. Required Policy Blocks

- Human Review Checklist / 人工复核清单
- Renderer Boundary / 渲染边界

## 5. Renderer Policy Refinement

- `asset_card`: clarify that `asset_ref` is only a reference, image content requires human review, and asset metadata is not knowledge explanation.
- `short_card`: clarify that short content is a verified static low-text pattern and must not be inflated.
- `concept_card`: clarify that output is only conservative organization of intermediate `text_blocks` / `key_terms`.
- `manual_review_card`: clarify that it is a review task card, not a final learning card.

## 6. Commands

```bash
pnpm render:baseline-set
pnpm validate:baseline-set-render
pnpm audit:render-quality
pnpm build:human-review-checklist
pnpm validate:render-quality-audit
pnpm report:renderer-policy-refinement
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- Still only three official Markdown files exist.
- New policy blocks exist.
- `boundary_violation_count = 0`.
- `validate:baseline-set-render` passes.
- `validate:render-quality-audit` passes.
- Refinement report is generated.
- `typecheck` and `verify` pass.

Ideal:
- `pass_count` increases.
- `pass_with_warnings_count` decreases.

## 8. Failure Handling

If any boundary violation appears:
- Fail.
- Do not enter Phase 4.5.

If readability warnings remain:
- Keep `pass_with_warnings`.
- Continue template refinement rather than expanding render scope.
