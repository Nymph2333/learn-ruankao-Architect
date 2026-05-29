# Phase 4.3 Renderer Quality Audit and Human Review Checklist

## 1. Background

Phase 4.2 generated three official baseline Markdown documents. The project must audit those documents before any renderer expansion or broader rendering.

## 2. Objective

Audit the three official docs for structure, boundary compliance, renderer policy expression, readability, and human-review requirements.

## 3. Scope

Allowed:
- Read three official Markdown files.
- Read the render trace.
- Read the renderer input contract.
- Generate a quality audit.
- Generate a human review checklist.

Prohibited:
- Generating new official Markdown.
- Batch rendering.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.

## 4. Audit Dimensions

- structure
- boundary
- asset policy
- short card policy
- concept card policy
- readability
- human review

## 5. Human Review Checklist

The checklist covers:
- content correctness
- asset review
- Ruankao alignment review
- renderer policy review
- release decision

## 6. Commands

```bash
pnpm audit:render-quality
pnpm build:human-review-checklist
pnpm validate:render-quality-audit
pnpm validate:baseline-set-render
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- Quality audit JSON and Markdown are generated.
- Human review checklist JSON and Markdown are generated.
- `audited_doc_count = 3`.
- `boundary_violation_count = 0`.
- No new official docs are generated.
- `validate:render-quality-audit` passes.
- `typecheck` and `verify` pass.

## 8. Failure Handling

If a boundary violation is detected:
- Fail.
- Do not enter Phase 4.4.

If a readability warning is detected:
- Mark `pass_with_warnings`.
- Route to template refinement rather than batch rendering.

Phase 4.4 refines renderer policy blocks after Phase 4.3 found `pass_with_warnings` without boundary violations.
