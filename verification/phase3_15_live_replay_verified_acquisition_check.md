# Phase 3.15 Live-replay-verified Acquisition Check

## 1. Background

Phase 3.14 unified catalog, diagnose, and crawler DOM replay logic through a shared DOM explorer.

It also proved that `3.3 数据库的设计` can be resolved from the reachable catalog and replayed in the live knowledge-route DOM.

## 2. Objective

This phase only performs controlled acquisition for exact leaf targets that pass live replay.

The goal is to increase renderer-eligible, non-quarantined leaf samples from the current baseline without entering Phase 4.

## 3. Scope

Allowed:

- Run live replay checks for at most five catalog-recommended candidates.
- Run acquisition for at most three live-replay-success targets.
- Require each successful sample to pass preflight, parse, intermediate validation, semantic audit, asset validation, quality audit, and coverage reporting.
- Generate a Phase 3.15 acquisition run report.

Forbidden:

- Full-site crawling.
- Markdown renderer implementation.
- OCR.
- Decrypting `encrypt=1`.
- Automatically reconstructing image tables.
- Rewriting exam content.
- Entering Phase 4 implementation.

## 4. Gate Sequence

```text
catalog exact leaf target
-> live replay check
-> crawl --require-leaf
-> preflight
-> parse
-> validate intermediate
-> semantic audit
-> asset capture
-> asset validation
-> quality audit
-> coverage report
```

## 5. Success Criteria

Minimum success:

- Live replay check can run.
- Every failed target has a reject reason.
- No unaudited sample is counted as success.
- `pnpm typecheck` and `pnpm verify` pass.

Ideal success:

- `renderer_eligible_count >= 3`.
- `phase4_candidate_status = candidate_ready`.
- `phase4_renderer_allowed = true`.

Even if ideal success is reached, Phase 4 implementation must not start in this phase.

## 6. Failure Handling

If live replay fails:

- Do not crawl detail.
- Do not parse.
- Do not generate a sample.

If preflight fails:

- Do not parse.
- Write a diagnostic artifact.

If semantic audit fails:

- Quarantine or mark diagnostic.
- Do not count it as renderer baseline.

If asset capture fails:

- The sample may remain, but must carry asset risk.
- Do not enter renderer unless the sample has no image refs and all other gates pass.

Phase 3.16 adds detail-body binding and parser timestamp integrity audit because Phase 3.15 found semantic body mismatches after successful live replay and preflight.
