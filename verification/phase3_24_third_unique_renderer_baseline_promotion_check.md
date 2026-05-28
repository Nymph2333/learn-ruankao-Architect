# Phase 3.24 Third Unique Renderer Baseline Promotion Check

## 1. Background

Phase 3.23 produced a unique-title renderer baseline manifest with `unique_title_count = 2`.
The current canonical baseline titles are `1.3 指令系统CISC和RISC` and `13.3 软件架构风格`, so Phase 4 remains blocked until one more unique renderer-ready title is available.

## 2. Objective

This phase uses discovery-first promotion to obtain a third unique renderer baseline title. It first tests exact reachable leaf targets with detail interaction discovery, then promotes at most one discovery-qualified target through the controlled acquisition pipeline.

## 3. Scope

Allowed:
- Run detail interaction discovery for at most 3 exact reachable leaf targets.
- Promote at most 1 discovery-qualified target through controlled acquisition.
- Re-run renderer readiness, semantic alignment, sample quality, coverage, baseline manifest, and validations.
- Generate a Phase 3.24 promotion run report.

Prohibited:
- Markdown renderer
- OCR
- Decrypting `encrypt=1`
- Automatically reconstructing image tables
- Full-site crawling
- Rewriting exam content
- Entering Phase 4 implementation

## 4. Candidate Policy

Candidates must come from the Phase 3.11 reachable leaf catalog and must not be:
- Existing canonical baseline titles.
- Quarantined titles.
- Known duplicate or mismatch samples.
- Previously rejected low-text failures unless discovery evidence is rerun.
- Chapter-level titles.

Priority candidates:
- `9.1 信息安全基础知识`
- `9.2 信息安全系统的组成框架`
- `12.2 软件配置管理`
- `10.2 需求工程`
- `3.11 SQL语言`

## 5. Promotion Rules

A candidate may be promoted only when discovery proves one of:

- `static_low_text` verified: safe clicks do not reveal significantly more text, alternate containers are not richer, final content is stable, and no mismatch signal is present.
- rich text verified: the strongest visible container has at least 120 characters and no target-mismatch signal is present.
- asset-card verified: images exist with surrounding text and the no-OCR asset reference policy can be preserved.

Discovery evidence must be recorded in the sample target config before acquisition.

## 6. Commands

```bash
pnpm run:third-baseline-promotion
pnpm audit:renderer-readiness
pnpm build:renderer-baseline
pnpm audit:sample-quality
pnpm report:sample-coverage
pnpm validate:intermediate
pnpm validate:assets
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

Minimum success:
- `run:third-baseline-promotion` is runnable.
- Every failed candidate has a clear reject reason.
- No unaudited sample is counted as a renderer baseline.
- `typecheck` and `verify` pass.

Ideal success:
- `final_unique_title_count >= 3`
- `phase4_input_contract_ready = true`
- `phase4_renderer_allowed = true`

Even if the ideal condition is reached, Phase 4 implementation must not start in this phase.

Phase 3.25 freezes the renderer input contract before any Phase 4 renderer implementation.

## 8. Failure Handling

If discovery is not qualified:
- Do not run acquisition for that candidate.
- Record the reject reason.

If acquisition fails:
- Do not generate a fake sample.
- Do not count the target as a baseline.

If semantic alignment fails:
- Quarantine or keep diagnostic evidence.
- Do not count it as a baseline.
