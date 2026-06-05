# Phase 7.4 人工审阅工作清单

> **本清单不是人工审阅本身。** 它不审批内容、不开启 Phase 7.7、
> 不修改生成内容、不创建已完成的人工审阅输入。
> 它仅用于告诉真实的人类审阅者需要检查什么。

生成日期：2026-06-05  
来源提交：`71f8f3f`（Phase 7.4）  
批次：`phase6_1_batch_001`  
已生成条目总数：**36**（8 个类别）  
不支持生成条目：**3**

---

## 1. 仓库文件地图

人工审阅者必须打开以下文件：

| # | 文件说明 | 路径 |
|---|----------|------|
| 1 | Phase 7.4 执行清单 | `data/manifests/phase7_4_ai_learning_generation_execution.json` |
| 2 | Phase 7.5 审阅请求包 | `data/manifests/phase7_5_ai_learning_generation_human_review_request_package.json` |
| 3 | Phase 7.6 阻断审阅记录门 | `data/manifests/phase7_6_ai_learning_generation_human_review_result_recording_gate.json` |
| 4 | 人工审阅输入模板（JSON） | `templates/phase7_4_ai_learning_generation_human_review_input.template.json` |
| 5 | 人工审阅输入模板（指南） | `templates/phase7_4_ai_learning_generation_human_review_input.template.md` |

---

## 2. 主要审阅目标

所有生成内容位于：  
`data/manifests/phase7_4_ai_learning_generation_execution.json`

关键 JSON 路径：

| 区域 | JSON 路径 |
|------|-----------|
| 生成输出 | `$.generated_outputs` |
| 不支持的条目 | `$.unsupported_generation_items` |
| 质量控制 | `$.generation_quality_controls` |
| 范围 | `$.scope` |
| 上游授权 | `$.upstream_authorization` |
| 上游执行计划 | `$.upstream_execution_plan` |
| 上游闭环 | `$.upstream_closure` |

---

## 3. 生成输出审阅表

### 3.1 learning_objectives（9 个条目）

| # | 条目 ID | 标题 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|--------|------------|-----------|------------|
| 1 | `lo-1.3-01` | 理解CISC指令系统的核心特征 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[0].items[0]` | 检查来源忠实度；检查概念正确性 |
| 2 | `lo-1.3-02` | 理解RISC指令系统的核心特征 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[0].items[1]` | 检查来源忠实度；检查概念正确性 |
| 3 | `lo-1.3-03` | 区分CISC与RISC的实现方式差异 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[0].items[2]` | 检查来源忠实度；检查对比准确性 |
| 4 | `lo-13.3-01` | 理解软件体系结构的基本定义 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[0].items[3]` | 检查来源忠实度；检查概念正确性 |
| 5 | `lo-13.3-02` | 掌握软件体系结构的三要素 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[0].items[4]` | 检查来源忠实度；检查完整性 |
| 6 | `lo-13.3-03` | 理解结构在体系结构中的核心地位 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[0].items[5]` | 检查来源忠实度；**confidence=medium — 需验证** |
| 7 | `lo-9.1-01` | 掌握信息安全的五个基本要素 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[0].items[6]` | 检查来源忠实度；检查完整性 |
| 8 | `lo-9.1-02` | 理解机密性与完整性的区别 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[0].items[7]` | 检查来源忠实度；检查区分准确性 |
| 9 | `lo-9.1-03` | 理解可用性与可控性的安全目标 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[0].items[8]` | 检查来源忠实度；检查区分准确性 |

### 3.2 knowledge_units（3 个条目）

| # | 条目 ID | 标题 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|--------|------------|-----------|------------|
| 1 | `ku-1.3` | 指令系统CISC和RISC | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[1].items[0]` | 检查来源忠实度；**manual_review_notes：图片型资料需人工复核** |
| 2 | `ku-13.3` | 软件架构风格 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[1].items[1]` | 检查来源忠实度；**taxonomy_suspect — 需确认分类** |
| 3 | `ku-9.1` | 信息安全基础知识 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[1].items[2]` | 检查来源忠实度；检查完整性 |

### 3.3 exam_oriented_explanations（3 个条目）

