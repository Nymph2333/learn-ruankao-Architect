/**
 * Phase 5.10 TypeScript domain types for the ruankaodaren AI Learning dry-run
 * human review approval gate. These types define approval gate structure only.
 * They do not authorize approval execution, AI learning content generation,
 * dry-run execution, formal dual-layer document generation, Source Layer edits,
 * or official Markdown edits.
 */

export type RuankaoApprovalGateScope = "dry_run_human_review_approval_gate_only";

export type RuankaoApprovalGateDecision =
  | "pending"
  | "approve_for_phase5_11_dry_run_execution"
  | "request_changes"
  | "reject";

export type RuankaoApprovalGateApprovalStatus = "pending";

export type RuankaoApprovalGateEvidenceRequirement =
  | "reviewer_identity_required"
  | "reviewer_decision_required"
  | "decided_at_required"
  | "selected_item_confirmed"
  | "source_packet_reference_verified"
  | "prompt_contract_reference_verified"
  | "dry_run_contract_reference_verified"
  | "request_manifest_reference_verified"
  | "execution_contract_reference_verified"
  | "readiness_check_reference_verified"
  | "human_review_request_package_reference_verified"
  | "output_path_isolated_verified"
  | "official_markdown_write_forbidden_confirmed"
  | "source_layer_write_forbidden_confirmed"
  | "no_ocr_confirmed"
  | "no_raw_html_or_xhr_confirmed"
  | "no_ai_content_in_source_content_confirmed"
  | "no_formal_generation_before_approval_confirmed";

export type RuankaoApprovalGateRequiredBeforePhase511 =
  | "explicit_user_approval"
  | "reviewer_decision_approve_for_phase5_11_dry_run_execution"
  | "human_review_approved"
  | "approval_evidence_complete"
  | "selected_item_is_9.1"
  | "output_path_isolated"
  | "all_contract_references_valid"
  | "no_source_layer_modification"
  | "no_official_markdown_modification";

export type RuankaoApprovalGateProhibitedBeforePhase511 =
  | "auto_approval_true"
  | "generation_allowed_true"
  | "dry_run_execution_without_review"
  | "source_layer_modification"
  | "official_markdown_modification"
  | "selected_item_taxonomy_suspect"
  | "selected_item_asset_unreviewed"
  | "approval_evidence_missing";

export type RuankaoApprovalGateExclusionReason =
  | "asset_manual_review_required"
  | "image_content_not_human_verified"
  | "taxonomy_suspect"
  | "multi_card_sequence_possible"
  | "parent_node_not_safe_as_leaf";

export type RuankaoApprovalGateCommitAllowed =
  | "schema"
  | "types"
  | "builder"
  | "validator"
  | "verification_doc"
  | "generated_approval_gate_json"
  | "generated_approval_gate_md";

export type RuankaoApprovalGateCommitForbidden =
  | "ai_learning_content"
  | "dry_run_content"
  | "approval_result_instance"
  | "input_bundle_instance"
  | "official_markdown_rewrite"
  | "source_layer_modifications"
  | "raw_snapshots"
  | "intermediate_generated_artifacts"
  | "asset_images"
  | ".auth"
  | "node_modules"
  | "pnpm-workspace.yaml";

export interface RuankaoApprovalGatePriorContractGate {
  source_packet_exists: true;
  complete_count: 3;
  phase5_4_generation_allowed: false;
  phase5_5_generation_allowed: false;
  phase5_6_generation_allowed: false;
  phase5_6_dry_run_generation_allowed: false;
  phase5_7_dry_run_execution_allowed: false;
  phase5_8_phase5_9_entry_allowed: false;
  phase5_9_review_request_allowed: true;
  phase5_9_reviewer_decision: "pending";
  phase5_9_human_review_approved: false;
  gate_result: "pass";
}

export interface RuankaoApprovalGateReviewerDecisionBehaviorPending {
  phase5_11_entry_allowed: false;
  dry_run_execution_allowed: false;
}

