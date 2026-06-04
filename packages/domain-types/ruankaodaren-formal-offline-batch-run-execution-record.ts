/**
 * Phase 6.21 — Formal Offline Batch Run Execution Record
 *
 * TypeScript type definitions for the formal offline batch run
 * execution record manifest.
 */

export interface FormalOfflineBatchRunExecutionRecord {
  manifest_version: "phase6.21";
  manifest_type: "formal_offline_batch_run_execution_record";
  status: "formal_offline_batch_run_execution_record_created";
  created_for_phase: "6.21";
  inherits_from_phase: [
    "6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9",
    "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17", "6.18", "6.19", "6.20"
  ];
  created_at: string;
  scope: {
    allowed: string[];
    forbidden: string[];
  };
  formal_run_status: "completed";
  formal_run_result: "pass";
  formal_run_executed: true;
  batch_run_executed: true;
  formal_execution_status: "completed";
  dry_run_review_status: "completed";
  dry_run_result: "pass";
  dry_run_executed: true;
  run_mode: "offline_existing_source_packet_only";
  batch_id: "phase6_1_batch_001";
  approved_items: [string, ...string[]];
  executed_items: [string, ...string[]];
  formal_run_approval_status: "approved";
  formal_run_approved: true;
  dry_run_approval_status: "approved";
  dry_run_approved: true;
  run_command_approved: true;
  execution_authorization_status: "execution_approved";
  operational_mode_approval_status: "operational_mode_approved";
  command_execution_scope: "formal_offline_run_only";
  prior_phase_reference: PriorPhaseReference;
  dry_run_artifact_references: DryRunArtifactReferences;
  formal_approval_reference: FormalApprovalReference;
  formal_run_command: FormalRunCommand;
  execution_metadata: ExecutionMetadata;
  formal_run_scope: FormalRunScope;
  item_execution_results: ItemExecutionResults;
  formal_run_artifacts: FormalRunArtifacts;
  phase_gates: PhaseGates;
  operational_gate_decisions: OperationalGateDecisions;
  allowed_phase6_21_artifacts: { description: string; artifacts: string[] };
  forbidden_phase6_21_artifacts: { description: string; artifacts: string[] };
  no_go_confirmation: NoGoConfirmation;
  operational_assertions: OperationalAssertions;
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
    { phase: "6.21"; outcome: string }
  ];
  validation_expectations: ValidationExpectations;
}

export interface PriorPhaseReference {
  prior_phase: "6.20";
  prior_manifest: string;
  prior_status: "formal_offline_batch_run_approval_decision_recorded";
  prior_formal_run_approval_status: "approved";
  prior_formal_run_approved: true;
  prior_formal_execution_status: "approved_not_started";
}

export interface DryRunArtifactReferences {
  dry_run_record: string;
  dry_run_audit_log: string;
  dry_run_item_scope_report: string;
  dry_run_validation_report: string;
}

export interface FormalApprovalReference {
  approval_manifest: string;
  approval_status: "formal_offline_batch_run_approval_decision_recorded";
  formal_run_approval_status: "approved";
  formal_run_approved: true;
  human_decision_recorded: true;
  human_decision: "approve_formal_offline_batch_run";
}

export interface FormalRunCommand {
  formal_run_command_id: string;
  command_type: "formal_offline_batch_run";
  command_status: "executed_as_formal_run_record";
  command_has_been_executed: true;
  command_execution_scope: "formal_offline_run_only";
  command_text_placeholder: string;
  command_is_placeholder_only: true;
  command_not_in_package_json: true;
  command_arguments: Array<{
    argument: string;
    value: string;
    description: string;
  }>;
}

export interface ExecutionMetadata {
  execution_id: string;
  execution_type: "formal_offline_batch_run_execution_record";
  execution_phase: "6.21";
  execution_timestamp: string;
  prior_decision_phase: "6.20";
  prior_decision_manifest: string;
  prior_decision_status: "formal_offline_batch_run_approval_decision_recorded";
  prior_formal_run_approval_status: "approved";
  prior_formal_run_approved: true;
  prior_formal_execution_status: "approved_not_started";
  dry_run_reference_phase: "6.18";
  dry_run_result: "pass";
  execution_scope: "formal_offline_run_only";
}

