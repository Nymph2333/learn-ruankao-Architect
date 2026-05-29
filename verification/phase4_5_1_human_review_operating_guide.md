# Phase 4.5.1 Human Review Operating Guide

This guide is for human reviewers. It does not approve any baseline document, does not modify `human-review-status.json`, does not generate new official Markdown, and does not enter Phase 4.6.

## 1. Review Scope

Review exactly these three official baseline documents:

- `docs/ruankaodaren/baseline/1.3_指令系统CISC和RISC.md`
- `docs/ruankaodaren/baseline/13.3_软件架构风格.md`
- `docs/ruankaodaren/baseline/9.1_信息安全基础知识.md`

Use these supporting review artifacts:

- `reviews/ruankaodaren/baseline/human-review-status.json`
- `reviews/ruankaodaren/baseline/human-review-status.md`
- `verification/generated/phase4_3_human_review_checklist.md`
- `verification/generated/phase4_5_controlled_expansion_plan.md`

Do not use raw HTML, raw XHR, OCR, encrypted XHR decryption, web requests, or image table reconstruction during review.

## 2. How to Review Each Baseline Doc

For each document, check the seven required sections:

- Core Concept / 核心概念
- Architectural Topology & Visualization / 架构拓扑与可视化
- Deterministic Constraints / 决定论约束
- Ruankao Alignment / 软考考点映射
- Case Study Answer Pattern / 案例分析答题模式
- Paper Usage / 论文可复用方式
- Source Reference / 来源引用

Also check the Phase 4 renderer policy blocks:

- Human Review Checklist / 人工复核清单
- Renderer Boundary / 渲染边界

The reviewer should verify that the document clearly marks missing knowledge as requiring human completion, and that it does not invent unsupported exam facts.

## 3. Per-document Focus

### 1.3 指令系统CISC和RISC

Renderer policy: `asset_card`.

Focus checks:

- Confirm the title and extracted text match the intended CISC/RISC knowledge point.
- Confirm image assets are referenced only as `asset_ref`.
- Confirm the document says the renderer did not OCR or reconstruct the image/table content.
- Manually inspect whether the image content needs later human transcription or explanation.
- Confirm Source Reference includes intermediate JSON, asset manifest, asset `sha256`, and asset `saved_path`.
- Confirm no CISC/RISC comparison table was automatically reconstructed from the image.

### 13.3 软件架构风格

Renderer policy: `short_card`.

Focus checks:

- Confirm the short extracted text is genuinely useful and not misleading.
- Confirm the document does not expand the short text into unsupported architecture theory.
- Confirm the document clearly marks that definitions, properties, case-study points, and paper usage need human supplementation.
- Confirm the short-card policy is appropriate, or mark whether it should become `manual_review_card`.

### 9.1 信息安全基础知识

Renderer policy: `concept_card`.

Focus checks:

- Confirm the extracted confidentiality, integrity, availability, controllability, and auditability content is correct.
- Confirm the renderer only organizes intermediate text and key terms.
- Confirm the document does not introduce unsupported exam conclusions.
- Confirm the case-study and paper sections remain frameworks rather than invented answer material.

## 4. Release Decision Rules

Use one of these release decisions for each item:

- `accepted`: all required checks are complete, the document is safe as a baseline, and no manual notes are needed.
- `accepted_with_notes`: all required checks are complete, the document is safe as a baseline, but reviewer notes are required for later human supplementation.
- `needs_revision`: the document should not be used for expansion until renderer policy, template wording, source references, or extracted content presentation is revised.
- `rejected`: the document is unsuitable as a baseline because of boundary violations, incorrect source binding, semantic mismatch, or unsafe content.

Only `accepted` and `accepted_with_notes` can count toward Phase 4.6 entry.

## 5. Manual Status Editing

The reviewer must update `reviews/ruankaodaren/baseline/human-review-status.json` manually. Scripts must not auto-sign or auto-approve any item.

For each reviewed item, fill:

- `review_status`: use `reviewed` only after all required checks are completed.
- `reviewer`: human reviewer name or stable reviewer identifier.
- `reviewed_at`: ISO 8601 timestamp, for example `2026-05-29T14:30:00+08:00`.
- `required_checks`: set each completed check to `true`.
- `manual_notes`: add reviewer notes if the decision is `accepted_with_notes`, `needs_revision`, or `rejected`.
- `release_decision`: one of `accepted`, `accepted_with_notes`, `needs_revision`, or `rejected`.

Required checks:

- `content_correctness_checked`
- `source_reference_checked`
- `asset_review_checked`
- `ruankao_alignment_checked`
- `case_study_pattern_checked`
- `paper_usage_checked`
- `renderer_boundary_checked`

After all three items are reviewed, update the aggregate fields manually:

- `overall_status`: set to `review_complete` only if every item is reviewed.
- `phase4_6_expansion_allowed`: set to `true` only if every item is `accepted` or `accepted_with_notes` and every required check is `true`.

If any item is `needs_revision`, `rejected`, or has an incomplete required check, keep:

- `overall_status`: `pending_review` or an explicit non-complete status.
- `phase4_6_expansion_allowed`: `false`.

## 6. Validation Command

After manual edits, run:

```bash
pnpm validate:human-review-status
```

The validator must pass before Phase 4.6 can be considered. If it fails, fix the manually edited review status file rather than changing the validator to approve incomplete review.

## 7. Phase 4.6 Entry Conditions

Phase 4.6 is allowed only when all conditions are true:

- All three baseline items are reviewed by a human.
- Each item has `reviewer` and `reviewed_at`.
- Every `required_checks` field is `true` for every item.
- Every `release_decision` is `accepted` or `accepted_with_notes`.
- `overall_status` is `review_complete`.
- `phase4_6_expansion_allowed` is `true`.
- `pnpm validate:human-review-status` passes.
- `pnpm validate:controlled-expansion-plan` passes.
- Renderer boundary policy remains unchanged: no OCR, no raw HTML/XHR direct read, no web requests, no decryption, no image table reconstruction, and no content invention.

## 8. Explicit No-auto-approval Policy

Scripts must not:

- Fill `reviewer`.
- Fill `reviewed_at`.
- Set required checks to `true`.
- Change release decisions to `accepted` or `accepted_with_notes`.
- Change `overall_status` to `review_complete`.
- Change `phase4_6_expansion_allowed` to `true`.

Only a human reviewer may sign off the review status. Phase 4.5.1 provides operating guidance only.
