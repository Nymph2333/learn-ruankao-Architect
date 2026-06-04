/**
 * Phase 6.14 Offline Batch Run Command Approval Decision domain types.
 *
 * Type-safe representation of the phase6_14_offline_batch_run_command_approval_decision.json manifest.
 * All literal types are enforced via readonly + const patterns.
 */

export interface OfflineBatchRunCommandApprovalDecisionScope {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionMetadata {
  readonly decision_id: string;
  readonly decision_type: "offline_batch_run_command_approval";
  readonly decision_phase: "6.14";
  readonly decision_timestamp: string;
  readonly prior_request_phase: "6.13";
  readonly prior_request_manifest: string;
  readonly prior_request_status: "offline_batch_run_command_approval_request_created";
  readonly referencing_plan_phase: "6.12";
  readonly referencing_decision_phase: "6.11";
  readonly referencing_approval_phase: "6.10";
  readonly decision_scope: "offline_run_command_approval_only";
}

export interface OfflineBatchRunCommandApprovalDecisionPhaseGates {
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

export interface OfflineBatchRunCommandApprovalDecisionOperationalGateDecisions {
  readonly crawler_gate_decision: "not_required";
  readonly renderer_gate_decision: "not_required";
  readonly recovery_gate_decision: "not_required";
  readonly web_requests_gate_decision: "not_required";
  readonly ai_learning_generation_gate_decision: "not_allowed";
  readonly constraint: string;
}

export interface OfflineBatchRunCommandApprovalDecisionCommandArgument {
  readonly argument: string;
  readonly value: string;
  readonly description: string;
}

export interface OfflineBatchRunCommandApprovalDecisionApprovedCommand {
  readonly command_id: string;
  readonly command_type: "offline_batch_run";
  readonly command_status: "approved";
  readonly command_is_executable_now: true;
  readonly command_has_been_executed: false;
  readonly command_text_placeholder: string;
  readonly command_is_placeholder_only: true;
  readonly command_not_in_package_json: true;
  readonly command_arguments: readonly OfflineBatchRunCommandApprovalDecisionCommandArgument[];
  readonly command_constraints: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionItemBoundary {
  readonly allowed_items: readonly string[];
  readonly approved_items: readonly ["1.3"];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly item_count: 1;
  readonly source_layer_mutation_allowed: false;
  readonly constraints: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionAllowedInput {
  readonly source_phase: string;
  readonly artifact: string;
  readonly purpose: string;
  readonly access_mode: "read_only";
}

export interface OfflineBatchRunCommandApprovalDecisionInputBoundary {
  readonly allowed_inputs: readonly OfflineBatchRunCommandApprovalDecisionAllowedInput[];
  readonly forbidden_inputs: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionFutureArtifact {
  readonly name: string;
  readonly purpose: string;
  readonly created_when: string;
  readonly status: "planned";
}

export interface OfflineBatchRunCommandApprovalDecisionAllowedFutureOutputs {
  readonly description: string;
  readonly artifacts: readonly OfflineBatchRunCommandApprovalDecisionFutureArtifact[];
}

export interface OfflineBatchRunCommandApprovalDecisionForbiddenArtifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionNoGoConfirmation {
  readonly no_batch_execution_occurs: true;
  readonly no_approved_command_executed: true;
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

export interface OfflineBatchRunCommandApprovalDecisionOperationalAssertions {
  readonly batch_execution_claimed: false;
  readonly approved_command_executed: false;
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

export interface OfflineBatchRunCommandApprovalDecisionHumanDecisionFields {
  readonly human_decision: "approved";
  readonly human_decision_timestamp: string;
  readonly human_decision_notes: string;
  readonly human_reviewer_id: string;
  readonly description: string;
}

export interface OfflineBatchRunCommandApprovalDecisionRollbackCondition {
  readonly phase6_14_rollback_needed: false;
  readonly reason: string;
  readonly approval_decision_reversible: true;
  readonly future_execution_requirements: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionNextPhaseConstraints {
  readonly description: string;
  readonly constraints: readonly string[];
}

export interface OfflineBatchRunCommandApprovalDecisionAuditConditionGates {
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

export interface OfflineBatchRunCommandApprovalDecisionAuditCondition {
  readonly prior_phase_chain: readonly string[];
  readonly current_approval_status: "run_command_approved";
  readonly current_approved_decision: "approve_offline_run_command";
  readonly current_run_command_approval_status: "approved";
  readonly current_run_command_approved: true;
  readonly current_batch_run_executed: false;
  readonly current_run_mode: "offline_existing_source_packet_only";
  readonly current_operational_mode_approval_status: "operational_mode_approved";
  readonly current_execution_authorization_status: "execution_approved";
  readonly current_run_plan_status: "planned_not_executed";
  readonly current_operational_gates: OfflineBatchRunCommandApprovalDecisionAuditConditionGates;
  readonly no_go_confirmation: true;
  readonly validation_commands: readonly string[];
  readonly commit_scope: string;
}

export interface OfflineBatchRunCommandApprovalDecisionPhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

export interface OfflineBatchRunCommandApprovalDecisionValidationExpectations {
  readonly schema_validation: "must_pass";
  readonly invariant_checks: "must_pass";
  readonly approval_status_must_be: "run_command_approved";
  readonly approved_decision_must_be: "approve_offline_run_command";
  readonly run_command_approval_status_must_be: "approved";
  readonly run_command_approved_must_be: true;
  readonly batch_run_executed_must_be: false;
  readonly command_status_must_be: "approved";
  readonly command_is_executable_now_must_be: true;
  readonly command_has_been_executed_must_be: false;
  readonly operational_assertions_all_false: true;
  readonly no_go_confirmations_all_true: true;
  readonly item_constraints_satisfied: true;
  readonly future_outputs_planned_only: true;
  readonly forbidden_artifacts_explicitly_listed: true;
  readonly operational_gate_decisions_all_not_required_or_not_allowed: true;
}

export interface OfflineBatchRunCommandApprovalDecisionManifest {
  readonly manifest_version: "phase6.14";
  readonly manifest_type: "offline_batch_run_command_approval_decision";
  readonly status: "offline_batch_run_command_approval_decision_recorded";
  readonly created_for_phase: "6.14";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12", "6.13"];
  readonly created_at: string;
  readonly scope: OfflineBatchRunCommandApprovalDecisionScope;
  readonly approval_status: "run_command_approved";
  readonly approved_decision: "approve_offline_run_command";
  readonly run_command_approval_status: "approved";
  readonly run_command_approved: true;
  readonly batch_run_executed: false;
  readonly run_mode: "offline_existing_source_packet_only";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly execution_authorization_status: "execution_approved";
  readonly operational_mode_approval_status: "operational_mode_approved";
  readonly run_plan_status: "planned_not_executed";
  readonly decision_metadata: OfflineBatchRunCommandApprovalDecisionMetadata;
  readonly approved_command: OfflineBatchRunCommandApprovalDecisionApprovedCommand;
  readonly phase_gates: OfflineBatchRunCommandApprovalDecisionPhaseGates;
  readonly operational_gate_decisions: OfflineBatchRunCommandApprovalDecisionOperationalGateDecisions;
  readonly item_boundary: OfflineBatchRunCommandApprovalDecisionItemBoundary;
  readonly input_boundary: OfflineBatchRunCommandApprovalDecisionInputBoundary;
  readonly allowed_future_outputs: OfflineBatchRunCommandApprovalDecisionAllowedFutureOutputs;
  readonly forbidden_phase6_14_artifacts: OfflineBatchRunCommandApprovalDecisionForbiddenArtifacts;
  readonly no_go_confirmation: OfflineBatchRunCommandApprovalDecisionNoGoConfirmation;
  readonly operational_assertions: OfflineBatchRunCommandApprovalDecisionOperationalAssertions;
  readonly human_decision_fields: OfflineBatchRunCommandApprovalDecisionHumanDecisionFields;
  readonly rollback_condition: OfflineBatchRunCommandApprovalDecisionRollbackCondition;
  readonly next_phase_constraints: OfflineBatchRunCommandApprovalDecisionNextPhaseConstraints;
  readonly audit_condition: OfflineBatchRunCommandApprovalDecisionAuditCondition;
  readonly phase_progression_history: readonly OfflineBatchRunCommandApprovalDecisionPhaseProgressionEntry[];
  readonly validation_expectations: OfflineBatchRunCommandApprovalDecisionValidationExpectations;
}
