/**
 * Domain types for Ruankao AI Learning Generation Human Review Result Recording Gate (Phase 7.6)
 *
 * Phase 7.6 is result-recording-only. It records whether a human review result
 * exists. It does NOT perform review, does NOT allow AI self-review, and does NOT
 * independently judge, approve, reject, revise, regenerate, or improve content.
 */

// ─── Review Recording Statuses ───────────────────────────────────────────────

export const REVIEW_RECORDING_STATUSES = [
  "blocked",
  "recorded",
  "invalid_input",
] as const;

export type ReviewRecordingStatus = (typeof REVIEW_RECORDING_STATUSES)[number];

// ─── Review Recording Results ────────────────────────────────────────────────

export const REVIEW_RECORDING_RESULTS = [
  "no_human_review_input",
  "human_review_result_recorded",
  "invalid_human_review_input",
] as const;

export type ReviewRecordingResult = (typeof REVIEW_RECORDING_RESULTS)[number];

// ─── Review Recording Modes ──────────────────────────────────────────────────

export const REVIEW_RECORDING_MODES = [
  "result_recording_only",
] as const;

export type ReviewRecordingMode = (typeof REVIEW_RECORDING_MODES)[number];

// ─── Allowed Decision Results ────────────────────────────────────────────────

export const ALLOWED_DECISION_RESULTS = [
  "approve_for_quality_review",
  "require_minor_revision_plan",
  "require_major_revision_plan",
  "reject_generation_batch",
  "request_source_recheck",
] as const;

export type AllowedDecisionResult = (typeof ALLOWED_DECISION_RESULTS)[number];

export const ALLOWED_DECISION_RESULT_COUNT = 5;

// ─── Allowed Issue Severity Levels ───────────────────────────────────────────

export const ALLOWED_ISSUE_SEVERITY_LEVELS = [
  "blocker",
  "major",
  "minor",
  "advisory",
] as const;

export type AllowedIssueSeverityLevel =
  (typeof ALLOWED_ISSUE_SEVERITY_LEVELS)[number];

export const ALLOWED_ISSUE_SEVERITY_LEVEL_COUNT = 4;

// ─── Decision Statuses ───────────────────────────────────────────────────────

