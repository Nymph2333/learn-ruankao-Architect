# Phase 4.2 Three-baseline Official Render Check

## 1. Background

Phase 4.1 successfully rendered one official baseline Markdown document. Phase 4.2 only extends official rendering to the three frozen canonical baseline items from the Phase 3.25 renderer input contract.

## 2. Objective

Render three baseline official Markdown files. This is not full knowledge-base batch rendering.

## 3. Scope

Allowed:
- Read the renderer input contract.
- Read intermediate JSON.
- Read asset manifest metadata.
- Write three `docs/ruankaodaren/baseline` Markdown files.
- Generate an aggregate render trace.

Prohibited:
- Full knowledge-base batch rendering.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.
- Rendering knowledge points outside the frozen contract.

## 4. Input Boundary

Allowed inputs:
- renderer input contract
- intermediate JSON
- asset manifest
- downloaded asset metadata referenced by asset manifests

Forbidden inputs:
- raw HTML direct read
- raw XHR direct read
- web requests
- OCR
- encrypted XHR decryption
- image table reconstruction
- content invention

## 5. Controlled Baseline Set

- `1.3 指令系统CISC和RISC`
- `13.3 软件架构风格`
- `9.1 信息安全基础知识`

## 6. Required Sections

- Core Concept / 核心概念
- Architectural Topology & Visualization / 架构拓扑与可视化
- Deterministic Constraints / 决定论约束
- Ruankao Alignment / 软考考点映射
- Case Study Answer Pattern / 案例分析答题模式
- Paper Usage / 论文可复用方式
- Source Reference / 来源引用

## 7. Renderer Policies

- `asset_card`: preserve asset refs and metadata; do not describe image contents.
- `short_card`: preserve genuine short text; do not inflate or pad.
- `concept_card`: render validated intermediate text fields only.
- `manual_review_card`: output a manual-review frame only; do not fill missing content.

## 8. Commands

```bash
pnpm build:renderer-input-contract
pnpm validate:renderer-input-contract
pnpm render:baseline-set
pnpm validate:baseline-set-render
pnpm typecheck
pnpm verify
```

## 9. Success Criteria

- Three official Markdown files are generated.
- No fourth official Markdown exists.
- Aggregate trace is generated.
- `rendered_count = 3`.
- `controlled_baseline_set_render = true`.
- `batch_render = false`.
- `forbidden_inputs_touched = []`.
- No OCR.
- No image table reconstruction.
- No content invention.
- No raw HTML or raw XHR read.
- `typecheck` and `verify` pass.

## 10. Failure Handling

If the contract is invalid:
- Do not render.

If `docs/ruankaodaren/baseline` contains a non-baseline Markdown file:
- Fail validation.

If any forbidden input is detected:
- Fail validation.

Phase 4.3 audits the three official baseline Markdown outputs before any renderer expansion.
