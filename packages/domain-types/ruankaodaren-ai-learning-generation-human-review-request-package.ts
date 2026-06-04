/**
 * Domain types for Ruankao AI Learning Generation Human Review Request Package (Phase 7.5)
 *
 * Phase 7.5 is review-request-only. It prepares a formal human review request
 * package for the Phase 7.4 generated learning content. It does NOT generate,
 * revise, accept, reject, or render content.
 */

// ─── Review Request Statuses ─────────────────────────────────────────────────

export const REVIEW_REQUEST_STATUSES = [
  "requested",
  "in_review",
  "review_completed",
  "review_cancelled",
] as const;

export type ReviewRequestStatus = (typeof REVIEW_REQUEST_STATUSES)[number];

// ─── Review Request Results ──────────────────────────────────────────────────

export const REVIEW_REQUEST_RESULTS = [
  "pending_human_review",
  "approved_for_quality_review",
  "revision_required",
  "rejected",
  "source_recheck_required",
] as const;

export type ReviewRequestResult = (typeof REVIEW_REQUEST_RESULTS)[number];

// ─── Review Request Modes ────────────────────────────────────────────────────

export const REVIEW_REQUEST_MODES = [
  "review_request_only",
] as const;

export type ReviewRequestMode = (typeof REVIEW_REQUEST_MODES)[number];

// ─── Output Types ────────────────────────────────────────────────────────────

export const REVIEW_OUTPUT_TYPES = [
  "learning_objectives",
  "knowledge_units",
  "exam_oriented_explanations",
  "practice_questions",
  "answer_rationales",
  "misconception_warnings",
  "review_checklist",
  "source_traceability_map",
] as const;

export type ReviewOutputType = (typeof REVIEW_OUTPUT_TYPES)[number];

export const REVIEW_OUTPUT_CATEGORY_COUNT = 8;

// ─── Human Review Criteria ───────────────────────────────────────────────────

export const HUMAN_REVIEW_CRITERIA = [
  "source_fidelity",
  "exam_relevance",
  "conceptual_correctness",
  "explanation_clarity",
  "question_validity",
  "answer_rationale_consistency",
  "unsupported_item_correctness",
  "traceability_sufficiency",
  "hallucination_or_overreach_detection",
  "duplicate_or_low_value_content_detection",
] as const;

export type HumanReviewCriterion = (typeof HUMAN_REVIEW_CRITERIA)[number];

export const HUMAN_REVIEW_CRITERIA_COUNT = 10;

// ─── Allowed Human Review Decisions ──────────────────────────────────────────

export const ALLOWED_HUMAN_REVIEW_DECISIONS = [
  "approve_for_quality_review",
  "require_minor_revision_plan",
  "require_major_revision_plan",
  "reject_generation_batch",
  "request_source_recheck",
] as const;

export type AllowedHumanReviewDecision =
  (typeof ALLOWED_HUMAN_REVIEW_DECISIONS)[number];

export const ALLOWED_HUMAN_REVIEW_DECISION_COUNT = 5;

// ─── Issue Severity Levels ───────────────────────────────────────────────────

export const ISSUE_SEVERITY_LEVELS = [
  "blocker",
  "major",
  "minor",
  "advisory",
] as const;

export type IssueSeverityLevel = (typeof ISSUE_SEVERITY_LEVELS)[number];

export const ISSUE_SEVERITY_LEVEL_COUNT = 4;

// ─── Decision Statuses ───────────────────────────────────────────────────────

export const DECISION_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

// ─── Review Decision Results ─────────────────────────────────────────────────

export const DECISION_RESULTS = [
  "approve_for_quality_review",
  "require_minor_revision_plan",
  "require_major_revision_plan",
  "reject_generation_batch",
  "request_source_recheck",
] as const;

export type DecisionResult = (typeof DECISION_RESULTS)[number];

// ─── Output Category ─────────────────────────────────────────────────────────

export interface ReviewOutputCategory {
  readonly output_type: ReviewOutputType;
  readonly item_count: number;
  readonly review_required: true;
}

// ─── Review Decision ─────────────────────────────────────────────────────────

export interface ReviewDecision {
  readonly decision_status: "not_started";
  readonly decision_result: null;
  readonly reviewer: null;
  readonly reviewed_at: null;
  readonly issues: readonly [];
}

// ─── Scope ───────────────────────────────────────────────────────────────────

export interface ReviewRequestScope {
  readonly review_scope: "phase7_4_generated_outputs_only";
  readonly allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  readonly content_mutation_allowed: false;
  readonly new_generation_allowed: false;
  readonly external_sources_allowed: false;
  readonly source_expansion_allowed: false;
  readonly offline_only: true;
}

// ─── Risk ────────────────────────────────────────────────────────────────────

export interface ReviewRequestRisk {
  readonly risk_level: "low";
  readonly risk_reason: string;
}

// ─── Closure ─────────────────────────────────────────────────────────────────

export interface ReviewRequestClosure {
  readonly phase7_5_status: "complete";
  readonly phase7_5_result: "pass";
}

// ─── Upstream References ─────────────────────────────────────────────────────

export interface UpstreamGenerationExecution {
  readonly phase: "7.4";
  readonly artifact_type: "ai_learning_generation_execution";
  readonly manifest: "phase7_4_ai_learning_generation_execution.json";
  readonly commit: "71f8f3f";
  readonly execution_status: "completed";
  readonly execution_result: "pass";
  readonly execution_mode: "offline_existing_source_packet_only";
  readonly generated_output_category_count: 8;
  readonly generated_item_count: 36;
  readonly unsupported_generation_item_count: 3;
  readonly phase7_5_entry_allowed: false;
}

