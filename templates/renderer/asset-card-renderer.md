# {{title}}

Renderer template: `asset_card`.

Boundary:
- Use only text already present in intermediate JSON.
- Preserve image references as `asset_ref` metadata.
- Do not describe image or table contents.
- Do not read raw HTML or raw XHR.
- Do not use web requests.
- Do not invent, supplement, or rewrite missing content.
- Do not OCR images or reconstruct image tables.

## Core Concept / 核心概念

{{core_concept}}

## Architectural Topology & Visualization / 架构拓扑与可视化

{{topology_placeholder}}

{{asset_refs}}

## Deterministic Constraints / 决定论约束

{{deterministic_constraints}}

## Ruankao Alignment / 软考考点映射

{{ruankao_alignment}}

## Case Study Answer Pattern / 案例分析答题模式

{{case_study_pattern}}

## Paper Usage / 论文可复用方式

{{paper_usage}}

## Source Reference / 来源引用

{{source_reference}}

## Human Review Checklist / 人工复核清单

- [ ] 内容是否与正式教材一致。
- [ ] 是否需要补充定义 / 特点 / 优缺点。
- [ ] 是否需要补充案例分析答题点。
- [ ] 是否需要补充论文可用表达。
- [ ] 是否需要复核图片资产。
- [ ] 是否确认 renderer 未补写缺失内容。

Asset-card specific review:
- [ ] `asset_ref` 只是引用，不代表 renderer 已理解图片内容。
- [ ] 图片内容必须人工阅读。
- [ ] `sha256` / `saved_path` / `content_type` / dimensions 是资产定位信息，不是知识解释。
- [ ] 不允许根据图片自动写 CISC/RISC 对比表内容。

## Renderer Boundary / 渲染边界

- 未 OCR。
- 未解密 `encrypt=1`。
- 未还原图片表格。
- 未读取 raw HTML。
- 未读取 raw XHR。
- 未访问网页。
- 未补写缺失内容。
