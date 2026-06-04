/**
 * Phase 6.15 Offline Batch Dry-Run Plan domain types.
 *
 * Type-safe representation of the phase6_15_offline_batch_dry_run_plan.json manifest.
 * All literal types are enforced via readonly + const patterns.
 */

export interface OfflineBatchDryRunPlanScope {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
}

export interface OfflineBatchDryRunPlanMetadata {
  readonly plan_id: string;
  readonly plan_type: "offline_batch_dry_run_plan";
  readonly plan_phase: "6.15";
  readonly plan_timestamp: string;
  readonly prior_decision_phase: "6.14";
  readonly prior_decision_manifest: string;
  readonly prior_decision_status: "offline_batch_run_command_approval_decision_recorded";
  readonly referencing_approval_phase: "6.14";
  readonly referencing_decision_phase: "6.11";
  readonly referencing_plan_phase: "6.12";
  readonly plan_scope: "offline_batch_dry_run_plan_only";
}

export interface OfflineBatchDryRunPlanDryRunScope {
  readonly eligible_items: readonly string[];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly item_count: 1;
  readonly source_layer_mutation_allowed: false;
  readonly output_artifact_creation_allowed: false;
  readonly constraints: readonly string[];
}

export interface OfflineBatchDryRunPlanDryRunIntent {
  readonly description: string;
  readonly verification_targets: readonly string[];
}

export interface OfflineBatchDryRunPlanCommandArgument {
  readonly argument: string;
  readonly value: string;
  readonly description: string;
}

export interface OfflineBatchDryRunPlanPlannedCommand {
  readonly command_id: string;
  readonly command_type: "offline_batch_dry_run";
  readonly command_status: "planned";
  readonly command_is_executable_now: false;
  readonly command_has_been_executed: false;
  readonly command_text_placeholder: string;
  readonly command_is_placeholder_only: true;
  readonly command_not_in_package_json: true;
  readonly command_arguments: readonly OfflineBatchDryRunPlanCommandArgument[];
  readonly command_constraints: readonly string[];
}

export interface OfflineBatchDryRunPlanPhaseGates {
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

export interface OfflineBatchDryRunPlanOperationalGateDecisions {
  readonly crawler_gate_decision: "not_required";
  readonly renderer_gate_decision: "not_required";
  readonly recovery_gate_decision: "not_required";
  readonly web_requests_gate_decision: "not_required";
  readonly ai_learning_generation_gate_decision: "not_allowed";
  readonly constraint: string;
}

export interface OfflineBatchDryRunPlanPlannedAssertions {
  readonly prior_phase_chain_complete: true;
  readonly run_command_approved: true;
  readonly command_has_not_been_executed: true;
  readonly dry_run_has_not_been_executed: true;
  readonly batch_run_has_not_been_executed: true;
  readonly operational_gates_remain_closed: true;
  readonly approved_items_equals_1_3: true;
  readonly item_13_3_excluded: true;
  readonly item_9_1_deferred: true;
  readonly no_forbidden_input_used: true;
  readonly no_forbidden_output_produced: true;
}

export interface OfflineBatchDryRunPlanFutureArtifact {
  readonly name: string;
  readonly purpose: string;
  readonly created_when: string;
  readonly status: "planned";
}

export interface OfflineBatchDryRunPlanAllowedFutureOutputs {
  readonly description: string;
  readonly artifacts: readonly OfflineBatchDryRunPlanFutureArtifact[];
}

export interface OfflineBatchDryRunPlanForbiddenArtifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchDryRunPlanNoGoConfirmation {
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

export interface OfflineBatchDryRunPlanOperationalAssertions {
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

export interface OfflineBatchDryRunPlanRollbackCondition {
  readonly phase6_15_rollback_needed: false;
  readonly reason: string;
  readonly future_dry_run_rollback_requirements: readonly string[];
}

export interface OfflineBatchDryRunPlanAuditConditionGates {
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

export interface OfflineBatchDryRunPlanAuditCondition {
  readonly prior_phase_chain: readonly string[];
  readonly current_command_approval_status: "approved";
  readonly current_dry_run_status: "not_started";
  readonly current_dry_run_executed: false;
  readonly current_batch_run_executed: false;
  readonly current_plan_status: "planned_not_executed";
  readonly current_operational_gates: OfflineBatchDryRunPlanAuditConditionGates;
  readonly no_go_confirmation: true;
  readonly validation_commands: readonly string[];
  readonly commit_scope: string;
}

export interface OfflineBatchDryRunPlanPhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

export interface OfflineBatchDryRunPlanValidationExpectations {
  readonly schema_validation: "must_pass";
  readonly invariant_checks: "must_pass";
  readonly plan_status_must_be: "planned_not_executed";
  readonly dry_run_status_must_be: "not_started";
  readonly dry_run_executed_must_be: false;
  readonly batch_run_executed_must_be: false;
  readonly run_command_approved_must_be: true;
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

export interface OfflineBatchDryRunPlanManifest {
  readonly manifest_version: "phase6.15";
  readonly manifest_type: "offline_batch_dry_run_plan";
  readonly status: "offline_batch_dry_run_plan_created";
  readonly created_for_phase: "6.15";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12", "6.13", "6.14"];
  readonly created_at: string;
  readonly scope: OfflineBatchDryRunPlanScope;
  readonly plan_status: "planned_not_executed";
  readonly dry_run_status: "not_started";
  readonly dry_run_executed: false;
  readonly batch_run_executed: false;
  readonly run_command_approved: true;
  readonly command_status: "approved";
  readonly command_is_executable_now: true;
  readonly command_has_been_executed: false;
  readonly run_mode: "offline_existing_source_packet_only";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly execution_authorization_status: "execution_approved";
  readonly operational_mode_approval_status: "operational_mode_approved";
  readonly plan_metadata: OfflineBatchDryRunPlanMetadata;
  readonly dry_run_scope: OfflineBatchDryRunPlanDryRunScope;
  readonly dry_run_intent: OfflineBatchDryRunPlanDryRunIntent;
  readonly planned_dry_run_command: OfflineBatchDryRunPlanPlannedCommand;
  readonly phase_gates: OfflineBatchDryRunPlanPhaseGates;
  readonly operational_gate_decisions: OfflineBatchDryRunPlanOperationalGateDecisions;
  readonly planned_dry_run_assertions: OfflineBatchDryRunPlanPlannedAssertions;
  readonly allowed_future_outputs: OfflineBatchDryRunPlanAllowedFutureOutputs;
  readonly forbidden_phase6_15_artifacts: OfflineBatchDryRunPlanForbiddenArtifacts;
  readonly no_go_confirmation: OfflineBatchDryRunPlanNoGoConfirmation;
  readonly operational_assertions: OfflineBatchDryRunPlanOperationalAssertions;
  readonly rollback_condition: OfflineBatchDryRunPlanRollbackCondition;
  readonly audit_condition: OfflineBatchDryRunPlanAuditCondition;
  readonly phase_progression_history: readonly OfflineBatchDryRunPlanPhaseProgressionEntry[];
  readonly validation_expectations: OfflineBatchDryRunPlanValidationExpectations;
}
