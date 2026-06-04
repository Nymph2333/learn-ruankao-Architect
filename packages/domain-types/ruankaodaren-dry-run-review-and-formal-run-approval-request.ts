/**
 * Phase 6.19 — Dry-Run Review and Formal Run Approval Request
 *
 * TypeScript type definitions for the dry-run review and formal run
 * approval request manifest.
 */

export interface DryRunReviewAndFormalRunApprovalRequest {
  manifest_version: "phase6.19";
  manifest_type: "dry_run_review_and_formal_run_approval_request";
  status: "dry_run_review_and_formal_run_approval_request_created";
  created_for_phase: "6.19";
  inherits_from_phase: [
    "6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9",
    "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17", "6.18"
  ];
  created_at: string;
  scope: {
    allowed: string[];
    forbidden: string[];
  };
  dry_run_review_status: "completed";
  dry_run_result: "pass";
  dry_run_executed: true;
  formal_run_approval_status: "pending_human_review";
  requested_decision: "approve_formal_offline_batch_run";
  formal_run_approved: false;
  formal_run_executed: false;
  batch_run_executed: false;
  formal_execution_status: "approval_requested";
  run_mode: "offline_existing_source_packet_only";
  batch_id: "phase6_1_batch_001";
  approved_items: [string, ...string[]];
  dry_run_approval_status: "approved";
  dry_run_approved: true;
  run_command_approved: true;
  execution_authorization_status: "execution_approved";
  operational_mode_approval_status: "operational_mode_approved";
  prior_phase_reference: PriorPhaseReference;
  dry_run_artifact_references: DryRunArtifactReferences;
  dry_run_review: DryRunReview;
  formal_run_approval_request: FormalRunApprovalRequest;
  human_decision_fields: HumanDecisionFields;
  phase_gates: PhaseGates;
  operational_gate_decisions: OperationalGateDecisions;
  allowed_phase6_19_artifacts: { description: string; artifacts: [string, string, string] };
  forbidden_phase6_19_artifacts: { description: string; artifacts: [string, string, string, string, string, string, string, string, string, string, string, string] };
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
    { phase: "6.19"; outcome: string }
  ];
  validation_expectations: ValidationExpectations;
}

export interface PriorPhaseReference {
  prior_phase: "6.18";
  prior_manifest: string;
  prior_status: "offline_batch_dry_run_execution_record_created";
  prior_dry_run_status: "completed";
  prior_dry_run_result: "pass";
  prior_dry_run_executed: true;
  prior_formal_execution_status: "not_started";
}

export interface DryRunArtifactReferences {
  dry_run_record: string;
  dry_run_audit_log: string;
  dry_run_item_scope_report: string;
  dry_run_validation_report: string;
}

export interface DryRunReview {
  review_status: "completed";
  review_outcome: "dry_run_passed_formal_run_eligible";
  dry_run_result: "pass";
  dry_run_executed: true;
  item_review_results: {
    item_1_3: {
      item_id: "1.3";
      item_name: string;
      status: "execution_approved";
      dry_run_result: "dry_run_scope_valid";
      formal_run_eligible: true;
    };
    item_9_1: {
      item_id: "9.1";
      item_name: string;
      status: "deferred_candidate";
      dry_run_result: "deferred_not_assessed";
      formal_run_eligible: false;
    };
    item_13_3: {
      item_id: "13.3";
      item_name: string;
      status: "quarantined_ineligible";
      dry_run_result: "quarantined_ineligible";
      formal_run_eligible: false;
    };
  };
}

export interface FormalRunApprovalRequest {
  requested_decision: "approve_formal_offline_batch_run";
  formal_run_approval_status: "pending_human_review";
  formal_run_approved: false;
  formal_run_executed: false;
  human_review_required: true;
  requested_formal_run_mode: "offline_existing_source_packet_only";
  requested_formal_run_scope: {
    batch_id: "phase6_1_batch_001";
    approved_items: string[];
    item_count: number;
    deferred_items: string[];
    quarantined_items: string[];
    no_additional_item_added: true;
    existing_source_packet_boundary_sufficient: true;
  };
  requested_formal_run_output_boundary: {
    outputs: [
      { name: string; status: "planned" },
      { name: string; status: "planned" },
      { name: string; status: "planned" },
      { name: string; status: "planned" }
    ];
  };
  requested_rollback_boundary: {
    rollback_to_state: string;
    constraints: string[];
  };
  requested_audit_boundary: {
    constraints: string[];
  };
}

export interface HumanDecisionFields {
  requested_decision: "approve_formal_offline_batch_run";
  formal_run_approval_status: "pending_human_review";
  formal_run_approved: false;
  human_review_required: true;
  human_decision_recorded: false;
  decision_options: ["approve_formal_offline_batch_run", "reject_formal_offline_batch_run"];
  constraints: [string, string, string, string, string];
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
  no_formal_batch_execution_occurs: true;
  no_formal_item_level_result_created: true;
  no_formal_post_run_validation_created: true;
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
}

export interface OperationalAssertions {
  formal_batch_execution_claimed: false;
  formal_item_level_result_claimed: false;
  formal_post_run_validation_claimed: false;
  crawler_output_claimed: false;
  renderer_output_claimed: false;
  recovery_output_claimed: false;
  ai_learning_generation_claimed: false;
  source_layer_mutation_declared: false;
  web_requests_declared: false;
  raw_snapshots_created: false;
  intermediate_json_created: false;
  assets_captured: false;
}

export interface RollbackCondition {
  phase6_19_rollback_needed: false;
  reason: string;
  future_rollback_requirements: [string, string, string];
}

export interface AuditCondition {
  prior_phase_chain: [
    "6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9",
    "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17", "6.18"
  ];
  current_dry_run_review_status: "completed";
  current_dry_run_result: "pass";
  current_dry_run_executed: true;
  current_formal_run_approval_status: "pending_human_review";
  current_formal_run_approved: false;
  current_formal_run_executed: false;
  current_formal_execution_status: "approval_requested";
  current_operational_gates: PhaseGates;
  no_go_confirmation: true;
  validation_commands: [string, string, string];
  commit_scope: string;
}

export interface ValidationExpectations {
  schema_validation: "must_pass";
  invariant_checks: "must_pass";
  dry_run_review_status_must_be: "completed";
  dry_run_result_must_be: "pass";
  dry_run_executed_must_be: true;
  formal_run_approval_status_must_be: "pending_human_review";
  requested_decision_must_be: "approve_formal_offline_batch_run";
  formal_run_approved_must_be: false;
  formal_run_executed_must_be: false;
  batch_run_executed_must_be: false;
  formal_execution_status_must_be: "approval_requested";
  run_mode_must_be: "offline_existing_source_packet_only";
  batch_id_must_be: "phase6_1_batch_001";
  operational_assertions_all_false: true;
  no_go_confirmations_all_true: true;
  item_constraints_satisfied: true;
  planned_formal_outputs_marked_planned_only: true;
  forbidden_artifacts_explicitly_listed: true;
  operational_gate_decisions_all_not_required_or_not_allowed: true;
  dry_run_artifacts_referenced: true;
  human_decision_fields_present: true;
}
