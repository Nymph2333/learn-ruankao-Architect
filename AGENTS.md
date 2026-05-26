# AGENTS.md

## 1. Project Mission

This repository builds a Markdown-first knowledge base for the Ruankao senior-level System Architect exam / 软考高级系统架构设计师考试.

The project is not a web mirror and not a direct copy of public notes. Its purpose is to transform fragmented materials into structured, exam-oriented knowledge assets:

Knowledge point -> architectural explanation -> constraint model -> case-study answer pattern -> reusable paper material.

## 2. Non-Negotiable Output Structure

Every technical knowledge document in `docs/` must include the following sections:

- Core Concept / 核心概念
- Architectural Topology & Visualization / 架构拓扑与可视化
- Deterministic Constraints / 决定论约束
- Ruankao Alignment / 软考考点映射
- Case Study Answer Pattern / 案例分析答题模式
- Paper Usage / 论文可复用方式

These sections are required because the repository is designed for reasoning, answering, and writing, not for shallow memorization.

## 3. Writing Standard

Documents should avoid shallow recitation. Prefer explanations based on:

- architectural invariants / 架构不变量
- trade-off analysis / 权衡分析
- failure mode analysis / 失效模式分析
- deterministic causal chains / 决定论因果链
- exam mapping / 考试映射
- Mermaid diagrams / Mermaid 图

Do not produce:

- empty motivational language / 空洞励志语言
- generic definitions without architecture context / 脱离架构语境的泛泛定义
- unverified facts / 未验证事实
- large copied passages from source material / 原文大段复制
- unstructured Markdown / 无结构 Markdown

When a fact is uncertain, mark it as requiring verification instead of presenting it as exam truth.

## 4. Source Policy

Future source material must be stored by source and processing stage:

- Raw source material: `sources/<source-name>/raw/`
- Parsed intermediate material: `sources/<source-name>/parsed/`
- Human-readable knowledge documents: `docs/`

Every future source capture must preserve:

- source URL
- capture time
- content hash
- parser version

Generated Markdown must cite source references without copying large original passages.

## 5. Technical Roadmap

- Phase 1: project scaffold and templates
- Phase 2: Playwright crawler
- Phase 3: parser and schema validation
- Phase 4: Markdown renderer
- Phase 5: exam coverage verification

This repository currently implements only the Phase 1 scaffold, templates, and minimum structural verification.
