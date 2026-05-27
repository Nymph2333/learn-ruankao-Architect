# Phase 3.9 Renderer Baseline Acquisition Run

Generated at: 2026-05-27T08:15:00.764Z

## Summary

| Metric | Value |
|---|---|
| Attempted targets | 3 |
| Preflight pass | 0 |
| Preflight fail | 0 |
| Target resolution trusted | 0 |
| Target resolution failed | 3 |
| Exact leaf match | 0 |
| Renderer eligible added | 0 |
| Final renderer eligible count | 1 |
| Phase 4 renderer allowed | false |

## Per-Target Results

| Target | Hint | Preflight | Trusted | Exact leaf | Semantic Audit | Renderer Eligible | Reject Reason |
|---|---|---|---|---|---|---|---|
| phase312_database_design | 3.3 数据库的设计 | not_reached | no | no | fail_not_renderer_eligible | no | leaf_resolution_failed |
| phase312_network_overview_model | 5.1 网络概述和模型 | not_reached | no | no | fail_not_renderer_eligible | no | leaf_resolution_failed |
| phase312_typical_information_system_architecture | 8.8 典型信息系统架构模型 | not_reached | no | no | fail_not_renderer_eligible | no | leaf_resolution_failed |

## Renderer Eligible Added

- None added in this run.

## Rejected by Preflight

- None.

## Rejected by Semantic Audit

- None.

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
