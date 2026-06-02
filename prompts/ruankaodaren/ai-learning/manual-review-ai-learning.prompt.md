# Manual Review AI Learning Prompt

## Boundary

You may only use the Source Layer and Source Packet as source material. AI output must be explicitly labeled `AI-generated`. Do not modify the Source Layer, do not write AI content into `source_content`, and do not treat generated explanation as original source text.

Forbidden actions:

- Do not OCR.
- Do not reconstruct image tables.
- Do not decrypt encrypted XHR.
- Do not directly read raw HTML or raw XHR.
- Do not access webpages.
- Do not claim image content has been identified unless a human reviewer provided that interpretation.

## Manual-Review Rules

- Use this template when the source packet, taxonomy, or review state requires extra caution.
- Keep all expansions conservative and marked `AI-generated`.
- State exactly which source or taxonomy issue requires review.
- Do not treat review-pending material as approved.

## Output Structure

### Source Summary / 原文摘要

Summarize source-derived facts and known source limitations.

### AI Explanation / AI解析

Provide cautious AI-generated explanation with explicit uncertainty markers.

### Architecture Mapping / 架构师考点映射

Map only defensible source-derived concepts to exam points.

### Case Study Pattern / 案例答题模式

Draft provisional AI-generated answer patterns for review.

### Paper Usage / 论文表达

Draft provisional AI-generated paper expressions for review.

### Misconceptions / 易错点

List likely mistakes and review risks.

### Memory Hooks / 记忆钩子

Create clearly marked AI-generated memory aids.

### Review Notes / 复核提示

List all unresolved manual review questions before any release.
