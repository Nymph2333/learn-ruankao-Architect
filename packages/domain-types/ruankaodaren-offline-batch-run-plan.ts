/**
 * Phase 6.12 Offline Batch Run Plan domain types.
 *
 * Type-safe representation of the phase6_12_offline_batch_run_plan.json manifest.
 * All literal types are enforced via readonly + const patterns.
 */

export interface OfflineBatchRunPlanScope {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
}

export interface OfflineBatchRunPlanMetadata {
  readonly plan_id: string;
  readonly plan_type: "offline_batch_run_plan";
  readonly plan_phase: "6.12";
  readonly plan_timestamp: string;
  readonly referencing_decision_phase: "6.11";
  readonly referencing_approval_phase: "6.10";
  readonly plan_scope: "offline_batch_run_plan_only";
}

export interface OfflineBatchRunPlanPhaseGates {
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

export interface OfflineBatchRunPlanOperationalGateDecisions {
  readonly crawler_gate_decision: "not_required";
  readonly renderer_gate_decision: "not_required";
  readonly recovery_gate_decision: "not_required";
  readonly web_requests_gate_decision: "not_required";
  readonly ai_learning_generation_gate_decision: "not_allowed";
  readonly constraint: string;
}

export interface OfflineBatchRunPlanRunScope {
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly item_count: 1;
  readonly source_layer_mutation_allowed: false;
  readonly constraints: readonly string[];
}

export interface OfflineBatchRunPlanAllowedInput {
  readonly source_phase: string;
  readonly artifact: string;
  readonly purpose: string;
  readonly access_mode: "read_only";
}

export interface OfflineBatchRunPlanInputBoundary {
  readonly allowed_inputs: readonly OfflineBatchRunPlanAllowedInput[];
  readonly forbidden_inputs: readonly string[];
}

export interface OfflineBatchRunPlanSequenceStep {
  readonly step: number;
  readonly name: string;
  readonly description: string;
  readonly executed_in_phase6_12: false;
  readonly placeholder_command?: string;
}

export interface OfflineBatchRunPlanPlannedRunSequence {
  readonly description: string;
  readonly steps: readonly OfflineBatchRunPlanSequenceStep[];
}

export interface OfflineBatchRunPlanRunRecordField {
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly expected_value?: string;
  readonly expected_values?: readonly string[];
  readonly format?: string;
}

export interface OfflineBatchRunPlanExpectedFutureRunRecordFields {
  readonly description: string;
  readonly fields: readonly OfflineBatchRunPlanRunRecordField[];
}

export interface OfflineBatchRunPlanPostRunValidationExpectations {
  readonly description: string;
  readonly expectations: readonly string[];
}

export interface OfflineBatchRunPlanFutureArtifact {
  readonly name: string;
  readonly purpose: string;
  readonly created_when: string;
  readonly status: "planned";
}

export interface OfflineBatchRunPlanAllowedFutureArtifacts {
  readonly description: string;
  readonly artifacts: readonly OfflineBatchRunPlanFutureArtifact[];
}

export interface OfflineBatchRunPlanForbiddenArtifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchRunPlanNoGoConfirmation {
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
  readonly crawler_allowed_remains_false: true;
  readonly renderer_allowed_remains_false: true;
  readonly recovery_allowed_remains_false: true;
  readonly web_requests_allowed_remains_false: true;
  readonly ai_learning_generation_allowed_remains_false: true;
}

export interface OfflineBatchRunPlanOperationalAssertions {
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

export interface OfflineBatchRunPlanRollbackBoundary {
  readonly phase6_12_rollback_needed: false;
  readonly reason: string;
  readonly future_execution_requirements: readonly string[];
}

export interface OfflineBatchRunPlanAuditBoundaryGates {
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

export interface OfflineBatchRunPlanAuditBoundary {
  readonly prior_phase_chain: readonly string[];
  readonly current_run_mode: "offline_existing_source_packet_only";
  readonly current_operational_mode_approval_status: "operational_mode_approved";
  readonly current_execution_authorization_status: "execution_approved";
  readonly current_plan_status: "planned_not_executed";
  readonly current_operational_gates: OfflineBatchRunPlanAuditBoundaryGates;
  readonly no_go_confirmation: true;
  readonly validation_commands: readonly string[];
  readonly commit_scope: string;
}

export interface OfflineBatchRunPlanPhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

export interface OfflineBatchRunPlanValidationExpectations {
  readonly schema_validation: "must_pass";
  readonly invariant_checks: "must_pass";
  readonly plan_status_must_be: "planned_not_executed";
  readonly run_mode_must_be: "offline_existing_source_packet_only";
  readonly batch_id_must_be: "phase6_1_batch_001";
  readonly operational_mode_approval_status_must_be: "operational_mode_approved";
  readonly execution_authorization_status_must_be: "execution_approved";
  readonly operational_assertions_all_false: true;
  readonly no_go_confirmations_all_true: true;
  readonly item_constraints_satisfied: true;
  readonly future_artifacts_planned_only: true;
  readonly forbidden_artifacts_explicitly_listed: true;
  readonly operational_gate_decisions_all_not_required_or_not_allowed: true;
}

export interface OfflineBatchRunPlanManifest {
  readonly manifest_version: "phase6.12";
  readonly manifest_type: "offline_batch_run_plan";
  readonly status: "offline_batch_run_plan_created";
  readonly created_for_phase: "6.12";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11"];
  readonly created_at: string;
  readonly scope: OfflineBatchRunPlanScope;
  readonly plan_status: "planned_not_executed";
  readonly run_mode: "offline_existing_source_packet_only";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly execution_authorization_status: "execution_approved";
  readonly operational_mode_approval_status: "operational_mode_approved";
  readonly plan_metadata: OfflineBatchRunPlanMetadata;
  readonly phase_gates: OfflineBatchRunPlanPhaseGates;
  readonly operational_gate_decisions: OfflineBatchRunPlanOperationalGateDecisions;
  readonly run_scope: OfflineBatchRunPlanRunScope;
  readonly input_boundary: OfflineBatchRunPlanInputBoundary;
  readonly planned_run_sequence: OfflineBatchRunPlanPlannedRunSequence;
  readonly expected_future_run_record_fields: OfflineBatchRunPlanExpectedFutureRunRecordFields;
  readonly post_run_validation_expectations: OfflineBatchRunPlanPostRunValidationExpectations;
  readonly allowed_future_artifacts: OfflineBatchRunPlanAllowedFutureArtifacts;
  readonly forbidden_phase6_12_artifacts: OfflineBatchRunPlanForbiddenArtifacts;
  readonly no_go_confirmation: OfflineBatchRunPlanNoGoConfirmation;
  readonly operational_assertions: OfflineBatchRunPlanOperationalAssertions;
  readonly rollback_boundary: OfflineBatchRunPlanRollbackBoundary;
  readonly audit_boundary: OfflineBatchRunPlanAuditBoundary;
  readonly phase_progression_history: readonly OfflineBatchRunPlanPhaseProgressionEntry[];
  readonly validation_expectations: OfflineBatchRunPlanValidationExpectations;
}
