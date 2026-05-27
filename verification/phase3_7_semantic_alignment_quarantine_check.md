# Phase 3.7 Semantic Alignment and Quarantine Check

## 1. Background

Phase 3.6 exposed schema-valid but semantically invalid samples. A sample can pass JSON schema and hard constraints while still having a mismatched target, reused body content, duplicate actual content, or insufficient text.

That means schema validation is necessary but not sufficient for renderer readiness.

## 2. Objective

This phase audits target/body alignment and quarantines mismatch, duplicate, and low-text samples so they cannot be counted as renderer baseline candidates.

It does not continue sampling and does not enter renderer implementation.

## 3. Scope

Allowed:

- Scan intermediate samples.
- Generate semantic alignment audit reports.
- Generate a quarantine manifest.
- Update quality audit and coverage report to read the quarantine manifest.

Prohibited:

- Delete raw artifacts.
- Markdown renderer.
- OCR.
- Decrypting `encrypt=1`.
- Automatic image-table reconstruction.
- Full-site crawling.
- Entering Phase 4.

## 4. Alignment Rules

Title / target consistency:

- `matched`: `content.title` and `navigation_context.target_node_text` are identical.
- `likely_matched`: one contains the other or they share the same numbered leaf prefix.
- `mismatched`: title and target clearly point to different nodes or one is a chapter parent of the other.
- `unknown`: insufficient evidence.

Body signal consistency:

- Extract expected tokens from title and target, including numeric section tokens and meaningful Chinese or Latin terms.
- Compare expected tokens with text blocks, key terms, image surrounding text, and HTML fragment text.
- Mark `matched` when body text contains meaningful expected tokens.
- Mark `mismatched` when body text clearly contains another sample's distinctive tokens.
- Mark `insufficient_text` when body text is too short.
- Mark `image_dominant_unknown` when the sample is image-heavy and text evidence is insufficient.

Duplicate actual content detection:

- Compute a fingerprint from normalized text blocks, image reference URLs, and key terms.
- Samples with the same fingerprint but different titles or targets are duplicate actual content.

Quarantine decision:

- Quarantine target/body mismatch.
- Quarantine duplicate actual content when title or target differs.
- Quarantine global fallback strategy.
- Quarantine low text with no image references.
- Quarantine `body_alignment = mismatched`.

## 5. Quarantine Policy

Quarantine does not delete samples or raw artifacts.

Quarantined samples remain available for diagnosis, but they do not count toward renderer baseline eligibility.

The quarantine manifest is an input to renderer gate decisions in sample quality audit and coverage reporting.

## 6. Commands

```bash
pnpm audit:semantic-alignment
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- `audit:semantic-alignment` is runnable.
- `verification/generated/phase3_7_semantic_alignment_audit.md` is generated.
- `verification/generated/phase3_7_semantic_alignment_audit.json` is generated.
- `data/intermediate/ruankaodaren/quarantine/quarantine-manifest.json` is generated.
- Mismatch samples are quarantined.
- `audit:sample-quality` excludes quarantined samples from renderer readiness.
- `report:sample-coverage` displays quarantined samples.
- `pnpm typecheck` passes.
- `pnpm verify` passes.

## 8. Failure Handling

If alignment cannot be judged:

- Mark `unknown`.
- Require manual review.
- Do not count it as renderer baseline unless there is clear matched evidence.

If false-positive risk is high:

- Prefer quarantine over renderer eligibility.

Phase 3.8 moves semantic alignment checks earlier into acquisition preflight to prevent future schema-valid semantic pollution.
