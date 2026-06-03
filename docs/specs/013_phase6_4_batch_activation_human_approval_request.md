# Phase 6.4 Batch Activation Human Approval Request

## 1. Phase Boundary

```
phase: "6.4"
name: "batch_activation_human_approval_request"
scope: "approval_request_package_only"

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

phase6_1_entry_allowed: false
activation_allowed: false
batch_executable: false
approval_granted: false
```

Phase 6.4 prepares a **human approval request package** for batch activation.

This phase:
- Creates a structured approval request for human review
- Documents the batch, items, risks, and readiness assessment
- Specifies which gate changes are being requested
- Explicitly documents what is NOT being requested
- **Does NOT approve activation** (approval_status: pending_human_review)
- **Does NOT open any gates**
- **Does NOT execute any operations**

---

## 2. Inherited Phase Context

Phase 6.4 inherits from:
- Phase 6.0: controlled source expansion plan
- Phase 6.1: dormant batch selection manifest
- Phase 6.2: gate recheck and taxonomy quarantine
- Phase 6.3: activation readiness preflight

### Current State from Phase 6.3

| Gate / Status | Value |
|---|---|
| `expansion_blocked_until_recheck` | `false` |
| `taxonomy_suspect_13_3` | `false` |
| `taxonomy_suspect_13_3_quarantined` | `true` |
| `phase6_1_entry_allowed` | `false` ⚠️ |
| `activation_allowed` | `false` ⚠️ |
| `batch_executable` | `false` ⚠️ |
| `batch_id` | `phase6_1_batch_001` |
| `readiness_status` | `activation_candidate` |
| `selected_items` | `["1.3"]` |
| `deferred_items` | `["9.1"]` |
| `quarantined_items` | `["13.3"]` |

---

## 3. Approval Request Scope

### 3.1 Request Objectives

1. **Package Preparation**: Create a reviewable approval request package
2. **Context Summary**: Document batch history, gate progression, and readiness
3. **Risk Assessment**: Present known risks and mitigation context
4. **Decision Fields**: Provide explicit approval/rejection fields
5. **Gate Change Specification**: Document requested gate changes if approved

### 3.2 Scope Boundaries

Phase 6.4 is **request preparation only**:
- ✅ May read existing Phase 6.0-6.3 manifests
- ✅ May create human approval request package
- ✅ May document requested gate changes
- ✅ May set approval_status to `pending_human_review`
- ❌ Must NOT approve activation (human decision required)
- ❌ Must NOT set `phase6_1_entry_allowed=true`
- ❌ Must NOT set `activation_allowed=true`
- ❌ Must NOT set `batch_executable=true`
- ❌ Must NOT run crawler, renderer, or any execution
- ❌ Must NOT modify source layer
- ❌ Must NOT generate AI learning content

---

## 4. Approval Request Package

### 4.1 Request Metadata

**Request ID**: `phase6_4_approval_request_001`  
**Request Type**: `batch_activation_approval`  
**Requested For Batch**: `phase6_1_batch_001`  
**Requested Decision**: `approve_activation`  
**Approval Status**: `pending_human_review`  
**Created**: Phase 6.4  
**Requires Human Decision**: YES

### 4.2 Batch Summary

**Batch ID**: `phase6_1_batch_001`  
**Selected Items**: `["1.3"]`  
**Item Count**: 1  
**Readiness Status**: `activation_candidate`

| Item ID | Title | Status | Readiness | Risk Level |
|---|---|---|---|---|
| 1.3 | 指令系统CISC和RISC | proposed_primary | ready_pending_approval | low |

**Deferred Items**: `["9.1"]`  
**Quarantined Items**: `["13.3"]`

### 4.3 Phase Progression History

| Phase | Outcome |
|---|---|
| 6.0 | Controlled source expansion plan created |
| 6.1 | Dormant batch selection: 1.3 selected as proposed_primary |
| 6.2 | Gate recheck: 13.3 quarantined, taxonomy suspect resolved |
| 6.3 | Readiness preflight: batch marked as activation_candidate (6/9 gates satisfied) |
| 6.4 | Human approval request prepared (this phase) |

### 4.4 Structural Readiness Summary

From Phase 6.3 preflight:
- ✅ Batch structural eligibility: **PASS**
- ✅ Risk profile: **ACCEPTABLE**
- ✅ Gate inventory: **6/9 satisfied**
- ✅ All structural preconditions: **PASS**

---

## 5. Requested Gate Changes

### 5.1 Gates Requested to Open (if approved)

If human approval is granted, the following gates are **requested** to be opened in a subsequent phase:

