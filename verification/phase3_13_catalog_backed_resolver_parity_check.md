# Phase 3.13 Catalog-backed Resolver Parity Check

## 1. Background

Phase 3.11 found 104 reachable leaf nodes in the current UI catalog. Phase 3.12 then attempted three catalog-recommended exact leaf targets, but the crawler resolver rejected all of them as `chapter_not_found`. That exposed a parity gap between catalog enumeration and crawler replay.

## 2. Objective

This phase makes crawler, diagnose, and acquisition use the same catalog-backed target resolver. The goal is resolver parity, not additional sampling or renderer work.

## 3. Scope

Allowed:

- Extract a shared target resolution module.
- Add richer catalog leaf metadata.
- Add catalog-backed resolver lookup.
- Enhance diagnose live replay output.
- Enhance crawler catalog-backed resolver metadata.
- Add a catalog resolver unit-style test.

Forbidden:

- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatic image table reconstruction.
- Full-site crawling.
- Generating knowledge-point body documents.

## 4. Resolver Rules

- First perform catalog lookup from `verification/generated/phase3_11_reachable_leaf_catalog.json`.
- Prefer exact full-title match.
- Then allow normalized title match.
- Then allow section-number match.
- Token overlap is diagnostic only and must not be treated as exact under `--require-leaf`.
- Live DOM replay must still prove the catalog leaf can be found in the current browser state.
- Under `--require-leaf`, same-chapter fallback or global fallback cannot count as success.

## 5. Metadata Fields

Crawler metadata records:

- `catalog_resolver_used`
- `catalog_match_found`
- `catalog_match_strategy`
- `catalog_chapter_title`
- `catalog_leaf_title`
- `catalog_live_replay_success`

## 6. Commands

```bash
pnpm catalog:reachable-leaves
pnpm test:catalog-resolver -- --target "3.3 数据库的设计"
pnpm diagnose:target-reachability -- --target "3.3 数据库的设计"
pnpm crawl:ruankaodaren -- --target "3.3 数据库的设计" --require-leaf
pnpm preflight:sample -- --latest
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

- `test:catalog-resolver` returns an exact match for `3.3 数据库的设计`.
- Diagnose distinguishes `catalog_match_found` from `live_replay_success`.
- Crawler metadata includes catalog resolver fields.
- If live replay fails, failure reason is `catalog_live_replay_mismatch`, not `chapter_not_found`.
- `typecheck` and `verify` pass.

Ideal success:

- Live replay succeeds.
- Crawl enters the correct leaf detail.
- Latest preflight passes.

## 8. Failure Handling

If catalog lookup fails, report `catalog_target_not_found` and do not guess.

If catalog lookup succeeds but live replay fails, report `catalog_live_replay_mismatch`, do not parse, and do not generate a sample.

If fallback is triggered under `--require-leaf`, it cannot be counted as success.

Phase 3.14 introduces a shared live DOM explorer so catalog, diagnose, and crawler replay use the same DOM facts.
