# Phase 6.3 Batch Activation Readiness Preflight

## 1. Phase Boundary

```
phase: "6.3"
name: "batch_activation_readiness_preflight"
scope: "structural_eligibility_assessment_only"

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
```

Phase 6.3 performs a **structural readiness preflight** for batch activation eligibility.

This phase:
- Assesses whether phase6_1_batch_001 meets structural preconditions for activation
- Validates that all prerequisite gates are satisfied (or explicitly documented as pending)
- Marks the batch as `activation_candidate` if eligible
- **Does NOT activate the batch**
- **Does NOT execute any expansion operations**
- **Does NOT open execution gates**

---

## 2. Inherited Phase Context

Phase 6.3 inherits from:
- Phase 6.0: controlled source expansion plan
- Phase 6.1: dormant batch selection manifest
- Phase 6.2: gate recheck and taxonomy quarantine

### Current State from Phase 6.2

| Gate / Status | Value |
|---|---|
| `expansion_blocked_until_recheck` | `false` ✅ |
| `taxonomy_suspect_13_3` | `false` ✅ |
| `taxonomy_suspect_13_3_quarantined` | `true` |
| `phase6_1_entry_allowed` | `false` ⚠️ |
| `activation_allowed` | `false` ⚠️ |
| `batch_executable` | `false` ⚠️ |
| `selected_batch_id` | `phase6_1_batch_001` |
| `selected_items` | `["1.3"]` |
| `deferred_items` | `["9.1"]` |
| `quarantined_items` | `["13.3"]` |

---

## 3. Preflight Scope

### 3.1 Preflight Objectives

1. **Structural Assessment**: Determine if batch structure meets activation preconditions
2. **Gate Inventory**: Document which gates are satisfied vs. pending
3. **Risk Evaluation**: Assess whether selected items have acceptable risk profiles
4. **Readiness Decision**: Mark batch as `activation_candidate` if structurally eligible
5. **Approval Requirements**: Document remaining human approval requirements

### 3.2 Scope Boundaries

Phase 6.3 is **read-only and assessment-only**:
- ✅ May read existing Phase 6.0, 6.1, 6.2 manifests
- ✅ May read existing source packets
- ✅ May validate batch structural integrity
- ✅ May assess readiness criteria
- ✅ May write readiness preflight manifest
- ❌ Must NOT run crawler
- ❌ Must NOT run renderer
- ❌ Must NOT make web requests
- ❌ Must NOT modify source layer
- ❌ Must NOT generate AI learning content
- ❌ Must NOT execute the batch
- ❌ Must NOT set `batch_executable=true`
- ❌ Must NOT set `activation_allowed=true`
- ❌ Must NOT open any execution gates

---

## 4. Batch Structural Assessment

### 4.1 Batch Identity

**Batch ID**: `phase6_1_batch_001`  
**Selected Items**: `["1.3"]`  
**Item 1.3**: 指令系统CISC和RISC

### 4.2 Structural Preconditions

| Precondition | Status | Evidence |
|---|---|---|
| Batch size within bounds (1-5) | ✅ PASS | Size = 1 |
| No quarantined items in selection | ✅ PASS | 13.3 is quarantined and not selected |
| No taxonomy suspect items in selection | ✅ PASS | 13.3 resolved via quarantine |
| Selected items exist in baseline | ✅ PASS | 1.3 is part of baseline capture |
| Source packets exist for selected items | ✅ PASS | Source packets validated |
| Risk level acceptable | ✅ PASS | 1.3 has risk_level=low |
| Known issues manageable | ✅ PASS | 1.3 has MIXED_TEXT_IMAGE (manageable) |

**Structural Assessment Result**: ✅ **PASS**

All structural preconditions are satisfied. The batch is structurally sound.

### 4.3 Item Risk Profile

**Item 1.3 指令系统CISC和RISC**:
- Risk level: **low**
- Known issue: `MIXED_TEXT_IMAGE`
- Issue severity: manageable
- Expansion surface: leaf item, minimal expansion expected
- Boundary ambiguity: low
- Structural ambiguity: low

**Risk Assessment**: ✅ **ACCEPTABLE**

---

## 5. Gate Inventory

### 5.1 Satisfied Gates

| Gate | Status | Resolved By |
|---|---|---|
| `expansion_blocked_until_recheck` | false ✅ | Phase 6.2 |
| `taxonomy_suspect_13_3` | false ✅ | Phase 6.2 |
| Batch size within bounds | ✅ | Phase 6.1 |
| No quarantined items selected | ✅ | Phase 6.1, 6.2 |
| Source packet validation | ✅ | Baseline capture |
| Structural integrity | ✅ | Phase 6.3 assessment |

### 5.2 Pending Gates (not yet satisfied)

| Gate | Status | Requirement |
|---|---|---|
| `phase6_1_entry_allowed` | false ⚠️ | Requires human approval (Phase 6.4+) |
| `activation_allowed` | false ⚠️ | Requires explicit activation decision (Phase 6.4+) |
| `batch_executable` | false ⚠️ | Requires full approval chain (Phase 6.5+) |

**Gate Inventory Result**: 6 of 9 gates satisfied, 3 pending human approval.

---

## 6. Readiness Decision

### 6.1 Decision Logic

**Structural Eligibility**: ✅ PASS  
**Risk Profile**: ✅ ACCEPTABLE  
**Gate Inventory**: 6/9 satisfied (3 pending approval)

**Decision**: The batch is **structurally ready** to become an activation candidate.

**Readiness Status**: `activation_candidate`

### 6.2 Interpretation

