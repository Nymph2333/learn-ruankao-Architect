/**
 * Phase 6.18 Offline Batch Dry-Run Execution Record domain types.
 *
 * Type-safe representation of the phase6_18_offline_batch_dry_run_execution_record.json manifest.
 * All literal types are enforced via readonly + const patterns.
 */

export interface OfflineBatchDryRunExecutionRecordScope {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
}

export interface OfflineBatchDryRunExecutionRecordCommandArgument {
  readonly argument: string;
  readonly value: string;
  readonly description: string;
}

export interface OfflineBatchDryRunExecutionRecordDryRunCommand {
  readonly dry_run_command_id: string;
  readonly command_type: "offline_batch_dry_run";
  readonly command_status: "executed_as_dry_run_record";
  readonly command_has_been_executed: true;
  readonly command_execution_scope: "dry_run_only";
  readonly command_text_placeholder: string;
  readonly command_is_placeholder_only: true;
  readonly command_not_in_package_json: true;
  readonly command_arguments: readonly OfflineBatchDryRunExecutionRecordCommandArgument[];
}

export interface OfflineBatchDryRunExecutionRecordExecutionMetadata {
  readonly execution_id: string;
  readonly execution_type: "offline_batch_dry_run_execution_record";
  readonly execution_phase: "6.18";
  readonly execution_timestamp: string;
  readonly prior_decision_phase: "6.17";
  readonly prior_decision_manifest: string;
  readonly prior_decision_status: "offline_batch_dry_run_approval_decision_recorded";
  readonly prior_approval_status: "dry_run_approved";
  readonly prior_dry_run_approval_status: "approved";
  readonly prior_dry_run_approved: true;
  readonly referencing_approval_phase: "6.14";
  readonly referencing_decision_phase: "6.11";
  readonly referencing_plan_phase: "6.15";
  readonly referencing_dry_run_approval_phase: "6.16";
  readonly referencing_dry_run_decision_phase: "6.17";
  readonly execution_scope: "dry_run_only";
}

export interface OfflineBatchDryRunExecutionRecordDryRunScope {
  readonly included_items: readonly string[];
  readonly excluded_items: readonly string[];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly item_count: 1;
  readonly source_layer_mutation_allowed: false;
  readonly output_artifact_creation_allowed: true;
  readonly output_artifact_isolation: string;
  readonly constraints: readonly string[];
}

export interface OfflineBatchDryRunExecutionRecordItemAssessmentResult {
  readonly item_id: string;
  readonly item_name: string;
  readonly status: string;
  readonly dry_run_result: string;
  readonly source_packet_available?: true;
  readonly parser_contract_valid?: true;
  readonly assessment_notes: string;
}

export interface OfflineBatchDryRunExecutionRecordItemAssessmentResults {
  readonly item_1_3: OfflineBatchDryRunExecutionRecordItemAssessmentResult;
  readonly item_9_1: OfflineBatchDryRunExecutionRecordItemAssessmentResult;
  readonly item_13_3: OfflineBatchDryRunExecutionRecordItemAssessmentResult;
}

export interface OfflineBatchDryRunExecutionRecordDryRunArtifact {
  readonly name: string;
  readonly path: string;
  readonly purpose: string;
  readonly status: "created";
}

export interface OfflineBatchDryRunExecutionRecordDryRunArtifacts {
  readonly isolation_path: string;
  readonly artifacts: readonly OfflineBatchDryRunExecutionRecordDryRunArtifact[];
}

