# Phase 6.5 Batch Activation Human Approval Decision

## 1. Phase Boundary

```
phase: "6.5"
name: "batch_activation_human_approval_decision"
scope: "human_approval_decision_recording_only"

execution_allowed: false
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
batch_executable: false
approval_granted: true
```

Phase 6.5 records the **human approval decision** for batch activation.

This phase:
- Records the human decision to approve activation (not execution)
- Opens `phase6_1_entry_allowed` and `activation_allowed` gates
- Keeps `batch_executable` and all execution gates closed
- **Does NOT approve execution**
- **Does NOT set batch_executable=true**
- **Does NOT run crawler, renderer, recovery, or any execution**
- **Does NOT modify source layer**
- **Does NOT generate AI learning content**

Core boundary: **6.5 only approves activation, not execution.**

---

## 2. Inherited Phase Context

Phase 6.5 inherits from:
- Phase 6.0: controlled source expansion plan
- Phase 6.1: dormant batch selection manifest
- Phase 6.2: gate recheck and taxonomy quarantine
- Phase 6.3: activation readiness preflight
- Phase 6.4: human approval request (pending_human_review)

### Current State from Phase 6.4

| Gate / Status | Phase 6.4 Value | Phase 6.5 Value |
|---|---|---|
| `approval_status` | `pending_human_review` | `activation_approved` ✅ |
| `phase6_1_entry_allowed` | `false` ⚠️ | `true` ✅ |
| `activation_allowed` | `false` ⚠️ | `true` ✅ |
| `batch_executable` | `false` ⚠️ | `false` ⛔ |
| `execution_allowed` | `false` ⛔ | `false` ⛔ |
| `crawler_allowed` | `false` ⛔ | `false` ⛔ |
| `renderer_allowed` | `false` ⛔ | `false` ⛔ |
| `recovery_allowed` | `false` ⛔ | `false` ⛔ |
| `web_requests_allowed` | `false` ⛔ | `false` ⛔ |
| `ai_learning_generation_allowed` | `false` ⛔ | `false` ⛔ |
| `batch_id` | `phase6_1_batch_001` | `phase6_1_batch_001` |
| `selected_items` | `["1.3"]` | `["1.3"]` |
| `deferred_items` | `["9.1"]` | `["9.1"]` |
| `quarantined_items` | `["13.3"]` | `["13.3"]` |

---

## 3. Decision Scope

### 3.1 Decision Objectives

1. **Record Human Decision**: Document the approval of activation for batch `phase6_1_batch_001`
2. **Open Activation Gates**: Set `phase6_1_entry_allowed=true` and `activation_allowed=true`
3. **Keep Execution Closed**: `batch_executable=false`, `execution_allowed=false`
4. **Preserve Item Constraints**: Only `["1.3"]` approved; `9.1` remains deferred; `13.3` remains quarantined
5. **No Operational Execution**: No crawler, renderer, recovery, web requests, or AI generation

### 3.2 Scope Boundaries

Phase 6.5 is **decision recording only**:
- ✅ May read existing Phase 6.0-6.4 manifests
- ✅ May record human approval decision
- ✅ May set `phase6_1_entry_allowed=true`
- ✅ May set `activation_allowed=true`
- ✅ May set `approval_granted=true`
- ❌ Must NOT set `batch_executable=true`
- ❌ Must NOT set `execution_allowed=true`
- ❌ Must NOT set `crawler_allowed=true`
- ❌ Must NOT set `renderer_allowed=true`
- ❌ Must NOT set `recovery_allowed=true`
- ❌ Must NOT set `web_requests_allowed=true`
- ❌ Must NOT set `ai_learning_generation_allowed=true`
- ❌ Must NOT run crawler, renderer, or any execution
- ❌ Must NOT modify source layer
- ❌ Must NOT generate AI learning content
- ❌ Must NOT add new items to the batch
- ❌ Must NOT select quarantined items

---

## 4. Approval Decision Record

### 4.1 Decision Metadata

| Field | Value |
|---|---|
| **Decision ID** | `phase6_5_batch_activation_decision_001` |
| **Decision Type** | `human_activation_approval` |
| **Approval Status** | `activation_approved` |
| **Approved Decision** | `approve_activation` |
| **Approved Batch ID** | `phase6_1_batch_001` |
| **Approved Items** | `["1.3"]` |
| **Approval Scope** | `activation_only` |
| **Execution Approval Status** | `not_requested` |
| **Decision Timestamp** | (set at creation time) |

