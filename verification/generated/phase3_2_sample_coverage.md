# Phase 3.2 Sample Coverage Report

Generated at: 2026-05-27T08:15:09.750Z

## Summary

| Metric | Value |
|--------|-------|
| Total samples | 7 |
| Requires manual review | 2 |
| With asset manifests | 7 |
| Without asset manifests | 0 |
| Asset manifest assets | 2 |
| Downloaded assets | 2 |
| Download failed assets | 0 |
| Skipped assets | 0 |
| Manual review assets | 2 |
| Quarantined samples | 6 |
| Renderer eligible samples | 1 |
| Preflight passed samples | 0 |
| Diagnostic samples | 6 |
| Duplicate actual content | 6 |
| Constraint violations | 0 |
| Phase 4 candidate status | blocked_insufficient_renderer_eligible |
| Missing renderer eligible | 2 |
| Total text_blocks | 11 |
| Total key_terms | 39 |
| Total image_refs | 2 |

## Renderer Eligible Titles

- 1.3 指令系统CISC和RISC

## Classification Distribution

| Classification | Count |
|----------------|-------|
| MIXED_TEXT_IMAGE | 2 |
| HTML_RICH_TEXT | 5 |

## Parser Confidence Distribution

| Confidence | Count |
|------------|-------|
| medium | 2 |
| high | 5 |

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

## Renderer Baseline Candidates

- 2026-05-26T09-40-21-903Z.json: 1.3 指令系统CISC和RISC

## Quarantined Samples

- 2026-05-27T01-32-02-914Z.json: 第3章 数据库系统 — duplicate_actual_content
- 2026-05-27T01-32-47-268Z.json: 第5章 计算机网络 — duplicate_actual_content
- 2026-05-27T02-17-40-989Z.json: 3.1 数据库系统常识 — low_text
- 2026-05-27T02-34-55-788Z.json: 1.3 指令系统CISC和RISC — target_body_mismatch
- 2026-05-27T02-35-30-393Z.json: 1.5 存储系统 — target_body_mismatch
- 2026-05-27T02-36-04-460Z.json: 1.4 指令的流水处理 — target_body_mismatch

## Constraints

- No OCR was used
- No encrypt=1 decrypted
- No Markdown generated
- No image table reconstructed
