# Phase 3.2 Multi-sample Parser Validation Check

## 1. Background

Phase 3.0 produced a parser contract and an initial intermediate JSON sample for knowledge node
`1.3 指令系统CISC和RISC` (classification: `MIXED_TEXT_IMAGE`). Phase 3.1 added schema validation
and invariant hardening via `validate:intermediate`. Phase 2.15 added asset capture for `image_refs`.

A single CISC/RISC sample is insufficient to prove the parser generalizes across different knowledge
nodes and content forms. Phase 3.2 establishes the infrastructure for multi-sample parser validation:
crawler `--target` support, parser `--latest-success` flag, a sample target configuration file, and a
coverage reporting script.

## 2. Objective

The objective of Phase 3.2 is to validate that the existing parser contract can handle multiple
knowledge point samples. The phase adds scaffolding for additional sample capture but does NOT:

- Run a full-site batch crawl
- Generate Markdown content
- Modify the Phase 3.0/3.1 parser contract
- Enter Phase 4 (Markdown renderer)

## 3. Scope

**Allowed in this phase:**

- Add `--target` CLI parameter to `scripts/crawl-ruankaodaren.ts`
- Add `--latest-success` flag to `scripts/parse-ruankaodaren-outer-html.ts`
- Add `config/ruankaodaren-sample-targets.yaml` as a human-readable target registry
- Add `scripts/report-ruankaodaren-sample-coverage.ts` for coverage aggregation
- Parse and validate additional samples if captured
- Generate sample coverage reports in `verification/generated/`

**Prohibited:**

- Full-site batch crawl
- Markdown renderer
- OCR
- Decrypting `encrypt=1` XHR responses
- Reconstructing image tables
- Modifying exam content
- Entering Phase 4

## 4. Sample Strategy

Target samples should cover all five classification types:

| Classification | Description | Example |
|---|---|---|
| `TEXT_DOM` | Pure paragraph text, no images | Simple definition nodes |
| `HTML_RICH_TEXT` | Rich HTML with lists, code, strong, em — no images | Structured concept nodes |
| `MIXED_TEXT_IMAGE` | Text + external JPEG images | 1.3 CISC/RISC (existing) |
| `IMAGE_EMBEDDED` | Primarily image content, little/no text | Diagram-heavy nodes |
| `UNSTABLE_OR_INCOMPLETE` | Page not fully rendered | Any node where DOM is incomplete |

## 5. Commands

```bash
# Crawl a specific target
pnpm crawl:ruankaodaren -- --target "1.3 指令系统CISC和RISC"

# Parse the latest successful snapshot
pnpm parse:ruankaodaren -- --latest-success

# Parse a specific timestamp
pnpm parse:ruankaodaren -- --timestamp 2026-05-26T09-40-21-903Z

# Validate all intermediate samples
pnpm validate:intermediate

# Capture assets for image_refs
pnpm capture:assets

# Validate captured assets
pnpm validate:assets

# Generate sample coverage report
pnpm report:sample-coverage

# Type check
pnpm typecheck

# Structure verification
pnpm verify
```

## 6. Success Criteria

- `crawl:ruankaodaren` accepts `--target "<text>"` parameter
- `parse:ruankaodaren` accepts `--latest-success` flag (maps to auto-discovery of latest successful metadata)
- `report:sample-coverage` runs without error
- Existing CISC/RISC sample (`2026-05-26T09-40-21-903Z`) passes `validate:intermediate`
- Existing asset manifest passes `validate:assets`
- Coverage report lists:
  - total sample count
  - classification distribution
  - constraint violations = 0
- `pnpm typecheck` passes
- `pnpm verify` passes

## 7. Failure Handling

**If `--target` finds no match:**

- `findKnowledgeNodeCandidateText` warns and falls back to auto-discovery
- Metadata records `requested_target_text` and `target_source: "cli"` vs `"default"`
- Crawler does not fabricate samples

**If a sample fails to parse:**

- Raw snapshot is preserved
- Failure is reported; parser does not fall back to OCR or manual reconstruction
- Schema is not relaxed to hide problems

**If constraint violations are found in `report:sample-coverage`:**

- Report exits with code 1
- Fix the parser or the sample — do not relax constraints

## 8. Parser Confidence vs. Classification Matrix

| Classification | Expected Confidence | Manual Review |
|---|---|---|
| `TEXT_DOM` | high | false |
| `HTML_RICH_TEXT` | high | false (unless ambiguous) |
| `MIXED_TEXT_IMAGE` | medium | true |
| `IMAGE_EMBEDDED` | low | true |
| `UNSTABLE_OR_INCOMPLETE` | low | true |

## 9. Files Added in Phase 3.2

| File | Purpose |
|---|---|
| `config/ruankaodaren-sample-targets.yaml` | Human-readable target registry |
| `scripts/report-ruankaodaren-sample-coverage.ts` | Coverage aggregation script |
| `verification/phase3_2_multi_sample_parser_validation_check.md` | This document |
| `verification/generated/phase3_2_sample_coverage.json` | Auto-generated JSON report |
| `verification/generated/phase3_2_sample_coverage.md` | Auto-generated Markdown report |

Phase 3.3 performs controlled empirical multi-sample acquisition; Phase 3.2 only established the infrastructure.