export interface FormalRunScope {
  included_items: string[];
  excluded_items: string[];
  executed_items: string[];
  deferred_items: string[];
  quarantined_items: string[];
  item_count: number;
  source_layer_mutation_allowed: false;
  output_artifact_creation_allowed: true;
  output_artifact_isolation: string;
  no_additional_item_added: true;
  existing_source_packet_boundary_sufficient: true;
  constraints: string[];
}

export interface ItemExecutionResults {
  item_1_3: ItemExecutionResultPass;
  item_9_1: ItemExecutionResultDeferred;
  item_13_3: ItemExecutionResultQuarantined;
}

export interface ItemExecutionResultPass {
  item_id: "1.3";
  item_title: string;
  item_status: "formal_run_completed";
  execution_result: "pass";
  run_mode: "offline_existing_source_packet_only";
  source_packet_mode: "existing_only";
  mixed_text_image_handling_status: string;
  source_layer_mutation_detected: false;
  ai_learning_generation_detected: false;
  crawler_dependency_detected: false;
  renderer_dependency_detected: false;
  web_request_dependency_detected: false;
  formal_run_artifact: string;
}

export interface ItemExecutionResultDeferred {
  item_id: "9.1";
  item_title: string;
  item_status: "deferred";
  execution_result: "deferred_not_executed";
  notes: string;
}

export interface ItemExecutionResultQuarantined {
  item_id: "13.3";
  item_title: string;
  item_status: "quarantined_ineligible";
  execution_result: "quarantined_ineligible";
  notes: string;
}

export interface FormalRunArtifacts {
  isolation_path: "data/formal-runs/phase6_21/";
  artifacts: [
    { name: string; path: string; purpose: string; status: "created" },
    { name: string; path: string; purpose: string; status: "created" },
    { name: string; path: string; purpose: string; status: "created" },
    { name: string; path: string; purpose: string; status: "created" }
  ];
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
  no_source_layer_modified: true;
  no_ai_learning_generated: true;
  no_assets_captured: true;
  no_raw_snapshots_created: true;
  no_intermediate_json_created: true;
  no_package_script_added_for_formal_run: true;
  crawler_allowed_remains_false: true;
  renderer_allowed_remains_false: true;
  recovery_allowed_remains_false: true;
  web_requests_allowed_remains_false: true;
  ai_learning_generation_allowed_remains_false: true;
  no_output_for_9_1_created: true;
  no_output_for_13_3_created: true;
}

export interface OperationalAssertions {
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

export interface RollbackCondition {
  phase6_21_rollback_needed: false;
  reason: string;
  future_rollback_requirements: [string, string, string];
}

export interface AuditCondition {
  prior_phase_chain: [
    "6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9",
    "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17", "6.18", "6.19", "6.20"
  ];
  current_formal_run_status: "completed";
  current_formal_run_result: "pass";
  current_formal_run_executed: true;
  current_batch_run_executed: true;
  current_formal_execution_status: "completed";
  current_dry_run_result: "pass";
  current_dry_run_executed: true;
  current_operational_gates: PhaseGates;
  no_go_confirmation: true;
  validation_commands: [string, string, string];
  commit_scope: string;
}

export interface ValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  formal_run_status_must_be: "completed";
  formal_run_result_must_be: "pass";
  formal_run_executed_must_be: true;
  batch_run_executed_must_be: true;
  formal_execution_status_must_be: "completed";
  run_mode_must_be: "offline_existing_source_packet_only";
  batch_id_must_be: "phase6_1_batch_001";
  approved_items_exact_match: string[];
  executed_items_exact_match: string[];
  formal_run_approval_status_must_be: "approved";
  formal_run_approved_must_be: true;
  dry_run_result_must_be: "pass";
  dry_run_executed_must_be: true;
  command_execution_scope_must_be: "formal_offline_run_only";
  operational_assertions_all_false: true;
  no_go_confirmations_all_true: true;
  item_constraints_satisfied: true;
  formal_run_artifacts_isolated: true;
  forbidden_artifacts_explicitly_listed: true;
  operational_gate_decisions_all_not_required_or_not_allowed: true;
  dry_run_artifacts_referenced: true;
  formal_approval_referenced: true;
  no_output_for_9_1: true;
  no_output_for_13_3: true;
}