export interface RuankaoApprovalGateReviewerDecisionBehaviorApprove {
  requires: [
    "explicit_user_approval",
    "reviewer_identity",
    "decided_at",
    "approval_evidence",
    "all_references_valid"
  ];
  may_allow_future_phase5_11_entry: true;
}

export interface RuankaoApprovalGateReviewerDecisionBehaviorRequestChanges {
  blocks_phase5_11: true;
  requires_change_request_notes: true;
  dry_run_execution_allowed: false;
}

export interface RuankaoApprovalGateReviewerDecisionBehaviorReject {
  blocks_phase5_11: true;
  requires_rejection_reason: true;
  dry_run_execution_allowed: false;
}

export interface RuankaoApprovalGateReviewerDecisionBehavior {
  pending: RuankaoApprovalGateReviewerDecisionBehaviorPending;
  approve_for_phase5_11_dry_run_execution: RuankaoApprovalGateReviewerDecisionBehaviorApprove;
  request_changes: RuankaoApprovalGateReviewerDecisionBehaviorRequestChanges;
  reject: RuankaoApprovalGateReviewerDecisionBehaviorReject;
}

export interface RuankaoApprovalGateReviewerDecisionSchema {
  current_decision: "pending";
  allowed_values: RuankaoApprovalGateDecision[];
  decision_executed: false;
  decided_by: null;
  decided_at: null;
  notes: null;
  decision_behavior: RuankaoApprovalGateReviewerDecisionBehavior;
}

export interface RuankaoApprovalGateSelectedItem {
  title: "9.1 信息安全基础知识";
  render_as: "concept_card";
  selected_for_human_review_request: true;
  selected_for_approval_gate: true;
  approval_status: "pending";
  reviewer_decision: "pending";
  human_review_approved: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_generation_allowed: false;
  output_path_isolated: true;
  default_future_output_path: "verification/dry-run/ruankaodaren/baseline/9.1_信息安全基础知识/";
}

export interface RuankaoApprovalGateExcludedItem {
  title: "1.3 指令系统CISC和RISC" | "13.3 软件架构风格";
  excluded_from_approval_gate: true;
  exclusion_reason: RuankaoApprovalGateExclusionReason[];
  taxonomy_suspect?: boolean;
  is_multi_card_sequence?: boolean;
  required_warnings?: string[];
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_generation_allowed: false;
}

export interface RuankaoApprovalGatePhase511EntryPolicy {
  phase5_11_entry_allowed: false;
  required_before_entry: RuankaoApprovalGateRequiredBeforePhase511[];
  prohibited_before_entry: RuankaoApprovalGateProhibitedBeforePhase511[];
}

export interface RuankaoApprovalGateArtifactCommitPolicy {
  commit_allowed: RuankaoApprovalGateCommitAllowed[];
  commit_forbidden: RuankaoApprovalGateCommitForbidden[];
}

export interface RuankaoAiLearningHumanReviewApprovalGate {
  gate_version: "phase5.10";
  source_name: "ruankaodaren";
  created_at: string;
  gate_scope: RuankaoApprovalGateScope;
  generation_allowed: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_ai_learning_generation_allowed: false;
  approval_gate_defined: true;
  approval_executed: false;
  reviewer_decision: "pending";
  human_review_required: true;
  human_review_approved: false;
  auto_approval: false;
  source_layer_modification_allowed: false;
  official_markdown_modification_allowed: false;
  phase5_11_entry_allowed: false;
  source_packet_prior_contract_gate: RuankaoApprovalGatePriorContractGate;
  reviewer_decision_schema: RuankaoApprovalGateReviewerDecisionSchema;
  approval_evidence_requirements: RuankaoApprovalGateEvidenceRequirement[];
  selected_item_approval_gate: RuankaoApprovalGateSelectedItem;
  excluded_items_approval_policy: RuankaoApprovalGateExcludedItem[];
  phase5_11_entry_policy: RuankaoApprovalGatePhase511EntryPolicy;
  artifact_commit_policy: RuankaoApprovalGateArtifactCommitPolicy;
}
