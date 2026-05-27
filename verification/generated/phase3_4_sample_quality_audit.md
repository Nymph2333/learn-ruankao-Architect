# Phase 3.4 Sample Quality Audit

Generated at: 2026-05-27T08:15:09.770Z

## Summary

| Metric | Value |
|---|---:|
| Sample count | 7 |
| leaf_knowledge_point | 5 |
| chapter_overview | 2 |
| mixed | 0 |
| unknown | 0 |
| ready | 0 |
| ready_with_asset_refs | 1 |
| not_ready | 6 |
| quarantined | 6 |
| renderer eligible leaf | 1 |
| constraint violations | 0 |

## Overall Gate

- **phase4_renderer_allowed**: false
- **reason**: Renderer design gate blocked because controlled samples do not yet provide enough leaf-level renderer baselines.
- **required_before_phase4**:
  - acquire 2 more renderer-eligible non-quarantined leaf-level sample(s) (have 1/3)
  - validate at least 3 unique renderer-ready leaf titles
  - improve target selection for chapter-level hints
  - avoid using chapter overview as renderer baseline

## Sample Audits

| Timestamp | Title | Shape | Readiness | Quarantined | Strategy | Text length | image_refs | Asset manifest | Risks |
|---|---|---|---|---|---|---:|---:|---|---|
| 2026-05-26T09-40-21-903Z | 1.3 指令系统CISC和RISC | leaf_knowledge_point | ready_with_asset_refs | no | target_scoped | 92 | 1 | present |  |
| 2026-05-27T01-32-02-914Z | 第3章 数据库系统 | chapter_overview | not_ready_quarantined | yes | target_scoped | 106 | 0 | present | chapter-level title should not be treated as a leaf knowledge point; quarantine_reason = duplicate_actual_content |
| 2026-05-27T01-32-47-268Z | 第5章 计算机网络 | chapter_overview | not_ready_quarantined | yes | target_scoped | 106 | 0 | present | chapter-level title should not be treated as a leaf knowledge point; quarantine_reason = duplicate_actual_content |
| 2026-05-27T02-17-40-989Z | 3.1 数据库系统常识 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 12 | 0 | present | total text length < 80 and image_refs = 0; quarantine_reason = low_text |
| 2026-05-27T02-34-55-788Z | 1.3 指令系统CISC和RISC | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 92 | 1 | present | quarantine_reason = target_body_mismatch |
| 2026-05-27T02-35-30-393Z | 1.5 存储系统 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 106 | 0 | present | content body does not contain a meaningful title signal; quarantine_reason = target_body_mismatch |
| 2026-05-27T02-36-04-460Z | 1.4 指令的流水处理 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 106 | 0 | present | content body does not contain a meaningful title signal; quarantine_reason = target_body_mismatch |

## Renderer Policies

- 2026-05-26T09-40-21-903Z: Renderer may preserve asset_ref links only; no OCR and no image-table reconstruction.

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 implementation was not entered.
