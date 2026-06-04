# Phase 6.12 Offline Batch Run Plan

## 1. Background

Phase 6.11 recorded the operational gate approval decision. The decision approved `offline_existing_source_packet_only` as the execution mode for `phase6_1_batch_001`. All operational gates remain closed (crawler, renderer, recovery, web requests, AI learning generation).

Phase 6.12 creates the precise offline batch run plan. This phase defines exactly what will happen when the batch is eventually executed, without actually executing it. The run plan is a descriptive specification only — no execution occurs.

## 2. Objective

Create a detailed offline batch run plan for `phase6_1_batch_001` that:

- Specifies the exact run scope (item 1.3 only)
- Defines the input boundary (existing artifacts only)
- Describes the planned run sequence (descriptive, not executable)
- Lists planned future artifacts (marked as planned)
- Lists forbidden Phase 6.12 artifacts
- Defines the rollback boundary
- Defines the audit boundary

## 3. Run Scope

### 3.1 Approved Items

Only item `1.3` (指令系统CISC和RISC) is approved for batch execution. This item has `execution_approved` status from Phase 6.5 onward.

### 3.2 Deferred Items

Item `9.1` (信息安全基础知识) remains `deferred_candidate`. It is excluded from the current batch.

### 3.3 Quarantined Items

Item `13.3` (软件架构风格) remains `quarantined` and `ineligible`. It is excluded from the current batch.

### 3.4 Scope Constraints

- No additional item may be added to the batch
- No source layer mutation may occur in Phase 6.12
- No item status may change in Phase 6.12
- The run plan is descriptive only — it does not execute

## 4. Input Boundary

### 4.1 Allowed Inputs

Phase 6.12 may read (but not modify) the following existing artifacts:

| Source Phase | Artifact | Purpose |
|---|---|---|
| 6.0 | controlled source expansion plan | Defines overall expansion scope |
| 6.1 | batch selection manifest | Defines batch 001 item selection |
| 6.2 | quarantine decision | Confirms quarantine status for 13.3 |
| 6.3 | readiness preflight | Confirms activation readiness |
| 6.4 | approval request | Records activation approval request |
| 6.5 | activation decision | Records activation approval |
| 6.6 | execution readiness preflight | Confirms execution readiness |
| 6.7 | execution approval request | Records execution approval request |
| 6.8 | execution approval decision | Records execution approval |
| 6.9 | controlled execution plan | Defines execution plan |
| 6.10 | operational gate request | Records operational gate request |
| 6.11 | operational gate decision | Records operational gate approval |
| source packets | existing source packets for item 1.3 | Input data for execution |

### 4.2 Forbidden Inputs

The following inputs are forbidden:

- New web content
- Crawler output
- Renderer output
- Recovery output
- AI-generated learning content
- Newly captured assets
- Newly created raw snapshots
- Newly created intermediate JSON

## 5. Planned Run Sequence

The following sequence is descriptive only. No step is executed in Phase 6.12.

### Step 1: Assert Prior Phase Chain Completeness

Verify that phases 6.0 through 6.11 are all committed and their manifests exist. The chain must be unbroken.

### Step 2: Assert Approved Execution Mode

Verify that `approved_execution_mode` is `offline_existing_source_packet_only`.

### Step 3: Assert Operational Gates Remain Closed

Verify that all operational gates are false:
- `crawler_allowed = false`
- `renderer_allowed = false`
- `recovery_allowed = false`
- `web_requests_allowed = false`
- `ai_learning_generation_allowed = false`

### Step 4: Assert Single-Item Batch Scope

Verify that `approved_items` contains exactly `["1.3"]`. No other item is approved.

### Step 5: Assert Source Packet Availability for Item 1.3

Verify that existing source packets for item 1.3 are present and readable. No new source packet creation occurs.

### Step 6: Assert MIXED_TEXT_IMAGE Handling Rule

Item 1.3 has `MIXED_TEXT_IMAGE` content type. The execution must handle this content type by reading existing source packets only, without generating new content.

### Step 7: Assert No Source Layer Mutation

Verify that no source layer files are modified. The source layer is read-only during execution.

### Step 8: Prepare Run Command Placeholder

A run command placeholder is defined for future execution. The placeholder is:

```
# PLACEHOLDER — NOT EXECUTED IN PHASE 6.12
# pnpm run:offline-batch -- --batch-id=phase6_1_batch_001 --mode=offline_existing_source_packet_only --items=1.3
```

This command does not exist as a package script. It is a documentation placeholder only.

### Step 9: Define Expected Future Run Record Fields

When the batch is eventually executed, the run record must include:

