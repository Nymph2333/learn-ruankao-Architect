/**
 * Phase 6.5 Batch Activation Human Approval Decision TypeScript types.
 *
 * Defines the structure of the Phase 6.5 human approval decision manifest.
 * This manifest records the human decision to approve activation only.
 * Execution gates remain closed.
 */

export type BatchActivationHumanApprovalDecision = {
  readonly manifest_version: "phase6.5";
  readonly manifest_type: "batch_activation_human_approval_decision";
  readonly status: "activation_approved";
  readonly created_for_phase: "6.5";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3", "6.4"];
  readonly created_at: string;
  readonly scope: DecisionScope;
  readonly phase_gates: DecisionPhaseGates;
  readonly decision_metadata: DecisionMetadata;
  readonly batch_summary: DecisionBatchSummary;
  readonly phase_progression_history: readonly PhaseProgression[];
  readonly gate_state_after_decision: GateStateAfterDecision;
  readonly item_constraints: ItemConstraints;
  readonly operational_assertions: OperationalAssertions;
  readonly validation_expectations: ValidationExpectations;
  readonly final_decision: FinalApprovalDecision;
};

export type DecisionScope = {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
};

export type DecisionPhaseGates = {
  readonly phase6_1_entry_allowed: true;
  readonly activation_allowed: true;
  readonly batch_executable: false;
  readonly execution_allowed: false;
  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly ai_learning_generation_allowed: false;
  readonly approval_granted: true;
};

export type DecisionMetadata = {
  readonly decision_id: string;
  readonly decision_type: "human_activation_approval";
  readonly approval_status: "activation_approved";
  readonly approved_decision: "approve_activation";
  readonly approved_batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly approval_scope: "activation_only";
  readonly execution_approval_status: "not_requested" | "explicitly_denied";
  readonly requires_execution_approval: true;
  readonly decision_timestamp: string;
};

export type DecisionBatchSummary = {
  readonly batch_id: "phase6_1_batch_001";
  readonly selected_items: readonly ["1.3"];
  readonly approved_items: readonly ["1.3"];
  readonly item_count: 1;
  readonly readiness_status: "activation_approved";
  readonly items: readonly {
    readonly item_id: string;
    readonly title: string;
    readonly status: string;
    readonly readiness: string;
    readonly risk_level: string;
  }[];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
};

export type PhaseProgression = {
  readonly phase: string;
  readonly outcome: string;
};

export type GateStateAfterDecision = {
  readonly gates_opened: readonly {
    readonly gate: string;
    readonly previous: false;
    readonly current: true;
    readonly rationale: string;
  }[];
  readonly gates_remaining_closed: readonly {
    readonly gate: string;
    readonly value: false;
    readonly rationale: string;
  }[];
  readonly separation_note: string;
};

export type ItemConstraints = {
  readonly approved_items: readonly ["1.3"];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
  readonly constraints: readonly string[];
};

export type OperationalAssertions = {
  readonly expansion_execution_claimed: false;
  readonly ai_learning_generation_claimed: false;
  readonly source_layer_mutation_declared: false;
  readonly web_requests_made: false;
  readonly assets_captured: false;
  readonly raw_snapshots_created: false;
  readonly intermediate_json_created: false;
};

export type ValidationExpectations = {
  readonly must_pass: readonly string[];
  readonly must_not_trigger: readonly string[];
};

export type FinalApprovalDecision = {
  readonly decision_recorded: true;
  readonly approval_status: "activation_approved";
  readonly approved_decision: "approve_activation";
  readonly batch_id: "phase6_1_batch_001";
  readonly approved_items: readonly ["1.3"];
  readonly approval_scope: "activation_only";
  readonly phase6_1_entry_allowed: true;
  readonly activation_allowed: true;
  readonly batch_executable: false;
  readonly execution_allowed: false;
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
};
