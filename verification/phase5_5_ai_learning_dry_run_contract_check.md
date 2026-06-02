# Phase 5.5 AI Learning Dry-run Contract

## 1. Background

Phase 5.4 defined the AI Learning Layer prompt contract. Phase 5.5 defines a dry-run request and review gate contract only. It does not generate AI learning content and does not create formal dual-layer document instances.

## 2. Objective

Establish the dry-run request boundary, isolated output path policy, review gate state machine, and per-item dry-run restrictions for the three baseline source packets.

## 3. Scope

Allowed:

- Read Phase 5.4 prompt contract.
- Read source packet.
- Build Phase 5.5 dry-run contract JSON / Markdown artifacts.
- Validate dry-run gate invariants.

Forbidden:

- AI learning content generation.
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

## 4. Dry-run Contract Policy

- `contract_version = phase5.5`
- `source_name = ruankaodaren`
- `dry_run_allowed = request_only`
- `generation_allowed = false`
- `contract_scope = dry_run_request_and_review_gate_only`
- `review_gate_required = true`
- `auto_approval = false`
- `source_layer_modification_allowed = false`
- `official_markdown_modification_allowed = false`
- `source_content_write_allowed = false`

## 5. Output Isolation Policy

Dry-run output paths must be isolated under:

- `verification/dry-run`
- `drafts/ai-learning`

Dry-run output paths must not point to:

- `docs/ruankaodaren/baseline`
- `source_content`

## 6. Review Gate State Machine

Allowed statuses:

- `not_requested`
- `dry_run_requested`
- `dry_run_generated`
- `human_review_pending`
- `human_review_changes_requested`
- `human_review_rejected`
- `human_review_approved`

Default status:

- `not_requested`

Without human review approval:

- No formal AI Learning Layer generation.
- No writes to `docs/ruankaodaren/baseline`.
- No official Markdown modification.
- No Phase 5.6 entry.

## 7. Item Policies

`1.3 指令系统CISC和RISC`:

- `render_as = asset_card`
- `dry_run_generation_allowed = false`
- `requires_manual_asset_review = true`
- `no_ocr = true`
- `no_image_table_reconstruction = true`
- `cannot_claim_image_content_recognized = true`

`13.3 软件架构风格`:

- `render_as = short_card`
- `taxonomy_suspect = true`
- `is_multi_card_sequence = true`
- `dry_run_generation_allowed = false`
- `taxonomy_suspect_handling = restrict_dry_run`
- `multi_card_sequence_handling = do_not_claim_complete`
- `parent_node_handling = do_not_generate_as_leaf`
- Required warnings: `taxonomy_suspect`, `multi_card_sequence_possible`, `do_not_claim_complete`

`9.1 信息安全基础知识`:

- `render_as = concept_card`
- `dry_run_generation_allowed = false`
- `may_enter_future_dry_run_after_review = true`
- `requires_manual_review = true`

## 8. Commands

```bash
pnpm build:ai-learning-dry-run-contract
pnpm validate:ai-learning-dry-run-contract
pnpm validate:ai-learning-prompt-contract
pnpm validate:source-packets
pnpm validate:dual-layer-contract
pnpm validate:human-review-status
pnpm validate:controlled-expansion-plan
pnpm typecheck
pnpm verify
```

## 9. Success Criteria

- Dry-run contract JSON / Markdown generated.
- `generation_allowed = false`.
- `dry_run_allowed = request_only`.
- `review_gate_required = true`.
- `auto_approval = false`.
- Every item defaults to `review_gate_status = not_requested`.
- Every item has `dry_run_generation_allowed = false`.
- `13.3 软件架构风格` carries taxonomy and multi-card warnings.
- Dry-run output paths are isolated outside official Markdown and `source_content`.
- Validator, typecheck, and structure verification pass.
