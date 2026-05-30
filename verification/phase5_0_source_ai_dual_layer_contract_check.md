# Phase 5.0 Source + AI Learning Dual-layer Renderer Contract

## 1. Background

Phase 4 completed a conservative renderer boundary for three baseline Markdown files. Those files preserve extracted source text, asset references, renderer policy, and manual review gates, but they are not final learning documents.

The current learning need is different from Phase 4 rendering: keep webpage source/original material auditable, then add clearly separated AI learning analysis for Ruankao System Architect study. Phase 5.0 defines that contract only.

## 2. Problem

The current official Markdown has several limits:

- The source/original layer is present only implicitly through extracted text, key terms, asset refs, and source references.
- The AI learning layer does not exist.
- Case study and paper sections are placeholders because Phase 4 forbids supplementation.
- `13.3 软件架构风格` is taxonomy-suspect: current catalog treats it as a reachable leaf, but user-observed UI may expose child nodes `13.3.1` through `13.3.4`, and current evidence shows only a 61-character static-low-text card.
- Source artifacts may be absent from the checked-in repository because raw snapshots, intermediate JSON, asset manifests, and asset images are ignored.
- It is not appropriate to enter Phase 4.6 controlled expansion before the source and AI learning layers are separated.

## 3. Objective

Phase 5.0 only defines the Source + AI Learning dual-layer document contract.

It adds:

- A JSON schema for future dual-layer documents.
- TypeScript domain types for the same contract.
- A validator that checks the schema and invariant boundaries.
- This verification document.

Phase 5.0 does not generate AI learning content, does not create dual-layer document instances, does not alter official baseline Markdown, and does not enter Phase 5.1 or Phase 4.6.

## 4. Source Layer Policy

The source layer stores original/extracted material only:

- Extracted source text blocks from validated intermediate artifacts.
- Extracted source key terms from validated intermediate artifacts.
- Image or other asset references from asset manifests.
- Official Markdown paths only as render references, not as the sole source of truth.
- Source timestamp, content hash, parser version, source availability, and source paths.

The source layer must not:

- Rewrite original text.
- Expand missing material.
- Perform OCR.
- Reconstruct image tables.
- Decrypt `encrypt=1`.
- Read raw XHR for renderer generation.
- Mix in AI-generated explanation.

If a source artifact is unavailable, the document must mark source availability explicitly and wait for a source packet instead of treating official Markdown as complete source truth.

## 5. AI Learning Layer Policy

The AI learning layer is separate from the source layer and must be explicitly marked `AI-generated`.

Allowed AI learning sections are:

- `AI Explanation / AI解析`
- `Architecture Mapping / 架构师考点映射`
- `Case Study Pattern / 案例答题模式`
- `Paper Usage / 论文表达`
- `Misconceptions / 易错点`
- `Memory Hooks / 记忆钩子`

The AI layer may explain, expand, compare, classify, map to Ruankao exam usage, shape case-study answer patterns, and draft paper expressions. It must reference the source layer and must not modify, overwrite, or disguise AI output as original source content.

The default AI generation status is `not_generated`, and the default AI review status is `pending_review`.

## 6. Source Artifact Retention Policy

Future source packets must make the source layer auditable. A source packet should retain:

- Source URL and capture time.
- Intermediate JSON path and content hash.
- Asset manifest path and asset hashes.
- Asset files or stable asset references.
- Parser version.
- Official Markdown render reference.
- Any unavailable artifact flags.

If the current repository is missing intermediate JSON, asset manifests, or asset files, the next phase must build or recover source packets first. Official Markdown cannot be used as the only source of truth because it is a rendered derivative and may omit raw/intermediate context.

## 7. Taxonomy Correction Policy

`13.3 软件架构风格` must be marked `taxonomy_suspect` until rechecked.

Required recheck targets:

- `13.3.1 软件体系结构风格`
- `13.3.2 基本架构风格`
- `13.3.3 层次结构风格`
- `13.3.4 面向服务的架构 SOA`

A parent directory must not become the final learning leaf. If live UI proves `13.3` is a parent node, future documents should use the verified child leaf nodes. If only a parent node can be captured, the taxonomy must model it as parent plus child placeholders or as a multi-card sequence with explicit item indexes.

## 8. Forbidden Actions

Phase 5.0 forbids:

- Automatic AI learning正文 generation.
- Automatic human-review signoff.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Full-library or full-site batch rendering.
- New official Markdown generation.
- Crawl or acquisition runs.
- Raw XHR reads.
- Web access.
- Entering Phase 4.6.

## 9. Next Phase Proposal

The recommended next phase is:

`Phase 5.1 Source Packet Builder and Taxonomy Recheck`

Phase 5.1 should come before Phase 4.6. It should verify or rebuild source packets, check whether `13.3.1` through `13.3.4` exist in the live taxonomy, and only then decide which nodes are safe inputs for AI learning-layer generation.