| # | 条目 ID | 标题 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|--------|------------|-----------|------------|
| 1 | `ee-1.3` | CISC与RISC对比——软考高频考点解析 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[2].items[0]` | 检查考试相关性；**内容中 RISC 固定长度需人工确认** |
| 2 | `ee-13.3` | 软件体系结构定义——软考概念辨析 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[2].items[1]` | 检查考试相关性；检查概念正确性 |
| 3 | `ee-9.1` | 信息安全五要素——软考必考知识点 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[2].items[2]` | 检查考试相关性；检查完整性 |

### 3.4 practice_questions（6 个条目）

| # | 条目 ID | 类型 | 难度 | 正确答案 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|------|----------|--------|------------|-----------|------------|
| 1 | `pq-1.3-01` | single_choice | basic | B | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[3].items[0]` | 检查题目清晰度；检查选项有效性；检查答案与解析一致性 |
| 2 | `pq-1.3-02` | single_choice | basic | C | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[3].items[1]` | 检查题目清晰度；检查选项有效性；检查答案与解析一致性 |
| 3 | `pq-13.3-01` | single_choice | intermediate | D | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[3].items[2]` | 检查题目清晰度；检查选项有效性；检查答案与解析一致性 |
| 4 | `pq-13.3-02` | true_false | basic | 错误 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[3].items[3]` | 检查题目清晰度；检查答案与解析一致性 |
| 5 | `pq-9.1-01` | multiple_choice | basic | A,B,C,D,E | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[3].items[4]` | 检查题目清晰度；检查选项有效性；检查答案与解析一致性 |
| 6 | `pq-9.1-02` | single_choice | basic | C | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[3].items[5]` | 检查题目清晰度；检查答案与解析一致性 |

**练习题详细审阅检查清单（每道题均需检查）：**

- [ ] 题目文字清晰无歧义
- [ ] 所有选项均合理可选（single_choice / multiple_choice）
- [ ] `correct_answer` 与预期正确选项匹配
- [ ] `rationale` 正确解释了为什么该答案正确
- [ ] `rationale` 正确解释了为什么其他选项错误
- [ ] `source_refs` 同时支持题目内容和答案解析
- [ ] 无 `source_refs` 不支持的虚构内容
- [ ] 难度评级合理

### 3.5 answer_rationales（6 个条目）

| # | 条目 ID | 标题 | 关联题目 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|----------|--------|------------|-----------|------------|
| 1 | `ar-pq-1.3-01` | CISC指令系统特征解析 | `pq-1.3-01` | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[4].items[0]` | 检查解析是否支持答案；检查来源忠实度 |
| 2 | `ar-pq-1.3-02` | RISC实现方式解析 | `pq-1.3-02` | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[4].items[1]` | 检查解析是否支持答案；检查来源忠实度 |
| 3 | `ar-pq-13.3-01` | 体系结构三要素辨析 | `pq-13.3-01` | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[4].items[2]` | 检查解析是否支持答案；检查来源忠实度 |
| 4 | `ar-pq-13.3-02` | 体系结构结构数量辨析 | `pq-13.3-02` | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[4].items[3]` | 检查解析是否支持答案；检查来源忠实度 |
| 5 | `ar-pq-9.1-01` | 信息安全五要素列举 | `pq-9.1-01` | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[4].items[4]` | 检查解析是否支持答案；检查来源忠实度 |
| 6 | `ar-pq-9.1-02` | 机密性定义辨析 | `pq-9.1-02` | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[4].items[5]` | 检查解析是否支持答案；检查来源忠实度 |

### 3.6 misconception_warnings（3 个条目）

| # | 条目 ID | 标题 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|--------|------------|-----------|------------|
| 1 | `mw-1.3` | CISC与RISC实现方式混淆 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[5].items[0]` | 检查概念正确性；检查可追溯性 |
| 2 | `mw-13.3` | 体系结构关注内部实现的误区 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[5].items[1]` | 检查概念正确性；**confidence=medium — 需验证** |
| 3 | `mw-9.1` | 信息安全要素数量和名称混淆 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[5].items[2]` | 检查概念正确性；检查可追溯性 |

### 3.7 review_checklist（3 个条目）

| # | 条目 ID | 标题 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|--------|------------|-----------|------------|
| 1 | `rc-1.3` | 指令系统CISC和RISC复习清单 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[6].items[0]` | 检查来源忠实度；检查完整性 |
| 2 | `rc-13.3` | 软件架构风格复习清单 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[6].items[1]` | 检查来源忠实度；**taxonomy_suspect — 需确认** |
| 3 | `rc-9.1` | 信息安全基础知识复习清单 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[6].items[2]` | 检查来源忠实度；检查完整性 |

### 3.8 source_traceability_map（3 个条目）

| # | 条目 ID | 标题 | 来源包 | 来源引用数 | JSON 路径 | 审阅者操作 |
|---|---------|------|--------|------------|-----------|------------|
| 1 | `stm-1.3` | 1.3 指令系统CISC和RISC来源追溯 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[7].items[0]` | 检查追溯充分性；**manual_review_required: true（图片内容）** |
| 2 | `stm-13.3` | 13.3 软件架构风格来源追溯 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[7].items[1]` | 检查追溯充分性；**taxonomy_suspect；manual_review_required: true** |
| 3 | `stm-9.1` | 9.1 信息安全基础知识来源追溯 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[7].items[2]` | 检查追溯充分性；content_completeness=good |

