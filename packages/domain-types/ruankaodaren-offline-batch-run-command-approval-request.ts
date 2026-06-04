/**
 * Phase 6.13 Offline Batch Run Command Approval Request domain types.
 *
 * Type-safe representation of the phase6_13_offline_batch_run_command_approval_request.json manifest.
 * All literal types are enforced via readonly + const patterns.
 */

export interface OfflineBatchRunCommandApprovalRequestScope {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
}

export interface OfflineBatchRunCommandApprovalRequestMetadata {
  readonly request_id: string;
  readonly request_type: "offline_batch_run_command_approval";
  readonly request_phase: "6.13";
  readonly request_timestamp: string;
  readonly referencing_plan_phase: "6.12";
  readonly referencing_decision_phase: "6.11";
  readonly referencing_approval_phase: "6.10";
  readonly request_scope: "offline_run_command_approval_only";
}

export interface OfflineBatchRunCommandApprovalRequestPhaseGates {
  readonly phase6_1_entry_allowed: true;
  readonly activation_allowed: true;
  readonly batch_executable: true;
  readonly execution_allowed: true;
  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly ai_learning_generation_allowed: false;
}

export interface OfflineBatchRunCommandApprovalRequestOperationalGateDecisions {
  readonly crawler_gate_decision: "not_required";
  readonly renderer_gate_decision: "not_required";
  readonly recovery_gate_decision: "not_required";
  readonly web_requests_gate_decision: "not_required";
  readonly ai_learning_generation_gate_decision: "not_allowed";
  readonly constraint: string;
}

export interface OfflineBatchRunCommandApprovalRequestCommandArgument {
  readonly argument: string;
  readonly value: string;
  readonly description: string;
}

export interface OfflineBatchRunCommandApprovalRequestRequestedCommand {
  readonly command_id: string;
  readonly command_type: "offline_batch_run";
  readonly command_status: "pending_human_review";
  readonly command_is_executable_now: false;
  readonly command_has_been_executed: false;
  readonly command_text_placeholder: string;
  readonly command_is_placeholder_only: true;
  readonly command_not_in_package_json: true;
  readonly command_arguments: readonly OfflineBatchRunCommandApprovalRequestCommandArgument[];
  readonly command_constraints: readonly string[];
}

export interface OfflineBatchRunCommandApprovalRequestItemBoundary {
  readonly allowed_items: readonly string[];
  readonly approved_items: readonly ["1.3"];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly item_count: 1;
  readonly source_layer_mutation_allowed: false;
  readonly constraints: readonly string[];
}

export interface OfflineBatchRunCommandApprovalRequestAllowedInput {
  readonly source_phase: string;
  readonly artifact: string;
  readonly purpose: string;
  readonly access_mode: "read_only";
}

export interface OfflineBatchRunCommandApprovalRequestInputBoundary {
  readonly allowed_inputs: readonly OfflineBatchRunCommandApprovalRequestAllowedInput[];
  readonly forbidden_inputs: readonly string[];
}

export interface OfflineBatchRunCommandApprovalRequestFutureArtifact {
  readonly name: string;
  readonly purpose: string;
  readonly created_when: string;
  readonly status: "planned";
}

export interface OfflineBatchRunCommandApprovalRequestAllowedFutureOutputs {
  readonly description: string;
  readonly artifacts: readonly OfflineBatchRunCommandApprovalRequestFutureArtifact[];
}

export interface OfflineBatchRunCommandApprovalRequestForbiddenArtifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchRunCommandApprovalRequestNoGoConfirmation {
  readonly no_batch_execution_occurs: true;
  readonly no_crawler_runs: true;
  readonly no_renderer_runs: true;
  readonly no_recovery_runs: true;
  readonly no_web_requests_made: true;
  readonly no_source_layer_modified: true;
  readonly no_ai_learning_generated: true;
  readonly no_assets_captured: true;
  readonly no_raw_snapshots_created: true;
  readonly no_intermediate_json_created: true;
  readonly no_package_script_added_for_batch_run: true;
  readonly crawler_allowed_remains_false: true;
  readonly renderer_allowed_remains_false: true;
  readonly recovery_allowed_remains_false: true;
  readonly web_requests_allowed_remains_false: true;
  readonly ai_learning_generation_allowed_remains_false: true;
}

export interface OfflineBatchRunCommandApprovalRequestOperationalAssertions {
  readonly batch_execution_claimed: false;
  readonly crawler_output_claimed: false;
  readonly renderer_output_claimed: false;
  readonly recovery_output_claimed: false;
  readonly ai_learning_generation_claimed: false;
  readonly source_layer_mutation_declared: false;
  readonly web_requests_declared: false;
  readonly raw_snapshots_created: false;
  readonly intermediate_json_created: false;
  readonly assets_captured: false;
  readonly run_command_approved: false;
  readonly run_command_executed: false;
}

