/**
 * Phase 6.22 — Formal Run Review and Closure Report
 *
 * TypeScript type definitions for the formal run review and
 * closure report manifest.
 */

export interface FormalRunReviewAndClosureReport {
  manifest_version: "phase6.22";
  manifest_type: "formal_run_review_and_closure_report";
  status: "formal_run_review_and_closure_report_created";
  created_for_phase: "6.22";
  inherits_from_phase: [
    "6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9",
    "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17", "6.18", "6.19", "6.20", "6.21"
  ];
  created_at: string;
  scope: {
    allowed: string[];
    forbidden: string[];
  };
  closure_status: "closed";
  closure_result: "pass";
  batch_id: "phase6_1_batch_001";
  reviewed_items: [string, ...string[]];
  executed_items: [string, ...string[]];
  approved_items: [string, ...string[]];
  formal_run_status: "completed";
  formal_run_result: "pass";
  formal_run_executed: true;
  batch_run_executed: true;
  formal_execution_status: "completed";
  run_mode: "offline_existing_source_packet_only";
  source_layer_mutation_detected: false;
  ai_learning_generation_detected: false;
  operational_gate_violation_detected: false;
  prior_phase_reference: PriorPhaseReference;
  artifact_references: ArtifactReferences;
  closure_review_confirmations: ClosureReviewConfirmations;
  final_batch_result: FinalBatchResult;
  item_final_statuses: ItemFinalStatuses;
  phase_gates: PhaseGates;
  operational_gate_decisions: OperationalGateDecisions;
  no_go_confirmation: NoGoConfirmation;
  operational_assertions: OperationalAssertions;
  next_phase_recommendation: NextPhaseRecommendation;
  allowed_phase6_22_artifacts: { description: string; artifacts: string[] };
  forbidden_phase6_22_artifacts: { description: string; artifacts: string[] };
  rollback_condition: RollbackCondition;
  audit_condition: AuditCondition;
  phase_progression_history: [
    { phase: "6.0"; outcome: string },
    { phase: "6.1"; outcome: string },
    { phase: "6.2"; outcome: string },
    { phase: "6.3"; outcome: string },
    { phase: "6.4"; outcome: string },
    { phase: "6.5"; outcome: string },
    { phase: "6.6"; outcome: string },
    { phase: "6.7"; outcome: string },
    { phase: "6.8"; outcome: string },
    { phase: "6.9"; outcome: string },
    { phase: "6.10"; outcome: string },
    { phase: "6.11"; outcome: string },
    { phase: "6.12"; outcome: string },
    { phase: "6.13"; outcome: string },
    { phase: "6.14"; outcome: string },
    { phase: "6.15"; outcome: string },
    { phase: "6.16"; outcome: string },
    { phase: "6.17"; outcome: string },
    { phase: "6.18"; outcome: string },
    { phase: "6.19"; outcome: string },
    { phase: "6.20"; outcome: string },
    { phase: "6.21"; outcome: string },
    { phase: "6.22"; outcome: string }
  ];
  validation_expectations: ValidationExpectations;
}

export interface PriorPhaseReference {
  prior_phase: "6.21";
  prior_manifest: string;
  prior_status: "formal_offline_batch_run_execution_record_created";
  prior_formal_run_status: "completed";
  prior_formal_run_result: "pass";
  prior_formal_run_executed: true;
  prior_formal_execution_status: "completed";
}

export interface ArtifactReferences {
  dry_run_artifacts: DryRunArtifactReferences;
  formal_approval_decision: FormalApprovalDecisionReferences;
  formal_run_artifacts: FormalRunArtifactReferences;
}

export interface DryRunArtifactReferences {
  dry_run_record: string;
  dry_run_audit_log: string;
  dry_run_item_scope_report: string;
  dry_run_validation_report: string;
  dry_run_result: "pass";
  dry_run_executed: true;
}

export interface FormalApprovalDecisionReferences {
  approval_manifest: string;
  formal_run_approval_status: "approved";
  formal_run_approved: true;
  human_decision_recorded: true;
}

export interface FormalRunArtifactReferences {
  formal_batch_run_record: string;
  formal_execution_audit_log: string;
  formal_item_execution_result_1_3: string;
  formal_post_run_validation_report: string;
  formal_run_artifacts_isolation_path: string;
}

export interface ClosureReviewConfirmations {
  prior_phase_chain_complete: true;
  dry_run_passed_before_formal_run: true;
  formal_run_approval_existed_before_formal_run: true;
  formal_run_completed_successfully: true;
  only_item_1_3_executed: true;
  item_9_1_remains_deferred: true;
  item_13_3_remains_quarantined_ineligible: true;
  no_crawler_was_run: true;
  no_renderer_was_run: true;
  no_recovery_was_run: true;
  no_web_request_was_made: true;
  no_ai_learning_content_generated: true;
  no_source_layer_mutation_occurred: true;
  no_raw_snapshot_created: true;
  no_intermediate_json_created: true;
  no_asset_capture_occurred: true;
  formal_run_artifacts_isolated: true;
}

