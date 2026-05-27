# Phase 3.0 Sample Output Review

Timestamp: `2026-05-26T09-40-21-903Z`

Run command: `pnpm parse:ruankaodaren -- --timestamp 2026-05-26T09-40-21-903Z`

Output: `data/intermediate/ruankaodaren/samples/2026-05-26T09-40-21-903Z.json`

## 1. Title

```
1.3 指令系统CISC和RISC
```

✅ Correct. Taken from `metadata.knowledge_node_click_text`.

## 2. Text Blocks (3)

| order | type | text |
|---|---|---|
| 0 | paragraph | `CISC是复杂指令系统：兼容性强，指令繁多、长度可变，由微程序实现。` |
| 1 | paragraph | `RISC是精简指令系统：指令少，使用频率接近，主要依靠硬件实现(通用寄存器、硬布线逻辑控制)。` |
| 2 | paragraph | `二者各方面区分如下图：` |

✅ 3 blocks extracted. The 4th `<p>` (which contains only `<img>`) has empty text and is correctly skipped.

✅ Inline deduplication correct: `strong` "CISC是复杂指令系统：" is subsumed within block 0, so it is NOT promoted to a separate text_block.

## 3. Key Terms (7)

| order | kind | text |
|---|---|---|
| 0–5 | underline_placeholder | 兼容性强 / 指令繁多 / 长度可变 / 微程序 / 指令少 / 硬件实现 |
| 6 | strong | CISC是复杂指令系统： |

✅ 6 `<a class="underline-placeholder">` terms + 1 `<strong>` term = 7 total.

✅ The `strong` key_term is recorded (for key_terms) even though it is excluded from text_blocks (by dedup).

## 4. Image Refs (1)

```json
{
  "src": "https://image-t.chaiding.com/ruankao/20240808/d2d172a92eaf4055aa7852d56a4cacb4.jpg-ruankao",
  "alt": "",
  "title": "",
  "surrounding_text": "二者各方面区分如下图：",
  "asset_status": "referenced_not_downloaded",
  "requires_manual_review": true,
  "manual_review_reason": "image may contain table or non-text instructional content"
}
```

✅ 1 image ref. `surrounding_text` correctly captures the preceding paragraph.

✅ Image is NOT downloaded, NOT OCR'd, NOT transcribed.

## 5. Classification

```json
{
  "content_source_classification": "MIXED_TEXT_IMAGE",
  "parser_confidence": "medium",
  "requires_manual_review": true,
  "manual_review_reasons": [
    "Contains 1 image(s) that may encode non-text content (e.g. tables, diagrams)"
  ]
}
```

✅ Correct. Both text and image present → `MIXED_TEXT_IMAGE`.

✅ `parser_confidence: "medium"` is correct (image present, but text is parseable).

## 6. Constraints

```json
{
  "ocr_used": false,
  "encrypted_xhr_decrypted": false,
  "image_table_reconstructed": false,
  "markdown_generated": false
}
```

✅ All hard constraints satisfied.

## 7. Parser Boundary Verification

The parser did NOT:
- Generate Markdown output
- Use OCR
- Decrypt any XHR response (`encrypt=1` payloads untouched)
- Reconstruct the CISC/RISC comparison table from the image
- Rewrite or paraphrase any exam content
- Access `<body>` or any container other than `.knowInfo.ql-editor`

The parser DID:
- Extract DOM text faithfully from the Quill editor HTML
- Preserve the outerHTML in `html_fragments[0].outer_html`
- Record the image as an unresolved external reference
- Classify the document as `MIXED_TEXT_IMAGE`
- Flag the document for manual review because of the image


Phase 3.1 adds schema validation and invariant checks for intermediate JSON outputs.
