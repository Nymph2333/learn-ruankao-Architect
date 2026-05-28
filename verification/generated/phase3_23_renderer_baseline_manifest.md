# Phase 3.23 Renderer Baseline Manifest

Generated at: 2026-05-28T05:27:02.593Z

## Policy

| Policy | Value |
|---|---|
| Unit | unique_title |
| Duplicates count once | true |
| Quarantined excluded | true |
| Diagnostic excluded | true |
| Min unique titles for Phase 4 | 3 |

## Summary

| Metric | Value |
|---|---:|
| baseline_count | 3 |
| unique_title_count | 3 |
| phase4_input_contract_ready | true |
| excluded_items | 12 |

## Phase 4 Gate

- **ready**: true

## Baseline Items

### 1.3 指令系统CISC和RISC

- **Canonical sample**: `data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json`
- **Timestamp**: 2026-05-26T09-40-21-903Z
- **Content shape**: MIXED_TEXT_IMAGE
- **Readiness class**: renderer_ready_with_asset_refs
- **Render as**: asset_card
- **Preserve asset refs**: true
- **Allow Markdown generation later**: true
- **Manual review required**: true
- **Asset manifest**: sources/ruankaodaren/raw/assets/manifests/2026-05-26T09-40-21-903Z.json
- **Notes**:
  - asset refs must be preserved as links
  - no OCR on image content
  - no image table reconstruction

### 13.3 软件架构风格

- **Canonical sample**: `data/intermediate/ruankaodaren/samples/2026-05-28T02-54-15-543Z.json`
- **Timestamp**: 2026-05-28T02-54-15-543Z
- **Content shape**: STATIC_LOW_TEXT_VERIFIED
- **Readiness class**: renderer_ready_short_card
- **Render as**: short_card
- **Preserve asset refs**: false
- **Allow Markdown generation later**: true
- **Manual review required**: true
- **Asset manifest**: sources/ruankaodaren/raw/assets/manifests/2026-05-28T02-54-15-543Z.json
- **Duplicate samples** (3):
  - `data/intermediate/ruankaodaren/samples/2026-05-28T02-59-11-656Z.json`
  - `data/intermediate/ruankaodaren/samples/2026-05-28T03-03-37-856Z.json`
  - `data/intermediate/ruankaodaren/samples/2026-05-28T03-10-01-532Z.json`
- **Notes**:
  - content is genuinely short — do not inflate or pad
  - Phase 3.20 discovery confirmed static_low_text pattern
  - manual human review recommended before publishing

### 9.1 信息安全基础知识

- **Canonical sample**: `data/intermediate/ruankaodaren/samples/2026-05-28T05-25-27-891Z.json`
- **Timestamp**: 2026-05-28T05-25-27-891Z
- **Content shape**: HTML_RICH_TEXT
- **Readiness class**: renderer_ready_text
- **Render as**: concept_card
- **Preserve asset refs**: false
- **Allow Markdown generation later**: true
- **Manual review required**: true
- **Asset manifest**: (none)
- **Notes**:
  - standard concept card rendering
  - do not rewrite exam content

## Excluded Items

| Title | Path | Reason |
|---|---|---|
| 13.3 软件架构风格 | `data/intermediate/ruankaodaren/samples/2026-05-28T02-59-11-656Z.json` | duplicate_same_title |
| 13.3 软件架构风格 | `data/intermediate/ruankaodaren/samples/2026-05-28T03-03-37-856Z.json` | duplicate_same_title |
| 13.3 软件架构风格 | `data/intermediate/ruankaodaren/samples/2026-05-28T03-10-01-532Z.json` | duplicate_same_title |
| 第3章 数据库系统 | `data/intermediate/ruankaodaren/samples/2026-05-27T01-32-02-914Z.json` | diagnostic |
| 第5章 计算机网络 | `data/intermediate/ruankaodaren/samples/2026-05-27T01-32-47-268Z.json` | diagnostic |
| 3.1 数据库系统常识 | `data/intermediate/ruankaodaren/samples/2026-05-27T02-17-40-989Z.json` | low_text |
| 1.3 指令系统CISC和RISC | `data/intermediate/ruankaodaren/samples/2026-05-27T02-34-55-788Z.json` | target_mismatch |
| 1.5 存储系统 | `data/intermediate/ruankaodaren/samples/2026-05-27T02-35-30-393Z.json` | target_mismatch |
| 1.4 指令的流水处理 | `data/intermediate/ruankaodaren/samples/2026-05-27T02-36-04-460Z.json` | target_mismatch |
| 3.3 数据库的设计 | `data/intermediate/ruankaodaren/samples/2026-05-27T14-34-52-493Z.json` | low_text |
| 5.1 网络概述和模型 | `data/intermediate/ruankaodaren/samples/2026-05-27T14-36-07-171Z.json` | low_text |
| 8.8 典型信息系统架构模型 | `data/intermediate/ruankaodaren/samples/2026-05-27T14-37-21-375Z.json` | target_mismatch |
