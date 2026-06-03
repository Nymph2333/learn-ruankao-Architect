/**
 * Phase 6.4 Batch Activation Human Approval Request TypeScript types.
 *
 * Defines the structure of the Phase 6.4 human approval request package.
 * This manifest documents the approval request for batch activation.
 * It does NOT grant approval or open any gates.
 */

export type BatchActivationHumanApprovalRequest = {
  readonly manifest_version: "phase6.4";
  readonly manifest_type: "batch_activation_human_approval_request";
  readonly status: "approval_request_pending_human_review";
  readonly created_for_phase: "6.4";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2", "6.3"];
  readonly created_at: string;
  readonly scope: ApprovalRequestScope;
  readonly phase_gates: PhaseGates;
  readonly approval_request_metadata: ApprovalRequestMetadata;
  readonly batch_summary: BatchSummary;
  readonly phase_progression_history: readonly PhaseProgression[];
  readonly requested_gate_changes: RequestedGateChanges;
  readonly gates_not_requested: readonly GateNotRequested[];
  readonly risk_assessment: RiskAssessment;
  readonly approval_decision_fields: ApprovalDecisionFields;
  readonly validation_expectations: ValidationExpectations;
  readonly final_decision: FinalDecision;
};

export type ApprovalRequestScope = {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
};

export type PhaseGates = {
  readonly phase6_1_entry_allowed: false;
  readonly activation_allowed: false;
  readonly batch_executable: false;
  readonly execution_allowed: false;
  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly ai_learning_generation_allowed: false;
  readonly approval_granted: false;
};

export type ApprovalRequestMetadata = {
  readonly request_id: string;
  readonly request_type: "batch_activation_approval";
  readonly requested_for_batch: "phase6_1_batch_001";
  readonly requested_decision: "approve_activation";
  readonly approval_status: "pending_human_review";
  readonly requires_human_decision: true;
};

export type BatchSummary = {
  readonly batch_id: "phase6_1_batch_001";
  readonly selected_items: readonly ["1.3"];
  readonly item_count: 1;
  readonly readiness_status: "activation_candidate";
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

export type RequestedGateChanges = {
  readonly gates_to_open: readonly {
    readonly gate: string;
    readonly current: false;
    readonly requested: boolean;
    readonly rationale: string;
  }[];
  readonly rationale: string;
};

export type GateNotRequested = {
  readonly gate: string;
  readonly current: false;
  readonly requested: false;
  readonly rationale: string;
};

export type RiskAssessment = {
  readonly known_risks: readonly Record<string, unknown>[];
  readonly risk_mitigation_context: readonly string[];
  readonly overall_risk_assessment: {
    readonly risk_level: string;
    readonly recommendation: string;
  };
};

export type ApprovalDecisionFields = {
  readonly decision_options: readonly {
    readonly option: string;
    readonly decision: string;
    readonly effect: string;
    readonly reason?: string;
    readonly next_step: string;
  }[];
  readonly decision_recording: string;
};

export type ValidationExpectations = {
  readonly must_pass: readonly string[];
  readonly must_not_trigger: readonly string[];
};

export type FinalDecision = {
  readonly approval_request_prepared: true;
  readonly approval_status: "pending_human_review";
  readonly batch_id: "phase6_1_batch_001";
  readonly selected_items: readonly ["1.3"];
  readonly requested_decision: "approve_activation";
  readonly phase6_1_entry_allowed: false;
  readonly activation_allowed: false;
  readonly batch_executable: false;
  readonly execution_allowed: false;
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
};
