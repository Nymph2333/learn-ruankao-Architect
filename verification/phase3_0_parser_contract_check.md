# Phase 3.0 Parser Contract Check

## 1. Background

Phase 2.14 confirmed a matched detail snapshot at timestamp `2026-05-26T09-40-21-903Z`:

- `final_url`: `https://ruankaodaren.com/exam/#/konwledgeInfo?id=1821374468119990275`
- `knowledge_node_click_text`: `1.3 指令系统CISC和RISC`
- `detail_entry_strategy`: `target_scoped`
- `detail_entry_route_changed`: `true`

The confirmed content form is **MIXED_TEXT_IMAGE**:

- `.knowInfo.ql-editor` outerHTML contains `<p>` paragraphs, `<strong>`, `<a class="underline-placeholder">` key terms, and one `<img>` pointing to an external JPEG.
- The CISC/RISC comparison table is an external JPEG (`image-t.chaiding.com`), not an HTML table, canvas, SVG, or base64 blob.
- All 7 XHR responses use `encrypt=1` and cannot be parsed.
- DOM text length is only ~96 characters — insufficient as a standalone parser input.
- `.knowInfo.ql-editor` outerHTML (787 bytes) is sufficient as a **restricted** parser input.

Phase 3 can begin, but only as a raw-to-intermediate JSON parser. Markdown generation, OCR, and image table reconstruction remain prohibited.

## 2. Objective

Phase 3.0 establishes the minimum **parser contract** from raw `.knowInfo.ql-editor` outerHTML to an intermediate JSON document.

This phase is NOT:
- A Markdown renderer
- A knowledge point rewriter
- A complete batch parser
- An OCR pipeline
- An API decryption tool

This phase IS:
- A structured intermediate layer that converts DOM HTML into a typed JSON artifact
- A schema-validated contract for downstream Phase 3+ consumers
- A single-sample validation using the Phase 2.14 confirmed snapshot

## 3. Input Source

Input file:

```
sources/ruankaodaren/raw/outer-html/<timestamp>-knowInfo_ql-editor.html
```

The path is resolved from `metadata.outer_html_paths` — the array entry matching `knowInfo_ql-editor`.

Metadata selection criteria (auto-discovery or `--timestamp` override):

- `final_url` contains `konwledgeInfo`
- `detail_entry_strategy` = `target_scoped`
- `detail_entry_route_changed` = `true`
- `knowledge_node_click_text` is non-empty
- `outer_html_paths` contains an entry with `knowInfo_ql-editor`

## 4. Output Contract

Output file:

```
data/intermediate/ruankaodaren/samples/<timestamp>.json
```

The output conforms to `schemas/ruankaodaren-intermediate.schema.json` and TypeScript types in `packages/domain-types/ruankaodaren-intermediate.ts`.

## 5. Extracted Fields

### `source`
- `source_name`: always `"ruankaodaren"`
- `source_url`: from `metadata.final_url`
- `captured_at`: from `metadata.captured_at` (ISO 8601)
- `timestamp`: filename-safe timestamp (hyphens replace colons)
- `raw_paths`: paths to metadata, outer_html, screenshot, dom_text, containers

### `navigation_context`
- `target_node_text`: from `metadata.knowledge_node_click_text`
- `final_url`: from `metadata.final_url`
- `route`: hash fragment extracted from `final_url` (e.g. `konwledgeInfo`)
- `detail_entry_strategy`: from metadata
- `detail_entry_route_changed`: from metadata

### `content`
- `title`: `knowledge_node_click_text` → first strong/heading → first paragraph → null
- `text_blocks`: `<p>`, `<li>` (block), then `<strong>`, `<em>` (inline, deduplicated)
- `key_terms`: `<a class="underline-placeholder">`, `<strong>`, `<em>`
- `image_refs`: all `<img>` with src, alt, title, surrounding_text, asset_status
- `html_fragments`: root `.knowInfo.ql-editor` outerHTML with metadata
- `source_outer_html_hash`: SHA-256 of the raw outerHTML file

### `classification`
- `content_source_classification`: `TEXT_DOM | HTML_RICH_TEXT | IMAGE_EMBEDDED | MIXED_TEXT_IMAGE | UNSTABLE_OR_INCOMPLETE`
- `parser_confidence`: `high | medium | low`
- `requires_manual_review`: true when images present
- `manual_review_reasons`: list of reasons

### `constraints`
- `ocr_used`: always `false`
- `encrypted_xhr_decrypted`: always `false`
- `image_table_reconstructed`: always `false`
- `markdown_generated`: always `false`

## 6. Prohibited Actions

The parser enforces the following hard constraints. Violation would corrupt the integrity of the knowledge base:

| Action | Status |
|---|---|
| OCR on images | **PROHIBITED** |
| Decrypting `encrypt=1` XHR responses | **PROHIBITED** |
| Forging or simulating API requests | **PROHIBITED** |
| Generating Markdown output | **PROHIBITED** |
| Reconstructing image tables as text | **PROHIBITED** |
| Rewriting exam content | **PROHIBITED** |
| Falling back to full `<body>` HTML | **PROHIBITED** (unless metadata explicitly allows) |

Images are stored as `image_ref` objects with `asset_status: "referenced_not_downloaded"` and `requires_manual_review: true`. They are never processed, transcribed, or substituted.

## 7. Success Criteria

A Phase 3.0 run is considered successful when ALL of the following hold:

| Criterion | Expected Value |
|---|---|
| `pnpm parse:ruankaodaren` exits 0 | ✓ |
| Output JSON exists at `data/intermediate/ruankaodaren/samples/<ts>.json` | ✓ |
| `content.title` | `"1.3 指令系统CISC和RISC"` |
| `classification.content_source_classification` | `"MIXED_TEXT_IMAGE"` |
| `content.image_refs.length` | ≥ 1 |
| `content.text_blocks.length` | ≥ 1 |
| `constraints.ocr_used` | `false` |
| `constraints.markdown_generated` | `false` |
| `pnpm typecheck` passes | 0 errors |
| `pnpm verify` passes | 0 failures |

## 8. Failure Handling

### Raw artifacts not found

If the outerHTML file referenced in `outer_html_paths` does not exist on disk (e.g. gitignored artifacts not present):

- Output clear error message
- Do NOT guess or generate fake content
- `process.exit(1)`

### `.knowInfo.ql-editor` not found in outerHTML

If the target selector is missing from the outerHTML file:

- Output clear error message
- Do NOT fall back to `<body>` or any other container (unless metadata explicitly allows it)
- `process.exit(1)`

### Metadata does not satisfy criteria

If the specified `--timestamp` metadata does not meet all success criteria:

- List missing criteria
- `process.exit(1)`

### No successful metadata found (auto-discovery)

If no metadata file in `sources/ruankaodaren/raw/metadata/` satisfies all criteria:

- Report how many files were checked
- `process.exit(1)`
