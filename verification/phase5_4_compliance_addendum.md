# Phase 5.4 Compliance Addendum

## 1. Source Packet Gate Audit

The Phase 5.4 prompt contract depends on complete source packets. The gate was checked before any Phase 5.4 compliance validation.

```text
source-packet.json exists: true
complete_count: 3
gate_result: pass
source packet repair attempted: false
```

If `source-packet.json` is missing or `complete_count != 3`, Phase 5.4 prompt-contract build must fail, must report the current source packet state, and must not attempt source packet repair. The builder and validator both enforce this gate.

## 2. Official Markdown Audit

The official baseline Markdown files under `docs/ruankaodaren/baseline/` must remain unchanged during Phase 5.4. Compliance validation checks `git status --short docs/ruankaodaren/baseline` and fails when any official Markdown change is detected.

## 3. Prompt Template Audit

Prompt templates are contract templates only. They may contain generation rules, source-layer boundaries, forbidden actions, and output structure. They must not contain concrete Ruankao knowledge-body examples for the baseline titles.

Required template boundaries:

- Use only Source Layer / Source Packet.
- Mark AI output as `AI-generated`.
- Do not modify the Source Layer.
- Do not write AI content into `source_content`.
- Do not OCR.
- Do not reconstruct image tables.
- Do not decrypt encrypted XHR.
- Do not directly read raw HTML or raw XHR.
- Do not access webpages.
- Do not claim image content has been identified unless human-provided.

## 4. Validator Coverage Addendum

`pnpm build:ai-learning-prompt-contract` and `pnpm validate:ai-learning-prompt-contract` now cover the Source Packet Gate. `pnpm validate:ai-learning-prompt-contract` additionally covers:

- Source packet file exists.
- Source packet `complete_count = 3`.
- Source packet status is `complete`.
- Official baseline Markdown has no Git changes.
- Prompt templates exist.
- Prompt templates contain required boundary and output structure snippets.
- Prompt templates do not contain concrete baseline knowledge examples.
- `generation_allowed = false`.
- Every `ai_generation_allowed_for_item = false`.
- Forbidden inputs include OCR, image table reconstruction, encrypted XHR decryption, raw HTML direct read, raw XHR direct read, web requests, source layer modification, and unmarked AI content.
- `13.3 软件架构风格` appears in taxonomy affected titles and carries restrictive warnings.

## 5. Git Status Audit

The final compliance report must include `git status --short` and classify changed files into:

- Should commit: Phase 5.4 schema/type/scripts/templates/verification docs and generated prompt contract reports.
- Do not commit: `.auth`, `node_modules`, raw snapshots, intermediate generated artifacts, and asset images unless explicitly approved by project policy.
- Needs user confirmation: local pnpm build-approval metadata and prior Phase 5.3 recovery/generated reports if they are still unstaged or untracked.

## 6. Explicit No-go

This addendum does not generate AI learning content, does not generate dual-layer document instances, does not run renderer, does not modify official Markdown, does not OCR, does not decrypt `encrypt=1`, does not reconstruct image tables, does not read raw HTML or raw XHR, does not use web requests, does not sign off human review, and does not enter Phase 4.6.