### 3.9 汇总：各类别条目数

| 类别 | 条目数 | 使用的来源包 |
|------|--------|-------------|
| learning_objectives | 9 | 3 (1.3, 13.3, 9.1) |
| knowledge_units | 3 | 3 (1.3, 13.3, 9.1) |
| exam_oriented_explanations | 3 | 3 (1.3, 13.3, 9.1) |
| practice_questions | 6 | 3 (1.3, 13.3, 9.1) |
| answer_rationales | 6 | 3 (1.3, 13.3, 9.1) |
| misconception_warnings | 3 | 3 (1.3, 13.3, 9.1) |
| review_checklist | 3 | 3 (1.3, 13.3, 9.1) |
| source_traceability_map | 3 | 3 (1.3, 13.3, 9.1) |
| **合计** | **36** | **3 个唯一来源包** |

---

## 4. 练习题审阅区

审阅者必须打开 Phase 7.4 执行清单，在指定 JSON 路径下检查以下字段。

### pq-1.3-01 — CISC指令系统描述

- **JSON 路径：** `$.generated_outputs[3].items[0]`
- **question_type：** single_choice
- **difficulty：** basic
- **correct_answer：** B
- **rationale 路径：** `$.generated_outputs[3].items[0].rationale`
- **source_refs 数量：** 1
- **source_packet_id：** `ruankaodaren/baseline/1.3_指令系统CISC和RISC`
- **审阅者必须检查：**
  - [ ] 题目文字清晰无歧义
  - [ ] 选项 A–D 均合理
  - [ ] `correct_answer` = B 与选项文字匹配
  - [ ] `rationale` 正确解释了 B 为何正确、A/C/D 为何错误
  - [ ] `source_refs` 同时支持题目和解析

### pq-1.3-02 — RISC实现方式

- **JSON 路径：** `$.generated_outputs[3].items[1]`
- **question_type：** single_choice
- **difficulty：** basic
- **correct_answer：** C
- **rationale 路径：** `$.generated_outputs[3].items[1].rationale`
- **source_refs 数量：** 1
- **source_packet_id：** `ruankaodaren/baseline/1.3_指令系统CISC和RISC`
- **审阅者必须检查：**
  - [ ] 题目文字清晰无歧义
  - [ ] 选项 A–D 均合理
  - [ ] `correct_answer` = C 与选项文字匹配
  - [ ] `rationale` 正确解释了 C 为何正确、A/B/D 为何错误
  - [ ] `source_refs` 同时支持题目和解析

### pq-13.3-01 — 体系结构核心要素

- **JSON 路径：** `$.generated_outputs[3].items[2]`
- **question_type：** single_choice
- **difficulty：** intermediate
- **correct_answer：** D
- **rationale 路径：** `$.generated_outputs[3].items[2].rationale`
- **source_refs 数量：** 1
- **source_packet_id：** `ruankaodaren/baseline/13.3_软件架构风格`
- **审阅者必须检查：**
  - [ ] 题目文字清晰无歧义
  - [ ] 选项 A–D 均合理
  - [ ] `correct_answer` = D 与选项文字匹配
  - [ ] `rationale` 正确解释了 D 为何正确、A/B/C 为何错误
  - [ ] `source_refs` 同时支持题目和解析

### pq-13.3-02 — 体系结构结构数量判断题

- **JSON 路径：** `$.generated_outputs[3].items[3]`
- **question_type：** true_false
- **difficulty：** basic
- **correct_answer：** 错误
- **rationale 路径：** `$.generated_outputs[3].items[3].rationale`
- **source_refs 数量：** 1
- **source_packet_id：** `ruankaodaren/baseline/13.3_软件架构风格`
- **审阅者必须检查：**
  - [ ] 题目表述清晰
  - [ ] `correct_answer` = 错误 是正确的（体系结构可包含多个结构）
  - [ ] `rationale` 正确解释了该命题为何错误
  - [ ] `source_refs` 支持解析内容

