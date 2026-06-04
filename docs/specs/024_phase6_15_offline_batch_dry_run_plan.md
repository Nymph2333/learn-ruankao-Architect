# Phase 6.15 Offline Batch Dry-Run Plan

## 1. Background

Phase 6.14 recorded the human approval decision for the offline batch run command. The command was approved as metadata: `run_command_approved=true`, `command_status=approved`, `command_is_executable_now=true`, `command_has_been_executed=false`. The command placeholder was defined with `--batch phase6_1_batch_001 --items 1.3 --mode offline_existing_source_packet_only`. All operational gates remain closed. No execution occurred.

Phase 6.15 creates a precise dry-run plan for the approved offline batch run command. The plan defines what a future dry-run execution must verify, without executing the dry-run and without creating any output artifacts.

## 2. Objective

Create an offline batch dry-run plan that:

- References the approved command from Phase 6.14
- Defines dry-run scope limited to approved item 1.3
- Specifies dry-run intent: what the dry-run must verify in a later phase
- Includes a placeholder dry-run command (not added to package.json)
- Lists planned dry-run assertions
- Defines allowed future dry-run artifacts (all marked planned only)
- Defines forbidden Phase 6.15 artifacts
- Specifies rollback and audit conditions
- Includes no-go confirmation
- Does NOT execute the dry-run
- Does NOT create any output artifacts

## 3. Dry-Run Plan Reference

### 3.1 Prior Phase

| Field | Value |
|---|---|
| prior_decision_phase | 6.14 |
| prior_decision_manifest | phase6_14_offline_batch_run_command_approval_decision.json |
| prior_decision_status | offline_batch_run_command_approval_decision_recorded |

### 3.2 Plan Identity

| Field | Value |
|---|---|
| plan_phase | 6.15 |
| manifest_type | offline_batch_dry_run_plan |
| plan_status | planned_not_executed |
| dry_run_status | not_started |
| dry_run_executed | false |
| batch_run_executed | false |

## 4. Dry-Run Scope

### 4.1 Item Scope

| Item | Status | Dry-Run Eligible |
|---|---|---|
| 1.3 指令系统CISC和RISC | execution_approved | Yes |
| 9.1 信息安全基础知识 | deferred_candidate | No |
| 13.3 软件架构风格 | quarantined, ineligible | No |

### 4.2 Scope Constraints

- Only item 1.3 may be dry-run assessed
- 9.1 remains deferred
- 13.3 remains quarantined and ineligible
- No new item may be added
- No source layer mutation may occur
- No output artifact may be created in Phase 6.15

## 5. Dry-Run Intent

The dry-run is intended to verify, in a later phase:

- Approved command metadata is complete
- Item scope is exactly `["1.3"]`
- Existing source packet availability is sufficient
- No crawler/web/renderer/recovery dependency is required
- MIXED_TEXT_IMAGE handling rule is defined
- Future execution outputs can be isolated
- Rollback can be limited to run-scoped artifacts
- No Source Layer rollback is required

## 6. Planned Dry-Run Command Placeholder

The following command is a placeholder only. It is NOT added to `package.json` and is NOT executed in Phase 6.15:

```
pnpm run batch:offline:dry-run -- --batch phase6_1_batch_001 --items 1.3 --mode offline_existing_source_packet_only
```

### 6.1 Command Arguments

| Argument | Value | Description |
|---|---|---|
| --batch | phase6_1_batch_001 | Target batch identifier |
| --items | 1.3 | Comma-separated list of approved item IDs |
| --mode | offline_existing_source_packet_only | Execution mode constraint |

### 6.2 Command Constraints

- The command is a plan placeholder only
- No `batch:offline:dry-run` script exists in `package.json`
- The command must not be executed in Phase 6.15
- The command must not generate any output artifacts in Phase 6.15
- The command is executable only in a future dry-run execution phase

## 7. Planned Dry-Run Assertions

