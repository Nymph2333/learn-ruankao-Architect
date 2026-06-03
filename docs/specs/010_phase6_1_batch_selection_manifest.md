# Phase 6.1 Batch Selection Manifest

## 1. Phase Boundary

```
phase: "6.1"
name: "batch_selection_manifest"
scope: "controlled_source_expansion_batch_selection_only"

execution_allowed: false
crawler_allowed: false
renderer_allowed: false
recovery_allowed: false
web_requests_allowed: false
source_layer_modification_allowed: false
ai_learning_generation_allowed: false

phase6_1_entry_allowed: false
activation_allowed: false
```

Phase 6.1 defines a **dormant / inactive** batch selection manifest only.
It does not activate expansion execution.
All gates inherited from Phase 6.0 remain blocked.

---

## 2. Inherited Phase 6.0 Gates (all remain closed)

| Gate | Value |
|---|---|
| `phase6_1_entry_allowed` | `false` |
| `expansion_blocked_until_recheck` | `true` |
| `taxonomy_suspect_13_3` | `true` |
| `execution_allowed` | `false` |
| `crawler_allowed` | `false` |
| `renderer_allowed` | `false` |
| `ai_learning_generation_allowed` | `false` |

---

## 3. Candidate Items — Risk Ranking

| Item ID | Title | Status | Risk | Proposed for First Batch |
|---|---|---|---|---|
| 1.3 | 指令系统CISC和RISC | `proposed_primary` | low | yes |
| 9.1 | 信息安全基础知识 | `deferred_candidate` | medium | no |
| 13.3 | 软件架构风格 | `blocked` | high | no |

### Selection Logic

**1.3 指令系统CISC和RISC** — Proposed Primary
- Leaf item with minimal expansion surface
- Known issue: `MIXED_TEXT_IMAGE` (manageable)
- Lowest structural ambiguity among the three baseline items
- Suitable as first controlled expansion candidate after gates are reopened
- `selection_allowed_now: false` — proposed only, not executable

**9.1 信息安全基础知识** — Deferred
- Suspected internal multi-card topic
- Boundary verification not yet complete
- Defer until structural boundary is confirmed

**13.3 软件架构风格** — Blocked
- `taxonomy_suspect_13_3: true`
- Must not enter any batch before taxonomy recheck is resolved
- Highest expansion risk

---

## 4. Proposed First Batch

```
batch_id: phase6_1_batch_001
status:   proposed_inactive
```

| Item ID | Title | execution_allowed |
|---|---|---|
| 1.3 | 指令系统CISC和RISC | `false` |

Selection reason: Smallest controllable expansion surface; lowest structural ambiguity among the three baseline items.

---

## 5. Final Decision

```
batch_selected:     true
batch_executable:   false
selected_batch_id:  phase6_1_batch_001
selected_items:     ["1.3"]
blocked_items:      ["13.3"]
deferred_items:     ["9.1"]
```

The batch is **selected as a proposal** but remains **non-executable** until activation conditions are met.

---

## 6. Activation Conditions

The proposed batch may only be activated (moved to executable) when ALL of the following are satisfied:

1. `phase6_1_entry_allowed` must be `true`
2. `expansion_blocked_until_recheck` must be `false`
3. `taxonomy_suspect_13_3` must be resolved or explicitly quarantined
4. Human review gate must approve controlled expansion
5. Source packet validation must pass
6. Batch size must remain between 1 and 5
7. No crawler or renderer may run during manifest validation

---

## 7. Validation Requirements

Scripts that **must pass** before this manifest may be considered:

- `pnpm validate:controlled-source-expansion-plan`
- `pnpm validate:source-packets`
- `pnpm validate:dual-layer-contract`
- `pnpm validate:batch-selection-manifest`

Scripts / systems that **must not be triggered**:

- `crawler`
- `renderer`
- `recovery`
- `web_requests`
- `ai_learning_generation`

---

## 8. Validator Failure Conditions

The `validate:batch-selection-manifest` script will exit with error if:

- `phase6_1_entry_allowed` is `true`
- `batch_executable` is `true`
- `activation_allowed` is `true`
- Item `13.3` appears in `selected_items`
- Batch size is outside min=1 and max=5
- Any candidate item has `selection_allowed_now: true`
- Any proposed batch item has `execution_allowed: true`
- `proposed_batch.status` is not `proposed_inactive`

---

## 9. Manifest File Location

Machine-readable manifest:

```
data/manifests/phase6_1_batch_selection_manifest.json
```

Schema:

```
schemas/ruankaodaren-batch-selection-manifest.schema.json
```

---

## 10. Forbidden Actions

The following remain forbidden in Phase 6.1:

- Run crawler
- Run renderer
- Run recovery
- Make web requests
- Modify Source Layer
- Generate AI learning content
- Capture assets
- Create raw snapshots
- Create intermediate JSON
- Activate Phase 6.1 execution
- Pop / apply / drop stash@{0}
- Enter Phase 4.6
- Enter Phase 5.11
