# Phase 6.13 Offline Batch Run Command Approval Request

## 1. Background

Phase 6.12 created the offline batch run plan for `phase6_1_batch_001`. The plan defines exactly what will happen when the batch is eventually executed, using existing source packets only, without actually executing anything.

Phase 6.13 prepares a human-reviewable approval request for the exact offline run command. This phase documents the precise command that will be used to execute the batch, requests human approval for that command, and records the approval request as pending. No command is executed, no approval decision is made, and no output artifacts are created.

## 2. Objective

Create an offline batch run command approval request that:

- Documents the exact run command as a placeholder
- Specifies command arguments and run mode
- Defines the allowed inputs and forbidden inputs
- Defines allowed future outputs and forbidden current-phase outputs
- Specifies rollback and audit conditions
- Includes no-go confirmation
- Includes human decision fields (pending)
- Does NOT approve or execute the command
- Does NOT add any executable package script

## 3. Requested Command

### 3.1 Command Identity

| Field | Value |
|---|---|
| command_id | phase6_13_offline_run_command_001 |
| command_type | offline_batch_run |
| command_status | pending_human_review |
| command_is_executable_now | false |
| command_has_been_executed | false |

### 3.2 Command Text (Placeholder Only)

The following command is documented as a placeholder. It is NOT added to `package.json` and is NOT executable as part of Phase 6.13:

```
pnpm run batch:offline -- --batch phase6_1_batch_001 --items 1.3 --mode offline_existing_source_packet_only
```

### 3.3 Command Arguments

| Argument | Value | Description |
|---|---|---|
| --batch | phase6_1_batch_001 | Target batch identifier |
| --items | 1.3 | Comma-separated list of approved item IDs |
| --mode | offline_existing_source_packet_only | Execution mode constraint |

### 3.4 Command Constraints

- The command is a documentation placeholder only
- No `batch:offline` script exists in `package.json`
- The command must not be executed in Phase 6.13
- The command must not generate any output artifacts in Phase 6.13
- The command must be approved by a human before future execution

## 4. Run Mode

- `run_mode`: `offline_existing_source_packet_only`
- This mode constrains execution to reading existing source packets only
- No crawler, renderer, recovery, web requests, or AI generation may occur
- No source layer mutation may occur

## 5. Allowed Inputs

The run command, when eventually approved and executed, may read (but not modify) the following existing artifacts:

| Source Phase | Artifact | Purpose | Access Mode |
|---|---|---|---|
| 6.0 | controlled source expansion plan | Defines overall expansion scope | read_only |
| 6.1 | batch selection manifest | Defines batch 001 item selection | read_only |
| 6.2 | quarantine decision | Confirms quarantine status for 13.3 | read_only |
| 6.3 | readiness preflight | Confirms activation readiness | read_only |
| 6.4 | approval request | Records activation approval request | read_only |
| 6.5 | activation decision | Records activation approval | read_only |
| 6.6 | execution readiness preflight | Confirms execution readiness | read_only |
| 6.7 | execution approval request | Records execution approval request | read_only |
| 6.8 | execution approval decision | Records execution approval | read_only |
| 6.9 | controlled execution plan | Defines execution plan | read_only |
| 6.10 | operational gate request | Records operational gate request | read_only |
| 6.11 | operational gate decision | Records operational gate approval | read_only |
| 6.12 | offline batch run plan | Defines the run plan | read_only |
| source packets | existing source packets for item 1.3 | Input data for execution | read_only |

## 6. Forbidden Inputs

The following inputs are forbidden:

- New web content
- Crawler output
- Renderer output
- Recovery output
- AI-generated learning content
- Newly captured assets
- Newly created raw snapshots
- Newly created intermediate JSON

## 7. Allowed Future Outputs

When the command is eventually approved and executed, the following artifacts may be created. All are marked as `planned` only — none are created in Phase 6.13:

| Artifact | Purpose | Created When | Status |
|---|---|---|---|
| controlled_batch_run_record | Records batch execution metadata | During future execution | planned |
| execution_audit_log | Records step-by-step execution trace | During future execution | planned |
| item_level_execution_result | Records per-item outcome for 1.3 | During future execution | planned |
| post_run_validation_report | Validates execution invariants | After future execution | planned |

## 8. Forbidden Phase 6.13 Artifacts

Phase 6.13 must NOT create any of the following artifacts:

- actual controlled batch run record
- actual item-level execution result
- actual post-run validation report
- raw_snapshots
- intermediate_json
- rendered_outputs
- crawler_outputs
- recovery_outputs
- web_request_results
- ai_learning_content
- source_layer_mutations
- captured_assets

## 9. Rollback Condition

