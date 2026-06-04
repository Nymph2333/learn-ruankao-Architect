# Phase 7.2 AI Learning Generation Execution Plan

## 1. Background

Phase 7.1 recorded the human approval decision for AI learning content generation. The approval status was set to `ai_learning_generation_approved` with `ai_learning_generation_approved=true`. `ai_learning_content_generation_allowed` was transitioned to `true` and `phase7_1_entry_allowed` was set to `true`. Phase 7.1 did not generate any actual learning content — it was an approval decision record only.

Phase 7.2 creates the AI learning generation execution plan. This phase documents the approved generation scope, defines the generation boundaries, and prepares the execution record for the 8 approved learning outputs. The execution plan authorizes the generation pipeline without executing it. Actual content generation artifacts are deferred to Phase 7.3+.

## 2. Objective

Create an AI learning generation execution plan that:

- References the Phase 7.1 approval gate artifact
- Confirms `ai_learning_generation_approved=true` and `ai_learning_content_generation_allowed=true`
- Documents the 8 approved learning outputs for generation
- Defines the generation execution boundaries
- Sets the generation mode to `offline_existing_source_packet_only`
- References the closed-pass Phase 6.1 batch as the source basis
- Maintains source layer immutability
- Does NOT generate actual AI learning content
- Does NOT create study notes, question banks, explanations, flashcards, diagrams, summaries, or rendered learning content
- Does NOT crawl, recover, expand sources, modify source packets, or mutate earlier phase artifacts
- Does NOT make web requests
- Does NOT create raw snapshots or intermediate JSON

## 3. Upstream Phase Reference

| Field | Value |
|---|---|
| upstream_phase | 7.1 |
| upstream_manifest | phase7_1_ai_learning_generation_approval_gate.json |
| upstream_artifact_type | ai_learning_generation_approval_gate |
| upstream_approval_status | ai_learning_generation_approved |
| upstream_ai_learning_generation_approved | true |
| batch_id | phase6_1_batch_001 |

## 4. Execution Plan Identity

| Field | Value |
|---|---|
| phase | 7.2 |
| artifact_type | ai_learning_generation_execution_plan |
| execution_plan_status | planned |
| execution_mode | offline_existing_source_packet_only |
| execution_status | not_started |

## 5. Boundary Table

| Gate | Value | Reason |
|---|---|---|
| crawler_allowed | false | No crawling required |
| renderer_allowed | false | No rendering required |
| recovery_allowed | false | No recovery required |
| web_requests_allowed | false | No web requests allowed |
| source_layer_modification_allowed | false | Source layer remains frozen |
| ai_learning_content_generation_allowed | true | Approved by Phase 7.1 |
| ai_learning_request_creation_allowed | true | Request already created in Phase 7.0 |
| phase7_2_entry_allowed | true | Authorized by Phase 7.1 approval gate |
| phase7_3_entry_allowed | false | Phase 7.3 requires its own authorization |

## 6. Approved Generation Outputs

The following outputs are planned for generation:

| Output | Description | Status |
|---|---|---|
| learning_objectives | Exam-oriented learning objectives per knowledge unit | planned |
| knowledge_units | Structured knowledge units derived from approved source packets | planned |
| exam_oriented_explanations | Architectural explanations aligned to exam requirements | planned |
| practice_questions | Practice questions with difficulty calibration | planned |
| answer_rationales | Detailed answer rationales with architectural reasoning | planned |
| misconception_warnings | Common misconception warnings for each knowledge unit | planned |
| review_checklist | Review checklist for exam preparation | planned |
| source_traceability_map | Traceability map linking generated content back to approved source packets | planned |

**None of the above are generated in Phase 7.2.** They are recorded as planned outputs only.

## 7. Actual Generated Outputs

Phase 7.2 generates no learning content. The `actual_generated_outputs` array is empty.

## 8. Scope Constraints

| Constraint | Value |
|---|---|
| allowed_source_basis | closed_pass_phase6_1_batch_001_only |
| unapproved_sources_allowed | false |
| external_sources_allowed | false |
| source_expansion_allowed | false |
| generation_mode | offline_existing_source_packet_only |
| source_packet_boundary | frozen_after_phase6_22_closure |

## 9. Risk Assessment

| Field | Value |
|---|---|
| risk_level | low |
| risk_reason | Phase 7.2 creates an execution plan as metadata only and does not generate learning content or mutate source-layer artifacts. |

## 10. Acceptance Criteria

1. The execution plan artifact validates against its JSON schema.
2. All invariant checks pass.
3. `phase` is `"7.2"`.
4. `artifact_type` is `"ai_learning_generation_execution_plan"`.
5. `execution_plan_status` is `"planned"`.
6. `execution_mode` is `"offline_existing_source_packet_only"`.
7. `execution_status` is `"not_started"`.
8. `upstream_phase` is `"7.1"`.
9. `upstream_approval_status` is `"ai_learning_generation_approved"`.
10. `upstream_ai_learning_generation_approved` is `true`.
11. `batch_id` is `"phase6_1_batch_001"`.
12. `ai_learning_content_generation_allowed` is `true`.
13. `phase7_2_entry_allowed` is `true`.
14. `phase7_3_entry_allowed` is `false`.
15. All other operational gates remain closed.
16. `actual_generated_outputs` is an empty array.
17. `planned_outputs` contains exactly the 8 approved output names with status `"planned"`.
18. `risk.risk_level` is `"low"`.
19. `closure.phase7_2_status` is `"complete"`.
20. `closure.phase7_2_result` is `"pass"`.

## 11. Validation Commands

```
pnpm typecheck
pnpm verify
pnpm validate:ai-learning-generation-approval-gate
pnpm validate:ai-learning-generation-execution-plan
```

## 12. Phase 7.2 Artifacts

| Artifact | Path |
|---|---|
| spec | docs/specs/034_phase7_2_ai_learning_generation_execution_plan.md |
| manifest | data/manifests/phase7_2_ai_learning_generation_execution_plan.json |
| schema | schemas/ruankaodaren-ai-learning-generation-execution-plan.schema.json |
| types | packages/domain-types/ruankaodaren-ai-learning-generation-execution-plan.ts |
| validator | scripts/validate-ruankaodaren-ai-learning-generation-execution-plan.ts |

## 13. Next Phase

Phase 7.3 (AI Learning Generation Validation) is not authorized by this artifact alone. A separate execution completion artifact must be created before Phase 7.3 entry is permitted.