The following assertions are planned for future dry-run validation:

| # | Assertion | Expected |
|---|---|---|
| 1 | Prior phase chain 6.0 through 6.14 is complete | true |
| 2 | Run command is approved | true |
| 3 | Command has not been executed | true |
| 4 | Dry-run has not been executed | true |
| 5 | Batch run has not been executed | true |
| 6 | Operational gates remain closed | true |
| 7 | Approved items exactly equals `["1.3"]` | true |
| 8 | 13.3 is excluded | true |
| 9 | 9.1 remains deferred | true |
| 10 | No forbidden input is used | true |
| 11 | No forbidden output is produced | true |

## 8. Allowed Future Dry-Run Artifacts

The following artifacts are planned only, not created in Phase 6.15:

| Artifact | Purpose | Created When | Status |
|---|---|---|---|
| dry-run record | Records dry-run execution metadata | During future dry-run | planned |
| dry-run audit log | Records step-by-step dry-run trace | During future dry-run | planned |
| dry-run item scope report | Records per-item dry-run scope | During future dry-run | planned |
| dry-run validation report | Validates dry-run invariants | After future dry-run | planned |

## 9. Forbidden Phase 6.15 Artifacts

Phase 6.15 must NOT create any of these artifacts:

- actual dry-run record
- actual dry-run result
- actual controlled batch run record
- actual item-level execution result
- actual post-run validation report
- raw snapshots
- intermediate JSON
- rendered outputs
- crawler outputs
- recovery outputs
- web request results
- AI learning content
- source layer mutations
- captured assets

## 10. Rollback Boundary

- No rollback is required for Phase 6.15 because no dry-run occurs
- Future dry-run rollback must remove dry-run-scoped artifacts only
- Future dry-run must not require source layer rollback
- Future dry-run must not alter global state

## 11. Audit Boundary

### 11.1 Prior Phase Chain

The full prior phase chain from 6.0 through 6.14 must be complete.

### 11.2 Current State

| Field | Value |
|---|---|
| current_command_approval_status | approved |
| current_dry_run_status | not_started |
| current_dry_run_executed | false |
| current_batch_run_executed | false |
| current_plan_status | planned_not_executed |

### 11.3 Validation Commands

- `pnpm typecheck`
- `pnpm verify`
- `pnpm validate:offline-batch-dry-run-plan`

### 11.4 Commit Scope

Only Phase 6.15 offline batch dry-run plan files and related schema/type/validator/package script changes.

## 12. No-Go Confirmation

| # | Assertion | Value |
|---|---|---|
| 1 | No dry-run execution occurs | true |
| 2 | No batch execution occurs | true |
| 3 | No crawler runs | true |
| 4 | No renderer runs | true |
| 5 | No recovery runs | true |
| 6 | No web requests made | true |
| 7 | No source layer modified | true |
| 8 | No AI learning generated | true |
| 9 | No assets captured | true |
| 10 | No raw snapshots created | true |
| 11 | No intermediate JSON created | true |
| 12 | No package script added for dry-run | true |
| 13 | Crawler allowed remains false | true |
| 14 | Renderer allowed remains false | true |
| 15 | Recovery allowed remains false | true |
| 16 | Web requests allowed remains false | true |
| 17 | AI learning generation allowed remains false | true |
| 18 | No dry-run record created | true |
| 19 | No dry-run result created | true |

## 13. Operational Assertions

| # | Assertion | Value |
|---|---|---|
| 1 | Dry-run execution claimed | false |
| 2 | Batch execution claimed | false |
| 3 | Crawler output claimed | false |
| 4 | Renderer output claimed | false |
| 5 | Recovery output claimed | false |
| 6 | AI learning generation claimed | false |
| 7 | Source layer mutation declared | false |
| 8 | Web requests declared | false |
| 9 | Raw snapshots created | false |
| 10 | Intermediate JSON created | false |
| 11 | Assets captured | false |
