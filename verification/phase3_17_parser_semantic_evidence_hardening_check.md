# Phase 3.17 Parser Extraction and Semantic Evidence Hardening Check

## 1. Background

Phase 3.16 proved that timestamp binding is correct, but the selected samples still show three different quality issues:

- `weak_text_unknown` for `3.3 数据库的设计`
- `semantic_audit_false_positive` for `5.1 网络概述和模型`
- `parser_container_mismatch` for `8.8 典型信息系统架构模型`

The problem is now parser extraction and semantic evidence, not crawler, catalog, preflight, or acquisition.

## 2. Objective

This phase hardens parser text extraction and semantic audit evidence for existing selected raw snapshots.

It does not continue sampling and does not start renderer implementation.

## 3. Scope

Allowed:

- Enhance the outerHTML parser.
- Preserve `.knowInfo.ql-editor` root text, direct text nodes, and inline text.
- Enhance semantic audit evidence.
- Reparse existing selected samples only.
- Generate a parser extraction audit.

Forbidden:

- Crawl.
- Acquisition.
- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatically reconstructing image tables.
- Rewriting exam content.
- Entering Phase 4.

## 4. Parser Extraction Rules

The parser must preserve:

- direct root text under `.knowInfo.ql-editor`
- root-level inline text
- nested inline text
- document-order text traversal
- de-duplicated normalized text
- image surrounding text
- Quill rich text that is not wrapped in `<p>`

Root text may be represented as a `root_text` content block.

## 5. Semantic Evidence Rules

Semantic audit must record:

- expected tokens
- matched tokens
- missing tokens
- conflicting tokens
- evidence sources used
- decision reason

Token extraction should support Chinese substring matching while filtering generic tokens such as `系统`, `设计`, `模型`, `基础`, `概述`, `知识`, `组成`, and `框架`.

Single generic words must not make a sample renderer eligible. Low-text samples without images remain quarantined.

## 6. Commands

```bash
pnpm audit:parser-extraction
pnpm reparse:selected-samples
pnpm audit:semantic-alignment
pnpm audit:detail-binding
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- `audit:parser-extraction` is runnable.
- `reparse:selected-samples` is runnable.
- The `8.8` sample intermediate text length improves, or the report explains why it cannot improve.
- Semantic audit outputs expected / matched / missing / conflicting token evidence.
- `pnpm validate:intermediate` passes.
- `pnpm typecheck` and `pnpm verify` pass.

Ideal outcomes:

- `5.1` changes from semantic false-positive evidence to matched or likely matched.
- `8.8` no longer appears as parser-container loss.
- Renderer-eligible count improves.

Even if renderer eligibility improves, Phase 4 implementation must not start.

## 8. Failure Handling

If reparse still produces low text:

- Keep the sample quarantined.
- Do not enter renderer.

If parser extraction improves but semantic audit still fails:

- Keep recording evidence.
- Do not relax quarantine gates.

Phase 3.18 adds content-rich candidate probing because Phase 3.17 showed parser extraction is no longer the primary blocker.
