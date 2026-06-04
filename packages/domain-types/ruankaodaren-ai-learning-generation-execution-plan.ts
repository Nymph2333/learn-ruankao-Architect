/**
 * Phase 7.2 — AI Learning Generation Execution Plan
 *
 * TypeScript type definitions for the AI learning generation
 * execution plan manifest.
 */

export type PlannedOutputName =
  | "learning_objectives"
  | "knowledge_units"
  | "exam_oriented_explanations"
  | "practice_questions"
  | "answer_rationales"
  | "misconception_warnings"
  | "review_checklist"
  | "source_traceability_map";

export const PLANNED_OUTPUT_NAMES: readonly PlannedOutputName[] = [
  "learning_objectives",
  "knowledge_units",
  "exam_oriented_explanations",
  "practice_questions",
  "answer_rationales",
  "misconception_warnings",
  "review_checklist",
  "source_traceability_map",
] as const;

export interface PlannedOutput {
  name: PlannedOutputName;
  status: "planned";
}

export interface AiLearningGenerationExecutionPlan {
  manifest_version: "phase7.2";
  manifest_type: "ai_learning_generation_execution_plan";
  phase: "7.2";
  artifact_type: "ai_learning_generation_execution_plan";
  status: "ai_learning_generation_execution_plan_created";
  created_for_phase: "7.2";
  created_at: string;
  execution_plan_status: "planned";
  execution_mode: "offline_existing_source_packet_only";
  execution_status: "not_started";
  upstream_phase: "7.1";
  upstream_manifest: "phase7_1_ai_learning_generation_approval_gate.json";
  upstream_artifact_type: "ai_learning_generation_approval_gate";
  upstream_approval_status: "ai_learning_generation_approved";
  upstream_ai_learning_generation_approved: true;
  batch_id: "phase6_1_batch_001";
  crawler_allowed: false;
  renderer_allowed: false;
  recovery_allowed: false;
  web_requests_allowed: false;
  source_layer_modification_allowed: false;
  ai_learning_content_generation_allowed: true;
  ai_learning_request_creation_allowed: true;
  phase7_2_entry_allowed: true;
  phase7_3_entry_allowed: false;
  planned_outputs: PlannedOutput[];
  actual_generated_outputs: [];
  scope: AiLearningGenerationExecutionPlanScope;
  risk: AiLearningGenerationExecutionPlanRisk;
  closure: AiLearningGenerationExecutionPlanClosure;
  next_phase_recommendation: AiLearningGenerationExecutionPlanNextPhaseRecommendation;
  rollback_condition: AiLearningGenerationExecutionPlanRollbackCondition;
  audit_condition: AiLearningGenerationExecutionPlanAuditCondition;
  phase_progression_history: AiLearningGenerationExecutionPlanPhaseProgressionEntry[];
  validation_expectations: AiLearningGenerationExecutionPlanValidationExpectations;
}

export interface AiLearningGenerationExecutionPlanScope {
  allowed: string[];
  forbidden: string[];
  allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  unapproved_sources_allowed: false;
  external_sources_allowed: false;
  source_expansion_allowed: false;
  generation_mode: "offline_existing_source_packet_only";
  source_packet_boundary: "frozen_after_phase6_22_closure";
}

export interface AiLearningGenerationExecutionPlanRisk {
  risk_level: "low";
  risk_reason: string;
}

export interface AiLearningGenerationExecutionPlanClosure {
  phase7_2_status: "complete";
  phase7_2_result: "pass";
}

export interface AiLearningGenerationExecutionPlanNextPhaseRecommendation {
  next_recommended_phase: "phase7.3_ai_learning_generation_validation";
  phase7_3_entry_allowed: false;
  phase7_3_entry_requires_approval: true;
  notes: string;
}

export interface AiLearningGenerationExecutionPlanRollbackCondition {
  phase7_2_rollback_needed: false;
  reason: string;
  future_rollback_requirements: string[];
}

export interface AiLearningGenerationExecutionPlanAuditCondition {
  upstream_phase: "7.1";
  upstream_approval_status: "ai_learning_generation_approved";
  upstream_ai_learning_generation_approved: true;
  current_execution_plan_status: "planned";
  current_execution_status: "not_started";
  current_ai_learning_content_generation_allowed: true;
  current_phase7_2_entry_allowed: true;
  current_phase7_3_entry_allowed: false;
  planned_output_count: 8;
  actual_generated_outputs_empty: true;
  source_packet_boundary_frozen: true;
  validation_commands: string[];
  commit_scope: string;
}

export interface AiLearningGenerationExecutionPlanPhaseProgressionEntry {
  phase: string;
  outcome: string;
}

export interface AiLearningGenerationExecutionPlanValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  phase_must_be: "7.2";
  artifact_type_must_be: "ai_learning_generation_execution_plan";
  execution_plan_status_must_be: "planned";
  execution_mode_must_be: "offline_existing_source_packet_only";
  execution_status_must_be: "not_started";
  upstream_phase_must_be: "7.1";
  upstream_approval_status_must_be: "ai_learning_generation_approved";
  upstream_ai_learning_generation_approved_must_be: true;
  batch_id_must_be: "phase6_1_batch_001";
  ai_learning_content_generation_allowed_must_be: true;
  phase7_2_entry_allowed_must_be: true;
  phase7_3_entry_allowed_must_be: false;
  crawler_allowed_must_be: false;
  renderer_allowed_must_be: false;
  recovery_allowed_must_be: false;
  web_requests_allowed_must_be: false;
  source_layer_modification_allowed_must_be: false;
  actual_generated_outputs_must_be_empty: true;
  planned_output_count_must_be: 8;
  all_planned_outputs_status_must_be_planned: true;
  risk_level_must_be: "low";
  closure_status_must_be: "complete";
  closure_result_must_be: "pass";
}
