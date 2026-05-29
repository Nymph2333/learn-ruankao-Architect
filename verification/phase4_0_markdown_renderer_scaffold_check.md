# Phase 4.0 Markdown Renderer Scaffold and Dry Run Check

## 1. Background

Phase 3.25 froze the renderer input contract. Phase 4 can now be planned, but the project must not immediately batch-generate the formal knowledge base.

## 2. Objective

This phase creates the minimum Markdown renderer scaffold and performs a single-sample dry run.

## 3. Scope

Allowed:
- Read the renderer input contract.
- Read intermediate JSON.
- Read asset manifest metadata.
- Generate dry-run Markdown into `verification/generated` or `rendered/ruankaodaren/dry-runs`.
- Generate a render trace.

Prohibited:
- Batch formal rendering.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.
- Writing formal knowledge docs into `docs/`.

## 4. Renderer Policies

- `concept_card`: render validated intermediate text fields only.
- `short_card`: preserve genuine short text; do not inflate or pad.
- `asset_card`: preserve asset references and metadata; do not describe image contents.
- `manual_review_card`: mark uncertain or incomplete content for human review.

## 5. Required Sections

- Core Concept / 核心概念
- Architectural Topology & Visualization / 架构拓扑与可视化
- Deterministic Constraints / 决定论约束
- Ruankao Alignment / 软考考点映射
- Case Study Answer Pattern / 案例分析答题模式
- Paper Usage / 论文可复用方式
- Source Reference / 来源引用

## 6. Commands

```bash
pnpm build:renderer-input-contract
pnpm validate:renderer-input-contract
pnpm render:dry-run
pnpm validate:render-dry-run
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- `render:dry-run` runs.
- `validate:render-dry-run` runs.
- Dry-run Markdown is generated.
- Render trace is generated.
- `forbidden_inputs_touched = []`.
- No OCR.
- No image table reconstruction.
- No raw HTML or raw XHR read.
- No content invention.
- `typecheck` and `verify` pass.

## 8. Failure Handling

If the contract is invalid:
- Do not render.
- Exit with a clear error.

If the sample lacks intermediate JSON:
- Do not fake content.
- Fail.

If the asset manifest is missing:
- Preserve an asset reference warning.
- Do not describe image contents.

Phase 4.1 promotes the validated dry-run asset_card renderer to a single official baseline Markdown render.
