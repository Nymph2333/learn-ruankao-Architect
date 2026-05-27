# Phase 3.3 Sample Acquisition Run

Generated at: 2026-05-27T08:15:00.761Z

## Summary

| Metric | Value |
|---|---|
| Attempted targets | 3 |
| Successful samples | 0 |
| Successful new samples | 0 |
| Failed targets | 3 |
| Content-ready success | 0 |
| Low-text rejected | 0 |
| Diagnostic samples | 0 |
| Chapter-level rejected | 0 |
| Leaf resolution success | 0 |
| Leaf resolution failed | 3 |
| Target resolution trusted | 0 |
| Target resolution failed | 3 |
| Exact leaf match | 0 |
| Final coverage total samples | 7 |
| Final coverage image_refs | 2 |
| Samples with asset manifests | 7 |
| Constraint violations | 0 |

## Target Results

| Target | Hint | Status | Actual title | Resolved leaf | Trusted | Exact leaf | Content-ready | Text length | Classification | image_refs | Asset status | New sample |
|---|---|---|---|---|---|---|---|---:|---|---:|---|---|
| phase312_database_design | 3.3 数据库的设计 | failed |  |  | no | no |  |  |  |  | not_run | no |
| phase312_network_overview_model | 5.1 网络概述和模型 | failed |  |  | no | no |  |  |  |  | not_run | no |
| phase312_typical_information_system_architecture | 8.8 典型信息系统架构模型 | failed |  |  | no | no |  |  |  |  | not_run | no |

## Classification Distribution

```json
{}
```

## Image Refs Distribution

```json
{}
```

## Failures

- phase312_database_design: leaf_resolution_failed
- phase312_network_overview_model: leaf_resolution_failed
- phase312_typical_information_system_architecture: leaf_resolution_failed

## Commands Executed

### phase312_database_design

- `pnpm crawl:ruankaodaren -- --target "3.3 数据库的设计" --require-leaf` -> exit 1

### phase312_network_overview_model

- `pnpm crawl:ruankaodaren -- --target "5.1 网络概述和模型" --require-leaf` -> exit 1

### phase312_typical_information_system_architecture

- `pnpm crawl:ruankaodaren -- --target "8.8 典型信息系统架构模型" --require-leaf` -> exit 1

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