export interface UpstreamAuthorization {
  readonly phase: "7.3";
  readonly artifact_type: "ai_learning_generation_execution_authorization_gate";
  readonly manifest: "phase7_3_ai_learning_generation_execution_authorization_gate.json";
  readonly commit: "bc5f2af";
  readonly authorization_status: "authorized";
  readonly authorization_result: "pass";
}

export interface UpstreamExecutionPlan {
  readonly phase: "7.2";
  readonly artifact_type: "ai_learning_generation_execution_plan";
  readonly manifest: "phase7_2_ai_learning_generation_execution_plan.json";
  readonly commit: "6f0ac44";
  readonly execution_plan_status: "planned";
}

export interface UpstreamClosure {
  readonly phase: "6.22";
  readonly closure_status: "closed";
  readonly closure_result: "pass";
  readonly batch_id: "phase6_1_batch_001";
}

// ─── Phase Progression History Entry ─────────────────────────────────────────

export interface PhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

// ─── Main Manifest Interface ─────────────────────────────────────────────────

export interface AiLearningGenerationHumanReviewRequestPackage {
  readonly manifest_version: "phase7.5";
  readonly manifest_type: "ai_learning_generation_human_review_request_package";
  readonly phase: "7.5";
  readonly artifact_type: "ai_learning_generation_human_review_request_package";
  readonly status: "ai_learning_generation_human_review_request_package_created";
  readonly created_for_phase: "7.5";
  readonly created_at: string;

  readonly review_request_status: "requested";
  readonly review_request_result: "pending_human_review";
  readonly review_request_mode: "review_request_only";

  readonly upstream_generation_execution: UpstreamGenerationExecution;
  readonly upstream_authorization: UpstreamAuthorization;
  readonly upstream_execution_plan: UpstreamExecutionPlan;
  readonly upstream_closure: UpstreamClosure;

  readonly batch_id: "phase6_1_batch_001";

  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly source_layer_modification_allowed: false;
  readonly ai_learning_content_generation_allowed: false;
  readonly ai_learning_content_revision_allowed: false;
  readonly ai_learning_review_request_creation_allowed: true;
  readonly human_review_execution_allowed: false;
  readonly ai_learning_acceptance_allowed: false;

  readonly phase7_6_entry_allowed: false;

  readonly review_inventory: {
    readonly generated_output_category_count: 8;
    readonly generated_item_count: 36;
    readonly unsupported_generation_item_count: 3;
    readonly output_categories: readonly ReviewOutputCategory[];
    readonly unsupported_generation_items_review_required: true;
  };

  readonly human_review_criteria: readonly HumanReviewCriterion[];
  readonly allowed_human_review_decisions: readonly AllowedHumanReviewDecision[];
  readonly issue_severity_levels: readonly IssueSeverityLevel[];

  readonly review_decision: ReviewDecision;

  readonly scope: ReviewRequestScope;
  readonly risk: ReviewRequestRisk;
  readonly closure: ReviewRequestClosure;

  readonly next_phase_recommendation: {
    readonly next_recommended_phase: "phase7.6_ai_learning_generation_quality_review";
    readonly phase7_6_entry_allowed: false;
    readonly phase7_6_entry_requires_review_decision: true;
  };

  readonly rollback_condition: {
    readonly phase7_5_rollback_needed: false;
  };

  readonly audit_condition: {
    readonly upstream_generation_execution_phase: "7.4";
    readonly upstream_generation_execution_commit: "71f8f3f";
    readonly upstream_generation_execution_status: "completed";
    readonly upstream_generation_execution_result: "pass";
    readonly upstream_authorization_phase: "7.3";
    readonly upstream_authorization_commit: "bc5f2af";
    readonly upstream_authorization_status: "authorized";
    readonly upstream_execution_plan_phase: "7.2";
    readonly upstream_execution_plan_commit: "6f0ac44";
    readonly upstream_closure_phase: "6.22";
    readonly upstream_closure_result: "pass";
    readonly current_review_request_status: "requested";
    readonly current_review_request_result: "pending_human_review";
    readonly current_ai_learning_content_generation_allowed: false;
    readonly current_ai_learning_content_revision_allowed: false;
    readonly current_human_review_execution_allowed: false;
    readonly current_ai_learning_acceptance_allowed: false;
    readonly current_phase7_6_entry_allowed: false;
    readonly review_inventory_category_count: 8;
    readonly review_inventory_item_count: 36;
    readonly review_inventory_unsupported_item_count: 3;
  };

  readonly phase_progression_history: readonly PhaseProgressionEntry[];

  readonly validation_expectations: {
    readonly schema_validation: "must_pass";
    readonly invariant_checks: "must_pass";
    readonly review_request_status_must_be: "requested";
    readonly review_request_result_must_be: "pending_human_review";
    readonly review_request_mode_must_be: "review_request_only";
    readonly review_decision_status_must_be: "not_started";
    readonly review_decision_result_must_be: null;
    readonly review_decision_issues_must_be_empty: true;
    readonly phase7_6_entry_allowed_must_be: false;
    readonly generated_output_category_count_must_be: 8;
    readonly generated_item_count_must_be: 36;
    readonly unsupported_generation_item_count_must_be: 3;
  };
}