### 4.2 Gate State After Decision

**Gates Opened (activation scope):**

| Gate | Previous | After Decision | Rationale |
|---|---|---|---|
| `phase6_1_entry_allowed` | `false` | `true` | Human approved batch entry |
| `activation_allowed` | `false` | `true` | Human approved activation |
| `approval_granted` | `false` | `true` | Approval decision recorded |

**Gates Remaining Closed (execution scope):**

| Gate | Value | Rationale |
|---|---|---|
| `batch_executable` | `false` | Execution approval not requested or granted |
| `execution_allowed` | `false` | Execution is a separate approval gate |
| `crawler_allowed` | `false` | Crawler execution not approved |
| `renderer_allowed` | `false` | Renderer execution not approved |
| `recovery_allowed` | `false` | Recovery execution not approved |
| `web_requests_allowed` | `false` | Web requests not approved |
| `ai_learning_generation_allowed` | `false` | AI learning generation not approved |

### 4.3 Item Constraints

| Item ID | Status | Constraint |
|---|---|---|
| 1.3 | `activation_approved` | Only approved item |
| 9.1 | `deferred_candidate` | Remains deferred; not approved |
| 13.3 | `quarantined` | Remains quarantined; ineligible |

- No new items may be added
- No quarantined item may be selected
- Only the items explicitly approved by human review are activated

---

## 5. Phase Progression History

| Phase | Outcome |
|---|---|
| 6.0 | Controlled source expansion plan created |
| 6.1 | Dormant batch selection: 1.3 selected as proposed_primary |
| 6.2 | Gate recheck: 13.3 quarantined, taxonomy suspect resolved |
| 6.3 | Readiness preflight: batch marked as activation_candidate (6/9 gates satisfied) |
| 6.4 | Human approval request prepared (pending_human_review) |
| 6.5 | **Human approval decision recorded: activation_approved** (this phase) |

---

## 6. What This Phase Does NOT Do

Phase 6.5 is **decision recording only**. It explicitly does NOT:

- ❌ Approve execution (execution approval is a separate gate)
- ❌ Set `batch_executable=true`
- ❌ Set `execution_allowed=true`
- ❌ Set `crawler_allowed=true`
- ❌ Set `renderer_allowed=true`
- ❌ Set `recovery_allowed=true`
- ❌ Set `web_requests_allowed=true`
- ❌ Set `ai_learning_generation_allowed=true`
- ❌ Run crawler
- ❌ Run renderer
- ❌ Make web requests
- ❌ Modify source layer
- ❌ Generate AI learning content
- ❌ Execute the batch
- ❌ Capture assets
- ❌ Create raw snapshots
- ❌ Create intermediate JSON

**Only activation gates are opened. All execution gates remain closed.**

---

## 7. Validation Requirements

### 7.1 Must Pass

Scripts that **must pass** after Phase 6.5:
- `pnpm validate:controlled-source-expansion-plan`
- `pnpm validate:source-packets`
- `pnpm validate:dual-layer-contract`
- `pnpm validate:batch-selection-manifest`
- `pnpm validate:gate-recheck-manifest`
- `pnpm validate:activation-readiness-preflight`
- `pnpm validate:batch-activation-human-approval-request`
- `pnpm validate:batch-activation-human-approval-decision` ✅ (new)

### 7.2 Must Not Trigger

Systems that **must NOT be triggered** in Phase 6.5:
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

## 8. Validator Failure Conditions

The `validate:batch-activation-human-approval-decision` script will exit with error if:

- `approval_status` is not `activation_approved`
- `approved_decision` is not `approve_activation`
- `approved_batch_id` is not `phase6_1_batch_001`
- `approved_items` is not exactly `["1.3"]`
- `approval_scope` is not `activation_only`
- `phase6_1_entry_allowed` is not `true`
- `activation_allowed` is not `true`
- `batch_executable` is not `false`
- `execution_allowed` is not `false`
- `crawler_allowed` is not `false`
- `renderer_allowed` is not `false`
- `recovery_allowed` is not `false`
- `web_requests_allowed` is not `false`
- `ai_learning_generation_allowed` is not `false`
- `"13.3"` appears in `approved_items`
- `"13.3"` is not in `quarantined_items`
- `"9.1"` is not in `deferred_items`
- `execution_approval_status` is not `not_requested` or `explicitly_denied`
- Any expansion execution is claimed
- Any AI learning generation is claimed
- Any source layer mutation is declared
