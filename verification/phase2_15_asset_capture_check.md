# Phase 2.15 Asset Capture Check

## 1. Background

Phase 3.0 parsed the `.knowInfo.ql-editor` outerHTML and identified one `image_ref` for knowledge node `1.3 指令系统CISC和RISC`. The CISC/RISC comparison table is encoded as an external JPEG hosted at:

```
https://image-t.chaiding.com/ruankao/20240808/d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao
```

Phase 3.1 validated the intermediate JSON and confirmed:

- `asset_status = referenced_not_downloaded`
- `requires_manual_review = true`
- `classification = MIXED_TEXT_IMAGE`

The image is currently only referenced by URL. Without downloading and hashing it, the reference is unstable: the CDN may change or remove the file. Phase 2.15 captures the raw asset so it can be audited, version-pinned, and later reviewed by a human.

## 2. Objective

Phase 2.15 only does asset capture:

- Download image files referenced in `content.image_refs[]`
- Compute SHA-256 hash of each downloaded file
- Record content-type, file size, and image dimensions
- Save the file as `<sha256>.<ext>`
- Generate a structured manifest JSON

This phase does NOT:

- OCR the image
- Reconstruct the table as text
- Generate any Markdown
- Access any API or XHR

## 3. Input

Intermediate JSON from Phase 3.0/3.1:

```
data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json
```

Key fields consumed:

- `content.image_refs[].src` — the image URL to download
- `content.image_refs[].surrounding_text` — context recorded in manifest
- `content.image_refs[].manual_review_reason` — propagated to manifest
- `source.source_title` — recorded in manifest
- `source.timestamp` — used as manifest filename

## 4. Output

### Downloaded image file

```
sources/ruankaodaren/raw/assets/images/<sha256>.<ext>
```

Extension is inferred from the HTTP `Content-Type` response header (preferred), then from the URL pathname, then falls back to `.bin`.

### Asset manifest

```
sources/ruankaodaren/raw/assets/manifests/<source_timestamp>.json
```

Both paths are gitignored (raw artifacts). Only `.gitkeep` placeholder files are tracked.

## 5. Manifest Contract

The manifest records:

| Field | Type | Description |
|---|---|---|
| `source_name` | `"ruankaodaren"` | Always literal |
| `source_intermediate_path` | string | Path to input intermediate JSON |
| `source_title` | string | Knowledge node title |
| `source_timestamp` | string | Timestamp from intermediate JSON |
| `captured_at` | ISO 8601 | When the capture script ran |
| `asset_count` | integer | Length of `assets` array |
| `assets[]` | array | Per-image records (see below) |
| `constraints` | object | Hard invariants, all `false` |

Per-asset fields:

| Field | Description |
|---|---|
| `order` | Index in `image_refs` |
| `original_url` | Source URL |
| `saved_path` | Relative path to saved file, or `null` on failure |
| `sha256` | Hex SHA-256 of file bytes, or `null` on failure |
| `size_bytes` | File size in bytes, or `null` on failure |
| `content_type` | HTTP Content-Type, or `null` on failure |
| `width` / `height` | Image pixel dimensions, or `null` |
| `dimension_error` | Error string if dimensions could not be read |
| `asset_status` | `downloaded` / `download_failed` / `skipped` |
| `error_message` | Error detail if `download_failed` |
| `requires_manual_review` | Always `true` for image assets |
| `manual_review_reason` | Human-readable review reason |
| `ocr_used` | Always `false` |
| `image_table_reconstructed` | Always `false` |

## 6. Prohibited Actions

| Action | Status |
|---|---|
| OCR on downloaded images | **PROHIBITED** |
| Reconstructing image table as text | **PROHIBITED** |
| Decrypting `encrypt=1` XHR responses | **PROHIBITED** |
| Forging or simulating API requests | **PROHIBITED** |
| Generating Markdown output | **PROHIBITED** |
| Rewriting exam content | **PROHIBITED** |
| Entering Phase 4 | **PROHIBITED** (out of scope) |

## 7. Validation

After running asset capture, validate the manifest:

```bash
# Capture assets from a specific intermediate JSON
pnpm capture:assets -- --file data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json

# Validate all manifests (schema + invariants + file existence + SHA-256 check)
pnpm validate:assets

# Type-check the project
pnpm typecheck

# Verify repository structure
pnpm verify
```

## 8. Success Criteria

A Phase 2.15 run is considered successful when ALL of the following hold:

| Criterion | Expected |
|---|---|
| `pnpm capture:assets` exits 0 | ✓ |
| Manifest generated | `sources/ruankaodaren/raw/assets/manifests/2026-05-26T09-40-21-903Z.json` |
| `asset_count` | ≥ 1 |
| Image file exists on disk | `sources/ruankaodaren/raw/assets/images/<sha256>.(jpg\|png\|…)` |
| `sha256` verifiable | matches actual file bytes |
| `content_type` | `image/jpeg` or known image type |
| `width` / `height` | recorded, or `dimension_error` present |
| `requires_manual_review` | `true` |
| `ocr_used` | `false` |
| `image_table_reconstructed` | `false` |
| `markdown_generated` | `false` |
| `pnpm validate:assets` passes | 0 failures |
| `pnpm typecheck` passes | 0 errors |
| `pnpm verify` passes | 0 failures |

## 9. Failure Handling

### Download fails

If the HTTP request for an image fails (network error, 4xx, 5xx):

- Do NOT generate a fake or placeholder image
- Record `asset_status = "download_failed"` in the manifest
- Record `error_message` with the error detail
- If ALL images fail, exit with code 1
- If some images succeed and some fail, continue; exit 0 but log warnings

### No image_refs in intermediate JSON

If the intermediate JSON has `image_refs.length === 0`:

- Output a clear message
- Generate a manifest with `asset_count = 0` and empty `assets` array
- Exit 0 (not an error condition)

### Dimension detection fails

If `image-size` cannot parse the image dimensions:

- Do NOT fail the capture
- Record `width = null`, `height = null`
- Record `dimension_error` with the error message
- Continue


Phase 3.2 adds multi-sample parser validation and sample coverage reporting.
