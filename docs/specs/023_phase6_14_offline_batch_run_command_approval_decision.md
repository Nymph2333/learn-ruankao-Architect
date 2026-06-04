# Phase 6.14 Offline Batch Run Command Approval Decision

## 1. Background

Phase 6.13 created the offline batch run command approval request for `phase6_1_batch_001`. The request documented the exact run command as a placeholder, specified command arguments and run mode, defined allowed inputs and forbidden inputs, and included human decision fields in pending state.

Phase 6.14 records the human approval decision for the offline batch run command. The command is approved as metadata, making it executable in governance terms for a later execution phase. No command is actually executed, no output artifacts are created, and no package script is added.

## 2. Objective

Record the offline batch run command approval decision that:

- References the prior request from Phase 6.13
- Records the human decision as approved
- Updates command status to approved
- Marks the command as executable in governance terms
- Confirms the command has NOT been executed
- Confirms no package script is added
- Defines allowed inputs and forbidden inputs
- Defines allowed future outputs and forbidden current-phase outputs
- Specifies rollback and audit conditions
- Includes no-go confirmation
- Includes next-phase constraints
- Does NOT execute the command
- Does NOT create any output artifacts

## 3. Decision Reference

### 3.1 Prior Request

| Field | Value |
|---|---|
| prior_request_phase | 6.13 |
| prior_request_manifest | phase6_13_offline_batch_run_command_approval_request.json |
| prior_request_status | offline_batch_run_command_approval_request_created |

### 3.2 Decision Identity

| Field | Value |
|---|---|
| decision_phase | 6.14 |
| manifest_type | offline_batch_run_command_approval_decision |
| approval_status | run_command_approved |
| approved_decision | approve_offline_run_command |
| run_command_approval_status | approved |
| run_command_approved | true |
| batch_run_executed | false |

## 4. Approved Command Metadata

### 4.1 Command Identity

| Field | Value |
|---|---|
| command_id | phase6_13_offline_run_command_001 |
| command_type | offline_batch_run |
| command_status | approved |
| command_is_executable_now | true |
| command_has_been_executed | false |

### 4.2 Command Text (Placeholder Only)

The following command is approved as metadata. It is NOT added to `package.json` and is NOT executed in Phase 6.14:

```
pnpm run batch:offline -- --batch phase6_1_batch_001 --items 1.3 --mode offline_existing_source_packet_only
```

### 4.3 Command Arguments

| Argument | Value | Description |
|---|---|---|
| --batch | phase6_1_batch_001 | Target batch identifier |
| --items | 1.3 | Comma-separated list of approved item IDs |
| --mode | offline_existing_source_packet_only | Execution mode constraint |

### 4.4 Command Constraints

- The command is approved as metadata only
- No `batch:offline` script exists in `package.json`
- The command must not be executed in Phase 6.14
- The command must not generate any output artifacts in Phase 6.14
- The command is executable in governance terms for a future execution phase

## 5. Run Mode

- `run_mode`: `offline_existing_source_packet_only`
- This mode constrains execution to reading existing source packets only
- No crawler, renderer, recovery, web requests, or AI generation may occur
- No source layer mutation may occur

## 6. Allowed Inputs

The run command, when eventually executed, may read (but not modify) the following existing artifacts:

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
| 6.13 | offline batch run command approval request | Records the approval request | read_only |
| source packets | existing source packets for item 1.3 | Input data for execution | read_only |

## 7. Forbidden Inputs

The following inputs are forbidden:

- New web content
- Crawler output
- Renderer output
- Recovery output
- AI-generated learning content
- Newly captured assets
- Newly created raw snapshots
- Newly created intermediate JSON

## 8. Allowed Future Outputs

When the command is eventually executed, the following artifacts may be created. All are marked as `planned` only — none are created in Phase 6.14:

| Artifact | Purpose | Created When | Status |
|---|---|---|---|
| controlled_batch_run_record | Records batch execution metadata | During future execution | planned |
| execution_audit_log | Records step-by-step execution trace | During future execution | planned |
| item_level_execution_result | Records per-item outcome for 1.3 | During future execution | planned |
| post_run_validation_report | Validates execution invariants | After future execution | planned |

## 9. Forbidden Phase 6.14 Artifacts

Phase 6.14 must NOT create any of the following artifacts:

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

## 10. Rollback Condition

- No rollback is needed for Phase 6.14 because no execution occurs and no artifacts are created
- The approval decision can be reversed by creating a new request
- Future execution rollback: remove run-scoped output artifacts only
- Future execution rollback must not require source layer rollback
- Future execution rollback must isolate item 1.3 outputs from global state

## 11. Audit Condition

### 11.1 Prior Phase Chain

The complete prior phase chain is: 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13.

### 11.2 Current State

- `approval_status`: `run_command_approved`
- `approved_decision`: `approve_offline_run_command`
- `run_command_approval_status`: `approved`
- `run_command_approved`: true
- `batch_run_executed`: false
- `run_mode`: `offline_existing_source_packet_only`
- `batch_id`: `phase6_1_batch_001`

### 11.3 Gate State

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

### 11.4 No-Go Confirmation

- No batch execution occurs in Phase 6.14
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
- The approved command is NOT executed in Phase 6.14

### 11.5 Validation Commands

```
pnpm typecheck
pnpm verify
pnpm validate:offline-batch-run-command-approval-decision
```

### 11.6 Commit Scope

Only Phase 6.14 offline batch run command approval decision files and related schema/type/validator/package script changes.

## 12. Human Decision Fields

The human decision has been made and recorded:

| Field | Value | Description |
|---|---|---|
| human_decision | approved | The human reviewer approved the command |
| human_decision_timestamp | 2026-06-04T06:30:00.000Z | When the decision was made |
| human_decision_notes | Command approved as metadata for future execution | Notes from the reviewer |
| human_reviewer_id | human_reviewer_001 | Identifier of the reviewer |

## 13. Next-Phase Constraints

The following constraints apply to the next execution phase:

- The approved command may be executed in a future phase
- Execution must use `offline_existing_source_packet_only` mode
- Execution must be limited to approved items: `["1.3"]`
- Execution must not modify source layer artifacts
- Execution must not open any operational gates
- Execution must create only the allowed future outputs
- Execution must record all actions in an audit log
- Execution must validate invariants after completion