| Gate | Current | Requested | Rationale |
|---|---|---|---|
| `phase6_1_entry_allowed` | `false` | `true` | Allow entry to Phase 6.1 batch execution preparation |
| `activation_allowed` | `false` | `true` | Authorize activation of the selected batch |

**Important**: These gate changes are **NOT applied in Phase 6.4**. They are only documented as requested changes pending human approval.

### 5.2 Gates Explicitly NOT Requested

The following gates are **NOT requested** to be opened, even if activation is approved:

| Gate | Current | Requested | Rationale |
|---|---|---|---|
| `batch_executable` | `false` | `false` | Execution approval is a separate gate (Phase 6.5+) |
| `execution_allowed` | `false` | `false` | Item-level execution requires additional approval |
| `crawler_allowed` | `false` | `false` | Crawler execution is a separate gate |
| `renderer_allowed` | `false` | `false` | Renderer execution is a separate gate |
| `recovery_allowed` | `false` | `false` | Recovery execution is a separate gate |
| `web_requests_allowed` | `false` | `false` | Web requests are a separate gate |
| `ai_learning_generation_allowed` | `false` | `false` | AI learning is a separate gate |

**Separation of Concerns**: Activation approval (Phase 6.4) is separate from execution approval (Phase 6.5+).

---

## 6. Risk Assessment for Approval

### 6.1 Known Risks

**Item 1.3 指令系统CISC和RISC**:
- **Known Issue**: `MIXED_TEXT_IMAGE`
- **Risk Level**: low
- **Risk Description**: Content includes mixed text and image elements that may require special handling during parsing
- **Mitigation**: Parser already handles MIXED_TEXT_IMAGE in baseline; issue is manageable
- **Expansion Surface**: Leaf item, minimal expected expansion

**Item 13.3 软件架构风格**:
- **Status**: QUARANTINED (excluded from this batch)
- **Risk Level**: high
- **Risk Description**: Unknown expansion surface, potential taxonomy drift
- **Mitigation**: Excluded from all batches until full taxonomy verification

**Item 9.1 信息安全基础知识**:
- **Status**: DEFERRED (not in this batch)
- **Risk Level**: medium
- **Risk Description**: Suspected internal multi-card topic, boundary unclear
- **Mitigation**: Deferred until boundary verification complete

### 6.2 Risk Mitigation Context

- Batch size limited to 1 item (minimal expansion)
- Selected item has lowest risk profile among candidates
- All high-risk items excluded
- Structural preconditions validated in Phase 6.3
- No execution will occur until separate execution approval (Phase 6.5+)

### 6.3 Overall Risk Assessment

**Risk Level**: **LOW to MEDIUM**  
**Recommendation**: Approval is **structurally justified** based on Phase 6.3 readiness assessment.

---

## 7. Approval Decision Fields

### 7.1 Human Decision Required

The human reviewer must make ONE of the following decisions:

**Option 1: APPROVE ACTIVATION**
- Decision: `approve_activation`
- Effect: Batch may proceed to activation in Phase 6.5+
- Gates to be opened in Phase 6.5: `phase6_1_entry_allowed`, `activation_allowed`
- Next step: Phase 6.5 Batch Activation Decision (applies approved gate changes)

**Option 2: REJECT ACTIVATION**
- Decision: `reject_activation`
- Effect: Batch remains in `activation_candidate` status, gates remain closed
- Reason: Human judgment that activation should not proceed
- Next step: No further phases; batch remains dormant

**Option 3: DEFER DECISION**
- Decision: `defer_decision`
- Effect: Request remains in `pending_human_review` status
- Reason: More information needed before decision
- Next step: Human reviewer may request additional analysis

**Option 4: REQUEST MODIFICATION**
- Decision: `request_modification`
- Effect: Batch selection may be revised
- Reason: Human judgment that different items should be selected
- Next step: Return to Phase 6.1 batch selection

### 7.2 Decision Recording

The human decision will be recorded in a separate manifest (Phase 6.5+) with:
- `approval_decision`: one of the above options
- `approval_timestamp`: ISO 8601 datetime
- `approver_identity`: (optional) human reviewer identifier
- `approval_rationale`: (optional) free-text explanation

**Phase 6.4 does NOT record the decision.** It only prepares the request.

---

## 8. What This Phase Does NOT Do

Phase 6.4 is **request preparation only**. It explicitly does NOT:

- ❌ Approve activation (human decision required)
- ❌ Open `phase6_1_entry_allowed` gate
- ❌ Open `activation_allowed` gate
- ❌ Open `batch_executable` gate
- ❌ Set `execution_allowed=true`
- ❌ Run crawler
- ❌ Run renderer
- ❌ Make web requests
- ❌ Modify source layer
- ❌ Generate AI learning content
- ❌ Execute the batch
- ❌ Capture assets
- ❌ Create raw snapshots
- ❌ Create intermediate JSON

