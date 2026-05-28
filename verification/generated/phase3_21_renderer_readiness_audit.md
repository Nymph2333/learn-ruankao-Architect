# Phase 3.21 Renderer Readiness Audit

Generated at: 2026-05-28T05:40:43.729Z

## Summary

| Metric | Value |
|---|---:|
| total_evaluated | 15 |
| static_low_text_verified | 4 |
| eligible_for_phase4_baseline | 6 |
| phase4_gate_allowed | true |

## Content Shape Distribution

| Shape | Count |
|---|---:|
| MIXED_TEXT_IMAGE | 1 |
| DIAGNOSTIC_ONLY | 2 |
| SHORT_TEXT_CARD | 3 |
| TARGET_MISMATCH | 4 |
| STATIC_LOW_TEXT_VERIFIED | 4 |
| HTML_RICH_TEXT | 1 |

## Readiness Class Distribution

| Readiness Class | Count |
|---|---:|
| renderer_ready_with_asset_refs | 1 |
| not_ready_quarantined | 9 |
| renderer_ready_short_card | 4 |
| renderer_ready_text | 1 |

## Phase 4 Gate

- **allowed**: true
- **reason**: Phase 4 renderer design gate passed: sufficient eligible samples with renderer policies.
- **required**:
  - (none)

## Eligible Titles

- 1.3 指令系统CISC和RISC
- 13.3 软件架构风格
- 13.3 软件架构风格
- 13.3 软件架构风格
- 13.3 软件架构风格
- 9.1 信息安全基础知识

## Item Details

| Title | Shape | Readiness | Text | imgs | Discovery | Eligible |
|---|---|---|---:|---:|---|---|
| 1.3 指令系统CISC和RISC | MIXED_TEXT_IMAGE | renderer_ready_with_asset_refs | 92 | 1 | - | true |
| 第3章 数据库系统 | DIAGNOSTIC_ONLY | not_ready_quarantined | 106 | 0 | - | false |
| 第5章 计算机网络 | DIAGNOSTIC_ONLY | not_ready_quarantined | 106 | 0 | - | false |
| 3.1 数据库系统常识 | SHORT_TEXT_CARD | not_ready_quarantined | 12 | 0 | - | false |
| 1.3 指令系统CISC和RISC | TARGET_MISMATCH | not_ready_quarantined | 92 | 1 | - | false |
| 1.5 存储系统 | TARGET_MISMATCH | not_ready_quarantined | 106 | 0 | - | false |
| 1.4 指令的流水处理 | TARGET_MISMATCH | not_ready_quarantined | 106 | 0 | - | false |
| 3.3 数据库的设计 | SHORT_TEXT_CARD | not_ready_quarantined | 64 | 0 | - | false |
| 5.1 网络概述和模型 | SHORT_TEXT_CARD | not_ready_quarantined | 44 | 0 | - | false |
| 8.8 典型信息系统架构模型 | TARGET_MISMATCH | not_ready_quarantined | 128 | 0 | - | false |
| 13.3 软件架构风格 | STATIC_LOW_TEXT_VERIFIED | renderer_ready_short_card | 61 | 0 | static_low_text | true |
| 13.3 软件架构风格 | STATIC_LOW_TEXT_VERIFIED | renderer_ready_short_card | 61 | 0 | static_low_text | true |
| 13.3 软件架构风格 | STATIC_LOW_TEXT_VERIFIED | renderer_ready_short_card | 61 | 0 | static_low_text | true |
| 13.3 软件架构风格 | STATIC_LOW_TEXT_VERIFIED | renderer_ready_short_card | 61 | 0 | static_low_text | true |
| 9.1 信息安全基础知识 | HTML_RICH_TEXT | renderer_ready_text | 388 | 0 | alternate_container_found | true |

## Constraints

- No OCR used.
- No encrypt=1 decrypted.
- No Markdown knowledge docs generated.
- No image tables reconstructed.
- No samples generated.
- No Phase 4 implementation entered.
