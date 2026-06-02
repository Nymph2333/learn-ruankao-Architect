# Phase 5.9 AI Learning Human Review Request Package

## 1. Scope

Phase 5.9 builds a human review request package for future AI Learning dry-run execution review only.

It does not generate AI learning content, dry-run content, item-level AI explanations, input bundle instances, or formal dual-layer documents.

## 2. Required Inputs

- `source-packets/ruankaodaren/baseline/source-packet.json`
- `verification/generated/phase5_4_ai_learning_prompt_contract.json`
- `verification/generated/phase5_5_ai_learning_dry_run_contract.json`
- `verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json`
- `verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json`
- `verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json`

## 3. Source Packet / Prior Contract Gate

The builder and validator must confirm:

- source packet exists
- complete_count is 3
- Phase 5.4 generation_allowed is false
- Phase 5.5 generation_allowed is false
- Phase 5.6 generation_allowed is false
- Phase 5.6 dry_run_generation_allowed is false
- Phase 5.7 dry_run_execution_allowed is false
- Phase 5.8 phase5_9_entry_allowed is false

## 4. Selected Item Policy

Only `9.1 信息安全基础知识` may be selected for the Phase 5.9 human review request package.

The selected item must remain:

- review_status: human_review_pending
- human_review_approved: false
- dry_run_generation_allowed: false
- dry_run_execution_allowed: false
- formal_generation_allowed: false
- output_path_isolated: true

The default future output path is:

```text
verification/dry-run/ruankaodaren/baseline/9.1_信息安全基础知识/
```

## 5. Excluded Item Policy

`1.3 指令系统CISC和RISC` is excluded because asset manual review and human image content verification are still required.

`13.3 软件架构风格` is excluded because it remains taxonomy_suspect, may be a multi-card sequence, and is not safe to generate as a leaf item.

## 6. Human Review Checklist

The generated request package must include:

- source_packet_reference_verified
- prompt_contract_reference_verified
- dry_run_contract_reference_verified
- request_manifest_reference_verified
- execution_contract_reference_verified
- readiness_check_reference_verified
- output_path_isolated
- official_markdown_write_forbidden
- source_layer_write_forbidden
- no_ocr
- no_raw_html_or_xhr
- no_ai_content_in_source_content
- no_formal_generation_before_approval

## 7. Phase 5.10 Entry Policy

Phase 5.10 entry is not allowed in Phase 5.9.

Before Phase 5.10 can be considered, the package must require:

- explicit_user_approval
- reviewer_decision_approve_for_phase5_10_dry_run_execution
- human_review_approved
- selected_item_is_9.1
- output_path_isolated
- all_contract_references_valid
- no_source_layer_modification
- no_official_markdown_modification

## 8. Artifact Commit Policy

Commit allowed:

- schema
- types
- builder
- validator
- verification_doc
- generated_human_review_request_package_json
- generated_human_review_request_package_md

Commit forbidden:

- ai_learning_content
- dry_run_content
- input_bundle_instance
- official_markdown_rewrite
- source_layer_modifications
- raw_snapshots
- intermediate_generated_artifacts
- asset_images
- .auth
- node_modules
- pnpm-workspace.yaml

## 9. Validation Commands

```bash
pnpm build:ai-learning-human-review-request-package
pnpm validate:ai-learning-human-review-request-package
pnpm validate:ai-learning-dry-run-readiness-check
pnpm validate:ai-learning-dry-run-execution-contract
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