- The batch has **passed all structural and technical preconditions**
- The batch is **eligible for activation** pending human approval
- The batch **remains non-executable** until approval gates are opened
- The batch **requires formal human review** before activation
- The batch **will not execute** until `batch_executable=true`

### 6.3 What "activation_candidate" Means

**activation_candidate** is a structural status, not an execution status:
- ✅ Batch structure is valid
- ✅ Batch items are technically ready
- ✅ Batch has passed automated precondition checks
- ❌ Batch is NOT activated (activation_allowed=false)
- ❌ Batch is NOT executable (batch_executable=false)
- ❌ Batch will NOT run without explicit approval

**Next step**: Human review and approval (Phase 6.4+)

---

## 7. Updated Batch Status

### 7.1 Batch Metadata

```
batch_id:         phase6_1_batch_001
readiness_status: activation_candidate
batch_executable: false
activation_allowed: false
```

| Item ID | Title | execution_allowed | readiness_status |
|---|---|---|---|
| 1.3 | 指令系统CISC和RISC | `false` | `ready_pending_approval` |

### 7.2 Item Status Summary

| Item ID | Title | Status | Readiness |
|---|---|---|---|
| 1.3 | 指令系统CISC和RISC | `proposed_primary` | `ready_pending_approval` |
| 9.1 | 信息安全基础知识 | `deferred_candidate` | `not_assessed` |
| 13.3 | 软件架构风格 | `quarantined` | `ineligible` |

---

## 8. Remaining Approval Requirements

Even after Phase 6.3 preflight marks the batch as `activation_candidate`, the batch remains **non-executable** until:

1. ❌ **Human Review Gate**: Formal human review must approve the batch for activation
2. ❌ **Entry Gate**: `phase6_1_entry_allowed` must be set to `true`
3. ❌ **Activation Gate**: `activation_allowed` must be set to `true`
4. ❌ **Execution Gate**: `batch_executable` must be set to `true` (final step before execution)

**Status**: 0 of 4 approval gates satisfied.

**Phase 6.3 scope ends here.** Approval is outside this phase.

---

## 9. Validation Requirements

### 9.1 Must Pass

Scripts that **must pass** after Phase 6.3:
- `pnpm validate:controlled-source-expansion-plan`
- `pnpm validate:source-packets`
- `pnpm validate:dual-layer-contract`
- `pnpm validate:batch-selection-manifest`
- `pnpm validate:gate-recheck-manifest`
- `pnpm validate:activation-readiness-preflight` ✅ (new)

### 9.2 Must Not Trigger

Systems that **must NOT be triggered** in Phase 6.3:
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

The `validate:activation-readiness-preflight` script will exit with error if:

- `selected_items` is not `["1.3"]`
- `batch_id` is not `phase6_1_batch_001`
- `readiness_status` is not `activation_candidate`
- `batch_executable` is `true`
- `activation_allowed` is `true`
- `execution_allowed` is `true` for any item
- `crawler_allowed` is `true`
- `renderer_allowed` is `true`
- `recovery_allowed` is `true`
- `web_requests_allowed` is `true`
- `ai_learning_generation_allowed` is `true`
- `taxonomy_suspect_13_3_quarantined` is not `true`
- `"13.3"` appears in `selected_items`
- `"13.3"` is not in `quarantined_items`
- `"9.1"` is not in `deferred_items`
- Any source layer mutation is declared
- Any AI learning generation is declared

---

## 11. Manifest File Location

Machine-readable manifest:

```
data/manifests/phase6_3_activation_readiness_preflight_manifest.json
```

Schema:

```
schemas/ruankaodaren-activation-readiness-preflight.schema.json
```

TypeScript types:

```
packages/domain-types/ruankaodaren-activation-readiness-preflight.ts
```

Validator script:

```
scripts/validate-ruankaodaren-activation-readiness-preflight.ts
```

---

## 12. Forbidden Actions

The following remain forbidden in Phase 6.3:

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
- Set `batch_executable` to `true`
- Set `activation_allowed` to `true`
- Set `execution_allowed` to `true`
- Add item 13.3 to any expansion batch
- Pop / apply / drop stash@{0}
- Enter Phase 4.6
- Enter Phase 5.11

---

## 13. Phase Progression Path

**Current Phase**: Phase 6.3 (Batch Activation Readiness Preflight)  
**Batch Status**: `activation_candidate` (structurally ready, pending approval)

**Potential Next Phases** (NOT executed in Phase 6.3):
1. **Phase 6.4**: Human Review Approval Gate
   - Human reviewer formally approves or rejects the batch
   - If approved, may set `phase6_1_entry_allowed=true`
2. **Phase 6.5**: Activation Decision
   - If approved, set `activation_allowed=true`
   - Mark batch as `activated` (but still not executable)
3. **Phase 6.6**: Batch Execution Preparation
   - Final pre-execution checks
   - Set `batch_executable=true` if all checks pass
4. **Phase 6.7**: Controlled Expansion Execution
   - Run crawler for item 1.3 only
   - Capture source artifacts under controlled conditions
   - Validate results

**Phase 6.3 scope ends here.**

---

## 14. Summary

Phase 6.3 Batch Activation Readiness Preflight:
- ✅ Assessed batch structural integrity: **PASS**
- ✅ Evaluated risk profile: **ACCEPTABLE**
- ✅ Inventoried gate status: **6/9 satisfied**
- ✅ Marked batch as: **activation_candidate**
- ✅ All execution gates remain: **CLOSED**
- ✅ No expansion operations: **EXECUTED**

The batch `phase6_1_batch_001` with item 1.3 is structurally ready to become an activation candidate, pending human approval.
