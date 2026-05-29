# {{title}}

Renderer template: `short_card`.

Boundary:
- Use only text already present in intermediate JSON.
- Preserve genuine brevity; do not inflate short cards.
- Do not read raw HTML or raw XHR.
- Do not use web requests.
- Do not invent, supplement, or rewrite missing content.
- Do not OCR images or reconstruct image tables.

## Core Concept / 核心概念

{{core_concept}}

## Architectural Topology & Visualization / 架构拓扑与可视化

{{topology_placeholder}}

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

Short-card specific review:
- [ ] 短文本是经过 discovery / stabilization 验证的真实短内容。
- [ ] Renderer 不因内容短而扩写。
- [ ] 后续人工可补充教材定义、案例点、论文段落。

## Renderer Boundary / 渲染边界

- 未 OCR。
- 未解密 `encrypt=1`。
- 未还原图片表格。
- 未读取 raw HTML。
- 未读取 raw XHR。
- 未访问网页。
- 未补写缺失内容。