export const DECISION_STATUSES = [
  "not_available",
  "not_started",
  "in_progress",
  "completed",
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

// ─── Decision Results ────────────────────────────────────────────────────────

export const DECISION_RESULTS = [
  "approve_for_quality_review",
  "require_minor_revision_plan",
  "require_major_revision_plan",
  "reject_generation_batch",
  "request_source_recheck",
] as const;

export type DecisionResult = (typeof DECISION_RESULTS)[number];

// ─── Required Human Review Input Fields ──────────────────────────────────────

export const REQUIRED_HUMAN_REVIEW_INPUT_FIELDS = [
  "reviewer",
  "reviewed_at",
  "decision_result",
  "reviewed_output_category_count",
  "reviewed_generated_item_count",
  "reviewed_unsupported_generation_item_count",
  "traceability_review_confirmed",
  "issues",
] as const;

export type RequiredHumanReviewInputField =
  (typeof REQUIRED_HUMAN_REVIEW_INPUT_FIELDS)[number];

export const REQUIRED_HUMAN_REVIEW_INPUT_FIELD_COUNT = 8;

// ─── Human Review Input ──────────────────────────────────────────────────────

export interface HumanReviewInput {
  readonly human_review_input_present: false;
  readonly human_review_input_artifact: null;
  readonly human_review_input_valid: false;
  readonly missing_required_input_reason: string;
}

// ─── Review Decision ─────────────────────────────────────────────────────────

export interface ReviewDecision {
  readonly decision_status: "not_available";
  readonly decision_result: null;
  readonly reviewer: null;
  readonly reviewed_at: null;
  readonly issues: readonly [];
}

// ─── Expected Human Review Input Contract ────────────────────────────────────

export interface ExpectedHumanReviewInputContract {
  readonly required_fields: readonly RequiredHumanReviewInputField[];
  readonly allowed_decision_results: readonly AllowedDecisionResult[];
  readonly allowed_issue_severity_levels: readonly AllowedIssueSeverityLevel[];
}

// ─── Scope ───────────────────────────────────────────────────────────────────

export interface RecordingGateScope {
  readonly recording_scope: "human_review_result_for_phase7_4_generated_outputs_only";
  readonly allowed_source_basis: "closed_pass_phase6_1_batch_001_only";
  readonly content_mutation_allowed: false;
  readonly new_generation_allowed: false;
  readonly external_sources_allowed: false;
  readonly source_expansion_allowed: false;
  readonly offline_only: true;
}

// ─── Risk ────────────────────────────────────────────────────────────────────

export interface RecordingGateRisk {
  readonly risk_level: "low";
  readonly risk_reason: string;
}

// ─── Closure ─────────────────────────────────────────────────────────────────

export interface RecordingGateClosure {
  readonly phase7_6_status: "complete";
  readonly phase7_6_result: "blocked_no_human_review_input";
}

// ─── Upstream References ─────────────────────────────────────────────────────

export interface UpstreamReviewRequest {
  readonly phase: "7.5";
  readonly artifact_type: "ai_learning_generation_human_review_request_package";
  readonly manifest: "phase7_5_ai_learning_generation_human_review_request_package.json";
  readonly commit: "5e14cc2";
  readonly review_request_status: "requested";
  readonly review_request_result: "pending_human_review";
  readonly review_request_mode: "review_request_only";
  readonly generated_output_category_count: 8;
  readonly generated_item_count: 36;
  readonly unsupported_generation_item_count: 3;
  readonly phase7_6_entry_allowed: false;
}

export interface UpstreamGenerationExecution {
  readonly phase: "7.4";
  readonly artifact_type: "ai_learning_generation_execution";
  readonly manifest: "phase7_4_ai_learning_generation_execution.json";
  readonly commit: "71f8f3f";
  readonly execution_status: "completed";
  readonly execution_result: "pass";
  readonly generated_output_category_count: 8;
  readonly generated_item_count: 36;
  readonly unsupported_generation_item_count: 3;
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

// ─── Phase Progression History Entry ─────────────────────────────────────────

export interface PhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

// ─── Main Manifest Interface ─────────────────────────────────────────────────

export interface AiLearningGenerationHumanReviewResultRecordingGate {
  readonly manifest_version: "phase7.6";
  readonly manifest_type: "ai_learning_generation_human_review_result_recording_gate";
  readonly phase: "7.6";
  readonly artifact_type: "ai_learning_generation_human_review_result_recording_gate";
  readonly status: "ai_learning_generation_human_review_result_recording_gate_created";
  readonly created_for_phase: "7.6";
  readonly created_at: string;

  readonly review_recording_status: "blocked";
  readonly review_recording_result: "no_human_review_input";
  readonly review_recording_mode: "result_recording_only";

  readonly upstream_review_request: UpstreamReviewRequest;
  readonly upstream_generation_execution: UpstreamGenerationExecution;
  readonly upstream_authorization: UpstreamAuthorization;
  readonly upstream_execution_plan: UpstreamExecutionPlan;

  readonly batch_id: "phase6_1_batch_001";

  readonly human_review_input: HumanReviewInput;

  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly source_layer_modification_allowed: false;
  readonly ai_learning_content_generation_allowed: false;
  readonly ai_learning_content_revision_allowed: false;
  readonly ai_learning_review_result_recording_allowed: true;
  readonly ai_learning_acceptance_allowed: false;
  readonly ai_learning_revision_allowed: false;

  readonly phase7_7_entry_allowed: false;

  readonly review_decision: ReviewDecision;

  readonly expected_human_review_input_contract: ExpectedHumanReviewInputContract;

  readonly scope: RecordingGateScope;
  readonly risk: RecordingGateRisk;
  readonly closure: RecordingGateClosure;

  readonly rollback_condition: {
    readonly phase7_6_rollback_needed: false;
  };

  readonly next_phase_recommendation: {
    readonly next_recommended_phase: "phase7.7_ai_learning_generation_quality_review";
    readonly phase7_7_entry_allowed: false;
    readonly phase7_7_entry_requires_human_review_result: true;
  };

  readonly audit_condition: {
    readonly upstream_review_request_phase: "7.5";
    readonly upstream_review_request_commit: "5e14cc2";
    readonly upstream_review_request_status: "requested";
    readonly upstream_review_request_result: "pending_human_review";
    readonly upstream_generation_execution_phase: "7.4";
    readonly upstream_generation_execution_commit: "71f8f3f";
    readonly upstream_generation_execution_status: "completed";
    readonly upstream_generation_execution_result: "pass";
    readonly upstream_authorization_phase: "7.3";
    readonly upstream_authorization_commit: "bc5f2af";
    readonly upstream_authorization_status: "authorized";
    readonly upstream_execution_plan_phase: "7.2";
    readonly upstream_execution_plan_commit: "6f0ac44";
    readonly batch_id: "phase6_1_batch_001";
    readonly human_review_input_present: false;
    readonly human_review_input_valid: false;
    readonly review_recording_status: "blocked";
    readonly review_recording_result: "no_human_review_input";
    readonly current_ai_learning_content_generation_allowed: false;
    readonly current_ai_learning_content_revision_allowed: false;
    readonly current_ai_learning_acceptance_allowed: false;
    readonly current_ai_learning_revision_allowed: false;
    readonly current_phase7_7_entry_allowed: false;
    readonly review_inventory_category_count: 8;
    readonly review_inventory_item_count: 36;
    readonly review_inventory_unsupported_item_count: 3;
  };

  readonly phase_progression_history: readonly PhaseProgressionEntry[];

  readonly validation_expectations: {
    readonly schema_validation: "must_pass";
    readonly invariant_checks: "must_pass";
    readonly review_recording_status_must_be: "blocked";
    readonly review_recording_result_must_be: "no_human_review_input";
    readonly review_recording_mode_must_be: "result_recording_only";
    readonly human_review_input_present_must_be: false;
    readonly human_review_input_valid_must_be: false;
    readonly review_decision_status_must_be: "not_available";
    readonly review_decision_result_must_be: null;
    readonly review_decision_issues_must_be_empty: true;
    readonly phase7_7_entry_allowed_must_be: false;
    readonly ai_learning_acceptance_allowed_must_be: false;
    readonly ai_learning_revision_allowed_must_be: false;
  };
}
