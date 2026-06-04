/**
 * Phase 7.0 — AI Learning Generation Request
 *
 * TypeScript type definitions for the AI learning generation
 * request manifest.
 */

export type RequestedFutureOutput =
  | "learning_objectives"
  | "knowledge_units"
  | "exam_oriented_explanations"
  | "practice_questions"
  | "answer_rationales"
  | "misconception_warnings"
  | "review_checklist"
  | "source_traceability_map";

export const REQUESTED_FUTURE_OUTPUTS: readonly RequestedFutureOutput[] = [
  "learning_objectives",
  "knowledge_units",
  "exam_oriented_explanations",
  "practice_questions",
  "answer_rationales",
  "misconception_warnings",
  "review_checklist",
  "source_traceability_map",
] as const;

export interface AiLearningGenerationRequest {
  manifest_version: "phase7.0";
  manifest_type: "ai_learning_generation_request";
  phase: "7.0";
  artifact_type: "ai_learning_generation_request";
  status: "ai_learning_generation_request_created";
  created_for_phase: "7.0";
  created_at: string;
  request_status: "requested";
  request_mode: "request_only";
  batch_id: "phase6_1_batch_001";
  upstream_phase: "6.22";
  upstream_manifest: "phase6_22_formal_run_review_and_closure_report.json";
  upstream_artifact_type: "formal_run_review_and_closure_report";
  upstream_closure_status: "closed";
  upstream_closure_result: "pass";
  crawler_allowed: false;
  renderer_allowed: false;
  recovery_allowed: false;
  web_requests_allowed: false;
  source_layer_modification_allowed: false;
  ai_learning_content_generation_allowed: false;
  ai_learning_request_creation_allowed: true;
  phase7_1_entry_allowed: false;
  requested_future_outputs: [
    "learning_objectives",
    "knowledge_units",
    "exam_oriented_explanations",
    "practice_questions",
    "answer_rationales",
    "misconception_warnings",
    "review_checklist",
    "source_traceability_map"
  ];
  actual_generated_outputs: [];
  scope: AiLearningGenerationRequestScope;
  risk: AiLearningGenerationRequestRisk;
  closure: AiLearningGenerationRequestClosure;
  next_phase_recommendation: AiLearningGenerationRequestNextPhaseRecommendation;
  rollback_condition: AiLearningGenerationRequestRollbackCondition;
  audit_condition: AiLearningGenerationRequestAuditCondition;
  validation_expectations: AiLearningGenerationRequestValidationExpectations;
}

export interface AiLearningGenerationRequestScope {
  allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  unapproved_sources_allowed: false;
  external_sources_allowed: false;
  source_expansion_allowed: false;
}

export interface AiLearningGenerationRequestRisk {
  risk_level: "low";
  risk_reason: string;
}

export interface AiLearningGenerationRequestClosure {
  phase7_0_status: "complete";
  phase7_0_result: "pass";
}

export interface AiLearningGenerationRequestNextPhaseRecommendation {
  next_recommended_phase: "phase7.1_ai_learning_generation_execution";
  phase7_1_entry_allowed: false;
  phase7_1_entry_requires_approval: true;
  notes: string;
}

export interface AiLearningGenerationRequestRollbackCondition {
  phase7_0_rollback_needed: false;
  reason: string;
}

export interface AiLearningGenerationRequestAuditCondition {
  upstream_phase_chain_complete: true;
  upstream_closure_status: "closed";
  upstream_closure_result: "pass";
  request_mode: "request_only";
  actual_generated_outputs_empty: true;
  validation_commands: string[];
  commit_scope: string;
}

export interface AiLearningGenerationRequestValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  phase_must_be: "7.0";
  artifact_type_must_be: "ai_learning_generation_request";
  request_mode_must_be: "request_only";
  batch_id_must_be: "phase6_1_batch_001";
  upstream_phase_must_be: "6.22";
  upstream_closure_status_must_be: "closed";
  upstream_closure_result_must_be: "pass";
  ai_learning_content_generation_allowed_must_be: false;
  ai_learning_request_creation_allowed_must_be: true;
  phase7_1_entry_allowed_must_be: false;
  actual_generated_outputs_must_be_empty: true;
  requested_future_outputs_count_must_be: 8;
  risk_level_must_be: "low";
  closure_status_must_be: "complete";
  closure_result_must_be: "pass";
}
