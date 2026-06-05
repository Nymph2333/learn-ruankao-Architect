# Phase 7.4 Human Review Worklist

> **This worklist is not human review.** It does not approve content, open Phase 7.7,
> mutate generated content, or create a completed human review input.
> It exists solely to tell a real human reviewer exactly what to inspect.

Generated: 2026-06-05  
Source commit: `71f8f3f` (Phase 7.4)  
Batch: `phase6_1_batch_001`  
Total generated items: **36** (8 categories)  
Unsupported items: **3**

---

## 1. Repository File Map

The human reviewer must open these files:

| # | File | Path |
|---|------|------|
| 1 | Phase 7.4 execution manifest | `data/manifests/phase7_4_ai_learning_generation_execution.json` |
| 2 | Phase 7.5 review request package | `data/manifests/phase7_5_ai_learning_generation_human_review_request_package.json` |
| 3 | Phase 7.6 blocked recording gate | `data/manifests/phase7_6_ai_learning_generation_human_review_result_recording_gate.json` |
| 4 | Human review input template (JSON) | `templates/phase7_4_ai_learning_generation_human_review_input.template.json` |
| 5 | Human review input template (guide) | `templates/phase7_4_ai_learning_generation_human_review_input.template.md` |

---

## 2. Primary Review Target

All generated content lives in:  
`data/manifests/phase7_4_ai_learning_generation_execution.json`

Key JSON paths:

| Section | JSON Path |
|---------|-----------|
| Generated outputs | `$.generated_outputs` |
| Unsupported items | `$.unsupported_generation_items` |
| Quality controls | `$.generation_quality_controls` |
| Scope | `$.scope` |
| Upstream authorization | `$.upstream_authorization` |
| Upstream execution plan | `$.upstream_execution_plan` |
| Upstream closure | `$.upstream_closure` |

---

## 3. Generated Output Review Table

### 3.1 learning_objectives (9 items)

| # | Item ID | Title | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|---------------|-------------|-----------|-----------------|
| 1 | `lo-1.3-01` | 理解CISC指令系统的核心特征 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[0].items[0]` | Check source fidelity; check conceptual correctness |
| 2 | `lo-1.3-02` | 理解RISC指令系统的核心特征 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[0].items[1]` | Check source fidelity; check conceptual correctness |
| 3 | `lo-1.3-03` | 区分CISC与RISC的实现方式差异 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[0].items[2]` | Check source fidelity; check comparison accuracy |
| 4 | `lo-13.3-01` | 理解软件体系结构的基本定义 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[0].items[3]` | Check source fidelity; check conceptual correctness |
| 5 | `lo-13.3-02` | 掌握软件体系结构的三要素 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[0].items[4]` | Check source fidelity; check completeness |
| 6 | `lo-13.3-03` | 理解结构在体系结构中的核心地位 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[0].items[5]` | Check source fidelity; **confidence=medium** — verify |
| 7 | `lo-9.1-01` | 掌握信息安全的五个基本要素 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[0].items[6]` | Check source fidelity; check completeness |
| 8 | `lo-9.1-02` | 理解机密性与完整性的区别 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[0].items[7]` | Check source fidelity; check distinction accuracy |
| 9 | `lo-9.1-03` | 理解可用性与可控性的安全目标 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[0].items[8]` | Check source fidelity; check distinction accuracy |

### 3.2 knowledge_units (3 items)

| # | Item ID | Title | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|---------------|-------------|-----------|-----------------|
| 1 | `ku-1.3` | 指令系统CISC和RISC | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[1].items[0]` | Check source fidelity; **manual_review_notes: 图片型资料需人工复核** |
| 2 | `ku-13.3` | 软件架构风格 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[1].items[1]` | Check source fidelity; **taxonomy_suspect — confirm classification** |
| 3 | `ku-9.1` | 信息安全基础知识 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[1].items[2]` | Check source fidelity; check completeness |

### 3.3 exam_oriented_explanations (3 items)

