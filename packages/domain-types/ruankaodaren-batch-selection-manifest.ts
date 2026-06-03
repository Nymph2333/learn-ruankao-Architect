/**
 * Phase 6.1 Batch Selection Manifest TypeScript types.
 *
 * Defines the structure of the Phase 6.1 dormant batch selection manifest.
 * This manifest PROPOSES a first expansion batch in inactive/blocked state.
 * It does NOT activate or execute any expansion.
 */

export type BatchSelectionManifest = {
  readonly manifest_version: "phase6.1";
  readonly manifest_type: "controlled_source_expansion_batch_selection";
  readonly status: "inactive_blocked";
  readonly created_for_phase: "6.1";
  readonly inherits_from_phase: "6.0";
  readonly created_at: string;
  readonly scope: BatchSelectionScope;
  readonly phase_gates: PhaseGates;
  readonly batch_constraints: BatchConstraints;
  readonly baseline_context: BaselineContext;
  readonly candidate_items: readonly CandidateItem[];
  readonly proposed_batch: ProposedBatch;
  readonly activation_conditions: readonly string[];
  readonly validation_expectations: ValidationExpectations;
  readonly final_decision: FinalDecision;
};

export type BatchSelectionScope = {
  readonly allowed: readonly string[];
  readonly forbidden: readonly string[];
};

export type PhaseGates = {
  readonly phase6_1_entry_allowed: false;
  readonly expansion_blocked_until_recheck: true;
  readonly taxonomy_suspect_13_3: true;
  readonly human_review_required: true;
  readonly activation_allowed: false;
};

export type BatchConstraints = {
  readonly min_batch_size: number;
  readonly max_batch_size: number;
  readonly actual_selected_count: number;
  readonly selection_mode: "proposed_only";
  readonly execution_mode: "blocked_until_recheck";
};

export type BaselineContext = {
  readonly baseline_item_count: 3;
  readonly baseline_complete_count: 3;
  readonly full_site_captured: false;
};

export type CandidateItem = {
  readonly item_id: string;
  readonly title: string;
  readonly candidate_status: "proposed_primary" | "deferred_candidate" | "blocked";
  readonly risk_level: "low" | "medium" | "high";
  readonly reason: string;
  readonly known_issue: string;
  readonly selection_allowed_now: false;
  readonly proposed_for_first_batch: boolean;
};

export type ProposedBatch = {
  readonly batch_id: string;
  readonly status: "proposed_inactive";
  readonly items: readonly ProposedBatchItem[];
};

export type ProposedBatchItem = {
  readonly item_id: string;
  readonly title: string;
  readonly selection_reason: string;
  readonly execution_allowed: false;
};

export type ValidationExpectations = {
  readonly must_pass: readonly string[];
  readonly must_not_trigger: readonly string[];
};

export type FinalDecision = {
  readonly batch_selected: true;
  readonly batch_executable: false;
  readonly selected_batch_id: string;
  readonly selected_items: readonly string[];
  readonly blocked_items: readonly string[];
  readonly deferred_items: readonly string[];
};
