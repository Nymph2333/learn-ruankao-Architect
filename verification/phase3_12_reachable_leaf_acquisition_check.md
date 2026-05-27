# Phase 3.12 Reachable-leaf Preflight-gated Acquisition Check

## 1. Background

Phase 3.11 refreshed the current UI reachable leaf catalog. The current renderer gate still has `renderer_eligible_count = 1`, so Phase 4 remains blocked by insufficient renderer-eligible leaf samples.

## 2. Objective

This phase uses only exact leaf titles from the reachable catalog for preflight-gated acquisition. The goal is to add renderer-eligible baseline samples without accepting unreachable, mismatched, or semantically uncertain targets.

## 3. Scope

Allowed:

- Attempt at most three exact reachable leaf targets.
- Require `crawl:ruankaodaren -- --target "<exact leaf title>" --require-leaf`.
- Require each target to pass metadata/content/duplicate preflight before parsing.
- Require each parsed sample to pass semantic audit as renderer-eligible.
- Generate an acquisition run report.

Forbidden:

- Full-site crawling.
- Markdown renderer implementation.
- OCR.
- Decrypting `encrypt=1` data.
- Automatic image table reconstruction.
- Rewriting exam content.
- Entering Phase 4 implementation.

## 4. Gate Sequence

Catalog exact leaf target -> crawl `--require-leaf` -> metadata preflight -> content preflight -> duplicate gate -> parse -> validate intermediate -> semantic audit -> asset capture -> asset validation -> quality audit -> coverage report.

## 5. Success Criteria

Minimum success:

- `run:sample-acquisition` can run.
- Each failed target has a clear reject reason.
- No unaudited sample is counted as a renderer baseline.
- `typecheck` and `verify` pass.

Ideal success:

- `renderer_eligible_count >= 3`.
- `phase4_renderer_allowed = true`.

If the ideal state is not reached, `phase4_renderer_allowed` remains false and `required_before_phase4` states how many renderer-eligible samples are still missing.

## 6. Failure Handling

If preflight fails:

- Do not parse.
- Do not create a formal sample from that target.
- Write diagnostic metadata.

If semantic audit fails:

- Quarantine or mark diagnostic.
- Do not count the sample in the renderer baseline.

If asset capture fails:

- The sample may be retained with an asset risk marker.
- Do not enter renderer unless the sample has no image references and the remaining gates pass.

Phase 3.13 adds catalog-backed resolver parity because Phase 3.12 showed reachable catalog targets could not be replayed by the crawler resolver.