| # | Item ID | Title | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|---------------|-------------|-----------|-----------------|
| 1 | `ee-1.3` | CISC与RISC对比——软考高频考点解析 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[2].items[0]` | Check exam relevance; **content notes RISC fixed length needs human confirmation** |
| 2 | `ee-13.3` | 软件体系结构定义——软考概念辨析 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[2].items[1]` | Check exam relevance; check conceptual correctness |
| 3 | `ee-9.1` | 信息安全五要素——软考必考知识点 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[2].items[2]` | Check exam relevance; check completeness |

### 3.4 practice_questions (6 items)

| # | Item ID | Type | Difficulty | Correct Answer | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|------|------------|----------------|---------------|-------------|-----------|-----------------|
| 1 | `pq-1.3-01` | single_choice | basic | B | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[3].items[0]` | Check question clarity; check options validity; check answer-rationale consistency |
| 2 | `pq-1.3-02` | single_choice | basic | C | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[3].items[1]` | Check question clarity; check options validity; check answer-rationale consistency |
| 3 | `pq-13.3-01` | single_choice | intermediate | D | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[3].items[2]` | Check question clarity; check options validity; check answer-rationale consistency |
| 4 | `pq-13.3-02` | true_false | basic | 错误 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[3].items[3]` | Check question clarity; check answer-rationale consistency |
| 5 | `pq-9.1-01` | multiple_choice | basic | A,B,C,D,E | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[3].items[4]` | Check question clarity; check options validity; check answer-rationale consistency |
| 6 | `pq-9.1-02` | single_choice | basic | C | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[3].items[5]` | Check question clarity; check answer-rationale consistency |

**Detailed practice question review checklist (for each question):**

- [ ] Question text is clear and unambiguous
- [ ] All options are plausible (single_choice / multiple_choice)
- [ ] `correct_answer` matches the intended correct option(s)
- [ ] `rationale` correctly explains why the answer is right
- [ ] `rationale` correctly explains why other options are wrong
- [ ] `source_refs` support both the question content and the answer rationale
- [ ] No hallucinated content not supported by source_refs
- [ ] Difficulty rating is appropriate

### 3.5 answer_rationales (6 items)

| # | Item ID | Title | Linked Question | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|-----------------|---------------|-------------|-----------|-----------------|
| 1 | `ar-pq-1.3-01` | CISC指令系统特征解析 | `pq-1.3-01` | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[4].items[0]` | Check rationale supports answer; check source fidelity |
| 2 | `ar-pq-1.3-02` | RISC实现方式解析 | `pq-1.3-02` | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[4].items[1]` | Check rationale supports answer; check source fidelity |
| 3 | `ar-pq-13.3-01` | 体系结构三要素辨析 | `pq-13.3-01` | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[4].items[2]` | Check rationale supports answer; check source fidelity |
| 4 | `ar-pq-13.3-02` | 体系结构结构数量辨析 | `pq-13.3-02` | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[4].items[3]` | Check rationale supports answer; check source fidelity |
| 5 | `ar-pq-9.1-01` | 信息安全五要素列举 | `pq-9.1-01` | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[4].items[4]` | Check rationale supports answer; check source fidelity |
| 6 | `ar-pq-9.1-02` | 机密性定义辨析 | `pq-9.1-02` | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[4].items[5]` | Check rationale supports answer; check source fidelity |

### 3.6 misconception_warnings (3 items)

| # | Item ID | Title | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|---------------|-------------|-----------|-----------------|
| 1 | `mw-1.3` | CISC与RISC实现方式混淆 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[5].items[0]` | Check conceptual correctness; check traceability |
| 2 | `mw-13.3` | 体系结构关注内部实现的误区 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[5].items[1]` | Check conceptual correctness; **confidence=medium** — verify |
| 3 | `mw-9.1` | 信息安全要素数量和名称混淆 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[5].items[2]` | Check conceptual correctness; check traceability |

### 3.7 review_checklist (3 items)

