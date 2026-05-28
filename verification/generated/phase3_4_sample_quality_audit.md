# Phase 3.4 Sample Quality Audit

Generated at: 2026-05-28T05:27:03.277Z

## Summary

| Metric | Value |
|---|---:|
| Sample count | 15 |
| leaf_knowledge_point | 13 |
| chapter_overview | 2 |
| mixed | 0 |
| unknown | 0 |
| ready | 0 |
| ready_with_asset_refs | 1 |
| not_ready | 14 |
| quarantined | 13 |
| renderer eligible leaf | 1 |
| constraint violations | 0 |

## Overall Gate

- **phase4_renderer_allowed**: true
- **reason**: Renderer design gate passed (Phase 3.23 baseline manifest): sufficient unique titles.
- **required_before_phase4**:

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
| 2026-05-27T14-34-52-493Z | 3.3 数据库的设计 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 64 | 0 | present | total text length < 80 and image_refs = 0; content body does not contain a meaningful title signal; quarantine_reason = low_text |
| 2026-05-27T14-36-07-171Z | 5.1 网络概述和模型 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 44 | 0 | present | total text length < 80 and image_refs = 0; content body does not contain a meaningful title signal; quarantine_reason = low_text |
| 2026-05-27T14-37-21-375Z | 8.8 典型信息系统架构模型 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 128 | 0 | present | content body does not contain a meaningful title signal; quarantine_reason = target_body_mismatch |
| 2026-05-28T02-54-15-543Z | 13.3 软件架构风格 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 61 | 0 | present | total text length < 80 and image_refs = 0; content body does not contain a meaningful title signal; quarantine_reason = low_text |
| 2026-05-28T02-59-11-656Z | 13.3 软件架构风格 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 61 | 0 | present | total text length < 80 and image_refs = 0; content body does not contain a meaningful title signal; quarantine_reason = duplicate_same_title |
| 2026-05-28T03-03-37-856Z | 13.3 软件架构风格 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 61 | 0 | present | total text length < 80 and image_refs = 0; content body does not contain a meaningful title signal; quarantine_reason = duplicate_same_title |
| 2026-05-28T03-10-01-532Z | 13.3 软件架构风格 | leaf_knowledge_point | not_ready_quarantined | yes | target_scoped | 61 | 0 | present | total text length < 80 and image_refs = 0; content body does not contain a meaningful title signal; quarantine_reason = duplicate_same_title |
| 2026-05-28T05-25-27-891Z | 9.1 信息安全基础知识 | leaf_knowledge_point | not_ready_target_mismatch | no | target_scoped | 388 | 0 | missing | content body does not contain a meaningful title signal |

## Renderer Policies

- 2026-05-26T09-40-21-903Z: Renderer may preserve asset_ref links only; no OCR and no image-table reconstruction.

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 implementation was not entered.
