# Phase 5.4 AI Learning Layer Prompt Contract

## 1. Background

Phase 5.3.2 completed the source packet completeness policy repair. The three baseline source packets are complete, but AI generation remains disallowed because source completeness is not the same as prompt-contract approval or human review signoff.

## 2. Objective

This phase defines the AI Learning Layer prompt contract without generating AI learning content. It establishes allowed prompt sections, source-layer binding, content-shape policies, taxonomy-suspect handling, and validation rules.

## 3. Scope

Allowed:

- Read source packet.
- Read dual-layer schema.
- Read human review status.
- Generate AI prompt contract JSON / Markdown.
- Generate prompt templates.

Forbidden:

- AI learning content generation.
- Official Markdown rewrite.
- OCR.
- Decrypting `encrypt=1`.
- Image table reconstruction.
- Raw HTML direct read.
- Raw XHR direct read.
- Web requests.
- Automatic human review signoff.

## 4. Source Layer Binding

The AI Learning Layer must reference the Source Layer through the source packet. It must preserve source text, must not modify Source Layer artifacts, and must keep AI-generated material clearly separated from source-derived facts.

## 5. AI Learning Sections

- AI Explanation / AI解析
- Architecture Mapping / 架构师考点映射
- Case Study Pattern / 案例答题模式
- Paper Usage / 论文表达
- Misconceptions / 易错点
- Memory Hooks / 记忆钩子
- Review Notes / 复核提示

## 6. Content Shape Policies

- `asset_card`: may explain text blocks and asset metadata, but may not describe image content from pixels. Image assets can only be referenced as asset refs, and manual review is required for image tables or diagrams.
- `short_card`: may expand concepts only as AI-generated material, must mark source as short, and must not claim complete topic coverage.
- `concept_card`: may map extracted concepts to architecture and exam patterns, but must separate source-derived facts from AI expansion.
- `manual_review_card`: used when source packet, taxonomy, or review state requires extra caution before learning generation.

## 7. Taxonomy-suspect Policy

`13.3 软件架构风格` remains taxonomy-suspect. A multi-card sequence is possible, so AI must not claim it covers the complete software architecture style topic. Human review is required before any future learning content release.

## 8. Commands

```bash
pnpm build:ai-learning-prompt-contract
pnpm validate:ai-learning-prompt-contract
pnpm validate:source-packets
pnpm validate:dual-layer-contract
pnpm validate:human-review-status
pnpm validate:controlled-expansion-plan
pnpm typecheck
pnpm verify
```

## 9. Success Criteria

- Prompt contract JSON / Markdown generated.
- Prompt templates generated.
- `generation_allowed = false`.
- Every item has `ai_generation_allowed_for_item = false`.
- Forbidden inputs are complete.
- `13.3` taxonomy warning is present.
- Validator passes.
- Typecheck and structure verification pass.

## 10. Failure Handling

If source packet is incomplete, do not generate the contract.

If a prompt template is missing, validation fails.

If `generation_allowed = true`, validation fails.