| # | Item ID | Title | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|---------------|-------------|-----------|-----------------|
| 1 | `rc-1.3` | 指令系统CISC和RISC复习清单 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[6].items[0]` | Check source fidelity; check completeness |
| 2 | `rc-13.3` | 软件架构风格复习清单 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[6].items[1]` | Check source fidelity; **taxonomy_suspect — confirm** |
| 3 | `rc-9.1` | 信息安全基础知识复习清单 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[6].items[2]` | Check source fidelity; check completeness |

### 3.8 source_traceability_map (3 items)

| # | Item ID | Title | Source Packet | Source Refs | JSON Path | Reviewer Action |
|---|---------|-------|---------------|-------------|-----------|-----------------|
| 1 | `stm-1.3` | 1.3 指令系统CISC和RISC来源追溯 | `ruankaodaren/baseline/1.3_指令系统CISC和RISC` | 1 | `$.generated_outputs[7].items[0]` | Check traceability sufficiency; **manual_review_required: true (image content)** |
| 2 | `stm-13.3` | 13.3 软件架构风格来源追溯 | `ruankaodaren/baseline/13.3_软件架构风格` | 1 | `$.generated_outputs[7].items[1]` | Check traceability sufficiency; **taxonomy_suspect; manual_review_required: true** |
| 3 | `stm-9.1` | 9.1 信息安全基础知识来源追溯 | `ruankaodaren/baseline/9.1_信息安全基础知识` | 1 | `$.generated_outputs[7].items[2]` | Check traceability sufficiency; content_completeness=good |

### 3.9 Summary: Items per Category

| Category | Item Count | Source Packets Used |
|----------|------------|---------------------|
| learning_objectives | 9 | 3 (1.3, 13.3, 9.1) |
| knowledge_units | 3 | 3 (1.3, 13.3, 9.1) |
| exam_oriented_explanations | 3 | 3 (1.3, 13.3, 9.1) |
| practice_questions | 6 | 3 (1.3, 13.3, 9.1) |
| answer_rationales | 6 | 3 (1.3, 13.3, 9.1) |
| misconception_warnings | 3 | 3 (1.3, 13.3, 9.1) |
| review_checklist | 3 | 3 (1.3, 13.3, 9.1) |
| source_traceability_map | 3 | 3 (1.3, 13.3, 9.1) |
| **Total** | **36** | **3 unique source packets** |

---

## 4. Practice Question Review Section

For every practice question, the reviewer must open the Phase 7.4 execution manifest
and inspect the following fields at the given JSON path.

### pq-1.3-01 — CISC指令系统描述

- **JSON path:** `$.generated_outputs[3].items[0]`
- **question_type:** single_choice
- **difficulty:** basic
- **correct_answer:** B
- **rationale path:** `$.generated_outputs[3].items[0].rationale`
- **source_refs count:** 1
- **source_packet_id:** `ruankaodaren/baseline/1.3_指令系统CISC和RISC`
- **Reviewer must check:**
  - [ ] Question is clear and unambiguous
  - [ ] Options A–D are all plausible
  - [ ] `correct_answer` = B matches the option text
  - [ ] `rationale` correctly explains why B is right and A/C/D are wrong
  - [ ] `source_refs` support both the question and the rationale

### pq-1.3-02 — RISC实现方式

- **JSON path:** `$.generated_outputs[3].items[1]`
- **question_type:** single_choice
- **difficulty:** basic
- **correct_answer:** C
- **rationale path:** `$.generated_outputs[3].items[1].rationale`
- **source_refs count:** 1
- **source_packet_id:** `ruankaodaren/baseline/1.3_指令系统CISC和RISC`
- **Reviewer must check:**
  - [ ] Question is clear and unambiguous
  - [ ] Options A–D are all plausible
  - [ ] `correct_answer` = C matches the option text
  - [ ] `rationale` correctly explains why C is right and A/B/D are wrong
  - [ ] `source_refs` support both the question and the rationale

### pq-13.3-01 — 体系结构核心要素

- **JSON path:** `$.generated_outputs[3].items[2]`
- **question_type:** single_choice
- **difficulty:** intermediate
- **correct_answer:** D
- **rationale path:** `$.generated_outputs[3].items[2].rationale`
- **source_refs count:** 1
- **source_packet_id:** `ruankaodaren/baseline/13.3_软件架构风格`
- **Reviewer must check:**
  - [ ] Question is clear and unambiguous
  - [ ] Options A–D are all plausible
  - [ ] `correct_answer` = D matches the option text
  - [ ] `rationale` correctly explains why D is right and A/B/C are wrong
  - [ ] `source_refs` support both the question and the rationale

### pq-13.3-02 — 体系结构结构数量判断题

- **JSON path:** `$.generated_outputs[3].items[3]`
- **question_type:** true_false
- **difficulty:** basic
- **correct_answer:** 错误
- **rationale path:** `$.generated_outputs[3].items[3].rationale`
- **source_refs count:** 1
- **source_packet_id:** `ruankaodaren/baseline/13.3_软件架构风格`
- **Reviewer must check:**
  - [ ] Question statement is clear
  - [ ] `correct_answer` = 错误 is correct (体系结构可包含多个结构)
  - [ ] `rationale` correctly explains why the statement is false
  - [ ] `source_refs` support the rationale

### pq-9.1-01 — 信息安全基本要素多选题

- **JSON path:** `$.generated_outputs[3].items[4]`
- **question_type:** multiple_choice
- **difficulty:** basic
- **correct_answer:** A, B, C, D, E
- **rationale path:** `$.generated_outputs[3].items[4].rationale`
- **source_refs count:** 1
- **source_packet_id:** `ruankaodaren/baseline/9.1_信息安全基础知识`
- **Reviewer must check:**
  - [ ] Question is clear and unambiguous
  - [ ] Options A–F are all plausible
  - [ ] `correct_answer` = [A, B, C, D, E] matches the five security elements
  - [ ] `rationale` correctly explains why F (不可否认性) is not included
  - [ ] `source_refs` support both the question and the rationale

### pq-9.1-02 — 机密性定义辨析

- **JSON path:** `$.generated_outputs[3].items[5]`
- **question_type:** single_choice
- **difficulty:** basic
- **correct_answer:** C
- **rationale path:** `$.generated_outputs[3].items[5].rationale`
- **source_refs count:** 1
- **source_packet_id:** `ruankaodaren/baseline/9.1_信息安全基础知识`
- **Reviewer must check:**
  - [ ] Question is clear and unambiguous
  - [ ] Options A–D are all plausible
  - [ ] `correct_answer` = C matches 机密性
  - [ ] `rationale` correctly explains why C is right and A/B/D are wrong
  - [ ] `source_refs` support both the question and the rationale

---

## 5. Unsupported Generation Item Review Section

These 3 items were intentionally **not generated** because source material was
insufficient. The reviewer must verify that the system correctly avoided hallucination.

### Unsupported Item #1

- **JSON path:** `$.unsupported_generation_items[0]`
- **output_type:** exam_oriented_explanations
- **item_description:** CISC与RISC指令长度对比的详细说明
- **reason:** 源材料未明确提及RISC指令长度是否固定，仅提到CISC长度可变。
- **source_packet_id:** `ruankaodaren/baseline/1.3_指令系统CISC和RISC`
- **Reviewer must check:**
  - [ ] Source material truly does not mention RISC instruction length
  - [ ] Unsupported status is appropriate (not a hallucination gap)
  - [ ] System correctly avoided generating content without source support

### Unsupported Item #2

- **JSON path:** `$.unsupported_generation_items[1]`
- **output_type:** knowledge_units
- **item_description:** 软件架构风格的具体分类（管道-过滤器、分层架构、事件驱动等）
- **reason:** 源材料标题为'软件架构风格'但已抽取内容仅包含软件体系结构的定义，未包含具体架构风格的分类信息。
- **source_packet_id:** `ruankaodaren/baseline/13.3_软件架构风格`
- **Reviewer must check:**
  - [ ] Source material truly does not contain architecture style classifications
  - [ ] Unsupported status is appropriate
  - [ ] taxonomy_suspect flag is correctly applied
  - [ ] System correctly avoided hallucinating style categories

### Unsupported Item #3

- **JSON path:** `$.unsupported_generation_items[2]`
- **output_type:** practice_questions
- **item_description:** 信息安全五要素在实际场景中的应用题
- **reason:** 源材料仅提供五要素的定义，未包含实际应用场景或案例。
- **source_packet_id:** `ruankaodaren/baseline/9.1_信息安全基础知识`
- **Reviewer must check:**
  - [ ] Source material truly lacks application scenarios
  - [ ] Unsupported status is appropriate
  - [ ] System correctly avoided generating application questions without source support

---

## 6. Human Review Input Filling Guide

The reviewer must manually fill the following fields in a copy of the template:

**File:** `templates/phase7_4_ai_learning_generation_human_review_input.template.json`  
**Guide:** `templates/phase7_4_ai_learning_generation_human_review_input.template.md`

| Field | Description | Current Template Value |
|-------|-------------|----------------------|
| `reviewer` | Real reviewer name or identifier | `null` |
| `reviewed_at` | ISO-8601 timestamp of review completion | `null` |
| `review_scope.reviewed_output_category_count` | Number of categories actually reviewed | `null` |
| `review_scope.reviewed_generated_item_count` | Number of generated items actually reviewed | `null` |
| `review_scope.reviewed_unsupported_generation_item_count` | Number of unsupported items actually reviewed | `null` |
| `review_confirmations.source_fidelity_checked` | Outputs faithful to source material | `null` |
| `review_confirmations.exam_relevance_checked` | Outputs relevant to exam requirements | `null` |
| `review_confirmations.conceptual_correctness_checked` | Concepts are correct | `null` |
| `review_confirmations.explanation_clarity_checked` | Explanations are clear | `null` |
| `review_confirmations.question_validity_checked` | Practice questions are valid | `null` |
| `review_confirmations.answer_rationale_consistency_checked` | Answer rationales are consistent | `null` |
| `review_confirmations.unsupported_item_correctness_checked` | Unsupported items handled correctly | `null` |
| `review_confirmations.traceability_sufficiency_checked` | Traceability is sufficient | `null` |
| `review_confirmations.hallucination_or_overreach_checked` | No hallucination or overreach detected | `null` |
| `review_confirmations.duplicate_or_low_value_content_checked` | No duplicate or low-value content | `null` |
| `decision_result` | One of 5 allowed values | `null` |
| `issues` | Array of issues found | `[]` |
| `reviewer_notes` | Free-text reviewer notes | `null` |

**Codex must not fill these fields.** Only a real human reviewer may fill them.

---

## 7. Decision Rules

### Allowed `decision_result` values

| Value | Meaning |
|-------|---------|
| `approve_for_quality_review` | Outputs acceptable, proceed to quality review |
| `require_minor_revision_plan` | Minor issues found, revision plan needed |
| `require_major_revision_plan` | Major issues found, revision plan needed |
| `reject_generation_batch` | Outputs rejected, regeneration required |
| `request_source_recheck` | Source material needs re-verification |

### Recommended mapping

| Condition | Recommended Decision |
|-----------|---------------------|
| No blocker, no major, few or no minor issues | `approve_for_quality_review` |
| Minor fixable issues found | `require_minor_revision_plan` |
| Major correctness or traceability problems | `require_major_revision_plan` |
| Systemic failure across multiple categories | `reject_generation_batch` |
| Source packet ambiguity or insufficiency | `request_source_recheck` |

---

## 8. Issue Recording Format

If the reviewer finds issues, record them in the `issues` array:

```json
{
  "id": "HR-ISSUE-001",
  "severity": "major",
  "affected_output_type": "practice_questions",
  "affected_item_id": "pq-1.3-01",
  "description": "Human-written issue description.",
  "required_action": "Human-written required action."
}
```

### Allowed severity levels

| Severity | Meaning |
|----------|---------|
| `blocker` | Must be resolved before any further progression |
| `major` | Significant quality or correctness problem |
| `minor` | Small quality issue, does not block progression |
| `advisory` | Suggestion for improvement, not blocking |

### Affected output types (for `affected_output_type` field)

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

## 9. Non-Goals

This worklist explicitly does **NOT**:

- Perform human review (it is a guide, not a review)
- Approve or reject the generated content
- Open Phase 7.7
- Mutate any generated content
- Create a completed `phase7_4_ai_learning_generation_human_review_input.json`
- Fill `reviewer`, `reviewed_at`, `decision_result`, or `issues`
- Modify source packets
- Loosen validators

---

## 10. Special Attention Items

The reviewer should pay particular attention to:

1. **Item `lo-13.3-03`** — source_refs confidence = `medium` (all others are `high`)
2. **Item `mw-13.3`** — source_refs confidence = `medium`
3. **Item `ee-1.3`** — content notes RISC fixed length needs human confirmation
4. **Item `ku-1.3`** — manual_review_notes: image content needs human review
5. **Item `ku-13.3`** — taxonomy_suspect flag: confirm knowledge classification
6. **Item `stm-1.3`** — manual_review_required: true (image content)
7. **Item `stm-13.3`** — taxonomy_suspect; manual_review_required: true
8. **Unsupported item #1** — RISC instruction length not in source material
9. **Unsupported item #2** — architecture style classifications not in source material
10. **Unsupported item #3** — application scenarios not in source material
