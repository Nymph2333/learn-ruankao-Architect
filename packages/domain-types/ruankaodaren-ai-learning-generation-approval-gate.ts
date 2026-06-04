/**
 * Phase 7.1 — AI Learning Generation Approval Gate
 *
 * TypeScript type definitions for the AI learning generation
 * approval gate manifest.
 */

export type ApprovedGenerationOutput =
  | "learning_objectives"
  | "knowledge_units"
  | "exam_oriented_explanations"
  | "practice_questions"
  | "answer_rationales"
  | "misconception_warnings"
  | "review_checklist"
  | "source_traceability_map";

export const APPROVED_GENERATION_OUTPUTS: readonly ApprovedGenerationOutput[] = [
  "learning_objectives",
  "knowledge_units",
  "exam_oriented_explanations",
  "practice_questions",
  "answer_rationales",
  "misconception_warnings",
  "review_checklist",
  "source_traceability_map",
] as const;

export interface AiLearningGenerationApprovalGate {
  manifest_version: "phase7.1";
  manifest_type: "ai_learning_generation_approval_gate";
  phase: "7.1";
  artifact_type: "ai_learning_generation_approval_gate";
  status: "ai_learning_generation_approval_gate_recorded";
  created_for_phase: "7.1";
  created_at: string;
  approval_status: "ai_learning_generation_approved";
  approved_decision: "approve_ai_learning_content_generation";
  ai_learning_generation_approval_status: "approved";
  ai_learning_generation_approved: true;
  ai_learning_content_generation_allowed: true;
  phase7_1_entry_allowed: true;
  phase7_2_entry_allowed: false;
  upstream_phase: "7.0";
  upstream_manifest: "phase7_0_ai_learning_generation_request.json";
  upstream_artifact_type: "ai_learning_generation_request";
  upstream_request_status: "requested";
  upstream_request_mode: "request_only";
  batch_id: "phase6_1_batch_001";
  crawler_allowed: false;
  renderer_allowed: false;
  recovery_allowed: false;
  web_requests_allowed: false;
  source_layer_modification_allowed: false;
  ai_learning_request_creation_allowed: true;
  approved_generation_scope: [
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
  scope: AiLearningGenerationApprovalGateScope;
  risk: AiLearningGenerationApprovalGateRisk;
  closure: AiLearningGenerationApprovalGateClosure;
  next_phase_recommendation: AiLearningGenerationApprovalGateNextPhaseRecommendation;
  rollback_condition: AiLearningGenerationApprovalGateRollbackCondition;
  audit_condition: AiLearningGenerationApprovalGateAuditCondition;
  phase_progression_history: AiLearningGenerationApprovalGatePhaseProgressionEntry[];
  validation_expectations: AiLearningGenerationApprovalGateValidationExpectations;
}

export interface AiLearningGenerationApprovalGateScope {
  allowed: string[];
  forbidden: string[];
  allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  unapproved_sources_allowed: false;
  external_sources_allowed: false;
  source_expansion_allowed: false;
  generation_mode: "offline_existing_source_packet_only";
}

export interface AiLearningGenerationApprovalGateRisk {
  risk_level: "low";
  risk_reason: string;
}

export interface AiLearningGenerationApprovalGateClosure {
  phase7_1_status: "complete";
  phase7_1_result: "pass";
}

export interface AiLearningGenerationApprovalGateNextPhaseRecommendation {
  next_recommended_phase: "phase7.2_ai_learning_generation_execution";
  phase7_2_entry_allowed: false;
  phase7_2_entry_requires_approval: true;
  notes: string;
}

export interface AiLearningGenerationApprovalGateRollbackCondition {
  phase7_1_rollback_needed: false;
  reason: string;
  future_rollback_requirements: string[];
}

export interface AiLearningGenerationApprovalGateAuditCondition {
  upstream_phase: "7.0";
  upstream_request_status: "requested";
  upstream_request_mode: "request_only";
  current_approval_status: "ai_learning_generation_approved";
  current_ai_learning_generation_approved: true;
  current_ai_learning_content_generation_allowed: true;
  current_phase7_1_entry_allowed: true;
  current_phase7_2_entry_allowed: false;
  human_decision_recorded: true;
  approved_generation_scope_count: 8;
  actual_generated_outputs_empty: true;
  validation_commands: string[];
  commit_scope: string;
}

export interface AiLearningGenerationApprovalGatePhaseProgressionEntry {
  phase: string;
  outcome: string;
}

export interface AiLearningGenerationApprovalGateValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  phase_must_be: "7.1";
  artifact_type_must_be: "ai_learning_generation_approval_gate";
  approval_status_must_be: "ai_learning_generation_approved";
  approved_decision_must_be: "approve_ai_learning_content_generation";
  ai_learning_generation_approval_status_must_be: "approved";
  ai_learning_generation_approved_must_be: true;
  ai_learning_content_generation_allowed_must_be: true;
  phase7_1_entry_allowed_must_be: true;
  phase7_2_entry_allowed_must_be: false;
  upstream_phase_must_be: "7.0";
  upstream_request_status_must_be: "requested";
  batch_id_must_be: "phase6_1_batch_001";
  crawler_allowed_must_be: false;
  renderer_allowed_must_be: false;
  recovery_allowed_must_be: false;
  web_requests_allowed_must_be: false;
  source_layer_modification_allowed_must_be: false;
  actual_generated_outputs_must_be_empty: true;
  approved_generation_scope_count_must_be: 8;
  risk_level_must_be: "low";
  closure_status_must_be: "complete";
  closure_result_must_be: "pass";
}
