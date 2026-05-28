# Phase 3.3 Sample Acquisition Run

Generated at: 2026-05-28T05:26:21.580Z

## Summary

| Metric | Value |
|---|---|
| Attempted targets | 1 |
| Successful samples | 0 |
| Successful new samples | 1 |
| Failed targets | 1 |
| Content-ready success | 0 |
| Low-text rejected | 0 |
| Diagnostic samples | 1 |
| Chapter-level rejected | 0 |
| Leaf resolution success | 1 |
| Leaf resolution failed | 0 |
| Target resolution trusted | 1 |
| Target resolution failed | 0 |
| Exact leaf match | 1 |
| Final coverage total samples | 14 |
| Final coverage image_refs | 2 |
| Samples with asset manifests | 14 |
| Constraint violations | 0 |

## Target Results

| Target | Hint | Status | Actual title | Resolved leaf | Trusted | Exact leaf | Content-ready | Text length | Classification | image_refs | Asset status | New sample |
|---|---|---|---|---|---|---|---|---:|---|---:|---|---|
| phase324_9_1_信息安全基础知识 | 9.1 信息安全基础知识 | failed | 9.1 信息安全基础知识 | 9.1 信息安全基础知识 | yes | yes | no | 388 | HTML_RICH_TEXT | 0 | not_run | yes |

## Classification Distribution

```json
{
  "HTML_RICH_TEXT": 1
}
```

## Image Refs Distribution

```json
{
  "0": 1
}
```

## Failures

- phase324_9_1_信息安全基础知识: target_mismatch_content_body

## Commands Executed

### phase324_9_1_信息安全基础知识

- `internal live replay check --target "9.1 信息安全基础知识"` -> exit 0
- `pnpm crawl:ruankaodaren -- --target "9.1 信息安全基础知识" --require-leaf` -> exit 0
- `pnpm preflight:sample -- --timestamp "2026-05-28T05-25-27-891Z"` -> exit 0
- `pnpm parse:ruankaodaren -- --latest-success` -> exit 0
- `pnpm audit:semantic-alignment` -> exit 0

## Constraints

- No Markdown knowledge documents generated.
- No OCR used.
- No encrypt=1 data decrypted.
- No image table reconstructed.
- No full-site batch crawl performed.
- Phase 4 was not entered.
