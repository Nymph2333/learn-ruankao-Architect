/**
 * Phase 6.16 Offline Batch Dry-Run Approval Request domain types.
 *
 * Type-safe representation of the phase6_16_offline_batch_dry_run_approval_request.json manifest.
 * All literal types are enforced via readonly + const patterns.
 */

export interface OfflineBatchDryRunApprovalRequestScope {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestMetadata {
  readonly request_id: string;
  readonly request_type: "offline_batch_dry_run_approval_request";
  readonly request_phase: "6.16";
  readonly request_timestamp: string;
  readonly prior_plan_phase: "6.15";
  readonly prior_plan_manifest: string;
  readonly prior_plan_status: "offline_batch_dry_run_plan_created";
  readonly referencing_approval_phase: "6.14";
  readonly referencing_decision_phase: "6.11";
  readonly referencing_plan_phase: "6.15";
  readonly request_scope: "offline_batch_dry_run_approval_request_only";
}

export interface OfflineBatchDryRunApprovalRequestDryRunScope {
  readonly eligible_items: readonly string[];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly item_count: 1;
  readonly source_layer_mutation_allowed: false;
  readonly output_artifact_creation_allowed: false;
  readonly constraints: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestAllowedInput {
  readonly name: string;
  readonly source: string;
  readonly status: string;
}

export interface OfflineBatchDryRunApprovalRequestAllowedInputs {
  readonly description: string;
  readonly inputs: readonly OfflineBatchDryRunApprovalRequestAllowedInput[];
}

export interface OfflineBatchDryRunApprovalRequestForbiddenInputs {
  readonly description: string;
  readonly inputs: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestCommandArgument {
  readonly argument: string;
  readonly value: string;
  readonly description: string;
}

export interface OfflineBatchDryRunApprovalRequestDryRunCommand {
  readonly dry_run_command_id: string;
  readonly command_type: "offline_batch_dry_run";
  readonly command_status: "pending_human_review";
  readonly command_is_executable_now: false;
  readonly command_has_been_executed: false;
  readonly command_text_placeholder: string;
  readonly command_is_placeholder_only: true;
  readonly command_not_in_package_json: true;
  readonly command_arguments: readonly OfflineBatchDryRunApprovalRequestCommandArgument[];
  readonly command_constraints: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestPhaseGates {
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

export interface OfflineBatchDryRunApprovalRequestOperationalGateDecisions {
  readonly crawler_gate_decision: "not_required";
  readonly renderer_gate_decision: "not_required";
  readonly recovery_gate_decision: "not_required";
  readonly web_requests_gate_decision: "not_required";
  readonly ai_learning_generation_gate_decision: "not_allowed";
  readonly constraint: string;
}

export interface OfflineBatchDryRunApprovalRequestHumanDecisionFields {
  readonly requested_decision: "approve_offline_dry_run";
  readonly dry_run_approval_status: "pending_human_review";
  readonly dry_run_approved: false;
  readonly human_review_required: true;
  readonly human_decision_recorded: false;
  readonly human_decision: null;
  readonly decision_options: readonly ["approve_offline_dry_run", "reject_offline_dry_run"];
  readonly constraints: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestFutureArtifact {
  readonly name: string;
  readonly purpose: string;
  readonly created_when: string;
  readonly status: "planned";
}

export interface OfflineBatchDryRunApprovalRequestAllowedFutureOutputs {
  readonly description: string;
  readonly artifacts: readonly OfflineBatchDryRunApprovalRequestFutureArtifact[];
}

export interface OfflineBatchDryRunApprovalRequestForbiddenArtifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestNoGoConfirmation {
  readonly no_dry_run_execution_occurs: true;
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
  readonly no_package_script_added_for_dry_run: true;
  readonly crawler_allowed_remains_false: true;
  readonly renderer_allowed_remains_false: true;
  readonly recovery_allowed_remains_false: true;
  readonly web_requests_allowed_remains_false: true;
  readonly ai_learning_generation_allowed_remains_false: true;
  readonly no_dry_run_record_created: true;
  readonly no_dry_run_result_created: true;
}

export interface OfflineBatchDryRunApprovalRequestOperationalAssertions {
  readonly dry_run_execution_claimed: false;
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
}

export interface OfflineBatchDryRunApprovalRequestRollbackCondition {
  readonly phase6_16_rollback_needed: false;
  readonly reason: string;
  readonly future_dry_run_rollback_requirements: readonly string[];
}

export interface OfflineBatchDryRunApprovalRequestAuditConditionGates {
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

export interface OfflineBatchDryRunApprovalRequestAuditCondition {
  readonly prior_phase_chain: readonly string[];
  readonly current_approval_status: "pending_human_review";
  readonly current_dry_run_status: "not_started";
  readonly current_dry_run_executed: false;
  readonly current_batch_run_executed: false;
  readonly current_operational_gates: OfflineBatchDryRunApprovalRequestAuditConditionGates;
  readonly no_go_confirmation: true;
  readonly validation_commands: readonly string[];
  readonly commit_scope: string;
}

export interface OfflineBatchDryRunApprovalRequestPhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

export interface OfflineBatchDryRunApprovalRequestValidationExpectations {
  readonly schema_validation: "must_pass";
  readonly invariant_checks: "must_pass";
  readonly approval_status_must_be: "pending_human_review";
  readonly requested_decision_must_be: "approve_offline_dry_run";
  readonly dry_run_approval_status_must_be: "pending_human_review";
  readonly dry_run_approved_must_be: false;
  readonly dry_run_executed_must_be: false;
  readonly batch_run_executed_must_be: false;
  readonly run_mode_must_be: "offline_existing_source_packet_only";
  readonly batch_id_must_be: "phase6_1_batch_001";
  readonly operational_assertions_all_false: true;
  readonly no_go_confirmations_all_true: true;
  readonly item_constraints_satisfied: true;
  readonly future_outputs_planned_only: true;
  readonly forbidden_artifacts_explicitly_listed: true;
  readonly operational_gate_decisions_all_not_required_or_not_allowed: true;
  readonly human_decision_fields_present: true;
  readonly dry_run_command_is_placeholder_only: true;
}

export interface OfflineBatchDryRunApprovalRequestManifest {
  readonly manifest_version: "phase6.16";
  readonly manifest_type: "offline_batch_dry_run_approval_request";
  readonly status: "offline_batch_dry_run_approval_request_created";
  readonly created_for_phase: "6.16";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12", "6.13", "6.14", "6.15"];
  readonly created_at: string;
  readonly scope: OfflineBatchDryRunApprovalRequestScope;
  readonly approval_status: "pending_human_review";
  readonly requested_decision: "approve_offline_dry_run";
  readonly dry_run_approval_status: "pending_human_review";
  readonly dry_run_approved: false;
  readonly dry_run_executed: false;
  readonly batch_run_executed: false;
  readonly run_mode: "offline_existing_source_packet_only";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly run_command_approved: true;
  readonly command_status: "approved";
  readonly command_is_executable_now: true;
  readonly command_has_been_executed: false;
  readonly dry_run_plan_status: "planned_not_executed";
  readonly dry_run_plan_manifest: string;
  readonly execution_authorization_status: "execution_approved";
  readonly operational_mode_approval_status: "operational_mode_approved";
  readonly request_metadata: OfflineBatchDryRunApprovalRequestMetadata;
  readonly dry_run_scope: OfflineBatchDryRunApprovalRequestDryRunScope;
  readonly allowed_inputs: OfflineBatchDryRunApprovalRequestAllowedInputs;
  readonly forbidden_inputs: OfflineBatchDryRunApprovalRequestForbiddenInputs;
  readonly dry_run_command: OfflineBatchDryRunApprovalRequestDryRunCommand;
  readonly phase_gates: OfflineBatchDryRunApprovalRequestPhaseGates;
  readonly operational_gate_decisions: OfflineBatchDryRunApprovalRequestOperationalGateDecisions;
  readonly human_decision_fields: OfflineBatchDryRunApprovalRequestHumanDecisionFields;
  readonly allowed_future_outputs: OfflineBatchDryRunApprovalRequestAllowedFutureOutputs;
  readonly forbidden_phase6_16_artifacts: OfflineBatchDryRunApprovalRequestForbiddenArtifacts;
  readonly no_go_confirmation: OfflineBatchDryRunApprovalRequestNoGoConfirmation;
  readonly operational_assertions: OfflineBatchDryRunApprovalRequestOperationalAssertions;
  readonly rollback_condition: OfflineBatchDryRunApprovalRequestRollbackCondition;
  readonly audit_condition: OfflineBatchDryRunApprovalRequestAuditCondition;
  readonly phase_progression_history: readonly OfflineBatchDryRunApprovalRequestPhaseProgressionEntry[];
  readonly validation_expectations: OfflineBatchDryRunApprovalRequestValidationExpectations;
}
