/**
 * Domain types for Ruankao AI Learning Generation Execution (Phase 7.4)
 *
 * Phase 7.4 is the first phase that actually generates AI learning content
 * from approved source packets. It operates under Phase 7.3 authorization
 * and Phase 7.2 execution plan, using only content from Phase 6.22 closed
 * pass source packets.
 */

// ─── Output Types ─────────────────────────────────────────────────────────────

export const GENERATED_OUTPUT_TYPES = [
  "learning_objectives",
  "knowledge_units",
  "exam_oriented_explanations",
  "practice_questions",
  "answer_rationales",
  "misconception_warnings",
  "review_checklist",
  "source_traceability_map",
] as const;

export type GeneratedOutputType = (typeof GENERATED_OUTPUT_TYPES)[number];

export const GENERATED_OUTPUT_COUNT = 8;

// ─── Generation Statuses ──────────────────────────────────────────────────────

export const GENERATION_STATUSES = [
  "generated",
  "not_generated",
  "insufficient_source_basis",
] as const;

export type GenerationStatus = (typeof GENERATION_STATUSES)[number];

// ─── Question Types ───────────────────────────────────────────────────────────

export const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "fill_in_blank",
  "short_answer",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

// ─── Difficulty Levels ────────────────────────────────────────────────────────

export const DIFFICULTY_LEVELS = [
  "basic",
  "intermediate",
  "advanced",
] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

// ─── Confidence Levels ───────────────────────────────────────────────────────

export const CONFIDENCE_LEVELS = [
  "high",
  "medium",
  "low",
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

// ─── Source Reference ─────────────────────────────────────────────────────────

export interface SourceRef {
  source_packet_id: string;
  source_artifact: string;
  evidence: string;
  confidence: ConfidenceLevel;
}

// ─── Generated Item (base) ────────────────────────────────────────────────────

export interface GeneratedItemBase {
  id: string;
  title?: string;
  generated_content?: unknown;
  source_refs: SourceRef[];
  generation_status: GenerationStatus;
}

// ─── Practice Question Item ───────────────────────────────────────────────────

export interface PracticeQuestionItem extends GeneratedItemBase {
  question_type: QuestionType;
  question: string;
  options: string[];
  correct_answer: string | string[];
  rationale: string;
  difficulty: DifficultyLevel;
}

// ─── Generated Output Group ───────────────────────────────────────────────────

export interface GeneratedOutputGroup {
  output_type: GeneratedOutputType;
  generation_status: GenerationStatus;
  item_count: number;
  items: (GeneratedItemBase | PracticeQuestionItem)[];
}

// ─── Unsupported Generation Item ──────────────────────────────────────────────

export interface UnsupportedGenerationItem {
  output_type: string;
  item_description: string;
  reason: string;
  source_packet_id: string;
}

// ─── Generation Quality Controls ─────────────────────────────────────────────

export interface GenerationQualityControls {
  source_traceability_checked: true;
  unsupported_content_blocked: true;
  external_knowledge_blocked: true;
  hallucination_guard_enabled: true;
  empty_traceability_disallowed: true;
}

// ─── Upstream Authorization (Phase 7.3) ───────────────────────────────────────

export interface UpstreamAuthorization {
  phase: "7.3";
  artifact_type: "ai_learning_generation_execution_authorization_gate";
  commit: "bc5f2af";
  authorization_status: "authorized";
  authorization_result: "pass";
  authorized_execution_phase: "7.4";
  authorized_execution_mode: "offline_existing_source_packet_only";
  phase7_4_entry_allowed: true;
}

// ─── Upstream Execution Plan (Phase 7.2) ──────────────────────────────────────

export interface UpstreamExecutionPlan {
  phase: "7.2";
  artifact_type: "ai_learning_generation_execution_plan";
  commit: "6f0ac44";
  execution_plan_status: "planned";
  execution_status: "not_started";
  execution_mode: "offline_existing_source_packet_only";
}

// ─── Upstream Closure (Phase 6.22) ────────────────────────────────────────────

export interface UpstreamClosure {
  phase: "6.22";
  closure_status: "closed";
  closure_result: "pass";
  batch_id: "phase6_1_batch_001";
}

// ─── Scope ────────────────────────────────────────────────────────────────────

export interface ExecutionScope {
  allowed: string[];
  forbidden: string[];
  allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  unapproved_sources_allowed: false;
  external_sources_allowed: false;
  source_expansion_allowed: false;
  offline_only: true;
  source_traceability_required: true;
}

// ─── Risk ─────────────────────────────────────────────────────────────────────

export interface Risk {
  risk_level: "medium";
  risk_reason: string;
}

// ─── Closure ──────────────────────────────────────────────────────────────────

export interface Closure {
  phase7_4_status: "complete";
  phase7_4_result: "pass";
}

// ─── Phase Progression History Entry ──────────────────────────────────────────

export interface PhaseProgressionEntry {
  phase: string;
  outcome: string;
}

// ─── Next Phase Recommendation ────────────────────────────────────────────────

export interface NextPhaseRecommendation {
  next_recommended_phase: "phase7.5_ai_learning_generation_validation";
  phase7_5_entry_allowed: false;
  phase7_5_entry_requires_approval: true;
  notes: string;
}

// ─── Rollback Condition ──────────────────────────────────────────────────────

export interface RollbackCondition {
  phase7_4_rollback_needed: false;
  reason: string;
  future_rollback_requirements: string[];
}

// ─── Audit Condition ─────────────────────────────────────────────────────────

export interface AuditCondition {
  upstream_authorization_phase: "7.3";
  upstream_authorization_commit: "bc5f2af";
  upstream_authorization_status: "authorized";
  upstream_execution_plan_phase: "7.2";
  upstream_execution_plan_commit: "6f0ac44";
  upstream_closure_phase: "6.22";
  upstream_closure_result: "pass";
  current_execution_status: "completed";
  current_execution_result: "pass";
  current_ai_learning_content_generation_allowed: true;
  current_ai_learning_execution_allowed: true;
  current_phase7_5_entry_allowed: false;
  generated_output_count: 8;
  total_generated_items: number;
  total_unsupported_items: number;
  all_items_have_source_refs: true;
  validation_commands: string[];
  commit_scope: string;
}

// ─── Validation Expectations ─────────────────────────────────────────────────

export interface ValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  phase_must_be: "7.4";
  artifact_type_must_be: "ai_learning_generation_execution";
  execution_status_must_be: "completed";
  execution_result_must_be: "pass";
  execution_mode_must_be: "offline_existing_source_packet_only";
  upstream_authorization_phase_must_be: "7.3";
  upstream_authorization_commit_must_be: "bc5f2af";
  upstream_authorization_status_must_be: "authorized";
  upstream_execution_plan_phase_must_be: "7.2";
  upstream_execution_plan_commit_must_be: "6f0ac44";
  upstream_closure_phase_must_be: "6.22";
  upstream_closure_result_must_be: "pass";
  batch_id_must_be: "phase6_1_batch_001";
  ai_learning_content_generation_allowed_must_be: true;
  ai_learning_execution_allowed_must_be: true;
  phase7_5_entry_allowed_must_be: false;
  generated_output_count_must_be: 8;
  all_items_must_have_source_refs: true;
  risk_level_must_be: "medium";
  closure_status_must_be: "complete";
  closure_result_must_be: "pass";
}