### pq-9.1-01 — 信息安全基本要素多选题

- **JSON 路径：** `$.generated_outputs[3].items[4]`
- **question_type：** multiple_choice
- **difficulty：** basic
- **correct_answer：** A, B, C, D, E
- **rationale 路径：** `$.generated_outputs[3].items[4].rationale`
- **source_refs 数量：** 1
- **source_packet_id：** `ruankaodaren/baseline/9.1_信息安全基础知识`
- **审阅者必须检查：**
  - [ ] 题目文字清晰无歧义
  - [ ] 选项 A–F 均合理
  - [ ] `correct_answer` = [A, B, C, D, E] 对应五个安全要素
  - [ ] `rationale` 正确解释了为何不选 F（不可否认性）
  - [ ] `source_refs` 同时支持题目和解析

### pq-9.1-02 — 机密性定义辨析

- **JSON 路径：** `$.generated_outputs[3].items[5]`
- **question_type：** single_choice
- **difficulty：** basic
- **correct_answer：** C
- **rationale 路径：** `$.generated_outputs[3].items[5].rationale`
- **source_refs 数量：** 1
- **source_packet_id：** `ruankaodaren/baseline/9.1_信息安全基础知识`
- **审阅者必须检查：**
  - [ ] 题目文字清晰无歧义
  - [ ] 选项 A–D 均合理
  - [ ] `correct_answer` = C 对应机密性
  - [ ] `rationale` 正确解释了 C 为何正确、A/B/D 为何错误
  - [ ] `source_refs` 同时支持题目和解析

---

## 5. 不支持生成条目审阅区

以下 3 个条目因源材料不足而被**有意不生成**。审阅者必须验证系统是否正确地避免了虚构内容。

### 不支持条目 #1

- **JSON 路径：** `$.unsupported_generation_items[0]`
- **output_type：** exam_oriented_explanations
- **item_description：** CISC与RISC指令长度对比的详细说明
- **reason：** 源材料未明确提及RISC指令长度是否固定，仅提到CISC长度可变。
- **source_packet_id：** `ruankaodaren/baseline/1.3_指令系统CISC和RISC`
- **审阅者必须检查：**
  - [ ] 源材料确实未提及 RISC 指令长度
  - [ ] 不支持状态是合理的（不是虚构内容的遗漏）
  - [ ] 系统正确避免了在无源支持的情况下生成内容

### 不支持条目 #2

- **JSON 路径：** `$.unsupported_generation_items[1]`
- **output_type：** knowledge_units
- **item_description：** 软件架构风格的具体分类（管道-过滤器、分层架构、事件驱动等）
- **reason：** 源材料标题为'软件架构风格'但已抽取内容仅包含软件体系结构的定义，未包含具体架构风格的分类信息。
- **source_packet_id：** `ruankaodaren/baseline/13.3_软件架构风格`
- **审阅者必须检查：**
  - [ ] 源材料确实不包含架构风格分类
  - [ ] 不支持状态是合理的
  - [ ] taxonomy_suspect 标记被正确应用
  - [ ] 系统正确避免了虚构风格分类

### 不支持条目 #3

- **JSON 路径：** `$.unsupported_generation_items[2]`
- **output_type：** practice_questions
- **item_description：** 信息安全五要素在实际场景中的应用题
- **reason：** 源材料仅提供五要素的定义，未包含实际应用场景或案例。
- **source_packet_id：** `ruankaodaren/baseline/9.1_信息安全基础知识`
- **审阅者必须检查：**
  - [ ] 源材料确实缺乏应用场景
  - [ ] 不支持状态是合理的
  - [ ] 系统正确避免了在无源支持的情况下生成应用题

---

## 6. 人工审阅输入填写指南

审阅者必须在模板副本中手动填写以下字段：

**文件：** `templates/phase7_4_ai_learning_generation_human_review_input.template.json`  
**指南：** `templates/phase7_4_ai_learning_generation_human_review_input.template.md`

