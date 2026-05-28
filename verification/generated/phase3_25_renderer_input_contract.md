# Phase 3.25 Renderer Input Contract

Generated at: 2026-05-28T05:53:11.101Z

## Summary

| Field | Value |
|---|---|
| contract_version | phase3.25 |
| source_name | ruankaodaren |
| phase4_allowed | true |
| baseline_manifest_path | verification/generated/phase3_23_renderer_baseline_manifest.json |
| baseline_items | 3 |

## Allowed Inputs

- renderer_baseline_manifest
- intermediate_json
- asset_manifest
- asset_files

## Forbidden Inputs

- raw_html_direct_read
- raw_xhr_direct_read
- web_requests
- ocr
- encrypted_xhr_decryption
- image_table_reconstruction
- content_invention

## Renderer Policy Distribution

| render_as | Count |
|---|---:|
| asset_card | 1 |
| short_card | 1 |
| concept_card | 1 |

## Baseline Items

### 1.3 指令系统CISC和RISC

- **canonical_sample_path**: `data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json`
- **timestamp**: 2026-05-26T09-40-21-903Z
- **readiness_class**: renderer_ready_with_asset_refs
- **content_shape**: MIXED_TEXT_IMAGE
- **render_as**: asset_card
- **preserve_asset_refs**: true
- **allow_markdown_generation_later**: true
- **manual_review_required**: true
- **asset_manifest_path**: sources/ruankaodaren/raw/assets/manifests/2026-05-26T09-40-21-903Z.json
- **notes**:
  - asset refs must be preserved as links
  - no OCR on image content
  - no image table reconstruction
- **required_renderer_sections**:
  - Core Concept / 核心概念
  - Architectural Topology & Visualization / 架构拓扑与可视化
  - Deterministic Constraints / 决定论约束
  - Ruankao Alignment / 软考考点映射
  - Case Study Answer Pattern / 案例分析答题模式
  - Paper Usage / 论文可复用方式
  - Source Reference / 来源引用

### 13.3 软件架构风格

- **canonical_sample_path**: `data/intermediate/ruankaodaren/samples/2026-05-28T02-54-15-543Z.json`
- **timestamp**: 2026-05-28T02-54-15-543Z
- **readiness_class**: renderer_ready_short_card
- **content_shape**: STATIC_LOW_TEXT_VERIFIED
- **render_as**: short_card
- **preserve_asset_refs**: false
- **allow_markdown_generation_later**: true
- **manual_review_required**: true
- **asset_manifest_path**: sources/ruankaodaren/raw/assets/manifests/2026-05-28T02-54-15-543Z.json
- **notes**:
  - content is genuinely short — do not inflate or pad
  - Phase 3.20 discovery confirmed static_low_text pattern
  - manual human review recommended before publishing
- **required_renderer_sections**:
  - Core Concept / 核心概念
  - Architectural Topology & Visualization / 架构拓扑与可视化
  - Deterministic Constraints / 决定论约束
  - Ruankao Alignment / 软考考点映射
  - Case Study Answer Pattern / 案例分析答题模式
  - Paper Usage / 论文可复用方式
  - Source Reference / 来源引用

### 9.1 信息安全基础知识

- **canonical_sample_path**: `data/intermediate/ruankaodaren/samples/2026-05-28T05-25-27-891Z.json`
- **timestamp**: 2026-05-28T05-25-27-891Z
- **readiness_class**: renderer_ready_text
- **content_shape**: HTML_RICH_TEXT
- **render_as**: concept_card
- **preserve_asset_refs**: false
- **allow_markdown_generation_later**: true
- **manual_review_required**: true
- **asset_manifest_path**: (none)
- **notes**:
  - standard concept card rendering
  - do not rewrite exam content
- **required_renderer_sections**:
  - Core Concept / 核心概念
  - Architectural Topology & Visualization / 架构拓扑与可视化
  - Deterministic Constraints / 决定论约束
  - Ruankao Alignment / 软考考点映射
  - Case Study Answer Pattern / 案例分析答题模式
  - Paper Usage / 论文可复用方式
  - Source Reference / 来源引用

## Asset Policy

- Asset-card items must preserve asset references.
- Image content may be linked as an asset reference only.
- OCR and image-table reconstruction remain forbidden.
- Manual review is required for asset cards.

## Manual Review Policy

- Short-card and asset-card rendering must not inflate, infer, or supplement source content.
- Any later renderer may format validated intermediate fields only.
- Human review remains required where the baseline item marks it.

## Phase 4 Entry Conditions

| Condition | Value |
|---|---|
| unique_baseline_titles_min | 3 |
| unique_baseline_titles_actual | 3 |
| renderer_baseline_manifest_ready | true |
| all_items_have_renderer_policy | true |
| all_constraints_safe | true |

## Explicit Prohibitions

- No raw HTML direct read by the Phase 4 renderer.
- No raw XHR direct read by the Phase 4 renderer.
- No web requests by the Phase 4 renderer.
- No OCR.
- No encrypted XHR decryption.
- No image table reconstruction.
- No content invention.
- This phase does not generate Markdown knowledge documents.
- This phase does not enter Phase 4 implementation.
