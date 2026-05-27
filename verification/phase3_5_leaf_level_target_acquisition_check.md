# Phase 3.5 Leaf-level Target Acquisition Check

## 1. Background

Phase 3.4 determined that Phase 4 is not allowed yet. The current controlled sample set has only 1 `leaf_knowledge_point` sample, while 2 samples are `chapter_overview`:

- `第3章 数据库系统`
- `第5章 计算机网络`

Chapter-level samples can help diagnose crawler behavior, but they must not be counted as successful renderer baseline samples.

## 2. Objective

This phase hardens leaf-level target acquisition so broad hints cannot silently produce chapter-level success samples.

The crawler and acquisition runner must either resolve a chapter hit to a visible leaf knowledge point, or reject the target as chapter-level.

## 3. Scope

Allowed:

- Add `--require-leaf`.
- Perform leaf resolution under a chapter hint.
- Improve sample acquisition success criteria.
- Generate a leaf candidate report.

Prohibited:

- Full-site crawling.
- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatic image-table reconstruction.
- Rewriting exam content.
- Entering Phase 4.

## 4. Leaf-level Rules

Chapter-level:

- Starts with `第` and contains `章`.
- Examples include `第3章 数据库系统` and `第5章 计算机网络`.
- Does not include a section number such as `3.1` or `5.2`.
- Appears as an expandable directory node rather than a leaf item.

Leaf-level:

- Looks like `1.3 xxx`, `3.1 xxx`, or `5.2 xxx`.
- Corresponds to a leaf node, not an expandable chapter node.
- Usually has a normal detail-entry action such as `去掌握`.

## 5. Metadata Fields

New crawler metadata fields:

- `require_leaf`
- `chapter_level_hit`
- `chapter_level_text`
- `leaf_resolution_attempted`
- `leaf_resolution_success`
- `resolved_leaf_text`
- `resolved_leaf_strategy`

## 6. Commands

```bash
pnpm crawl:ruankaodaren -- --target "数据库" --require-leaf
pnpm run:sample-acquisition
pnpm list:leaf-candidates
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- `crawl:ruankaodaren` supports `--require-leaf`.
- `run:sample-acquisition` automatically uses `--require-leaf` for leaf targets.
- Chapter-level samples are no longer counted as successful samples.
- `list:leaf-candidates` is runnable.
- `audit:sample-quality` continues blocking Phase 4 unless `leaf_knowledge_point >= 3`.
- `pnpm typecheck` passes.
- `pnpm verify` passes.

## 8. Failure Handling

If a leaf cannot be resolved:

- Record `leaf_resolution_failed`.
- Do not generate fake samples.
- Do not enter the renderer.

If only a chapter-level node is found:

- Mark `chapter_level_rejected`.
- Do not count it as a successful sample.

Phase 3.6 adds content-ready leaf sample acquisition after Phase 3.5 proved leaf-level alone is insufficient.
