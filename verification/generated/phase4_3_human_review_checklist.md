# Phase 4.3 Human Review Checklist

This checklist is for human review only. It does not add content, perform OCR, reconstruct image tables, read raw HTML/XHR, or access the web.

## Summary

- checklist_count: 3
- quality_audit: `verification/generated/phase4_3_render_quality_audit.json`
- aggregate_trace: `verification/generated/phase4_2_baseline_set_render_trace.json`
- renderer_input_contract: `verification/generated/phase3_25_renderer_input_contract.json`

## 1.3 指令系统CISC和RISC

- path: `docs/ruankaodaren/baseline/1.3_指令系统CISC和RISC.md`
- render_as: `asset_card`
- quality_status: `pass`
- suggested_release_decision: `accept_with_manual_notes`

### Content correctness / 内容正确性

- [ ] 标题是否正确。
- [ ] 已抽取文本是否可信。
- [ ] 是否需要人工补充正式教材定义。
- [ ] 是否需要人工补充考试考点。

### Asset review / 资产复核

- [ ] 是否存在图片资产：是。
- [ ] 图片是否需要人工阅读：是。
- [ ] 禁止 OCR / 自动还原图片表格。
- [ ] asset_ref 是否能打开 / 找到。

### Ruankao alignment review / 软考映射复核

- [ ] 是否需要人工补充选择题考点。
- [ ] 是否需要人工补充案例分析答题点。
- [ ] 是否需要人工补充论文可用段落。

### Renderer policy review / 渲染策略复核

- [ ] 当前 renderer policy 是否合适：asset_card。
- [ ] 是否应转为 manual_review_card。
- [ ] 是否需要 Phase 4.4 refinement 调整模板表达。

### Release decision / 发布判断

- [ ] accept
- [ ] accept_with_manual_notes
- [ ] revise_renderer_template
- [ ] reject_from_batch_baseline

## 13.3 软件架构风格

- path: `docs/ruankaodaren/baseline/13.3_软件架构风格.md`
- render_as: `short_card`
- quality_status: `pass`
- suggested_release_decision: `accept_with_manual_notes`

### Content correctness / 内容正确性

- [ ] 标题是否正确。
- [ ] 已抽取文本是否可信。
- [ ] 是否需要人工补充正式教材定义。
- [ ] 是否需要人工补充考试考点。

### Asset review / 资产复核

- [ ] 是否存在图片资产：是。
- [ ] 图片是否需要人工阅读：按需。
- [ ] 禁止 OCR / 自动还原图片表格。
- [ ] asset_ref 是否能打开 / 找到。

### Ruankao alignment review / 软考映射复核

- [ ] 是否需要人工补充选择题考点。
- [ ] 是否需要人工补充案例分析答题点。
- [ ] 是否需要人工补充论文可用段落。

### Renderer policy review / 渲染策略复核

- [ ] 当前 renderer policy 是否合适：short_card。
- [ ] 是否应转为 manual_review_card。
- [ ] 是否需要 Phase 4.4 refinement 调整模板表达。

### Release decision / 发布判断

- [ ] accept
- [ ] accept_with_manual_notes
- [ ] revise_renderer_template
- [ ] reject_from_batch_baseline

## 9.1 信息安全基础知识

- path: `docs/ruankaodaren/baseline/9.1_信息安全基础知识.md`
- render_as: `concept_card`
- quality_status: `pass`
- suggested_release_decision: `accept_with_manual_notes`

### Content correctness / 内容正确性

- [ ] 标题是否正确。
- [ ] 已抽取文本是否可信。
- [ ] 是否需要人工补充正式教材定义。
- [ ] 是否需要人工补充考试考点。

### Asset review / 资产复核

- [ ] 是否存在图片资产：否。
- [ ] 图片是否需要人工阅读：按需。
- [ ] 禁止 OCR / 自动还原图片表格。
- [ ] asset_ref 是否能打开 / 找到。

### Ruankao alignment review / 软考映射复核

- [ ] 是否需要人工补充选择题考点。
- [ ] 是否需要人工补充案例分析答题点。
- [ ] 是否需要人工补充论文可用段落。

### Renderer policy review / 渲染策略复核

- [ ] 当前 renderer policy 是否合适：concept_card。
- [ ] 是否应转为 manual_review_card。
- [ ] 是否需要 Phase 4.4 refinement 调整模板表达。

### Release decision / 发布判断

- [ ] accept
- [ ] accept_with_manual_notes
- [ ] revise_renderer_template
- [ ] reject_from_batch_baseline
