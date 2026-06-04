# Phase 6.9 Controlled Batch Execution Plan

## 1. Phase Boundary

```
phase: "6.9"
name: "controlled_batch_execution_plan"
scope: "execution_plan_creation_only"

execution_allowed: true
batch_executable: true
crawler_allowed: false
renderer_allowed: false
recovery_allowed: false
web_requests_allowed: false
source_layer_modification_allowed: false
ai_learning_generation_allowed: false
asset_capture_allowed: false
raw_snapshot_creation_allowed: false
intermediate_json_creation_allowed: false
batch_execution_allowed: false

phase6_1_entry_allowed: true
activation_allowed: true
approval_granted: false
```

Phase 6.9 creates a precise controlled execution plan for batch `phase6_1_batch_001`, without executing it and without opening operational gates.

This phase:
- Validates Phase 6.8 execution approval decision exists and is valid
- Creates a detailed execution plan for future batch execution
- Documents input boundary, allowed artifacts, forbidden artifacts
- Documents execution sequence draft (descriptive only)
- Documents operational gate requests for future phases
- Documents rollback and audit boundaries
- **Does NOT execute the batch**
- **Does NOT open any operational gate**
- **Does NOT run crawler, renderer, or recovery**
- **Does NOT make web requests**
- **Does NOT modify source layer**
- **Does NOT generate AI learning content**
- **Does NOT capture assets**
- **Does NOT create raw snapshots or intermediate JSON**

Core boundary: **6.9 creates the execution plan, does not execute it.**

---

## 2. Inherited Phase Context

Phase 6.9 inherits from:
- Phase 6.0: controlled source expansion plan
- Phase 6.1: dormant batch selection manifest
- Phase 6.2: gate recheck and taxonomy quarantine
- Phase 6.3: activation readiness preflight
- Phase 6.4: human approval request (activation)
- Phase 6.5: human approval decision (activation_approved)
- Phase 6.6: batch execution readiness preflight
- Phase 6.7: execution approval request (pending_human_review)
- Phase 6.8: execution approval decision (execution_approved)

### Current State from Phase 6.8

| Gate / Status | Phase 6.8 Value | Phase 6.9 Value |
|---|---|---|
| `approval_status` | `execution_approved` | `execution_approved` (inherited) |
| `execution_authorization_status` | `execution_approved` | `execution_approved` (inherited) |
| `phase6_1_entry_allowed` | `true` | `true` (inherited) |
| `activation_allowed` | `true` | `true` (inherited) |
| `batch_executable` | `true` | `true` (inherited) |
| `execution_allowed` | `true` | `true` (inherited) |
| `crawler_allowed` | `false` | `false` ⛔ |
| `renderer_allowed` | `false` | `false` ⛔ |
| `recovery_allowed` | `false` | `false` ⛔ |
| `web_requests_allowed` | `false` | `false` ⛔ |
| `ai_learning_generation_allowed` | `false` | `false` ⛔ |
| `approved_batch_id` | `phase6_1_batch_001` | `phase6_1_batch_001` |
| `approved_items` | `["1.3"]` | `["1.3"]` |
| `deferred_items` | `["9.1"]` | `["9.1"]` |
| `quarantined_items` | `["13.3"]` | `["13.3"]` |

---

## 3. Input Boundary

### 3.1 Allowed Input

| Item ID | Title | Status | Notes |
|---|---|---|---|
| 1.3 | 指令系统CISC和RISC | execution_approved | Only item in batch |

### 3.2 Excluded Input

| Item ID | Title | Status | Notes |
|---|---|---|---|
| 9.1 | 信息安全基础知识 | deferred_candidate | Suspected multi-card, boundary unclear |
| 13.3 | 软件架构风格 | quarantined, ineligible | Unknown expansion surface, high risk |

### 3.3 Input Constraints

- Only item 1.3 may be processed
- 9.1 remains deferred
- 13.3 remains quarantined and ineligible
- No additional item may be added
- No source layer mutation may occur in this phase

---

## 4. Allowed Future Execution Artifacts

These artifacts are **planned only**, not created in Phase 6.9:

| Artifact | Purpose | Created When |
|---|---|---|
| Controlled batch run record | Records batch execution metadata | During future execution |
| Execution audit log | Records step-by-step execution trace | During future execution |
| Item-level execution result | Records per-item outcome (1.3) | During future execution |
| Post-run validation report | Validates execution invariants | After future execution |

---

## 5. Forbidden Phase 6.9 Artifacts

Phase 6.9 must NOT create any of the following:

