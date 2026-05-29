# Phase 4.1 Single Baseline Official Render Check

## 1. Background

Phase 4.0 dry-run passed for `1.3 指令系统CISC和RISC`. Phase 4.1 permits exactly one official baseline Markdown render and must not start batch rendering.

## 2. Objective

Render `1.3 指令系统CISC和RISC` as one official Markdown file.

## 3. Scope

Allowed:
- Read the renderer input contract.
- Read intermediate JSON.
- Read asset manifest metadata.
- Write one `docs/ruankaodaren/baseline` Markdown file.
- Generate an official render trace.

Prohibited:
- Batch rendering.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Content supplementation or invention.
- Rendering multiple knowledge points.

## 4. Input Boundary

Allowed inputs:
- renderer input contract
- intermediate JSON
- asset manifest
- downloaded asset metadata referenced by the asset manifest

Forbidden inputs:
- raw HTML direct read
- raw XHR direct read
- web requests
- OCR
- encrypted XHR decryption
- image table reconstruction
- content invention

## 5. Required Sections

- Core Concept / 核心概念
- Architectural Topology & Visualization / 架构拓扑与可视化
- Deterministic Constraints / 决定论约束
- Ruankao Alignment / 软考考点映射
- Case Study Answer Pattern / 案例分析答题模式
- Paper Usage / 论文可复用方式
- Source Reference / 来源引用

## 6. Asset Policy

Asset references are preserved as links and metadata only. The renderer does not explain image contents, use OCR, or reconstruct image tables.

## 7. Commands

```bash
pnpm build:renderer-input-contract
pnpm validate:renderer-input-contract
pnpm render:single-baseline
pnpm validate:single-baseline-render
pnpm typecheck
pnpm verify
```

## 8. Success Criteria

- Official Markdown is generated.
- Official trace is generated.
- Exactly one official doc exists in `docs/ruankaodaren/baseline`.
- `forbidden_inputs_touched = []`.
- `batch_render = false`.
- No OCR.
- No image table reconstruction.
- No content invention.
- No raw HTML or raw XHR read.
- `typecheck` and `verify` pass.

## 9. Failure Handling

If the contract is invalid:
- Do not render.

If the asset manifest is missing:
- Fail or preserve an asset warning, but do not explain image contents.

If any forbidden input is detected:
- Fail.

Phase 4.2 extends the official renderer from one validated baseline to the three frozen canonical baseline items.