export interface OfflineBatchDryRunExecutionRecordPhaseGates {
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

export interface OfflineBatchDryRunExecutionRecordOperationalGateDecisions {
  readonly crawler_gate_decision: "not_required";
  readonly renderer_gate_decision: "not_required";
  readonly recovery_gate_decision: "not_required";
  readonly web_requests_gate_decision: "not_required";
  readonly ai_learning_generation_gate_decision: "not_allowed";
  readonly constraint: string;
}

export interface OfflineBatchDryRunExecutionRecordAllowedPhase6_18Artifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchDryRunExecutionRecordForbiddenPhase6_18Artifacts {
  readonly description: string;
  readonly artifacts: readonly string[];
}

export interface OfflineBatchDryRunExecutionRecordNoGoConfirmation {
  readonly no_formal_batch_execution_occurs: true;
  readonly no_formal_item_level_result_created: true;
  readonly no_formal_post_run_validation_created: true;
  readonly no_crawler_runs: true;
  readonly no_renderer_runs: true;
  readonly no_recovery_runs: true;
  readonly no_web_requests_made: true;
  readonly no_source_layer_modified: true;
  readonly no_ai_learning_generated: true;
  readonly no_assets_captured: true;
  readonly no_raw_snapshots_created: true;
  readonly no_intermediate_json_created: true;
  readonly no_package_script_added_for_batch: true;
  readonly crawler_allowed_remains_false: true;
  readonly renderer_allowed_remains_false: true;
  readonly recovery_allowed_remains_false: true;
  readonly web_requests_allowed_remains_false: true;
  readonly ai_learning_generation_allowed_remains_false: true;
}

export interface OfflineBatchDryRunExecutionRecordOperationalAssertions {
  readonly formal_batch_execution_claimed: false;
  readonly formal_item_level_result_claimed: false;
  readonly formal_post_run_validation_claimed: false;
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

export interface OfflineBatchDryRunExecutionRecordRollbackCondition {
  readonly phase6_18_rollback_needed: false;
  readonly reason: string;
  readonly future_rollback_requirements: readonly string[];
}

export interface OfflineBatchDryRunExecutionRecordAuditConditionGates {
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

export interface OfflineBatchDryRunExecutionRecordAuditCondition {
  readonly prior_phase_chain: readonly string[];
  readonly current_dry_run_status: "completed";
  readonly current_dry_run_result: "pass";
  readonly current_dry_run_executed: true;
  readonly current_batch_run_executed: false;
  readonly current_formal_execution_status: "not_started";
  readonly current_operational_gates: OfflineBatchDryRunExecutionRecordAuditConditionGates;
  readonly no_go_confirmation: true;
  readonly validation_commands: readonly string[];
  readonly commit_scope: string;
}

export interface OfflineBatchDryRunExecutionRecordPhaseProgressionEntry {
  readonly phase: string;
  readonly outcome: string;
}

export interface OfflineBatchDryRunExecutionRecordValidationExpectations {
  readonly schema_validation: "must_pass";
  readonly invariant_checks: "must_pass";
  readonly dry_run_status_must_be: "completed";
  readonly dry_run_result_must_be: "pass";
  readonly dry_run_executed_must_be: true;
  readonly batch_run_executed_must_be: false;
  readonly formal_execution_status_must_be: "not_started";
  readonly run_mode_must_be: "offline_existing_source_packet_only";
  readonly batch_id_must_be: "phase6_1_batch_001";
  readonly operational_assertions_all_false: true;
  readonly no_go_confirmations_all_true: true;
  readonly item_constraints_satisfied: true;
  readonly dry_run_artifacts_isolated: true;
  readonly forbidden_artifacts_explicitly_listed: true;
  readonly operational_gate_decisions_all_not_required_or_not_allowed: true;
  readonly dry_run_command_executed_as_dry_run_record: true;
}

export interface OfflineBatchDryRunExecutionRecordManifest {
  readonly manifest_version: "phase6.18";
  readonly manifest_type: "offline_batch_dry_run_execution_record";
  readonly status: "offline_batch_dry_run_execution_record_created";
  readonly created_for_phase: "6.18";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12", "6.13", "6.14", "6.15", "6.16", "6.17"];
  readonly created_at: string;
  readonly scope: OfflineBatchDryRunExecutionRecordScope;
  readonly dry_run_status: "completed";
  readonly dry_run_result: "pass";
  readonly dry_run_executed: true;
  readonly batch_run_executed: false;
  readonly formal_execution_status: "not_started";
  readonly run_mode: "offline_existing_source_packet_only";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly dry_run_approval_status: "approved";
  readonly dry_run_approved: true;
  readonly run_command_approved: true;
  readonly command_has_been_executed: true;
  readonly command_execution_scope: "dry_run_only";
  readonly command_not_in_package_json: true;
  readonly dry_run_command: OfflineBatchDryRunExecutionRecordDryRunCommand;
  readonly execution_metadata: OfflineBatchDryRunExecutionRecordExecutionMetadata;
  readonly dry_run_scope: OfflineBatchDryRunExecutionRecordDryRunScope;
  readonly item_assessment_results: OfflineBatchDryRunExecutionRecordItemAssessmentResults;
  readonly dry_run_artifacts: OfflineBatchDryRunExecutionRecordDryRunArtifacts;
  readonly phase_gates: OfflineBatchDryRunExecutionRecordPhaseGates;
  readonly operational_gate_decisions: OfflineBatchDryRunExecutionRecordOperationalGateDecisions;
  readonly allowed_phase6_18_artifacts: OfflineBatchDryRunExecutionRecordAllowedPhase6_18Artifacts;
  readonly forbidden_phase6_18_artifacts: OfflineBatchDryRunExecutionRecordForbiddenPhase6_18Artifacts;
  readonly no_go_confirmation: OfflineBatchDryRunExecutionRecordNoGoConfirmation;
  readonly operational_assertions: OfflineBatchDryRunExecutionRecordOperationalAssertions;
  readonly rollback_condition: OfflineBatchDryRunExecutionRecordRollbackCondition;
  readonly audit_condition: OfflineBatchDryRunExecutionRecordAuditCondition;
  readonly phase_progression_history: readonly OfflineBatchDryRunExecutionRecordPhaseProgressionEntry[];
  readonly validation_expectations: OfflineBatchDryRunExecutionRecordValidationExpectations;
}