| Artifact | Reason |
|---|---|
| Raw snapshots | Requires crawler execution |
| Intermediate JSON | Requires parser execution |
| Rendered outputs | Requires renderer execution |
| Crawler outputs | Requires crawler execution |
| Recovery outputs | Requires recovery execution |
| AI learning content | Requires AI learning generation |
| Source layer mutations | Requires source layer modification |
| Newly captured assets | Requires asset capture |
| Web request results | Requires web requests |

---

## 6. Execution Sequence Draft

The following sequence is **descriptive only**. No command that mutates data or runs crawler/renderer/recovery may be executed in Phase 6.9.

### 6.1 Pre-Run Gate Assertion

```
ASSERT phase6_1_entry_allowed == true
ASSERT activation_allowed == true
ASSERT batch_executable == true
ASSERT execution_allowed == true
ASSERT crawler_allowed == false
ASSERT renderer_allowed == false
ASSERT recovery_allowed == false
ASSERT web_requests_allowed == false
ASSERT ai_learning_generation_allowed == false
```

### 6.2 Single-Item Batch Scope Check

```
ASSERT approved_items == ["1.3"]
ASSERT item_count == 1
ASSERT batch_id == "phase6_1_batch_001"
```

### 6.3 Source Packet Availability Check

```
VERIFY source_packet for item 1.3 exists
VERIFY source_packet has valid content hash
VERIFY source_packet is not corrupted
```

### 6.4 MIXED_TEXT_IMAGE Handling Check

```
VERIFY item 1.3 known_issue == "MIXED_TEXT_IMAGE"
VERIFY parser can handle MIXED_TEXT_IMAGE content type
VERIFY no special preprocessing required
```

### 6.5 Execution Dry Boundary Check

```
VERIFY no crawler will be invoked
VERIFY no renderer will be invoked
VERIFY no recovery will be invoked
VERIFY no web requests will be made
VERIFY no source layer mutation will occur
VERIFY no AI learning generation will occur
```

### 6.6 Run Command Placeholder

```
# PLACEHOLDER: Future execution command
# This command does NOT exist in Phase 6.9
# It will be defined in a future execution phase
# EXECUTE batch phase6_1_batch_001 --items 1.3 --dry-run=false
```

### 6.7 Post-Run Invariant Validation

```
VERIFY execution output exists for item 1.3
VERIFY output integrity (hash check)
VERIFY no side effects on deferred/quarantined items
VERIFY source layer unchanged
```

### 6.8 Rollback Check

```
VERIFY rollback target is defined
VERIFY rollback can isolate item 1.3 outputs
VERIFY rollback does not affect global source layer
```

### 6.9 Audit Finalization

```
RECORD batch_id
RECORD execution_timestamp
RECORD gate_state_snapshot
RECORD item_outcomes
RECORD validation_results
```

---

## 7. Operational Gate Requests

Phase 6.9 documents potential future gate requests. These are NOT applied in Phase 6.9.

### 7.1 Gates Potentially Required for Future Execution

| Gate | Required? | Rationale |
|---|---|---|
| `crawler_allowed` | Maybe | If source packet needs re-fetching |
| `renderer_allowed` | Maybe | If output requires rendering |
| `web_requests_allowed` | Maybe | If external resources needed |
| `ai_learning_generation_allowed` | Maybe | If AI-assisted content needed |
| `recovery_allowed` | No | Recovery not expected for 1.3 |

### 7.2 Gate Request Constraint

Phase 6.9 does NOT set any operational gate to `true`. All operational gates remain `false`.

---

## 8. Rollback Boundary

### 8.1 Phase 6.9 Rollback

No rollback needed for Phase 6.9 because no execution occurs.

### 8.2 Future Execution Rollback Requirements

- Future execution must define rollback before running
- Future execution must isolate item 1.3 outputs from global source layer
- Rollback target: return batch to `execution_approved` status
- Rollback scope: remove generated output artifacts for item 1.3
- Source preservation: source layer artifacts must remain untouched

---

## 9. Audit Boundary

### 9.1 Prior Phase Chain

| Phase | Outcome |
|---|---|
| 6.0 | Controlled source expansion plan created |
| 6.1 | Dormant batch selection: 1.3 selected as proposed_primary |
| 6.2 | Gate recheck: 13.3 quarantined, taxonomy suspect resolved |
| 6.3 | Readiness preflight: batch marked as activation_candidate (6/9 gates satisfied) |
| 6.4 | Human approval request prepared (pending_human_review) |
| 6.5 | Human approval decision recorded: activation_approved |
| 6.6 | Execution readiness preflight: batch marked as execution_candidate |
| 6.7 | Execution approval request prepared (pending_human_review) |
| 6.8 | Execution approval decision recorded: execution_approved |
| 6.9 | **Controlled execution plan created (this phase)** |

