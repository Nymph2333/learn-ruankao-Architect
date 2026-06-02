# Phase 5.6 AI Learning Dry-run Request Manifest

## 1. Background

Phase 5.5 defined the AI Learning Dry-run request and review gate contract. Phase 5.6 defines a request manifest only. It records item eligibility, request blockers, review prerequisites, output isolation, and artifact commit policy.

Phase 5.6 is not a content generation phase.

## 2. Objective

Establish a manifest that answers:

- Which baseline items may request a future dry-run.
- Why an item is eligible or ineligible.
- Which review prerequisites must exist before any future request.
- Where future dry-run outputs must be isolated.
- Which artifacts can be committed.
- How taxonomy-suspect items are restricted.
- Why Phase 5.7 remains blocked.

## 3. Scope

Allowed:

- Read `source-packets/ruankaodaren/baseline/source-packet.json`.
- Read Phase 5.4 AI Learning prompt contract.
- Read Phase 5.5 dry-run contract.
- Generate request manifest JSON / Markdown artifacts.
- Validate manifest invariants.

Forbidden:

- AI learning content generation.
- AI dry-run content generation.
- Formal dual-layer document instance generation.
- Official Markdown rewrite.
- Source Layer modification.
- Writing into `source_content`.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Renderer, crawler, or recovery execution.
- Phase 4.6 entry.
- Automatic human review signoff.

## 4. Manifest Policy

- `manifest_version = phase5.6`
- `source_name = ruankaodaren`
- `manifest_scope = dry_run_request_manifest_only`
- `generation_allowed = false`
- `dry_run_generation_allowed = false`
- `formal_ai_learning_generation_allowed = false`
- `review_gate_required = true`
- `auto_approval = false`
- `source_layer_modification_allowed = false`
- `official_markdown_modification_allowed = false`
- `phase5_7_entry_allowed = false`

## 5. Item Eligibility Policy

`1.3 指令系统CISC和RISC`:

- `render_as = asset_card`
- `request_status = not_requested`
- `eligible_for_request = false`
- `dry_run_generation_allowed = false`
- `formal_generation_allowed = false`
- `requires_manual_asset_review = true`
- `requires_manual_review = true`
- `no_ocr = true`
- `no_image_table_reconstruction = true`
- `cannot_claim_image_content_recognized = true`
- Eligibility blockers: `asset_manual_review_required`, `image_content_not_human_verified`

`13.3 软件架构风格`:

- `render_as = short_card`
- `taxonomy_suspect = true`
- `is_multi_card_sequence = true`
- `request_status = not_requested`
- `eligible_for_request = false`
- `dry_run_generation_allowed = false`
- `formal_generation_allowed = false`
- `taxonomy_suspect_handling = restrict_request`
- `multi_card_sequence_handling = do_not_claim_complete`
- `parent_node_handling = do_not_generate_as_leaf`
- Required warnings: `verified_short_text`, `taxonomy_suspect`, `multi_card_sequence_possible`, `do_not_claim_complete`
- Eligibility blockers: `taxonomy_suspect`, `multi_card_sequence_possible`, `parent_node_not_safe_as_leaf`

`9.1 信息安全基础知识`:

- `render_as = concept_card`
- `request_status = not_requested`
- `eligible_for_request = true`
- `dry_run_generation_allowed = false`
- `formal_generation_allowed = false`
- `may_request_future_dry_run_after_review = true`
- `requires_manual_review = true`
- Required prerequisites: `human_review_request`, `isolated_output_path`, `source_packet_reference`, `prompt_contract_reference`, `dry_run_contract_reference`

Eligibility does not permit content generation. It only means a future dry-run request can be created after review prerequisites are satisfied.

## 6. Review Prerequisite Policy

Required prerequisites:

- `source_packet_complete`
- `prompt_contract_validated`
- `dry_run_contract_validated`
- `item_eligibility_checked`
- `output_path_isolated`
- `human_review_request_created`
- `no_source_layer_modification`
- `no_official_markdown_modification`

Blocking conditions:

- `source_packet_incomplete`
- `taxonomy_suspect_without_restriction`
- `asset_without_manual_review`
- `output_path_points_to_source_layer`
- `output_path_points_to_official_markdown`
- `generation_allowed_true`
- `auto_approval_true`

## 7. Output Isolation Policy

Allowed output paths:

- `verification/dry-run/ruankaodaren/`
- `drafts/ai-learning/ruankaodaren/`

Forbidden output paths:

- `docs/ruankaodaren/baseline/`
- `source-packets/`
- `source_content`
- `data/raw`
- `data/intermediate`

Default suggested output path:

- `verification/dry-run/ruankaodaren/baseline/`

Phase 5.6 must not create dry-run content under that directory. It only records manifest / policy artifacts.

## 8. Artifact Commit Policy

Commit allowed:

- `schema`
- `types`
- `builder`
- `validator`
- `verification_doc`
- `generated_manifest_json`
- `generated_manifest_md`

Commit forbidden:

- `ai_learning_content`
- `dry_run_content`
- `official_markdown_rewrite`
- `source_layer_modifications`
- `raw_snapshots`
- `intermediate_generated_artifacts`
- `asset_images`
- `.auth`
- `node_modules`
- `pnpm-workspace.yaml`

## 9. Commands

```bash
pnpm build:ai-learning-dry-run-request-manifest
pnpm validate:ai-learning-dry-run-request-manifest
pnpm validate:ai-learning-dry-run-contract
pnpm validate:ai-learning-prompt-contract
pnpm validate:source-packets
pnpm validate:dual-layer-contract
pnpm validate:human-review-status
pnpm validate:controlled-expansion-plan
pnpm typecheck
pnpm verify
```

## 10. Success Criteria

- Request manifest JSON / Markdown generated.
- `generation_allowed = false`.
- `dry_run_generation_allowed = false`.
- `formal_ai_learning_generation_allowed = false`.
- `phase5_7_entry_allowed = false`.
- Every item has `request_status = not_requested`.
- No item allows dry-run generation or formal generation.
- `13.3` carries taxonomy and multi-card restrictions.
- Output paths are isolated from official Markdown, Source Layer, raw artifacts, and intermediate artifacts.
- Validator, typecheck, and structure verification pass.
