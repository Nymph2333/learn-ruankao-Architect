# Phase 5.1 Source Packet Audit

Generated at: 2026-06-02T05:13:44.564Z

## Summary

- source_name: ruankaodaren
- scope: baseline_official_docs
- item_count: 3
- complete_count: 3
- incomplete_count: 0
- overall_source_packet_status: complete
- phase5_2_ai_generation_allowed: false

## Items

### 1.3 指令系统CISC和RISC

- render_as: asset_card
- official_markdown_path: `docs/ruankaodaren/baseline/1.3_指令系统CISC和RISC.md`
- canonical_sample_path: `data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json`
- effective_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-31-42-677Z.json`
- asset_manifest_path: `sources/ruankaodaren/raw/assets/manifests/2026-05-26T09-40-21-903Z.json`
- effective_asset_manifest_path: `sources/ruankaodaren/raw/assets/manifests/2026-06-02T03-31-42-677Z.json`
- asset_requirement: required
- asset_requirement_reason: asset artifacts required because image_refs_count=1; render_as=asset_card; content_shape=MIXED_TEXT_IMAGE; renderer_policy.preserve_asset_refs=true; artifacts present
- image_refs_count: 1
- asset_refs_count: 0
- source_layer_status: complete
- recommended_action: accept_source_packet
- recovery_status: recovered
- taxonomy_suspect: false
- ai_learning_layer_status: not_generated
- availability:
  - official_markdown_exists: true
  - intermediate_json_exists: true
  - asset_manifest_exists: true
  - asset_files_exist: true
  - source_packet_complete: true
- taxonomy_notes:
  - effective intermediate has low extracted text length: 92
  - content_source_classification: MIXED_TEXT_IMAGE
  - canonical_sample_path missing; effective recovered intermediate used: data/intermediate/ruankaodaren/samples/2026-06-02T03-31-42-677Z.json
  - canonical asset_manifest_path missing; effective recovered manifest used: sources/ruankaodaren/raw/assets/manifests/2026-06-02T03-31-42-677Z.json
  - asset_requirement_reason: asset artifacts required because image_refs_count=1; render_as=asset_card; content_shape=MIXED_TEXT_IMAGE; renderer_policy.preserve_asset_refs=true; artifacts present
- missing_artifacts:
  - (none)

### 13.3 软件架构风格

- render_as: short_card
- official_markdown_path: `docs/ruankaodaren/baseline/13.3_软件架构风格.md`
- canonical_sample_path: `data/intermediate/ruankaodaren/samples/2026-05-28T02-54-15-543Z.json`
- effective_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-33-07-412Z.json`
- asset_manifest_path: `sources/ruankaodaren/raw/assets/manifests/2026-05-28T02-54-15-543Z.json`
- effective_asset_manifest_path: `(none)`
- asset_requirement: not_required
- asset_requirement_reason: asset artifacts not required because image_refs_count=0; asset_refs_count=0; render_as=short_card; content_shape=STATIC_LOW_TEXT_VERIFIED; preserve_asset_refs=false; legacy asset_manifest_path present but no image_refs detected
- image_refs_count: 0
- asset_refs_count: 0
- source_layer_status: complete
- recommended_action: manual_review_required
- recovery_status: recovered
- taxonomy_suspect: true
- ai_learning_layer_status: not_generated
- availability:
  - official_markdown_exists: true
  - intermediate_json_exists: true
  - asset_manifest_exists: false
  - asset_files_exist: false
  - source_packet_complete: true
- taxonomy_notes:
  - 13.3 remains taxonomy_suspect until live taxonomy recheck confirms whether it is a parent node or a multi-card sequence.
  - effective intermediate has low extracted text length: 61
  - content_source_classification: HTML_RICH_TEXT
  - canonical_sample_path missing; effective recovered intermediate used: data/intermediate/ruankaodaren/samples/2026-06-02T03-33-07-412Z.json
  - legacy asset_manifest_path present but no image_refs detected; asset manifest not required for completeness
  - asset_requirement_reason: asset artifacts not required because image_refs_count=0; asset_refs_count=0; render_as=short_card; content_shape=STATIC_LOW_TEXT_VERIFIED; preserve_asset_refs=false; legacy asset_manifest_path present but no image_refs detected
- missing_artifacts:
  - (none)

### 9.1 信息安全基础知识

- render_as: concept_card
- official_markdown_path: `docs/ruankaodaren/baseline/9.1_信息安全基础知识.md`
- canonical_sample_path: `data/intermediate/ruankaodaren/samples/2026-05-28T05-25-27-891Z.json`
- effective_intermediate_path: `data/intermediate/ruankaodaren/samples/2026-06-02T03-34-31-932Z.json`
- asset_manifest_path: `(none)`
- effective_asset_manifest_path: `(none)`
- asset_requirement: not_required
- asset_requirement_reason: asset artifacts not required because image_refs_count=0; asset_refs_count=0; render_as=concept_card; content_shape=HTML_RICH_TEXT; preserve_asset_refs=false
- image_refs_count: 0
- asset_refs_count: 0
- source_layer_status: complete
- recommended_action: accept_source_packet
- recovery_status: recovered
- taxonomy_suspect: false
- ai_learning_layer_status: not_generated
- availability:
  - official_markdown_exists: true
  - intermediate_json_exists: true
  - asset_manifest_exists: false
  - asset_files_exist: false
  - source_packet_complete: true
- taxonomy_notes:
  - content_source_classification: HTML_RICH_TEXT
  - canonical_sample_path missing; effective recovered intermediate used: data/intermediate/ruankaodaren/samples/2026-06-02T03-34-31-932Z.json
  - asset_requirement_reason: asset artifacts not required because image_refs_count=0; asset_refs_count=0; render_as=concept_card; content_shape=HTML_RICH_TEXT; preserve_asset_refs=false
- missing_artifacts:
  - (none)

## Constraints

- Official Markdown was not used as the source of truth.
- No OCR was used.
- No encrypt=1 data was decrypted.
- No image table was reconstructed.
- No raw XHR was read directly.
- No AI learning content was generated.
