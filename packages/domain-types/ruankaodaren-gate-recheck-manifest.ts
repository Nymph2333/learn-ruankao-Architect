/**
 * Phase 6.2 Gate Recheck Manifest TypeScript types.
 *
 * Defines the structure of the Phase 6.2 gate recheck and taxonomy quarantine manifest.
 * This manifest documents the recheck of taxonomy suspect item 13.3 and the quarantine decision.
 * It does NOT activate or execute any expansion.
 */

export type GateRecheckManifest = {
  readonly manifest_version: "phase6.2";
  readonly manifest_type: "gate_recheck_and_taxonomy_quarantine";
  readonly status: "recheck_complete_expansion_still_blocked";
  readonly created_for_phase: "6.2";
  readonly inherits_from_phase: readonly ["6.0", "6.1"];
  readonly created_at: string;
  readonly scope: GateRecheckScope;
  readonly phase_gates: PhaseGates;
  readonly recheck_scope: RecheckScope;
  readonly item_13_3_review: Item13_3Review;
  readonly gate_status_after_recheck: GateStatusAfterRecheck;
  readonly updated_batch_status: UpdatedBatchStatus;
  readonly remaining_activation_conditions: RemainingActivationConditions;
  readonly validation_expectations: ValidationExpectations;
  readonly final_decision: FinalDecision;
};

export type GateRecheckScope = {
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
};

export type RecheckScope = {
  readonly objectives: readonly string[];
  readonly scope_boundaries: {
    readonly allowed_operations: readonly string[];
    readonly forbidden_operations: readonly string[];
  };
};

export type Item13_3Review = {
  readonly item_id: "13.3";
  readonly title: "软件架构风格";
  readonly taxonomy_suspect_context: {
    readonly known_issue: "taxonomy_suspect_13_3";
    readonly original_suspicion: string;
    readonly risk_level: "high";
  };
  readonly evidence_analysis: {
    readonly baseline_capture_status: string;
    readonly source_artifact_review: string;
    readonly taxonomy_structure_review: string;
  };
  readonly quarantine_decision: {
    readonly decision: "QUARANTINE";
    readonly rationale: readonly string[];
    readonly quarantine_status: "quarantined" | "resolved" | "still_blocking";
    readonly quarantine_scope: string;
  };
};

export type GateStatusAfterRecheck = {
  readonly updated_gates: {
    readonly expansion_blocked_until_recheck: {
      readonly before: true;
      readonly after: false;
    };
    readonly taxonomy_suspect_13_3: {
      readonly before: true;
      readonly after: false;
    };
    readonly taxonomy_suspect_13_3_quarantined: {
      readonly before: null;
      readonly after: true;
    };
  };
  readonly interpretation: readonly string[];
};

export type UpdatedBatchStatus = {
  readonly selected_batch: {
    readonly batch_id: "phase6_1_batch_001";
    readonly status: "proposed_inactive";
    readonly items: readonly {
      readonly item_id: string;
      readonly title: string;
      readonly execution_allowed: false;
    }[];
  };
  readonly item_status_after_quarantine: readonly {
    readonly item_id: string;
    readonly title: string;
    readonly status: "proposed_primary" | "deferred_candidate" | "quarantined";
    readonly quarantine_status: "quarantined" | null;
  }[];
};

export type RemainingActivationConditions = {
  readonly satisfied: readonly string[];
  readonly still_required: readonly string[];
};

export type ValidationExpectations = {
  readonly must_pass: readonly string[];
  readonly must_not_trigger: readonly string[];
};

export type FinalDecision = {
  readonly recheck_complete: true;
  readonly item_13_3_quarantined: true;
  readonly expansion_execution_allowed: false;
  readonly selected_batch_id: "phase6_1_batch_001";
  readonly selected_items: readonly ["1.3"];
  readonly deferred_items: readonly string[];
  readonly blocked_or_quarantined_items: readonly string[];
};
