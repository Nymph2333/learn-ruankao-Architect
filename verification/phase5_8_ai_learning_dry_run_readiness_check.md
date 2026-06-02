# Phase 5.8 AI Learning Dry-run Execution Readiness Check

## 1. Scope

Phase 5.8 checks whether the repository is ready for future AI Learning dry-run execution.

It is check-only:

- `check_version = phase5.8`
- `check_scope = dry_run_execution_readiness_check_only`
- `readiness_mode = check_only`
- `generation_allowed = false`
- `dry_run_generation_allowed = false`
- `dry_run_execution_allowed = false`
- `formal_ai_learning_generation_allowed = false`
- `review_gate_required = true`
- `auto_approval = false`
- `phase5_9_entry_allowed = false`

Phase 5.8 does not generate AI learning content, dry-run content, item-level AI explanation content, input bundle instances, or formal dual-layer document instances.

## 2. Required Inputs

The builder must read and gate these artifacts before writing the readiness check:

- `source-packets/ruankaodaren/baseline/source-packet.json`
- `verification/generated/phase5_4_ai_learning_prompt_contract.json`
- `verification/generated/phase5_5_ai_learning_dry_run_contract.json`
- `verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json`
- `verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json`

Gate requirements:

- source packet exists.
- source packet `complete_count = 3`.
- Phase 5.4 `generation_allowed = false`.
- Phase 5.5 `generation_allowed = false`.
- Phase 5.6 `generation_allowed = false`.
- Phase 5.6 `dry_run_generation_allowed = false`.
- Phase 5.7 `generation_allowed = false`.
- Phase 5.7 `dry_run_execution_allowed = false`.

## 3. Readiness Item Policy

The readiness check must cover exactly the current three baseline items.

`1.3 指令系统CISC和RISC`:

- `render_as = asset_card`
- `current_status = not_ready`
- `eligible_for_request = false`
- `phase5_9_candidate = false`
- `current_execution_allowed = false`
- `current_dry_run_generation_allowed = false`
- `current_formal_generation_allowed = false`
- manual asset review is required.
- OCR and image-table reconstruction remain forbidden.
- readiness blockers include `asset_manual_review_required` and `image_content_not_human_verified`.
- `readiness_result = blocked`

`13.3 软件架构风格`:

- `render_as = short_card`
- `taxonomy_suspect = true`
- `is_multi_card_sequence = true`
- `current_status = not_ready`
- `eligible_for_request = false`
- `phase5_9_candidate = false`
- `current_execution_allowed = false`
- `current_dry_run_generation_allowed = false`
- `current_formal_generation_allowed = false`
- `taxonomy_suspect_handling = restrict_readiness`
- `multi_card_sequence_handling = do_not_claim_complete`
- `parent_node_handling = do_not_generate_as_leaf`
- readiness blockers include `taxonomy_suspect`, `multi_card_sequence_possible`, and `parent_node_not_safe_as_leaf`.
- `readiness_result = blocked`

`9.1 信息安全基础知识`:

- `render_as = concept_card`
- `current_status = review_required`
- `eligible_for_request = true`
- `phase5_9_candidate = false`
- `current_execution_allowed = false`
- `current_dry_run_generation_allowed = false`
- `current_formal_generation_allowed = false`
- `may_become_phase5_9_candidate_after_review = true`
- manual review is required.
- readiness prerequisites include human review request, human approval, isolated output path, and valid Phase 5.4 / 5.5 / 5.6 / 5.7 references.
- readiness blockers include `human_review_not_approved`.
- `readiness_result = blocked_until_human_review`

`eligible_for_request = true` is not execution approval. It only means a future Phase 5.9 candidate may be considered after the human review gate is satisfied.

## 4. Input Bundle Constructability

Phase 5.8 checks whether a future input bundle can be constructed, but does not generate an input bundle instance.

Required constructability result:

- `constructable_now = false`
- `reason = human_review_not_approved`
- `future_constructable_after_review = true`
- required references: source packet, prompt contract, dry-run contract, request manifest, execution contract
- `isolated_output_target_valid = true`
- `source_layer_write_allowed = false`
- `official_markdown_write_allowed = false`

## 5. Output Isolation Readiness

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

Phase 5.8 must not generate dry-run body files under the default future output root.

## 6. Phase 5.9 Entry Policy

Phase 5.8 defines Phase 5.9 entry conditions, but does not open Phase 5.9.

`phase5_9_entry_allowed = false`

Required before entry:

- explicit user approval
- human review request created
- human review approved
- selected item is Phase 5.9 candidate
- output path isolated
- source packet reference valid
- prompt contract reference valid
- dry-run contract reference valid
- request manifest reference valid
- execution contract reference valid

Prohibited before entry:

- source layer modification
- official Markdown modification
- generation allowed true
- auto approval true
- taxonomy suspect unrestricted generation
- asset without manual review

## 7. Artifact Commit Policy

Commit allowed:

- schema
- types
- builder
- validator
- verification doc
- generated readiness check JSON
- generated readiness check Markdown

Commit forbidden:

- AI learning content
- dry-run content
- input bundle instance
- official Markdown rewrite
- Source Layer modifications
- raw snapshots
- intermediate generated artifacts
- asset images
- `.auth`
- `node_modules`
- `pnpm-workspace.yaml`

## 8. Validation Commands

Required validation:

- `pnpm build:ai-learning-dry-run-readiness-check`
- `pnpm validate:ai-learning-dry-run-readiness-check`
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

## 9. Forbidden Actions

Phase 5.8 must not:

- generate AI learning content.
- generate dry-run content.
- generate input bundle instances.
- generate item-level AI explanation content.
- generate formal dual-layer document instances.
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

## 10. Expected Result

Phase 5.8 should conclude:

- current dry-run execution readiness is not satisfied.
- 1.3 is blocked by unresolved asset manual review.
- 13.3 is blocked by taxonomy suspect and multi-card sequence restrictions.
- 9.1 may become a future candidate after review, but is not a current Phase 5.9 candidate.
- Phase 5.9 remains closed.