- No rollback is needed for Phase 6.13 because no execution occurs and no artifacts are created
- The approval request itself can be replaced or removed without side effects
- Future execution rollback: remove run-scoped output artifacts only
- Future execution rollback must not require source layer rollback
- Future execution rollback must isolate item 1.3 outputs from global state

## 10. Audit Condition

### 10.1 Prior Phase Chain

The complete prior phase chain is: 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12.

### 10.2 Current State

- `approval_status`: `pending_human_review`
- `run_command_approval_status`: `pending_human_review`
- `run_command_approved`: false
- `batch_run_executed`: false
- `run_mode`: `offline_existing_source_packet_only`
- `batch_id`: `phase6_1_batch_001`

### 10.3 Gate State

| Gate | State |
|---|---|
| phase6_1_entry_allowed | true |
| activation_allowed | true |
| batch_executable | true |
| execution_allowed | true |
| crawler_allowed | false |
| renderer_allowed | false |
| recovery_allowed | false |
| web_requests_allowed | false |
| ai_learning_generation_allowed | false |

### 10.4 No-Go Confirmation

- No batch execution occurs in Phase 6.13
- No crawler runs
- No renderer runs
- No recovery runs
- No web requests are made
- No source layer is modified
- No AI learning content is generated
- No assets are captured
- No raw snapshots are created
- No intermediate JSON is created
- No package script is added that executes the batch

### 10.5 Validation Commands

```
pnpm typecheck
pnpm verify
pnpm validate:offline-batch-run-command-approval-request
```

### 10.6 Commit Scope

Only Phase 6.13 offline batch run command approval request files and related schema/type/validator/package script changes.

## 11. Human Decision Fields

The following fields are reserved for human decision. All are in pending state in Phase 6.13:

| Field | Current Value | Description |
|---|---|---|
| human_decision | pending | The human reviewer's decision |
| human_decision_timestamp | null | When the decision was made |
| human_decision_notes | null | Optional notes from the reviewer |
| human_reviewer_id | null | Identifier of the reviewer |

## 12. Phase Progression

| Phase | Outcome |
|---|---|
| 6.0 | controlled_source_expansion_plan_created |
| 6.1 | batch_selection_manifest_created |
| 6.2 | gate_recheck_completed |
| 6.3 | activation_readiness_preflight_passed |
| 6.4 | batch_activation_human_approval_request_created |
| 6.5 | batch_activation_human_approval_decision_accepted |
| 6.6 | batch_execution_readiness_preflight_passed |
| 6.7 | batch_execution_human_approval_request_created |
| 6.8 | batch_execution_human_approval_decision_accepted |
| 6.9 | controlled_batch_execution_plan_created |
| 6.10 | operational_gate_approval_request_created |
| 6.11 | operational_gate_approval_decision_recorded |
| 6.12 | offline_batch_run_plan_created |
| 6.13 | offline_batch_run_command_approval_request_created |

## 13. Validation Expectations

The Phase 6.13 validator must verify:

- `approval_status` is `pending_human_review`
- `requested_decision` is `approve_offline_run_command`
- `run_command_approval_status` is `pending_human_review`
- `run_command_approved` is `false`
- `batch_run_executed` is `false`
- `run_mode` is `offline_existing_source_packet_only`
- `batch_id` is `phase6_1_batch_001`
- `approved_items` is exactly `["1.3"]`
- `execution_authorization_status` is `execution_approved`
- `operational_mode_approval_status` is `operational_mode_approved`
- All authorization gates are true
- All operational gates are false
- All operational gate decisions are `not_required` or `not_allowed`
- `command_status` is `pending_human_review`
- `command_is_executable_now` is `false`
- `command_has_been_executed` is `false`
- No executable package script for the batch run is added
- `13.3` is not in `approved_items`
- `quarantined_items` includes `13.3`
- `deferred_items` includes `9.1`
- Allowed future outputs are marked as planned only
- Forbidden Phase 6.13 artifacts are explicitly listed
- No execution, crawler, renderer, recovery, web request, AI generation, source mutation, snapshot, intermediate JSON, or asset capture is claimed
- No actual batch execution is claimed

## 14. Commit Scope

Only the following files are included in the Phase 6.13 commit:

- `docs/specs/022_phase6_13_offline_batch_run_command_approval_request.md`
- `data/manifests/phase6_13_offline_batch_run_command_approval_request.json`
- `schemas/ruankaodaren-offline-batch-run-command-approval-request.schema.json`
- `packages/domain-types/ruankaodaren-offline-batch-run-command-approval-request.ts`
- `scripts/validate-ruankaodaren-offline-batch-run-command-approval-request.ts`
- `package.json` (new validation script entry)
- `scripts/verify-structure.ts` (new file entries)

No crawler, renderer, recovery, raw snapshots, intermediate JSON, assets, source packets, source layer files, AI learning content, execution result files, or execution code is modified.
