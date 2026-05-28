# Phase 3.2 Sample Coverage Report

Generated at: 2026-05-28T05:27:03.824Z

## Summary

| Metric | Value |
|--------|-------|
| Total samples | 15 |
| Requires manual review | 4 |
| With asset manifests | 14 |
| Without asset manifests | 1 |
| Asset manifest assets | 2 |
| Downloaded assets | 2 |
| Download failed assets | 0 |
| Skipped assets | 0 |
| Manual review assets | 2 |
| Quarantined samples | 13 |
| Renderer eligible samples | 2 |
| Preflight passed samples | 4 |
| Diagnostic samples | 21 |
| Duplicate actual content | 10 |
| Constraint violations | 0 |
| Phase 4 candidate status | candidate_ready |
| Missing renderer eligible | 1 |
| Total text_blocks | 53 |
| Total key_terms | 85 |
| Total image_refs | 2 |
| eligible_for_phase4_baseline | 6 |
| static_low_text_verified | 4 |
| renderer_baseline_manifest_exists | true |
| unique_renderer_baseline_count | 3 |
| duplicate_eligible_samples_excluded | 3 |
| phase4_input_contract_ready | true |

## Renderer Readiness Classes (Phase 3.21)

| Readiness Class | Count |
|---|---:|
| renderer_ready_with_asset_refs | 1 |
| not_ready_quarantined | 9 |
| renderer_ready_short_card | 4 |
| renderer_ready_text | 1 |

## Content Shape Distribution (Phase 3.21)

| Content Shape | Count |
|---|---:|
| MIXED_TEXT_IMAGE | 1 |
| DIAGNOSTIC_ONLY | 2 |
| SHORT_TEXT_CARD | 3 |
| TARGET_MISMATCH | 4 |
| STATIC_LOW_TEXT_VERIFIED | 4 |
| HTML_RICH_TEXT | 1 |

## Renderer Eligible Titles

- 1.3 指令系统CISC和RISC
- 9.1 信息安全基础知识

## Classification Distribution

| Classification | Count |
|----------------|-------|
| MIXED_TEXT_IMAGE | 2 |
| HTML_RICH_TEXT | 13 |

## Parser Confidence Distribution

| Confidence | Count |
|------------|-------|
| medium | 2 |
| high | 13 |

## Sample Details

### 2026-05-26T09-40-21-903Z.json

- **Title**: 1.3 指令系统CISC和RISC
- **Classification**: MIXED_TEXT_IMAGE
- **Parser confidence**: medium
- **Requires manual review**: true
- **text_blocks**: 3
- **key_terms**: 7
- **image_refs**: 1
- **Quarantined**: false
- **Renderer eligible**: true
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-26T09-40-21-903Z.json)
- **Assets**: manifest_count=1, downloaded=1, failed=0, skipped=0, manual_review=1

### 2026-05-27T01-32-02-914Z.json

- **Title**: 第3章 数据库系统
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 5
- **image_refs**: 0
- **Quarantined**: true (duplicate_actual_content)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T01-32-02-914Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T01-32-47-268Z.json

- **Title**: 第5章 计算机网络
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 5
- **image_refs**: 0
- **Quarantined**: true (duplicate_actual_content)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T01-32-47-268Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T02-17-40-989Z.json

- **Title**: 3.1 数据库系统常识
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 5
- **image_refs**: 0
- **Quarantined**: true (low_text)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T02-17-40-989Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T02-34-55-788Z.json

- **Title**: 1.3 指令系统CISC和RISC
- **Classification**: MIXED_TEXT_IMAGE
- **Parser confidence**: medium
- **Requires manual review**: true
- **text_blocks**: 3
- **key_terms**: 7
- **image_refs**: 1
- **Quarantined**: true (target_body_mismatch)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T02-34-55-788Z.json)
- **Assets**: manifest_count=1, downloaded=1, failed=0, skipped=0, manual_review=1

### 2026-05-27T02-35-30-393Z.json

- **Title**: 1.5 存储系统
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 5
- **image_refs**: 0
- **Quarantined**: true (target_body_mismatch)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T02-35-30-393Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T02-36-04-460Z.json