| 字段 | 说明 | 当前模板值 |
|------|------|-----------|
| `reviewer` | 真实审阅者姓名或标识 | `null` |
| `reviewed_at` | 审阅完成时间（ISO-8601 格式） | `null` |
| `review_scope.reviewed_output_category_count` | 实际审阅的输出类别数 | `null` |
| `review_scope.reviewed_generated_item_count` | 实际审阅的生成条目数 | `null` |
| `review_scope.reviewed_unsupported_generation_item_count` | 实际审阅的不支持条目数 | `null` |
| `review_confirmations.source_fidelity_checked` | 输出忠实于源材料 | `null` |
| `review_confirmations.exam_relevance_checked` | 输出与考试要求相关 | `null` |
| `review_confirmations.conceptual_correctness_checked` | 概念正确 | `null` |
| `review_confirmations.explanation_clarity_checked` | 解释清晰 | `null` |
| `review_confirmations.question_validity_checked` | 练习题有效 | `null` |
| `review_confirmations.answer_rationale_consistency_checked` | 答案解析一致 | `null` |
| `review_confirmations.unsupported_item_correctness_checked` | 不支持条目处理正确 | `null` |
| `review_confirmations.traceability_sufficiency_checked` | 追溯充分 | `null` |
| `review_confirmations.hallucination_or_overreach_checked` | 未检测到虚构或越界 | `null` |
| `review_confirmations.duplicate_or_low_value_content_checked` | 无重复或低价值内容 | `null` |
| `decision_result` | 5 个允许值之一 | `null` |
| `issues` | 发现的问题数组 | `[]` |
| `reviewer_notes` | 审阅者自由文本备注 | `null` |

**Codex 不得填写这些字段。** 仅真实的人类审阅者可填写。

---

## 7. 决策规则

### 允许的 `decision_result` 值

| 值 | 含义 |
|----|------|
| `approve_for_quality_review` | 输出可接受，进入质量审阅 |
| `require_minor_revision_plan` | 发现轻微问题，需要修订计划 |
| `require_major_revision_plan` | 发现严重问题，需要修订计划 |
| `reject_generation_batch` | 输出被拒绝，需要重新生成 |
| `request_source_recheck` | 源材料需重新验证 |

### 建议映射

| 条件 | 建议决策 |
|------|----------|
| 无 blocker、无 major、少量或无 minor 问题 | `approve_for_quality_review` |
| 发现可修复的轻微问题 | `require_minor_revision_plan` |
| 存在严重的正确性或可追溯性问题 | `require_major_revision_plan` |
| 跨多个类别出现系统性失败 | `reject_generation_batch` |
| 来源包模糊或不足 | `request_source_recheck` |

---

## 8. 问题记录格式

如果审阅者发现问题，请按以下格式记录到 `issues` 数组中：

```json
{
  "id": "HR-ISSUE-001",
  "severity": "major",
  "affected_output_type": "practice_questions",
  "affected_item_id": "pq-1.3-01",
  "description": "人工填写的问题描述。",
  "required_action": "人工填写的所需操作。"
}
```

### 允许的严重性等级

| 等级 | 含义 |
|------|------|
| `blocker` | 必须在任何进一步推进前解决 |
| `major` | 严重的质量或正确性问题 |
| `minor` | 轻微的质量问题，不阻断推进 |
| `advisory` | 改进建议，不阻断 |

### 受影响的输出类型（`affected_output_type` 字段可选值）

- `learning_objectives`
- `knowledge_units`
- `exam_oriented_explanations`
- `practice_questions`
- `answer_rationales`
- `misconception_warnings`
- `review_checklist`
- `source_traceability_map`
- `unsupported_generation_items`

---

## 9. 非目标边界

本清单明确**不**：

- 执行人工审阅（它是指南，不是审阅本身）
- 审批或拒绝生成内容
- 开启 Phase 7.7
- 修改任何生成内容
- 创建已完成的 `phase7_4_ai_learning_generation_human_review_input.json`
- 填写 `reviewer`、`reviewed_at`、`decision_result` 或 `issues`
- 修改来源包
- 放松验证器

---

## 10. 特别注意项

审阅者应特别注意以下条目：

1. **条目 `lo-13.3-03`** — source_refs confidence = `medium`（其他均为 `high`）
2. **条目 `mw-13.3`** — source_refs confidence = `medium`
3. **条目 `ee-1.3`** — 内容中 RISC 固定长度需人工确认
4. **条目 `ku-1.3`** — manual_review_notes：图片内容需人工复核
5. **条目 `ku-13.3`** — taxonomy_suspect 标记：需确认知识分类
6. **条目 `stm-1.3`** — manual_review_required: true（图片内容）
7. **条目 `stm-13.3`** — taxonomy_suspect；manual_review_required: true
8. **不支持条目 #1** — RISC 指令长度不在源材料中
9. **不支持条目 #2** — 架构风格分类不在源材料中
10. **不支持条目 #3** — 应用场景不在源材料中
