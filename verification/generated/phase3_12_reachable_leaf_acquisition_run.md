# Phase 3.12 Reachable-leaf Acquisition Run

Generated at: 2026-05-27T08:15:00.766Z

## Summary

| Metric | Value |
|---|---|
| Attempted targets | 3 |
| Exact leaf targets | 3 |
| Preflight pass | 0 |
| Preflight fail | 0 |
| Semantic pass | 0 |
| Semantic fail | 0 |
| Renderer eligible added | 0 |
| Final renderer eligible count | 1 |
| Phase 4 renderer allowed | false |

## Target Results

| Target | Hint | Preflight | Parse | Semantic Audit | Asset Capture | Renderer Eligible | Reject Reason |
|---|---|---|---|---|---|---|---|
| phase312_database_design | 3.3 数据库的设计 | not_reached | not_reached | not_reached | not_reached | no | leaf_resolution_failed |
| phase312_network_overview_model | 5.1 网络概述和模型 | not_reached | not_reached | not_reached | not_reached | no | leaf_resolution_failed |
| phase312_typical_information_system_architecture | 8.8 典型信息系统架构模型 | not_reached | not_reached | not_reached | not_reached | no | leaf_resolution_failed |

## Renderer Eligible Added

- None added in this run.

## Rejected Targets

- phase312_database_design: leaf_resolution_failed
- phase312_network_overview_model: leaf_resolution_failed
- phase312_typical_information_system_architecture: leaf_resolution_failed

## Phase 4 Gate

- **phase4_renderer_allowed**: false
- **required_before_phase4**:
  - acquire 2 more renderer-eligible non-quarantined leaf-level sample(s) (have 1/3)
  - validate at least 3 unique renderer-ready leaf titles
  - improve target selection for chapter-level hints
  - avoid using chapter overview as renderer baseline

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
