# Phase 3.7 Semantic Alignment Audit

Generated at: 2026-05-27T14:23:47.102Z

## Summary

| Metric | Value |
|---|---:|
| Total samples | 7 |
| matched | 3 |
| likely_matched | 3 |
| mismatched | 3 |
| quarantined | 6 |
| duplicate_actual_content | 6 |
| duplicate_same_title | 1 |
| renderer_eligible | 1 |

## Samples

| Timestamp | Title | Requested target | Target node | Alignment | Body alignment | Duplicate | Quarantined | Reason | Renderer eligible |
|---|---|---|---|---|---|---|---|---|---|
| 2026-05-26T09-40-21-903Z | 1.3 指令系统CISC和RISC |  | 1.3 指令系统CISC和RISC | matched | matched | dup-1 | no |  | yes |
| 2026-05-27T01-32-02-914Z | 第3章 数据库系统 | 数据库 | 第3章 数据库系统 | likely_matched | unknown | dup-2 | yes | duplicate_actual_content | no |
| 2026-05-27T01-32-47-268Z | 第5章 计算机网络 | 网络 | 第5章 计算机网络 | likely_matched | unknown | dup-2 | yes | duplicate_actual_content | no |
| 2026-05-27T02-17-40-989Z | 3.1 数据库系统常识 | 数据库 | 3.1 数据库系统常识 | likely_matched | matched |  | yes | low_text | no |
| 2026-05-27T02-34-55-788Z | 1.3 指令系统CISC和RISC | 3.6 关系数据库的规范化 | 1.3 指令系统CISC和RISC | mismatched | matched | dup-1 | yes | target_body_mismatch | no |
| 2026-05-27T02-35-30-393Z | 1.5 存储系统 | 1.5 存储系统 | 1.5 存储系统 | matched | mismatched | dup-2 | yes | target_body_mismatch | no |
| 2026-05-27T02-36-04-460Z | 1.4 指令的流水处理 | 1.4 指令的流水处理 | 1.4 指令的流水处理 | matched | mismatched | dup-2 | yes | target_body_mismatch | no |

## Quarantine Manifest

Path: `data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json`

- 2026-05-27T01-32-02-914Z / 第3章 数据库系统: duplicate_actual_content
- 2026-05-27T01-32-47-268Z / 第5章 计算机网络: duplicate_actual_content
- 2026-05-27T02-17-40-989Z / 3.1 数据库系统常识: low_text
- 2026-05-27T02-34-55-788Z / 1.3 指令系统CISC和RISC: target_body_mismatch
- 2026-05-27T02-35-30-393Z / 1.5 存储系统: target_body_mismatch
- 2026-05-27T02-36-04-460Z / 1.4 指令的流水处理: target_body_mismatch

## Constraints

- No raw artifacts deleted.
- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
