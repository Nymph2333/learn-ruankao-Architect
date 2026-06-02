/**
 * Phase 5.5 TypeScript domain types for the ruankaodaren AI Learning Layer
 * dry-run request and review gate contract. These types define request and
 * review boundaries only and do not generate AI learning content.
 */

export type RuankaoAiLearningDryRunAllowed = "request_only";

export type RuankaoAiLearningDryRunReviewGateStatus =
  | "not_requested"
  | "dry_run_requested"
  | "dry_run_generated"
  | "human_review_pending"
  | "human_review_changes_requested"
  | "human_review_rejected"
  | "human_review_approved";

export type RuankaoAiLearningDryRunRenderAs =
  | "asset_card"
  | "short_card"
  | "concept_card"
  | "manual_review_card";

export interface RuankaoAiLearningDryRunOutputPolicy {
  default_output_root: "verification/dry-run/ruankaodaren/baseline";
  allowed_output_roots: string[];
  forbidden_output_roots: string[];
  must_not_point_to_official_markdown: true;
  must_not_point_to_source_content: true;
  must_use_isolated_output_root: true;
}

export interface RuankaoAiLearningNoHumanApprovalPolicy {
  formal_ai_learning_generation_allowed: false;
  docs_baseline_write_allowed: false;
  official_markdown_modification_allowed: false;
  phase5_6_entry_allowed: false;
}

export interface RuankaoAiLearningDryRunReviewGate {
  allowed_statuses: RuankaoAiLearningDryRunReviewGateStatus[];
  default_status: "not_requested";
  human_review_required: true;
  human_review_approved: false;
  auto_approval: false;
  phase5_6_generation_allowed: false;
  without_human_review_approval: RuankaoAiLearningNoHumanApprovalPolicy;
}

export interface RuankaoAiLearningDryRunItemPolicy {
  title: string;
  source_packet_item_status: "complete" | "incomplete";
  render_as: RuankaoAiLearningDryRunRenderAs;
  content_shape: string;
  taxonomy_suspect: boolean;
  is_multi_card_sequence: boolean;
  dry_run_generation_allowed: false;
  unrestricted_dry_run_allowed: false;
  review_gate_status: "not_requested";
  human_review_approved: false;
  dry_run_output_path: string;
  required_warnings: string[];
  requires_manual_review: boolean;
  requires_manual_asset_review: boolean;
  no_ocr: boolean;
  no_image_table_reconstruction: boolean;
  cannot_claim_image_content_recognized: boolean;
  may_enter_future_dry_run_after_review: boolean;
  taxonomy_suspect_handling?: "restrict_dry_run";
  multi_card_sequence_handling?: "do_not_claim_complete";
  parent_node_handling?: "do_not_generate_as_leaf";
}

export interface RuankaoAiLearningDryRunContract {
  contract_version: "phase5.5";
  source_name: "ruankaodaren";
  created_at: string;
  dry_run_allowed: RuankaoAiLearningDryRunAllowed;
  generation_allowed: false;
  contract_scope: "dry_run_request_and_review_gate_only";
  review_gate_required: true;
  auto_approval: false;
  human_review_required: true;
  source_layer_modification_allowed: false;
  official_markdown_modification_allowed: false;
  source_content_write_allowed: false;
  output_policy: RuankaoAiLearningDryRunOutputPolicy;
  review_gate: RuankaoAiLearningDryRunReviewGate;
  items: RuankaoAiLearningDryRunItemPolicy[];
}
