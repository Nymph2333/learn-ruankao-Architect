# Phase 5.7 AI Learning Dry-run Execution Contract

## 1. Scope

Phase 5.7 defines how a future AI Learning dry-run execution must be constructed, validated, isolated, and reviewed.

It is contract-only:

- `contract_version = phase5.7`
- `contract_scope = dry_run_execution_contract_only`
- `execution_mode = contract_only`
- `generation_allowed = false`
- `dry_run_generation_allowed = false`
- `dry_run_execution_allowed = false`
- `formal_ai_learning_generation_allowed = false`
- `review_gate_required = true`
- `auto_approval = false`
- `phase5_8_entry_allowed = false`

## 2. Required Inputs

The builder must read and gate these artifacts before writing the Phase 5.7 execution contract:

- `source-packets/ruankaodaren/baseline/source-packet.json`
- `verification/generated/phase5_4_ai_learning_prompt_contract.json`
- `verification/generated/phase5_5_ai_learning_dry_run_contract.json`
- `verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json`

Gate requirements:

- source packet exists.
- source packet `complete_count = 3`.
- Phase 5.4 `generation_allowed = false`.
- Phase 5.5 `generation_allowed = false`.
- Phase 5.6 `generation_allowed = false`.
- Phase 5.6 `dry_run_generation_allowed = false`.

## 3. Execution Input Bundle Contract

Phase 5.7 defines the future input bundle shape but does not generate any input bundle instance.

Required input bundle fields:

- `source_packet_reference`
- `prompt_contract_reference`
- `dry_run_contract_reference`
- `dry_run_request_manifest_reference`
- `item_identity`
- `item_render_as`
- `item_content_shape`
- `source_layer_refs`
- `allowed_prompt_template_id`
- `output_isolation_target`
- `review_request_reference`
- `execution_controls`

`execution_controls` must keep all execution and write controls disabled:

- `generation_allowed = false`
- `dry_run_generation_allowed = false`
- `dry_run_execution_allowed = false`
- `formal_generation_allowed = false`
- `source_layer_write_allowed = false`
- `official_markdown_write_allowed = false`
- `auto_approval = false`

## 4. Execution Output Format Contract

Phase 5.7 defines future dry-run output labels and section names only. It must not fill section body content.

Required output format:

- `output_kind = dry_run_ai_learning_draft`
- `ai_generated_label_required = true`
- `dry_run_label_required = true`
- `not_human_approved_label_required = true`
- `source_packet_reference_required = true`
- `prompt_contract_reference_required = true`
- `dry_run_contract_reference_required = true`
- `request_manifest_reference_required = true`
- `source_layer_modification_forbidden = true`
- `official_markdown_modification_forbidden = true`

Future dry-run section names:

- Source Summary / 原文摘要
- AI Explanation / AI解析
- Architecture Mapping / 架构师考点映射
- Case Study Pattern / 案例答题模式
- Paper Usage / 论文表达
- Misconceptions / 易错点
- Memory Hooks / 记忆钩子
- Review Notes / 复核提示

These are names and requirements only. Phase 5.7 must not write section content.

## 5. Execution Status Machine

Allowed statuses:

- `not_executable`
- `execution_request_required`
- `execution_review_pending`
- `execution_ready`
- `execution_blocked`
- `dry_run_executed`
- `dry_run_review_pending`
- `dry_run_changes_requested`
- `dry_run_rejected`
- `dry_run_approved`

Current default:

- all items `execution_status = not_executable`
- all items `execution_allowed = false`
- all items `dry_run_generation_allowed = false`
- all items `formal_generation_allowed = false`

Required transitions:

- `not_executable -> execution_request_required` requires `item eligible_for_request = true`.
- `execution_request_required -> execution_review_pending` requires `human_review_request_created = true`.
- `execution_review_pending -> execution_ready` requires human review approval, isolated output path, and valid Phase 5.4 / 5.5 / 5.6 references.
- `execution_ready -> dry_run_executed` requires explicit Phase 5.8 entry approval.