### 9.2 Current Execution Authorization Status

- `execution_authorization_status`: `execution_approved`
- `approved_batch_id`: `phase6_1_batch_001`
- `approved_items`: `["1.3"]`

### 9.3 Current Operational Gates

| Gate | Value |
|---|---|
| `phase6_1_entry_allowed` | `true` |
| `activation_allowed` | `true` |
| `batch_executable` | `true` |
| `execution_allowed` | `true` |
| `crawler_allowed` | `false` |
| `renderer_allowed` | `false` |
| `recovery_allowed` | `false` |
| `web_requests_allowed` | `false` |
| `ai_learning_generation_allowed` | `false` |

### 9.4 No-Go Confirmation

| Condition | Status |
|---|---|
| No batch execution occurs | ✅ Confirmed |
| No crawler runs | ✅ Confirmed |
| No renderer runs | ✅ Confirmed |
| No recovery runs | ✅ Confirmed |
| No web requests made | ✅ Confirmed |
| No source layer modified | ✅ Confirmed |
| No AI learning generated | ✅ Confirmed |
| No assets captured | ✅ Confirmed |
| No raw snapshots created | ✅ Confirmed |
| No intermediate JSON created | ✅ Confirmed |

### 9.5 Validation Commands

```
pnpm typecheck
pnpm verify
pnpm validate:controlled-batch-execution-plan
```

### 9.6 Commit Scope

Only Phase 6.9 execution plan files and related schema/type/validator/package script changes.

---

## 10. What This Phase Does NOT Do

Phase 6.9 is **execution plan creation only**. It explicitly does NOT:

- ❌ Execute the batch
- ❌ Run crawler
- ❌ Run renderer
- ❌ Run recovery
- ❌ Make web requests
- ❌ Modify source layer
- ❌ Generate AI learning content
- ❌ Capture assets
- ❌ Create raw snapshots
- ❌ Create intermediate JSON
- ❌ Set `crawler_allowed=true`
- ❌ Set `renderer_allowed=true`
- ❌ Set `recovery_allowed=true`
- ❌ Set `web_requests_allowed=true`
- ❌ Set `ai_learning_generation_allowed=true`

**Only the execution plan is created. No execution occurs.**

---

## 11. Validation Requirements

### 11.1 Must Pass

Scripts that **must pass** after Phase 6.9:
- `pnpm validate:controlled-source-expansion-plan`
- `pnpm validate:source-packets`
- `pnpm validate:dual-layer-contract`
- `pnpm validate:batch-selection-manifest`
- `pnpm validate:gate-recheck-manifest`
- `pnpm validate:activation-readiness-preflight`
- `pnpm validate:batch-activation-human-approval-request`
- `pnpm validate:batch-activation-human-approval-decision`
- `pnpm validate:batch-execution-readiness-preflight`
- `pnpm validate:batch-execution-human-approval-request`
- `pnpm validate:batch-execution-human-approval-decision`
- `pnpm validate:controlled-batch-execution-plan` ✅ (new)

### 11.2 Must Not Trigger

Systems that **must NOT be triggered** in Phase 6.9:
- `crawler`
- `renderer`
- `recovery`
- `web_requests`
- `ai_learning_generation`
- `asset_capture`
- `raw_snapshot_creation`
- `intermediate_json_creation`
- `batch_execution`

---

## 12. Validator Failure Conditions

The `validate:controlled-batch-execution-plan` script will exit with error if:

- `plan_status` is not `planned_not_executed`
- `batch_id` is not `phase6_1_batch_001`
- `approved_items` is not exactly `["1.3"]`
- `execution_authorization_status` is not `execution_approved`
- `phase6_1_entry_allowed` is not `true`
- `activation_allowed` is not `true`
- `batch_executable` is not `true`
- `execution_allowed` is not `true`
- Any operational gate (crawler, renderer, recovery, web, ai) is not `false`
- `"13.3"` appears in `approved_items`
- `"13.3"` is not in `quarantined_items`
- `"9.1"` is not in `deferred_items`
- Any expansion execution, crawler output, renderer output, AI generation, source mutation, snapshot creation, or intermediate JSON creation is claimed
- Future execution artifacts are not marked as planned only
- Forbidden Phase 6.9 artifacts are not explicitly listed
