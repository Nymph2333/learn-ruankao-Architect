# Phase 3.14 Live DOM Replay Parity Check

## 1. Background

Phase 3.13 proved that the catalog resolver can exact-match `3.3 数据库的设计`, but the live DOM replay failed with `catalog_live_replay_mismatch`.

This exposed a parity gap: the catalog script and the diagnose / crawler replay logic were not using the same DOM exploration facts.

## 2. Objective

Phase 3.14 unifies catalog, diagnose, and crawler replay through a shared live DOM explorer.

The goal is replay parity and diagnostic evidence, not content extraction or renderer implementation.

## 3. Scope

Allowed:

- Extract a shared DOM explorer.
- Make catalog collection use shared chapter / leaf collection.
- Make diagnose use shared live replay.
- Make crawler use shared live replay.
- Generate live replay debug artifacts.

Forbidden:

- Enter detail pages.
- Parse正文.
- Generate intermediate JSON.
- Build a Markdown renderer.
- Use OCR.
- Decrypt `encrypt=1`.
- Perform full-site crawling.

## 4. Shared DOM Explorer Contract

The shared explorer provides:

- `collectVisibleChapters(page)` for visible chapter rows.
- `expandVisibleChapters(page)` for conservative directory expansion.
- `collectVisibleLeaves(page)` for leaf-level rows such as `3.3 数据库的设计`.
- `replayCatalogLeaf(page, catalogMatch)` for catalog-backed live replay.
- `captureReplayDebugSnapshot(page, options)` for replay failure diagnostics.

Catalog, diagnose, and crawler must rely on this same contract for current UI DOM facts.

## 5. Replay Failure Diagnostics

When live replay fails, the tooling must save:

- screenshot
- body text
- visible chapters
- visible leaves
- candidate ranking

These artifacts make `catalog_live_replay_mismatch` auditable instead of a one-line failure.

## 6. Commands

```bash
pnpm catalog:reachable-leaves
pnpm test:catalog-resolver -- --target "3.3 数据库的设计"
pnpm test:live-replay -- --target "3.3 数据库的设计"
pnpm diagnose:target-reachability -- --target "3.3 数据库的设计"
pnpm typecheck
pnpm verify
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
```

## 7. Success Criteria

Minimum success:

- Shared DOM explorer exists.
- Catalog uses the shared explorer.
- Diagnose uses shared replay.
- Crawler uses shared replay.
- Live replay failure includes debug artifacts, not only `catalog_live_replay_mismatch`.
- `pnpm typecheck` and `pnpm verify` pass.

Ideal success:

- Live replay for `3.3 数据库的设计` succeeds.
- Diagnose reports `live_replay_success = true`.
- Crawler can later enter the correct leaf detail, but this phase does not require a crawl-detail run.

## 8. Failure Handling

If live replay fails:

- Do not parse.
- Do not generate a sample.
- Save debug artifacts.
- Set `failure_type = catalog_live_replay_mismatch`.

If the shared explorer finds no leaves:

- Catalog must also reflect `leaf_count = 0`.
- Catalog and replay must not use two separate versions of DOM truth.
