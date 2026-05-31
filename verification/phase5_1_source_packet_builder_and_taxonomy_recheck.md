# Phase 5.1 Source Packet Builder and Taxonomy Recheck

## 1. Background

Phase 5.0 established a Source Layer / AI Learning Layer contract. That contract is necessary but not sufficient: the repository may not currently contain the underlying source artifacts referenced by the three conservative baseline Markdown files.

Current concerns:

- `data/intermediate/ruankaodaren/samples/*.json` may be missing.
- Asset manifests may be missing.
- Asset image files may be missing.
- `13.3 软件架构风格` remains taxonomy-suspect because current catalog evidence does not confirm `13.3.1` through `13.3.4`, while user-observed UI suggests those child nodes may exist.

## 2. Objective

Phase 5.1 builds auditable source packet manifests for the current three baseline official docs and rechecks the `13.3` taxonomy.

This phase does not generate AI learning content. It records source availability, missing artifacts, taxonomy evidence, and recommended next actions.

## 3. Scope

Allowed:

- Check source artifact existence.
- Generate source packet JSON / Markdown manifests.
- Validate source packets.
- Perform catalog-level taxonomy recheck.
- Expand catalog directory nodes and read directory text / DOM tree.

Forbidden:

- AI learning content generation.
- Official Markdown rewriting.
- Automatic human review signoff.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw XHR direct reads.
- Detail acquisition.
- Phase 4.6 entry.
- Full-library or full-site batch rendering.

## 4. Source Packet Policy

Official Markdown is a rendered derivative and must not be treated as the only source of truth.

A complete source packet requires traceable source artifacts:

- Intermediate JSON.
- Asset manifest when an asset manifest is referenced.
- Asset files when an asset-card item depends on image assets.
- Renderer input contract and baseline manifest references.
- Official Markdown render reference.

Missing artifacts must be recorded explicitly in `missing_artifacts`. Missing source must not be fabricated, inferred, or reconstructed from official Markdown.

If source artifacts are missing, `phase5_2_ai_generation_allowed` remains `false`.

## 5. Taxonomy Recheck Policy

`13.3 软件架构风格` is `taxonomy_suspect` until proven otherwise.

The recheck must look for:

- `13.3.1 软件系统结构风格` / `13.3.1 软件体系结构风格`
- `13.3.2 基本架构风格`
- `13.3.3 层次结构风格`
- `13.3.4 面向服务的架构 SOA`

A parent node should not be used as the final learning leaf. If `13.3` is a parent, future learning documents should use verified children. If it is a multi-card sequence, it must be modeled as a sequence with explicit item boundaries.

## 6. Commands

```bash
pnpm build:source-packets
pnpm validate:source-packets
pnpm recheck:taxonomy
pnpm validate:dual-layer-contract
pnpm validate:human-review-status
pnpm validate:controlled-expansion-plan
pnpm typecheck
pnpm verify
```

## 7. Success Criteria

- Source packet JSON / Markdown generated.
- Missing artifacts explicitly recorded.
- `validate:source-packets` passes.
- Taxonomy recheck report generated.
- `13.3` has an explicit `taxonomy_suspect` judgment.
- No AI content generated.
- Typecheck and structure verification pass.

## 8. Failure Handling

If source artifacts are missing:

- Do not fail source packet build.
- Record missing artifacts.
- Keep `phase5_2_ai_generation_allowed = false`.

If taxonomy live recheck fails:

- Do not guess child nodes.
- Keep `taxonomy_suspect = true`.
- Set `recommended_action = manual_review_required`.

## 9. Phase 5.2 Follow-up

Phase 5.2 attempts controlled recovery of missing baseline source artifacts and reruns 13.3 taxonomy live recheck after restoring Playwright Chromium.
