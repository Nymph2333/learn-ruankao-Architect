# Phase 3.8 Aligned Leaf Acquisition Repair Check

## 1. Background

Phase 3.7 found schema-valid but semantically invalid samples: 6 of 7 existing samples were quarantined because target/body alignment, duplicate actual content, or low-text evidence made them unsafe as renderer baselines.

## 2. Objective

Move semantic alignment checks earlier into acquisition preflight so future controlled samples must prove leaf-level target alignment before parse success is treated as usable evidence.

## 3. Scope

Allowed:

- Add sample preflight checks.
- Add a diagnostics directory for failed or uncertain acquisition attempts.
- Strengthen `run:sample-acquisition`.
- Strengthen semantic audit, quality audit, and coverage reporting.

Forbidden:

- Markdown renderer.
- OCR.
- Decrypting `encrypt=1` data.
- Automatic image table reconstruction.
- Full-site crawling.
- Deleting raw artifacts.

## 4. Gates

- Metadata gate: requires a detail route, non-global detail entry strategy, leaf enforcement, visible target text, detail content signal, and `.knowInfo.ql-editor` outerHTML.
- Content gate: requires parsed title/body evidence to align with the clicked target; low-text samples without image refs fail.
- Duplicate gate: rejects duplicate renderer-eligible fingerprints, including later same-title duplicates.
- Quarantine gate: failed parsed samples are excluded through semantic audit or diagnostic records.
- Renderer baseline gate: only semantic-audit renderer-eligible samples may count toward Phase 4 readiness.

## 5. Diagnostics Policy

Failed preflight artifacts do not become renderer baselines. Diagnostics record target, timestamp, stage, failure reason, and preflight report path. Diagnostics are not intermediate samples, do not replace parser validation, and do not fabricate source evidence. Raw artifacts are preserved.

## 6. Commands

```bash
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

- `preflight:sample` can run.
- `data/intermediate/ruankaodaren/diagnostics/` exists.
- `run:sample-acquisition` uses preflight gates.
- Preflight-failed samples are not counted as success.
- Semantic audit can still quarantine mismatches.
- Quality audit still blocks Phase 4 when renderer baselines are insufficient.
- `typecheck` and `verify` pass.

## 8. Failure Handling

If preflight fails, the sample is not parsed or is not counted as successful, depending on the stage. The failure reason is recorded and the renderer remains blocked.

If duplicate content is detected, later duplicates are quarantined or treated as diagnostic-only while the original known-good sample is preserved.

Phase 3.9 uses the Phase 3.8 preflight gate to acquire only renderer-eligible baseline samples.
