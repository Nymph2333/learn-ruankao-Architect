# Phase 3.16 Detail-body Binding and Parser Timestamp Integrity Audit

## 1. Background

Phase 3.15 showed that live replay, preflight, and parse can all pass while semantic audit still rejects samples with `target_mismatch_content_body`.

The failed targets were:

- `3.3 数据库的设计`
- `5.1 网络概述和模型`
- `8.8 典型信息系统架构模型`

## 2. Objective

This phase locates whether the mismatch happens in:

- detail body binding
- raw outerHTML capture
- parser timestamp selection
- semantic audit judgement

It is an audit phase only. It does not expand acquisition and does not enter renderer work.

## 3. Scope

Allowed:

- Audit raw metadata, outerHTML, screenshots, intermediate JSON, and semantic audit output.
- Enhance acquisition report trace fields.
- Enhance parser timestamp-integrity logging.
- Enhance semantic audit failure evidence.
- Generate a Phase 3.16 detail-binding report.

Forbidden:

- Markdown renderer implementation.
- OCR.
- Decrypting `encrypt=1`.
- Automatically reconstructing image tables.
- Full-site crawling.
- Rewriting exam content.
- Entering Phase 4.

## 4. Binding Status Taxonomy

- `bound`: metadata, raw outerHTML, and intermediate sample point to the same target and the content has enough target evidence.
- `stale_body`: route or target selection succeeded, but the saved body appears to contain old or unrelated known sample tokens.
- `wrong_timestamp`: metadata timestamp, selected outerHTML, or intermediate `source.timestamp` do not agree.
- `weak_text_unknown`: the detail body is short or sparse, so semantic confidence is insufficient.
- `parser_container_mismatch`: screenshot or raw outerHTML indicates detail content, but parser extraction does not preserve enough container text.
- `semantic_audit_false_positive`: raw/intermediate content contains target evidence, but semantic audit still rejects it.
- `unknown`: evidence is incomplete or contradictory.

## 5. Commands

```bash
pnpm audit:detail-binding
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 6. Success Criteria

- `audit:detail-binding` is runnable.
- `verification/generated/phase3_16_detail_binding_audit.md` is generated.
- `verification/generated/phase3_16_detail_binding_audit.json` is generated.
- Every Phase 3.15 target has a `binding_status`.
- The report identifies the next repair direction.
- `pnpm typecheck` and `pnpm verify` pass.

## 7. Failure Handling

If raw artifacts are missing:

- Mark the trace as artifact missing.
- Do not guess.
- Do not rewrite or delete the sample.

If timestamps are inconsistent:

- Mark `wrong_timestamp`.
- Do not continue acquisition.

Phase 4 remains blocked until binding and renderer-baseline eligibility are proven.

Phase 3.17 hardens parser extraction and semantic evidence after Phase 3.16 isolated parser_container_mismatch and semantic_audit_false_positive cases.