Phase 5.7 does not allow any item to enter `execution_ready` or `dry_run_executed`.

## 6. Item Execution Policy

The execution contract must cover exactly the current three baseline items.

`1.3 指令系统CISC和RISC`:

- `render_as = asset_card`
- `eligible_for_request = false`
- `execution_status = not_executable`
- `execution_allowed = false`
- `dry_run_generation_allowed = false`
- `formal_generation_allowed = false`
- manual asset review is required.
- OCR and image-table reconstruction remain forbidden.
- execution blockers include `asset_manual_review_required` and `image_content_not_human_verified`.

`13.3 软件架构风格`:

- `render_as = short_card`
- `taxonomy_suspect = true`
- `is_multi_card_sequence = true`
- `eligible_for_request = false`
- `execution_status = not_executable`
- `execution_allowed = false`
- `dry_run_generation_allowed = false`
- `formal_generation_allowed = false`
- `taxonomy_suspect_handling = restrict_execution`
- `multi_card_sequence_handling = do_not_claim_complete`
- `parent_node_handling = do_not_generate_as_leaf`
- required warnings include `verified_short_text`, `taxonomy_suspect`, `multi_card_sequence_possible`, and `do_not_claim_complete`.

`9.1 信息安全基础知识`:

- `render_as = concept_card`
- `eligible_for_request = true`
- `execution_status = not_executable`
- `execution_allowed = false`
- `dry_run_generation_allowed = false`
- `formal_generation_allowed = false`
- `may_enter_future_execution_after_review = true`
- manual review is required.
- required prerequisites include human review request, human approval, isolated output path, and valid Phase 5.4 / 5.5 / 5.6 references.

`eligible_for_request = true` is not execution approval. It only means a future execution request may be created after review-gate prerequisites are satisfied.

## 7. Output Isolation Policy

Allowed future output roots:

- `verification/dry-run/ruankaodaren/`
- `drafts/ai-learning/ruankaodaren/`

Default future output root:

- `verification/dry-run/ruankaodaren/baseline/`

Forbidden output roots:

- `docs/ruankaodaren/baseline/`
- `source-packets/`
- `source_content`
- `data/raw`
- `data/intermediate`

Phase 5.7 must not generate dry-run body files under the default future output root.

## 8. Artifact Commit Policy

Commit allowed:

- schema
- types
- builder
- validator
- verification doc
- generated execution contract JSON
- generated execution contract Markdown

Commit forbidden:

- AI learning content
- dry-run content
- official Markdown rewrite
- Source Layer modifications
- raw snapshots
- intermediate generated artifacts
- asset images
- `.auth`
- `node_modules`
- `pnpm-workspace.yaml`

## 9. Validation Commands

Required validation:

- `pnpm build:ai-learning-dry-run-execution-contract`
- `pnpm validate:ai-learning-dry-run-execution-contract`
- `pnpm validate:ai-learning-dry-run-request-manifest`
- `pnpm validate:ai-learning-dry-run-contract`
- `pnpm validate:ai-learning-prompt-contract`
- `pnpm validate:source-packets`
- `pnpm validate:dual-layer-contract`
- `pnpm validate:human-review-status`
- `pnpm validate:controlled-expansion-plan`
- `pnpm typecheck`
- `pnpm verify`

## 10. Forbidden Actions

Phase 5.7 must not:

- generate AI learning content.
- generate dry-run content.
- generate formal dual-layer document instances.
- generate item-level AI explanation content.
- rewrite official Markdown.
- modify Source Layer artifacts.
- write `source_content`.
- auto-sign human review.
- OCR.
- decrypt `encrypt=1`.
- reconstruct image tables.
- read raw HTML directly.
- read raw XHR directly.
- access webpages.
- run renderer, crawler, recovery, or batch render.
- enter Phase 4.6.
