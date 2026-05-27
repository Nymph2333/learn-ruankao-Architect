# Phase 3.1 Intermediate Validation Check

## 1. Background

Phase 3.0 generated the first intermediate JSON document:

- File: `data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json`
- Title: `1.3 指令系统CISC和RISC`
- Classification: `MIXED_TEXT_IMAGE`
- Content: 3 text_blocks, 7 key_terms, 1 image_ref
- Constraints: all `false` (no OCR, no encrypt=1 decrypt, no Markdown, no image table reconstruction)

The Phase 3.0 parser contract and prototype are confirmed to work on the known sample. However, there is no automated guard to prevent future parser runs from producing output that drifts from the schema contract or violates the hard constraints.

Phase 3.1 adds schema validation and invariant hardening to catch these regressions automatically.

## 2. Objective

Phase 3.1 only validates intermediate output. It does NOT:
- Implement a batch parser
- Implement a Markdown renderer
- Write or transform any content
- Access raw HTML, crawler, or API artifacts

The `validate:intermediate` script is a read-only quality gate over already-generated intermediate JSON documents.

## 3. Validation Scope

### JSON Schema Validation

All intermediate JSON files are validated against `schemas/ruankaodaren-intermediate.schema.json` using AJV (draft-07, `allErrors: true`).

### Invariant Checks

Beyond schema compliance, the following invariants are enforced:

| Invariant | Check |
|---|---|
| `source.source_name` | must be `"ruankaodaren"` |
| `source.timestamp` | must be non-empty |
| `navigation_context.target_node_text` | must be non-empty |
| `content.title` | must be present and non-null/empty |
| `content.text_blocks` | must be array |
| `content.image_refs` | must be array |
| `classification.content_source_classification` | must be one of the 5 valid values |
| `constraints.ocr_used` | must be `false` |
| `constraints.encrypted_xhr_decrypted` | must be `false` |
| `constraints.image_table_reconstructed` | must be `false` |
| `constraints.markdown_generated` | must be `false` |

### MIXED_TEXT_IMAGE Constraints

Documents classified as `MIXED_TEXT_IMAGE` must additionally satisfy:

| Invariant | Check |
|---|---|
| `image_refs.length` | must be ≥ 1 |
| `requires_manual_review` | must be `true` |
| `manual_review_reasons` | must be non-empty |
| `parser_confidence` | must NOT be `"high"` (image content is unverified) |

### image_refs Field Constraints

Each entry in `image_refs` must have:

- `src` (present)
- `order` (number)
- `asset_status` (present)
- `requires_manual_review` (must be `true`)
- `manual_review_reason` (non-empty string)

### No-OCR / No-Decrypt / No-Markdown Constraints

The hard constraint block is verified by both JSON Schema (enum `[false]`) and invariant code. A document that somehow sets any of these to `true` will fail validation immediately.

## 4. Prohibited Actions

The validation script enforces these prohibitions by checking the `constraints` block:

| Action | Status |
|---|---|
| OCR on images | **PROHIBITED** (`constraints.ocr_used` must be `false`) |
| Decrypting `encrypt=1` responses | **PROHIBITED** (`constraints.encrypted_xhr_decrypted` must be `false`) |
| Forging or simulating API requests | **PROHIBITED** |
| Generating Markdown output | **PROHIBITED** (`constraints.markdown_generated` must be `false`) |
| Reconstructing image tables as text | **PROHIBITED** (`constraints.image_table_reconstructed` must be `false`) |
| Rewriting exam content | **PROHIBITED** |
| Entering Phase 4 | **PROHIBITED** (out of scope for Phase 3.1) |

## 5. Commands

```bash
# Validate all intermediate samples (default)
pnpm validate:intermediate

# Validate a specific file
pnpm validate:intermediate -- --file data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json

# Type-check the project
pnpm typecheck

# Verify repository structure
pnpm verify
```

## 6. Success Criteria

A Phase 3.1 run is considered successful when ALL of the following hold:

| Criterion | Expected Value |
|---|---|
| `pnpm validate:intermediate` exits 0 | ✓ |
| `sample title` | `"1.3 指令系统CISC和RISC"` |
| `classification` | `"MIXED_TEXT_IMAGE"` |
| `image_refs.length` | ≥ 1 |
| `requires_manual_review` | `true` |
| `constraints.ocr_used` | `false` |
| `constraints.encrypted_xhr_decrypted` | `false` |
| `constraints.image_table_reconstructed` | `false` |
| `constraints.markdown_generated` | `false` |
| `pnpm typecheck` passes | 0 errors |
| `pnpm verify` passes | 0 failures |

## 7. Failure Handling

### Sample JSON does not exist

If no intermediate JSON files are found in `data/intermediate/ruankaodaren/samples/`:

- Do NOT generate fake data
- Output clear error message
- Direct user to run `pnpm parse:ruankaodaren` first
- `process.exit(1)`

### Schema mismatch

If a document fails AJV schema validation:

1. First determine whether the parser output is wrong OR the schema contract is wrong
2. Do not relax the schema to hide the problem
3. Apply the minimum fix to whichever side is in error
4. Re-run validation to confirm

### Invariant violation

If a document passes schema but fails an invariant:

- The invariant error message states exactly which field and what value was found
- Fix the parser, not the invariant


Phase 2.15 adds asset capture for image_refs referenced by validated intermediate JSON.
