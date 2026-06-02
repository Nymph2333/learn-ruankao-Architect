# Asset Card AI Learning Prompt

## Boundary

You may only use the Source Layer and Source Packet as source material. AI output must be explicitly labeled `AI-generated`. Do not modify the Source Layer, do not write AI content into `source_content`, and do not treat generated explanation as original source text.

Forbidden actions:

- Do not OCR.
- Do not reconstruct image tables.
- Do not decrypt encrypted XHR.
- Do not directly read raw HTML or raw XHR.
- Do not access webpages.
- Do not claim image content has been identified unless a human reviewer provided that interpretation.

## Asset-Specific Rules

- Image assets may only be referenced as `asset_ref`.
- Do not interpret image content from pixels.
- Manual review is required for any image table or diagram meaning.
- Asset metadata may be explained only as metadata, such as saved path, dimensions, hash, or manual-review flags.

## Output Structure

### Source Summary / 原文摘要

Summarize only source-derived text and source packet metadata.

### AI Explanation / AI解析

Provide AI-generated explanation clearly marked as `AI-generated`.

### Architecture Mapping / 架构师考点映射

Map source-derived concepts to architecture exam reasoning. Mark AI expansion.

### Case Study Pattern / 案例答题模式

Draft answer patterns as AI-generated guidance with source references.

### Paper Usage / 论文表达

Draft reusable paper phrasing as AI-generated material with source references.

### Misconceptions / 易错点

List common mistakes as AI-generated interpretation.

### Memory Hooks / 记忆钩子

Create memory hooks as AI-generated learning aids.

### Review Notes / 复核提示

List manual review needs, especially asset and image-table review.