export interface OfflineBatchRunCommandApprovalRequestHumanDecisionFields {
  readonly human_decision: "pending";
  readonly human_decision_timestamp: string | null;
  readonly human_decision_notes: string | null;
  readonly human_reviewer_id: string | null;
  readonly description: string;
}

export interface OfflineBatchRunCommandApprovalRequestRollbackCondition {
  readonly phase6_13_rollback_needed: false;
  readonly reason: string;
  readonly approval_request_reversible: true;
  readonly future_execution_requirements: readonly string[];
}

export interface OfflineBatchRunCommandApprovalRequestAuditConditionGates {
  readonly phase6_1_entry_allowed: true;
  readonly activation_allowed: true;
  readonly batch_executable: true;
  readonly execution_allowed: true;
  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly ai_learning_generation_allowed: false;
}

export interface OfflineBatchRunCommandApprovalRequestAuditCondition {
  readonly prior_phase_chain: readonly string[];
  readonly current_approval_status: "pending_human_review";
  readonly current_run_command_approval_status: "pending_human_review";
  readonly current_run_command_approved: false;
  readonly current_batch_run_executed: false;
  readonly current_run_mode: "offline_existing_source_packet_only";
  readonly current_operational_mode_approval_status: "operational_mode_approved";
  readonly current_execution_authorization_status: "execution_approved";
  readonly current_run_plan_status: "planned_not_executed";
  readonly current_operational_gates: OfflineBatchRunCommandApprovalRequestAuditConditionGates;
  readonly no_go_confirmation: true;
  readonly validation_commands: readonly string[];
  readonly commit_scope: string;
}

export interface OfflineBatchRunCommandApprovalRequestPhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

export interface OfflineBatchRunCommandApprovalRequestValidationExpectations {
  readonly schema_validation: "must_pass";
  readonly invariant_checks: "must_pass";
  readonly approval_status_must_be: "pending_human_review";
  readonly requested_decision_must_be: "approve_offline_run_command";
  readonly run_command_approval_status_must_be: "pending_human_review";
  readonly run_command_approved_must_be: false;
  readonly batch_run_executed_must_be: false;
  readonly command_status_must_be: "pending_human_review";
  readonly command_is_executable_now_must_be: false;
  readonly command_has_been_executed_must_be: false;
  readonly operational_assertions_all_false: true;
  readonly no_go_confirmations_all_true: true;
  readonly item_constraints_satisfied: true;
  readonly future_outputs_planned_only: true;
  readonly forbidden_artifacts_explicitly_listed: true;
  readonly operational_gate_decisions_all_not_required_or_not_allowed: true;
}

export interface OfflineBatchRunCommandApprovalRequestManifest {
  readonly manifest_version: "phase6.13";
  readonly manifest_type: "offline_batch_run_command_approval_request";
  readonly status: "offline_batch_run_command_approval_request_created";
  readonly created_for_phase: "6.13";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12"];
  readonly created_at: string;
  readonly scope: OfflineBatchRunCommandApprovalRequestScope;
  readonly approval_status: "pending_human_review";
  readonly requested_decision: "approve_offline_run_command";
  readonly run_command_approval_status: "pending_human_review";
  readonly run_command_approved: false;
  readonly batch_run_executed: false;
  readonly run_mode: "offline_existing_source_packet_only";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly execution_authorization_status: "execution_approved";
  readonly operational_mode_approval_status: "operational_mode_approved";
  readonly run_plan_status: "planned_not_executed";
  readonly request_metadata: OfflineBatchRunCommandApprovalRequestMetadata;
  readonly requested_command: OfflineBatchRunCommandApprovalRequestRequestedCommand;
  readonly phase_gates: OfflineBatchRunCommandApprovalRequestPhaseGates;
  readonly operational_gate_decisions: OfflineBatchRunCommandApprovalRequestOperationalGateDecisions;
  readonly item_boundary: OfflineBatchRunCommandApprovalRequestItemBoundary;
  readonly input_boundary: OfflineBatchRunCommandApprovalRequestInputBoundary;
  readonly allowed_future_outputs: OfflineBatchRunCommandApprovalRequestAllowedFutureOutputs;
  readonly forbidden_phase6_13_artifacts: OfflineBatchRunCommandApprovalRequestForbiddenArtifacts;
  readonly no_go_confirmation: OfflineBatchRunCommandApprovalRequestNoGoConfirmation;
  readonly operational_assertions: OfflineBatchRunCommandApprovalRequestOperationalAssertions;
  readonly human_decision_fields: OfflineBatchRunCommandApprovalRequestHumanDecisionFields;
  readonly rollback_condition: OfflineBatchRunCommandApprovalRequestRollbackCondition;
  readonly audit_condition: OfflineBatchRunCommandApprovalRequestAuditCondition;
  readonly phase_progression_history: readonly OfflineBatchRunCommandApprovalRequestPhaseProgressionEntry[];
  readonly validation_expectations: OfflineBatchRunCommandApprovalRequestValidationExpectations;
}
