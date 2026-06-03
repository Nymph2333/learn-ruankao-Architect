# Phase 6.0 Controlled Source Expansion Plan

**plan_version**: phase6.0
**source_name**: ruankaodaren
**created_at**: 2026-06-03T06:45:47.644Z
**plan_scope**: controlled_source_expansion_plan_only

## Execution Flags (all false)

- execution_allowed: false
- crawler_allowed: false
- renderer_allowed: false
- recovery_allowed: false
- web_requests_allowed: false
- raw_html_direct_read_allowed: false
- raw_xhr_direct_read_allowed: false
- ocr_allowed: false
- encrypted_xhr_decryption_allowed: false
- image_table_reconstruction_allowed: false
- source_layer_modification_allowed: false
- official_markdown_modification_allowed: false
- ai_learning_generation_allowed: false
- phase6_1_entry_allowed: false

## Current Source Coverage

- coverage_scope: baseline_only
- full_site_captured: false
- baseline_item_count: 3
- baseline_complete_count: 3

### Baseline Items

- **1.3 指令系统CISC和RISC**: source_layer_status=complete, taxonomy_suspect=false, render_as=asset_card
- **13.3 软件架构风格**: source_layer_status=complete, taxonomy_suspect=true, render_as=short_card
- **9.1 信息安全基础知识**: source_layer_status=complete, taxonomy_suspect=false, render_as=concept_card

### Coverage Boundary Notes

- Only 3 items from the ruankaodaren knowledge base have been captured: 1.3, 13.3, 9.1
- The site contains many more knowledge points across multiple exam subjects and chapters
- No section-level or full-site crawl has been executed; coverage is sample-only
- 13.3 remains taxonomy_suspect; its status cannot be resolved without live taxonomy recheck
- Coverage cannot be claimed as representative of any exam chapter or subject area

## Expansion Strategy

- first_batch_goal: Capture 1-3 additional concept_card items from the same exam subject areas (e.g., Chapter 1 or Chapter 9) where taxonomy_suspect=false and detail_entry_test can be verified
- expansion_batch_size: min=1, max=5
- no_full_site_bulk_capture: true
- no_unbounded_crawler: true
- no_renderer_bulk_run: true

### Candidate Groups

#### confirmed_concept_card_items
- priority: high
- item_type_filter: taxonomy_suspect=false AND render_as=concept_card
- prerequisite: detail_entry_test passes for selected item; no taxonomy ambiguity

#### confirmed_asset_card_items_after_manual_image_review
- priority: medium
- item_type_filter: taxonomy_suspect=false AND render_as=asset_card AND image_refs_count>0
- prerequisite: detail_entry_test passes; image download confirmed; asset manifest produced

#### taxonomy_suspect_items_after_recheck
- priority: low
- item_type_filter: taxonomy_suspect=true
- prerequisite: live taxonomy recheck confirms leaf node status; children enumerated or confirmed absent

## 13.3 Taxonomy Policy

- taxonomy_suspect: true
- is_multi_card_sequence_possible: true
- must_recheck_children_before_leaf_modeling: true
- must_not_claim_complete: true
- expansion_blocked_until_recheck: true

### Suggested Recheck Targets

- Navigate to 13.3 in the live site taxonomy tree and enumerate child nodes
- Confirm whether 13.3 is a leaf node or a parent with child knowledge points
- If children exist (e.g., 13.3.1, 13.3.2, …), capture each child as a separate item
- Do not assume the current short_card is the complete content for 13.3
- Re-run detail_entry_test for 13.3 to confirm content shape and text length

## Detail Entry Test Gate

- detail_entry_test_required_before_expansion: true
- rationale: Phase 2.11 confirmed that detail_entry_route_changed=true but body_text_length_after=521 < before=687, indicating the detail page may not have fully rendered. Any new item must pass a detail_entry_test before being accepted into the expansion batch.

## Phase 6.1 Entry Gate

- phase6_1_entry_allowed: false

### Required Before Phase 6.1

- explicit_user_approval of Phase 6.0 expansion plan
- selected_batch_scope defined (which specific items to capture)
- taxonomy_recheck_plan confirmed for 13.3 before expanding chapter 13
- auth_state_confirmed if web access is required
- no_dirty_worktree (git status clean)
- crawler_scope_limited to selected batch items only
- renderer_scope_limited to selected batch items only
- source_artifact_policy_validated for each selected item
- missing_record_policy_validated and understood

## Artifact Commit Policy

### Commit Allowed

- schemas/ruankaodaren-controlled-source-expansion-plan.schema.json
- packages/domain-types/ruankaodaren-controlled-source-expansion-plan.ts
- scripts/build-ruankaodaren-controlled-source-expansion-plan.ts
- scripts/validate-ruankaodaren-controlled-source-expansion-plan.ts
- verification/phase6_0_controlled_source_expansion_plan.md
- verification/generated/phase6_0_controlled_source_expansion_plan.json
- verification/generated/phase6_0_controlled_source_expansion_plan.md
- package.json (script additions only)
- scripts/verify-structure.ts (Phase 6.0 file additions only)

### Commit Forbidden

- Crawled raw snapshots
- Recovered source artifacts
- Intermediate generated artifacts from new items
- Asset images from new items
- Official Markdown rewrite
- AI learning content
- Dry-run content
- .auth files
- node_modules
- pnpm-workspace.yaml
- Any file from stash@{0}
- Approval result instance
