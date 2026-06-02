# Phase 5.4 AI Learning Prompt Contract

Generated at: 2026-06-02T05:57:17.168Z

## Summary

- contract_version: phase5.4
- source_name: ruankaodaren
- contract_scope: prompt_contract_only
- generation_allowed: false
- item_count: 3
- human_review_overall_status: pending_review
- human_review_auto_approval: false
- phase4_6_expansion_allowed: false

## Source Layer Binding

- must_reference_source_packet: true
- must_preserve_source_text: true
- must_not_modify_source_layer: true
- must_separate_ai_layer: true

## Forbidden Inputs

- raw_html_direct_read
- raw_xhr_direct_read
- web_requests
- ocr
- encrypted_xhr_decryption
- image_table_reconstruction
- source_layer_modification
- unmarked_ai_content

## AI Learning Sections

- AI Explanation / AI解析: allowed=true, ai_label=true, source_reference=true
- Architecture Mapping / 架构师考点映射: allowed=true, ai_label=true, source_reference=true
- Case Study Pattern / 案例答题模式: allowed=true, ai_label=true, source_reference=true
- Paper Usage / 论文表达: allowed=true, ai_label=true, source_reference=true
- Misconceptions / 易错点: allowed=true, ai_label=true, source_reference=true
- Memory Hooks / 记忆钩子: allowed=true, ai_label=true, source_reference=true

## Items

### 1.3 指令系统CISC和RISC

- source_packet_item_status: complete
- render_as: asset_card
- content_shape: MIXED_TEXT_IMAGE
- taxonomy_suspect: false
- ai_generation_allowed_for_item: false
- prompt_template_id: asset-card-ai-learning
- required_warnings:
  - no_ocr
  - no_image_table_reconstruction
  - asset_manual_review_required

### 13.3 软件架构风格

- source_packet_item_status: complete
- render_as: short_card
- content_shape: STATIC_LOW_TEXT_VERIFIED
- taxonomy_suspect: true
- ai_generation_allowed_for_item: false
- prompt_template_id: short-card-ai-learning
- required_warnings:
  - verified_short_text
  - taxonomy_suspect
  - multi_card_sequence_possible
  - do_not_claim_complete

### 9.1 信息安全基础知识

- source_packet_item_status: complete
- render_as: concept_card
- content_shape: HTML_RICH_TEXT
- taxonomy_suspect: false
- ai_generation_allowed_for_item: false
- prompt_template_id: concept-card-ai-learning
- required_warnings:
  - (none)

## Constraints

- This contract does not generate AI learning content.
- This contract does not create dual-layer document instances.
- This contract does not modify official Markdown or Source Layer artifacts.
- Human review remains pending and automatic approval remains disabled.
