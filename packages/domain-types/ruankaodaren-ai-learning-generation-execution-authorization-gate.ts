/**
 * Phase 7.3 — AI Learning Generation Execution Authorization Gate
 *
 * TypeScript type definitions for the AI learning generation
 * execution authorization gate manifest.
 */

export type AuthorizedFutureOutputName =
  | "learning_objectives"
  | "knowledge_units"
  | "exam_oriented_explanations"
  | "practice_questions"
  | "answer_rationales"
  | "misconception_warnings"
  | "review_checklist"
  | "source_traceability_map";

export const AUTHORIZED_FUTURE_OUTPUT_NAMES: readonly AuthorizedFutureOutputName[] = [
  "learning_objectives",
  "knowledge_units",
  "exam_oriented_explanations",
  "practice_questions",
  "answer_rationales",
  "misconception_warnings",
  "review_checklist",
  "source_traceability_map",
] as const;

export interface AiLearningGenerationExecutionAuthorizationGate {
  manifest_version: "phase7.3";
  manifest_type: "ai_learning_generation_execution_authorization_gate";
  phase: "7.3";
  artifact_type: "ai_learning_generation_execution_authorization_gate";
  status: "ai_learning_generation_execution_authorization_gate_created";
  created_for_phase: "7.3";
  created_at: string;
  authorization_status: "authorized";
  authorization_result: "pass";
  authorization_mode: "authorization_only";
  upstream_phase: "7.2";
  upstream_manifest: "phase7_2_ai_learning_generation_execution_plan.json";
  upstream_artifact_type: "ai_learning_generation_execution_plan";
  upstream_commit: "6f0ac44";
  upstream_execution_plan_status: "planned";
  upstream_execution_status: "not_started";
  upstream_execution_mode: "offline_existing_source_packet_only";
  upstream_ai_learning_content_generation_allowed: true;
  authorized_execution_phase: "7.4";
  authorized_execution_mode: "offline_existing_source_packet_only";
  batch_id: "phase6_1_batch_001";
  crawler_allowed: false;
  renderer_allowed: false;
  recovery_allowed: false;
  web_requests_allowed: false;
  source_layer_modification_allowed: false;
  ai_learning_content_generation_allowed: false;
  ai_learning_execution_authorization_allowed: true;
  ai_learning_request_creation_allowed: true;
  phase7_3_entry_allowed: true;
  phase7_4_entry_allowed: true;
  authorized_future_outputs: AuthorizedFutureOutputName[];
  actual_generated_outputs: [];
  scope: AiLearningGenerationExecutionAuthorizationGateScope;
  risk: AiLearningGenerationExecutionAuthorizationGateRisk;
  closure: AiLearningGenerationExecutionAuthorizationGateClosure;
  next_phase_recommendation: AiLearningGenerationExecutionAuthorizationGateNextPhaseRecommendation;
  rollback_condition: AiLearningGenerationExecutionAuthorizationGateRollbackCondition;
  audit_condition: AiLearningGenerationExecutionAuthorizationGateAuditCondition;
  phase_progression_history: AiLearningGenerationExecutionAuthorizationGatePhaseProgressionEntry[];
  validation_expectations: AiLearningGenerationExecutionAuthorizationGateValidationExpectations;
}

export interface AiLearningGenerationExecutionAuthorizationGateScope {
  allowed: string[];
  forbidden: string[];
  allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  unapproved_sources_allowed: false;
  external_sources_allowed: false;
  source_expansion_allowed: false;
  offline_only: true;
}

export interface AiLearningGenerationExecutionAuthorizationGateRisk {
  risk_level: "low";
  risk_reason: string;
}

export interface AiLearningGenerationExecutionAuthorizationGateClosure {
  phase7_3_status: "complete";
  phase7_3_result: "pass";
}

export interface AiLearningGenerationExecutionAuthorizationGateNextPhaseRecommendation {
  next_recommended_phase: "phase7.4_ai_learning_generation_execution";
  phase7_4_entry_allowed: true;
  phase7_4_entry_requires_authorization_gate: true;
  notes: string;
}

export interface AiLearningGenerationExecutionAuthorizationGateRollbackCondition {
  phase7_3_rollback_needed: false;
  reason: string;
  future_rollback_requirements: string[];
}

export interface AiLearningGenerationExecutionAuthorizationGateAuditCondition {
  upstream_phase: "7.2";
  upstream_artifact_type: "ai_learning_generation_execution_plan";
  upstream_commit: "6f0ac44";
  upstream_execution_plan_status: "planned";
  upstream_execution_status: "not_started";
  upstream_execution_mode: "offline_existing_source_packet_only";
  upstream_ai_learning_content_generation_allowed: true;
  current_authorization_status: "authorized";
  current_authorization_result: "pass";
  current_ai_learning_content_generation_allowed: false;
  current_phase7_4_entry_allowed: true;
  authorized_future_output_count: 8;
  actual_generated_outputs_empty: true;
  validation_commands: string[];
  commit_scope: string;
}

export interface AiLearningGenerationExecutionAuthorizationGatePhaseProgressionEntry {
  phase: string;
  outcome: string;
}

export interface AiLearningGenerationExecutionAuthorizationGateValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  phase_must_be: "7.3";
  artifact_type_must_be: "ai_learning_generation_execution_authorization_gate";
  authorization_status_must_be: "authorized";
  authorization_result_must_be: "pass";
  authorization_mode_must_be: "authorization_only";
  upstream_phase_must_be: "7.2";
  upstream_artifact_type_must_be: "ai_learning_generation_execution_plan";
  upstream_commit_must_be: "6f0ac44";
  upstream_execution_plan_status_must_be: "planned";
  upstream_execution_status_must_be: "not_started";
  upstream_execution_mode_must_be: "offline_existing_source_packet_only";
  upstream_ai_learning_content_generation_allowed_must_be: true;
  batch_id_must_be: "phase6_1_batch_001";
  authorized_execution_phase_must_be: "7.4";
  authorized_execution_mode_must_be: "offline_existing_source_packet_only";
  ai_learning_content_generation_allowed_must_be: false;
  ai_learning_execution_authorization_allowed_must_be: true;
  phase7_4_entry_allowed_must_be: true;
  crawler_allowed_must_be: false;
  renderer_allowed_must_be: false;
  recovery_allowed_must_be: false;
  web_requests_allowed_must_be: false;
  source_layer_modification_allowed_must_be: false;
  actual_generated_outputs_must_be_empty: true;
  authorized_future_output_count_must_be: 8;
  risk_level_must_be: "low";
  closure_status_must_be: "complete";
  closure_result_must_be: "pass";
}