- `run_id`: unique execution identifier
- `batch_id`: `phase6_1_batch_001`
- `run_mode`: `offline_existing_source_packet_only`
- `started_at`: ISO 8601 timestamp
- `completed_at`: ISO 8601 timestamp
- `status`: `completed` or `failed`
- `items_processed`: list of item IDs
- `items_succeeded`: list of item IDs
- `items_failed`: list of item IDs (empty if all succeeded)

### Step 10: Define Post-Run Validation Expectations

After future execution, the following validations must pass:

- All operational gates remain closed
- Source layer is unmodified
- Item 1.3 execution result exists
- Execution audit log exists
- No forbidden artifacts were created

### Step 11: Define Rollback Boundary

See Section 7 for rollback boundary definition.

### Step 12: Define Audit Finalization Checklist

See Section 8 for audit boundary definition.

## 6. Planned Future Artifacts

The following artifacts are planned but NOT created in Phase 6.12:

| Artifact | Purpose | Created When | Status |
|---|---|---|---|
| controlled_batch_run_record | Records batch execution metadata | During future execution | planned |
| item_level_execution_result | Records per-item outcome for 1.3 | During future execution | planned |
| execution_audit_log | Records step-by-step execution trace | During future execution | planned |
| post_run_validation_report | Validates execution invariants | After future execution | planned |

## 7. Forbidden Phase 6.12 Artifacts

Phase 6.12 must NOT create any of the following artifacts:

- raw_snapshots
- intermediate_json
- rendered_outputs
- crawler_outputs
- recovery_outputs
- ai_learning_content
- source_layer_mutations
- newly_captured_assets
- web_request_results
- actual_execution_result_files

## 8. Rollback Boundary

### 8.1 Phase 6.12 Rollback

No rollback is needed for Phase 6.12 because no execution occurs. Phase 6.12 creates only the run plan manifest, which can be replaced or removed without side effects.

### 8.2 Future Execution Rollback Requirements

When the batch is eventually executed:

- Future execution must be reversible by removing run-scoped output artifacts only
- Future execution must not require source layer rollback
- Future execution must isolate item 1.3 outputs from global state
- Rollback target: return batch to `planned_not_executed` status
- Rollback scope: remove generated output artifacts for item 1.3
- Source preservation: source layer artifacts must remain untouched

## 9. Audit Boundary

### 9.1 Prior Phase Chain

The complete prior phase chain is: 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11.

### 9.2 Current Run Mode

- `run_mode`: `offline_existing_source_packet_only`
- `operational_mode_approval_status`: `operational_mode_approved`
- `execution_authorization_status`: `execution_approved`

### 9.3 Current Gate State

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

### 9.4 No-Go Confirmation

- No batch execution occurs in Phase 6.12
- No crawler runs
- No renderer runs
- No recovery runs
- No web requests are made
- No source layer is modified
- No AI learning content is generated
- No assets are captured
- No raw snapshots are created
- No intermediate JSON is created

### 9.5 Validation Commands

```
pnpm typecheck
pnpm verify
pnpm validate:offline-batch-run-plan
```

### 9.6 Commit Scope

Only Phase 6.12 offline batch run plan files and related schema/type/validator/package script changes.

## 10. Phase Progression

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

## 11. Validation Expectations

The Phase 6.12 validator must verify:

- `plan_status` is `planned_not_executed`
- `run_mode` is `offline_existing_source_packet_only`
- `batch_id` is `phase6_1_batch_001`
- `approved_items` is exactly `["1.3"]`
- `execution_authorization_status` is `execution_approved`
- `operational_mode_approval_status` is `operational_mode_approved`
- All authorization gates are true
- All operational gates are false
- All operational gate decisions are `not_required` or `not_allowed`
- `13.3` is not in `approved_items`
- `quarantined_items` includes `13.3`
- `deferred_items` includes `9.1`
- Planned future artifacts are marked as planned only
- Forbidden Phase 6.12 artifacts are explicitly listed
- No execution, crawler, renderer, recovery, web request, AI generation, source mutation, snapshot, intermediate JSON, or asset capture is claimed
- No actual batch execution is claimed

## 12. Commit Scope

Only the following files are included in the Phase 6.12 commit:

- `docs/specs/021_phase6_12_offline_batch_run_plan.md`
- `data/manifests/phase6_12_offline_batch_run_plan.json`
- `schemas/ruankaodaren-offline-batch-run-plan.schema.json`
- `packages/domain-types/ruankaodaren-offline-batch-run-plan.ts`
- `scripts/validate-ruankaodaren-offline-batch-run-plan.ts`
- `package.json` (new validation script entry)
- `scripts/verify-structure.ts` (new file entries)

No crawler, renderer, recovery, raw snapshots, intermediate JSON, assets, source packets, source layer files, AI learning content, execution result files, or execution code is modified.