- **Title**: 1.4 指令的流水处理
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 5
- **image_refs**: 0
- **Quarantined**: true (target_body_mismatch)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T02-36-04-460Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T14-34-52-493Z.json

- **Title**: 3.3 数据库的设计
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 7
- **image_refs**: 0
- **Quarantined**: true (low_text)
- **Renderer eligible**: false
- **Preflight passed**: true
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T14-34-52-493Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T14-36-07-171Z.json

- **Title**: 5.1 网络概述和模型
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 7
- **image_refs**: 0
- **Quarantined**: true (low_text)
- **Renderer eligible**: false
- **Preflight passed**: true
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T14-36-07-171Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-27T14-37-21-375Z.json

- **Title**: 8.8 典型信息系统架构模型
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: true
- **text_blocks**: 15
- **key_terms**: 9
- **image_refs**: 0
- **Quarantined**: true (target_body_mismatch)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-27T14-37-21-375Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-28T02-54-15-543Z.json

- **Title**: 13.3 软件架构风格
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 3
- **image_refs**: 0
- **Quarantined**: true (low_text)
- **Renderer eligible**: false
- **Preflight passed**: true
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-28T02-54-15-543Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-28T02-59-11-656Z.json

- **Title**: 13.3 软件架构风格
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 3
- **image_refs**: 0
- **Quarantined**: true (duplicate_same_title)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-28T02-59-11-656Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-28T03-03-37-856Z.json

- **Title**: 13.3 软件架构风格
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 3
- **image_refs**: 0
- **Quarantined**: true (duplicate_same_title)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-28T03-03-37-856Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-28T03-10-01-532Z.json

- **Title**: 13.3 软件架构风格
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: false
- **text_blocks**: 1
- **key_terms**: 3
- **image_refs**: 0
- **Quarantined**: true (duplicate_same_title)
- **Renderer eligible**: false
- **Preflight passed**: false
- **Asset manifest**: present (sources/ruankaodaren/raw/assets/manifests/2026-05-28T03-10-01-532Z.json)
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

### 2026-05-28T05-25-27-891Z.json

- **Title**: 9.1 信息安全基础知识
- **Classification**: HTML_RICH_TEXT
- **Parser confidence**: high
- **Requires manual review**: true
- **text_blocks**: 21
- **key_terms**: 11
- **image_refs**: 0
- **Quarantined**: false
- **Renderer eligible**: true
- **Preflight passed**: true
- **Asset manifest**: missing
- **Assets**: manifest_count=0, downloaded=0, failed=0, skipped=0, manual_review=0

## Renderer Baseline Candidates

- 2026-05-26T09-40-21-903Z.json: 1.3 指令系统CISC和RISC
- 2026-05-28T05-25-27-891Z.json: 9.1 信息安全基础知识

## Quarantined Samples

- 2026-05-27T01-32-02-914Z.json: 第3章 数据库系统 — duplicate_actual_content
- 2026-05-27T01-32-47-268Z.json: 第5章 计算机网络 — duplicate_actual_content
- 2026-05-27T02-17-40-989Z.json: 3.1 数据库系统常识 — low_text
- 2026-05-27T02-34-55-788Z.json: 1.3 指令系统CISC和RISC — target_body_mismatch
- 2026-05-27T02-35-30-393Z.json: 1.5 存储系统 — target_body_mismatch
- 2026-05-27T02-36-04-460Z.json: 1.4 指令的流水处理 — target_body_mismatch
- 2026-05-27T14-34-52-493Z.json: 3.3 数据库的设计 — low_text
- 2026-05-27T14-36-07-171Z.json: 5.1 网络概述和模型 — low_text
- 2026-05-27T14-37-21-375Z.json: 8.8 典型信息系统架构模型 — target_body_mismatch
- 2026-05-28T02-54-15-543Z.json: 13.3 软件架构风格 — low_text
- 2026-05-28T02-59-11-656Z.json: 13.3 软件架构风格 — duplicate_same_title
- 2026-05-28T03-03-37-856Z.json: 13.3 软件架构风格 — duplicate_same_title
- 2026-05-28T03-10-01-532Z.json: 13.3 软件架构风格 — duplicate_same_title

## Constraints

- No OCR was used
- No encrypt=1 decrypted
- No Markdown generated
- No image table reconstructed
