# Phase 3.10 Deterministic Target Resolver Check

## 1. Background

Phase 3.9 attempted three leaf targets, but all were rejected by preflight because the actual clicked node did not match the requested target.

## 2. Objective

Fix target resolution so crawler diagnostics can determine whether a full leaf title is reachable, expand the correct chapter, and bind detail entry clicks to the exact leaf. This phase does not expand sampling volume.

## 3. Scope

Allowed:

- Parse target section numbers.
- Expand the corresponding chapter.
- Match full leaf titles deterministically.
- Diagnose target reachability.
- Strengthen preflight metadata gate.

Forbidden:

- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatic image table reconstruction.
- Full-site crawling.
- Forged API requests.

## 4. Target Resolution Rules

- Chapter expansion uses the target chapter number, such as `3` from `3.6 关系数据库的规范化`.
- Exact full title match is preferred.
- Number plus keyword match is diagnostic fallback only.
- Number-only fallback is diagnostic fallback only.
- Same-chapter fallback is allowed only as a recorded fallback and is not an exact match.
- Under `--require-leaf`, global fallback cannot count as successful target resolution.

## 5. Metadata Fields

- `target_resolver_enabled`
- `target_section_number`
- `target_chapter_number`
- `target_leaf_number`
- `target_title_remainder`
- `target_chapter_expand_attempted`
- `target_chapter_expand_success`
- `target_chapter_text`
- `target_leaf_resolution_attempted`
- `target_leaf_resolution_success`
- `target_leaf_resolution_strategy`
- `target_leaf_text`
- `target_leaf_exact_match`
- `target_resolution_trusted`
- `resolved_target_text`
- `actual_node_matches_requested_target`
- `target_resolution_failure_reason`

## 6. Commands

```bash
pnpm diagnose:target-reachability -- --target "3.6 关系数据库的规范化"
pnpm crawl:ruankaodaren -- --target "3.6 关系数据库的规范化" --require-leaf
pnpm preflight:sample -- --latest
pnpm run:sample-acquisition
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

Minimum success:

- `diagnose:target-reachability` can run.
- Target resolution metadata fields exist.
- Preflight rejects untrusted resolution.
- `phase4_candidate_status` is `blocked_insufficient_renderer_eligible` when fewer than three renderer-eligible samples exist.
- `typecheck` and `verify` pass.

Ideal success:

- Diagnostics find the exact leaf.
- Crawler reaches the correct leaf detail.
- Latest preflight passes.
- A new renderer-eligible sample is available.

## 8. Failure Handling

If target is unreachable, do not parse and record `target_not_found`.

If only a chapter is found, do not count it as success and record `chapter_only_match`.

If global fallback is used under `--require-leaf`, reject the sample.

Phase 3.11 adds a reachable leaf catalog because Phase 3.10 found the requested 3.6 target unreachable in current UI state.