// ─── Full Manifest Type ──────────────────────────────────────────────────────

export interface AiLearningGenerationExecution {
  manifest_version: "phase7.4";
  manifest_type: "ai_learning_generation_execution";
  phase: "7.4";
  artifact_type: "ai_learning_generation_execution";
  status: "ai_learning_generation_execution_completed";
  created_for_phase: "7.4";
  created_at: string;

  execution_status: "completed";
  execution_result: "pass";
  execution_mode: "offline_existing_source_packet_only";

  upstream_authorization: UpstreamAuthorization;
  upstream_execution_plan: UpstreamExecutionPlan;
  upstream_closure: UpstreamClosure;

  batch_id: "phase6_1_batch_001";

  crawler_allowed: false;
  renderer_allowed: false;
  recovery_allowed: false;
  web_requests_allowed: false;
  source_layer_modification_allowed: false;
  ai_learning_content_generation_allowed: true;
  ai_learning_execution_allowed: true;
  ai_learning_request_creation_allowed: true;
  phase7_4_entry_allowed: true;
  phase7_5_entry_allowed: false;

  generated_outputs: GeneratedOutputGroup[];
  unsupported_generation_items: UnsupportedGenerationItem[];
  generation_quality_controls: GenerationQualityControls;

  scope: ExecutionScope;
  risk: Risk;
  closure: Closure;
  next_phase_recommendation: NextPhaseRecommendation;
  rollback_condition: RollbackCondition;
  audit_condition: AuditCondition;
  phase_progression_history: PhaseProgressionEntry[];
  validation_expectations: ValidationExpectations;
}
