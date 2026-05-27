# Phase 3.3 Sample Acquisition Run

Generated at: 2026-05-27T01:33:54.488Z

## Summary

| Metric | Value |
|---|---|
| Attempted targets | 3 |
| Successful samples | 3 |
| Successful new samples | 2 |
| Failed targets | 0 |
| Final coverage total samples | 3 |
| Final coverage image_refs | 1 |
| Samples with asset manifests | 3 |
| Constraint violations | 0 |

## Target Results

| Target | Hint | Status | Actual title | Classification | image_refs | Asset status | New sample |
|---|---|---|---|---|---:|---|---|
| sample_database | 数据库 | success | 第3章 数据库系统 | HTML_RICH_TEXT | 0 | capture_failed | yes |
| sample_network | 网络 | success | 第5章 计算机网络 | HTML_RICH_TEXT | 0 | validated | yes |
| sample_architecture | 架构 | success | 系统架构设计师 | HTML_RICH_TEXT | 0 | validated | no |

## Classification Distribution

```json
{
  "HTML_RICH_TEXT": 3
}
```

## Image Refs Distribution

```json
{
  "0": 3
}
```

## Failures

- sample_database: capture_assets exited 1. stderr:   [FAIL] order=0 error: fetch failed
[capture] All downloads failed. Exiting with error.

## Commands Executed

### sample_database

- `pnpm crawl:ruankaodaren -- --target "数据库"` -> exit 0
- `pnpm parse:ruankaodaren -- --latest-success` -> exit 0
- `pnpm validate:intermediate` -> exit 0
- `pnpm capture:assets` -> exit 1

### sample_network

- `pnpm crawl:ruankaodaren -- --target "网络"` -> exit 0
- `pnpm parse:ruankaodaren -- --latest-success` -> exit 0
- `pnpm validate:intermediate` -> exit 0
- `pnpm capture:assets` -> exit 0
- `pnpm validate:assets` -> exit 0
- `pnpm report:sample-coverage` -> exit 0

### sample_architecture

- `pnpm crawl:ruankaodaren -- --target "架构"` -> exit 0
- `pnpm parse:ruankaodaren -- --latest-success` -> exit 0
- `pnpm validate:intermediate` -> exit 0
- `pnpm capture:assets` -> exit 0
- `pnpm validate:assets` -> exit 0
- `pnpm report:sample-coverage` -> exit 0

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