**All gates remain closed. All execution systems remain inactive.**

---

## 9. Validation Requirements

### 9.1 Must Pass

Scripts that **must pass** after Phase 6.4:
- `pnpm validate:controlled-source-expansion-plan`
- `pnpm validate:source-packets`
- `pnpm validate:dual-layer-contract`
- `pnpm validate:batch-selection-manifest`
- `pnpm validate:gate-recheck-manifest`
- `pnpm validate:activation-readiness-preflight`
- `pnpm validate:batch-activation-human-approval-request` ✅ (new)

### 9.2 Must Not Trigger

Systems that **must NOT be triggered** in Phase 6.4:
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

## 10. Validator Failure Conditions

The `validate:batch-activation-human-approval-request` script will exit with error if:

- `approval_status` is not `pending_human_review`
- `batch_id` is not `phase6_1_batch_001`
- `selected_items` is not `["1.3"]`
- `requested_decision` is not `approve_activation`
- `phase6_1_entry_allowed` is `true` (gate must remain closed)
- `activation_allowed` is `true` (gate must remain closed)
- `batch_executable` is `true` (gate must remain closed)
- `execution_allowed` is `true` for any item
- `crawler_allowed` is `true`
- `renderer_allowed` is `true`
- `recovery_allowed` is `true`
- `web_requests_allowed` is `true`
- `ai_learning_generation_allowed` is `true`
- `"13.3"` appears in `selected_items`
- `"13.3"` is not quarantined
- `"9.1"` is not deferred
- Approval request claims execution is approved
- Approval request claims expansion has occurred

---

## 11. Manifest File Location

Machine-readable manifest:

```
data/manifests/phase6_4_batch_activation_human_approval_request.json
```

Schema:

```
schemas/ruankaodaren-batch-activation-human-approval-request.schema.json
```

TypeScript types:

```
packages/domain-types/ruankaodaren-batch-activation-human-approval-request.ts
```

Validator script:

```
scripts/validate-ruankaodaren-batch-activation-human-approval-request.ts
```

---

## 12. Forbidden Actions

The following remain forbidden in Phase 6.4:

- Run crawler
- Run renderer
- Run recovery
- Make web requests
- Modify Source Layer
- Generate AI learning content
- Capture assets
- Create raw snapshots
- Create intermediate JSON
- Execute the selected batch
- Set `phase6_1_entry_allowed` to `true`
- Set `activation_allowed` to `true`
- Set `batch_executable` to `true`
- Set `execution_allowed` to `true`
- Approve activation (human decision required)
- Apply requested gate changes (requires Phase 6.5+)
- Add item 13.3 to any expansion batch
- Pop / apply / drop stash@{0}
- Enter Phase 4.6
- Enter Phase 5.11

---

## 13. Phase Progression Path

**Current Phase**: Phase 6.4 (Batch Activation Human Approval Request)  
**Approval Status**: `pending_human_review` (awaiting human decision)

**Potential Next Phases** (depends on human decision):

### If Approved:
1. **Phase 6.5**: Batch Activation Decision
   - Apply approved gate changes: `phase6_1_entry_allowed=true`, `activation_allowed=true`
   - Mark batch as `activation_approved`
   - Batch remains non-executable (batch_executable=false)

2. **Phase 6.6**: Batch Execution Preparation (future)
   - Final pre-execution checks
   - May set `batch_executable=true` if all checks pass

3. **Phase 6.7**: Controlled Expansion Execution (future)
   - Run crawler for item 1.3 only
   - Capture source artifacts

### If Rejected:
- Batch remains in `activation_candidate` status
- All gates remain closed
- No further phases executed

### If Deferred:
- Request remains in `pending_human_review` status
- Human may request additional analysis
- May return to this phase later

### If Modification Requested:
- Return to Phase 6.1 batch selection
- Revise selected items based on human feedback

**Phase 6.4 scope ends here. Human decision required to proceed.**

---

## 14. Summary

Phase 6.4 Batch Activation Human Approval Request:
- ✅ Created structured approval request package
- ✅ Documented batch, risks, and readiness assessment
- ✅ Specified requested gate changes (if approved)
- ✅ Explicitly documented what is NOT requested
- ✅ Set approval_status: **pending_human_review**
- ✅ All gates remain: **CLOSED**
- ✅ No operations: **EXECUTED**

The approval request for batch `phase6_1_batch_001` with item 1.3 is ready for human review. No activation has occurred. All execution gates remain closed.