export interface FinalBatchResult {
  batch_id: "phase6_1_batch_001";
  executed_items: string[];
  final_result: "pass";
  closure_status: "closed";
}

export interface ItemFinalStatuses {
  item_1_3: ItemFinalStatusPass;
  item_9_1: ItemFinalStatusDeferred;
  item_13_3: ItemFinalStatusQuarantined;
}

export interface ItemFinalStatusPass {
  item_id: "1.3";
  item_title: string;
  final_status: "formal_run_completed_pass";
  formal_run_status: "completed";
  execution_result: "pass";
  run_mode: "offline_existing_source_packet_only";
}

export interface ItemFinalStatusDeferred {
  item_id: "9.1";
  item_title: string;
  final_status: "deferred_candidate";
  notes: string;
}

export interface ItemFinalStatusQuarantined {
  item_id: "13.3";
  item_title: string;
  final_status: "quarantined_ineligible";
  notes: string;
}

export interface PhaseGates {
  phase6_1_entry_allowed: true;
  activation_allowed: true;
  batch_executable: true;
  execution_allowed: true;
  crawler_allowed: false;
  renderer_allowed: false;
  recovery_allowed: false;
  web_requests_allowed: false;
  ai_learning_generation_allowed: false;
}

export interface OperationalGateDecisions {
  crawler_gate_decision: "not_required";
  renderer_gate_decision: "not_required";
  recovery_gate_decision: "not_required";
  web_requests_gate_decision: "not_required";
  ai_learning_generation_gate_decision: "not_allowed";
  constraint: string;
}

export interface NoGoConfirmation {
  no_crawler_runs: true;
  no_renderer_runs: true;
  no_recovery_runs: true;
  no_web_requests_made: true;
  no_ai_learning_generated: true;
  no_source_layer_modified: true;
  no_raw_snapshots_created: true;
  no_intermediate_json_created: true;
  no_asset_capture_occurred: true;
  no_output_for_9_1: true;
  no_output_for_13_3: true;
  no_new_formal_run_record: true;
  no_new_item_level_execution_result: true;
  no_new_post_run_validation_report: true;
}

export interface OperationalAssertions {
  no_new_formal_run_record_created: true;
  no_new_item_level_execution_result_created: true;
  no_new_post_run_validation_report_created: true;
  crawler_execution_claimed: false;
  renderer_execution_claimed: false;
  recovery_execution_claimed: false;
  web_request_claimed: false;
  ai_learning_generation_claimed: false;
  source_layer_mutation_declared: false;
  raw_snapshot_creation_declared: false;
  intermediate_json_creation_declared: false;
  asset_capture_declared: false;
}

export interface NextPhaseRecommendation {
  next_recommended_phase: "phase7.0_ai_learning_generation_request";
  ai_learning_generation_allowed: false;
  ai_learning_generation_requested: false;
  source_layer_modification_allowed: false;
  notes: string;
}

export interface RollbackCondition {
  phase6_22_rollback_needed: false;
  reason: string;
  future_rollback_requirements: string[];
}

export interface AuditCondition {
  prior_phase_chain: [
    "6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9",
    "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17", "6.18", "6.19", "6.20", "6.21"
  ];
  current_closure_status: "closed";
  current_closure_result: "pass";
  current_formal_run_status: "completed";
  current_formal_run_result: "pass";
  current_formal_run_executed: true;
  current_formal_execution_status: "completed";
  current_operational_gates: {
    phase6_1_entry_allowed: true;
    activation_allowed: true;
    batch_executable: true;
    execution_allowed: true;
    crawler_allowed: false;
    renderer_allowed: false;
    recovery_allowed: false;
    web_requests_allowed: false;
    ai_learning_generation_allowed: false;
  };
  no_go_confirmation: true;
  validation_commands: string[];
  commit_scope: string;
}

export interface ValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  closure_status_must_be: "closed";
  closure_result_must_be: "pass";
  batch_id_must_be: "phase6_1_batch_001";
  approved_items_exact_match: string[];
  executed_items_exact_match: string[];
  reviewed_items_exact_match: string[];
  formal_run_status_must_be: "completed";
  formal_run_result_must_be: "pass";
  formal_run_executed_must_be: true;
  batch_run_executed_must_be: true;
  formal_execution_status_must_be: "completed";
  run_mode_must_be: "offline_existing_source_packet_only";
  phase6_21_formal_run_artifacts_referenced: true;
  phase6_18_dry_run_artifacts_referenced: true;
  phase6_20_formal_approval_decision_referenced: true;
  phase6_1_entry_allowed_must_be: true;
  activation_allowed_must_be: true;
  batch_executable_must_be: true;
  execution_allowed_must_be: true;
  crawler_allowed_must_be: false;
  renderer_allowed_must_be: false;
  recovery_allowed_must_be: false;
  web_requests_allowed_must_be: false;
  ai_learning_generation_allowed_must_be: false;
  operational_assertions_all_valid: true;
  no_go_confirmations_all_true: true;
  item_final_statuses_correct: true;
  next_recommended_phase_does_not_enable_ai_learning: true;
  forbidden_artifacts_explicitly_listed: true;
}
