# Project Roadmap

This roadmap records the intended staged delivery for the Markdown-first Ruankao senior System Architect knowledge base.

## Phase 1: Project Scaffold And Templates

- Create the repository structure.
- Define writing rules and source policy.
- Provide reusable concept, case-analysis, and paper templates.
- Add a minimum TypeScript structure verification script.

## Phase 2: Playwright Crawler

- Plan a crawler for future approved public source collection.
- Preserve source URL, capture time, content hash, and parser version.
- Do not implement crawler behavior in Phase 1.

## Phase 3: Parser And Schema Validation

- Convert captured source material into structured intermediate data.
- Validate required metadata and document fields.
- Keep parsing logic separate from Markdown rendering.

## Phase 4: Markdown Renderer

- Render reviewed intermediate data into knowledge-base Markdown.
- Enforce the non-negotiable output structure from `AGENTS.md`.
- Keep generated content traceable to source metadata.

## Phase 5: Exam Coverage Verification

- Check coverage across 综合知识, 案例分析, and 论文.
- Identify missing or weakly supported concepts.
- Report coverage gaps without inventing exam content.
