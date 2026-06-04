// === PHASE 6.8: BATCH EXECUTION HUMAN APPROVAL DECISION ===
// Domain types for ruankaodaren phase 6.8 execution human approval decision manifest.
// Status: EXECUTION APPROVED
// Gate changes applied: batch_executable=true, execution_allowed=true
// All operational gates remain false.

export interface BatchExecutionHumanApprovalDecisionManifest {
  readonly manifest_version: "phase6.8";
  readonly manifest_type: "batch_execution_human_approval_decision";
  readonly status: "execution_approved";
  readonly created_for_phase: "6.8";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"];
  readonly created_at: string;
  readonly scope: {
    readonly allowed: readonly string[];
    readonly forbidden: readonly string[];
  };
  readonly phase_gates: {
    readonly phase6_1_entry_allowed: true;
    readonly activation_allowed: true;
    readonly batch_executable: true;
    readonly execution_allowed: true;
    readonly crawler_allowed: false;
    readonly renderer_allowed: false;
    readonly recovery_allowed: false;
    readonly web_requests_allowed: false;
    readonly ai_learning_generation_allowed: false;
    readonly approval_granted: false;
  };
  readonly decision_metadata: {
    readonly decision_id: string;
    readonly decision_type: "human_execution_approval";
    readonly approved_decision: "approve_execution";
    readonly approval_scope: "batch_execution_authorization_only";
    readonly approval_status: "execution_approved";
    readonly approved_batch_id: "phase6_1_batch_001";
    readonly decision_timestamp: string;
    readonly decision_phase: "6.8";
  };
  readonly batch_summary: {
    readonly batch_id: "phase6_1_batch_001";
    readonly approved_items: readonly ["1.3"];
    readonly item_count: 1;
    readonly batch_size_within_limits: true;
    readonly batch_size_min: 1;
    readonly batch_size_max: 5;
    readonly items: readonly Readonly<{
      item_id: string;
      title: string;
      status: string;
      risk_level: string;
      known_issue?: string;
    }>[];
    readonly deferred_items: readonly string[];
    readonly quarantined_items: readonly string[];
  };
  readonly phase_progression_history: readonly Readonly<{
    phase: string;
    outcome: string;
  }>[];
  readonly gate_changes_applied: {
    readonly changes: readonly Readonly<{
      gate: string;
      before: false;
      after: true;
      rationale: string;
    }>[];
    readonly rationale: string;
  };
  readonly no_go_confirmation: {
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
  };
  readonly operational_assertions: {
    readonly expansion_execution_claimed: false;
    readonly crawler_output_claimed: false;
    readonly renderer_output_claimed: false;
    readonly ai_learning_generation_claimed: false;
    readonly source_layer_mutation_declared: false;
    readonly web_requests_declared: false;
    readonly raw_snapshots_created: false;
    readonly intermediate_json_created: false;
    readonly assets_captured: false;
  };
  readonly rollback_boundary: {
    readonly rollback_target: string;
    readonly rollback_scope: string;
    readonly source_preservation: string;
    readonly rollback_trigger: string;
    readonly rollback_constraint: string;
  };
  readonly audit_boundary: {
    readonly audit_trail_requirements: readonly string[];
    readonly decision_provenance: {
      readonly request_phase: string;
      readonly decision_phase: string;
      readonly request_manifest: string;
      readonly decision_manifest: string;
    };
  };
  readonly validation_expectations: {
    readonly schema_validation: "must_pass";
    readonly invariant_checks: "must_pass";
    readonly operational_assertions_all_false: true;
    readonly no_go_confirmations_all_true: true;
    readonly item_constraints_satisfied: true;
  };
}
