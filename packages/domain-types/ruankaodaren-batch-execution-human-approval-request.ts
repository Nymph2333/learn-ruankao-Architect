// === PHASE 6.7: BATCH EXECUTION HUMAN APPROVAL REQUEST ===
// Domain types for ruankaodaren phase 6.7 execution human approval request manifest.
// Status: EXECUTION APPROVAL REQUEST PENDING HUMAN REVIEW
// All gates remain as-is. Only the approval request is prepared.
// Requested gate changes: batch_executable=true, execution_allowed=true
// Explicitly not requested: all operational gates

export interface BatchExecutionHumanApprovalRequestManifest {
  readonly manifest_version: "phase6.7";
  readonly manifest_type: "batch_execution_human_approval_request";
  readonly status: "execution_approval_request_pending_human_review";
  readonly created_for_phase: "6.7";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4", "6.5", "6.6"];
  readonly created_at: string;
  readonly scope: {
    readonly allowed: readonly string[];
    readonly forbidden: readonly string[];
  };
  readonly phase_gates: {
    readonly phase6_1_entry_allowed: true;
    readonly activation_allowed: true;
    readonly batch_executable: false;
    readonly execution_allowed: false;
    readonly crawler_allowed: false;
    readonly renderer_allowed: false;
    readonly recovery_allowed: false;
    readonly web_requests_allowed: false;
    readonly ai_learning_generation_allowed: false;
    readonly approval_granted: false;
  };
  readonly approval_request_metadata: {
    readonly request_id: string;
    readonly request_type: "batch_execution_approval";
    readonly requested_for_batch: "phase6_1_batch_001";
    readonly requested_decision: "approve_execution";
    readonly approval_scope: "batch_execution_authorization_only";
    readonly approval_status: "pending_human_review";
    readonly requires_human_decision: true;
    readonly readiness_status: "execution_candidate";
  };
  readonly batch_summary: {
    readonly batch_id: "phase6_1_batch_001";
    readonly approved_items: readonly ["1.3"];
    readonly item_count: 1;
    readonly batch_size_within_limits: true;
    readonly batch_size_min: 1;
    readonly batch_size_max: 5;
    readonly readiness_status: "execution_candidate";
    readonly items: readonly Readonly<{
      item_id: string;
      title: string;
      status: string;
      readiness: string;
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
  readonly requested_gate_changes: {
    readonly gates_to_open: readonly Readonly<{
      gate: string;
      current: false;
      requested: boolean;
      rationale: string;
    }>[];
    readonly rationale: string;
  };
  readonly explicitly_not_requested: readonly Readonly<{
    gate: string;
    current: false;
    requested: false;
    rationale: string;
  }>[];
  readonly risk_assessment: {
    readonly known_risks: readonly Record<string, unknown>[];
    readonly risk_mitigation_context: readonly string[];
    readonly overall_risk_assessment: {
      readonly risk_level: string;
      readonly recommendation: string;
    };
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
    readonly batch_executable_remains_false: true;
    readonly execution_allowed_remains_false: true;
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
    readonly rollback_preconditions: readonly string[];
  };
  readonly audit_boundary: {
    readonly audit_trail_requirements: readonly string[];
    readonly audit_scope: {
      readonly input: string;
      readonly output: string;
      readonly cross_reference: string;
    };
  };
  readonly approval_decision_fields: {
    readonly decision_options: readonly Readonly<{
      option: string;
      decision: string;
      effect: string;
      reason?: string;
      next_step: string;
    }>[];
    readonly decision_recording: string;
  };
  readonly validation_expectations: {
    readonly must_pass: readonly string[];
    readonly must_not_trigger: readonly string[];
  };
  readonly final_decision: {
    readonly approval_request_prepared: true;
    readonly approval_status: "pending_human_review";
    readonly requested_decision: "approve_execution";
    readonly approval_scope: "batch_execution_authorization_only";
    readonly batch_id: "phase6_1_batch_001";
    readonly approved_items: readonly ["1.3"];
    readonly readiness_status: "execution_candidate";
    readonly phase6_1_entry_allowed: true;
    readonly activation_allowed: true;
    readonly batch_executable: false;
    readonly execution_allowed: false;
    readonly deferred_items: readonly string[];
    readonly quarantined_items: readonly string[];
  };
}
