/**
 * Phase 6.3 Activation Readiness Preflight TypeScript types.
 *
 * Defines the structure of the Phase 6.3 batch activation readiness preflight manifest.
 * This manifest documents the structural readiness assessment for batch activation eligibility.
 * It does NOT activate the batch or execute any expansion operations.
 */

export type ActivationReadinessPreflightManifest = {
  readonly manifest_version: "phase6.3";
  readonly manifest_type: "batch_activation_readiness_preflight";
  readonly status: "preflight_complete_approval_pending";
  readonly created_for_phase: "6.3";
  readonly inherits_from_phase: readonly ["6.0", "6.1", "6.2"];
  readonly created_at: string;
  readonly scope: ActivationReadinessScope;
  readonly phase_gates: PhaseGates;
  readonly batch_structural_assessment: BatchStructuralAssessment;
  readonly gate_inventory: GateInventory;
  readonly readiness_decision: ReadinessDecision;
  readonly updated_batch_status: UpdatedBatchStatus;
  readonly remaining_approval_requirements: RemainingApprovalRequirements;
  readonly validation_expectations: ValidationExpectations;
  readonly final_decision: FinalDecision;
};

export type ActivationReadinessScope = {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
};

export type PhaseGates = {
  readonly phase6_1_entry_allowed: false;
  readonly activation_allowed: false;
  readonly batch_executable: false;
  readonly crawler_allowed: false;
  readonly renderer_allowed: false;
  readonly recovery_allowed: false;
  readonly web_requests_allowed: false;
  readonly ai_learning_generation_allowed: false;
  readonly taxonomy_suspect_13_3_quarantined: true;
};

export type BatchStructuralAssessment = {
  readonly batch_id: "phase6_1_batch_001";
  readonly selected_items: readonly ["1.3"];
  readonly structural_preconditions: {
    readonly checks: readonly {
      readonly precondition: string;
      readonly status: "PASS" | "FAIL";
      readonly evidence: string;
    }[];
    readonly result: "PASS";
  };
  readonly item_risk_profile: {
    readonly item_id: "1.3";
    readonly title: "指令系统CISC和RISC";
    readonly risk_level: "low";
    readonly known_issue: "MIXED_TEXT_IMAGE";
    readonly risk_assessment: "ACCEPTABLE";
  };
};

export type GateInventory = {
  readonly satisfied_gates: readonly {
    readonly gate: string;
    readonly status: boolean;
    readonly resolved_by: string;
  }[];
  readonly pending_gates: readonly {
    readonly gate: string;
    readonly status: boolean;
    readonly requirement: string;
  }[];
  readonly result: string;
};

export type ReadinessDecision = {
  readonly structural_eligibility: "PASS";
  readonly risk_profile: "ACCEPTABLE";
  readonly gate_inventory_summary: string;
  readonly decision: string;
  readonly readiness_status: "activation_candidate";
  readonly interpretation: readonly string[];
};

export type UpdatedBatchStatus = {
  readonly batch_metadata: {
    readonly batch_id: "phase6_1_batch_001";
    readonly readiness_status: "activation_candidate";
    readonly batch_executable: false;
    readonly activation_allowed: false;
    readonly items: readonly {
      readonly item_id: string;
      readonly title: string;
      readonly execution_allowed: false;
      readonly readiness_status: string;
    }[];
  };
  readonly item_status_summary: readonly {
    readonly item_id: string;
    readonly title: string;
    readonly status: string;
    readonly readiness: string;
  }[];
};

export type RemainingApprovalRequirements = {
  readonly requirements: readonly string[];
  readonly status: string;
};

export type ValidationExpectations = {
  readonly must_pass: readonly string[];
  readonly must_not_trigger: readonly string[];
};

export type FinalDecision = {
  readonly preflight_complete: true;
  readonly batch_id: "phase6_1_batch_001";
  readonly readiness_status: "activation_candidate";
  readonly batch_executable: false;
  readonly activation_allowed: false;
  readonly selected_items: readonly ["1.3"];
  readonly deferred_items: readonly string[];
  readonly quarantined_items: readonly string[];
};
