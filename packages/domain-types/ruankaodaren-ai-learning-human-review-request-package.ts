/**
 * Phase 5.9 TypeScript domain types for the ruankaodaren AI Learning dry-run
 * human review request package. These types describe a review request package
 * only. They do not authorize AI learning content generation, dry-run
 * execution, formal dual-layer document generation, Source Layer edits, or
 * official Markdown edits.
 */

export type RuankaoAiLearningHumanReviewPackageScope =
  "dry_run_human_review_request_only";

export type RuankaoAiLearningHumanReviewRenderAs =
  | "asset_card"
  | "short_card"
  | "concept_card"
  | "manual_review_card";

export type RuankaoAiLearningHumanReviewStatus =
  | "human_review_pending"
  | "not_requested";

export type RuankaoAiLearningHumanReviewDecision =
  | "pending"
  | "approve_for_phase5_10_dry_run_execution"
  | "request_changes"
  | "reject";

export type RuankaoAiLearningHumanReviewChecklistItem =
  | "source_packet_reference_verified"
  | "prompt_contract_reference_verified"
  | "dry_run_contract_reference_verified"
  | "request_manifest_reference_verified"
  | "execution_contract_reference_verified"
  | "readiness_check_reference_verified"
  | "output_path_isolated"
  | "official_markdown_write_forbidden"
  | "source_layer_write_forbidden"
  | "no_ocr"
  | "no_raw_html_or_xhr"
  | "no_ai_content_in_source_content"
  | "no_formal_generation_before_approval";

export type RuankaoAiLearningHumanReviewRequiredBeforePhase510 =
  | "explicit_user_approval"
  | "reviewer_decision_approve_for_phase5_10_dry_run_execution"
  | "human_review_approved"
  | "selected_item_is_9.1"
  | "output_path_isolated"
  | "all_contract_references_valid"
  | "no_source_layer_modification"
  | "no_official_markdown_modification";

export type RuankaoAiLearningHumanReviewProhibitedBeforePhase510 =
  | "auto_approval_true"
  | "generation_allowed_true"
  | "dry_run_execution_without_review"
  | "source_layer_modification"
  | "official_markdown_modification"
  | "selected_item_taxonomy_suspect"
  | "selected_item_asset_unreviewed";

export type RuankaoAiLearningHumanReviewCommitAllowedArtifact =
  | "schema"
  | "types"
  | "builder"
  | "validator"
  | "verification_doc"
  | "generated_human_review_request_package_json"
  | "generated_human_review_request_package_md";

export type RuankaoAiLearningHumanReviewCommitForbiddenArtifact =
  | "ai_learning_content"
  | "dry_run_content"
  | "input_bundle_instance"
  | "official_markdown_rewrite"
  | "source_layer_modifications"
  | "raw_snapshots"
  | "intermediate_generated_artifacts"
  | "asset_images"
  | ".auth"
  | "node_modules"
  | "pnpm-workspace.yaml";

export interface RuankaoAiLearningHumanReviewPriorContractGate {
  source_packet_exists: true;
  complete_count: 3;
  phase5_4_generation_allowed: false;
  phase5_5_generation_allowed: false;
  phase5_6_generation_allowed: false;
  phase5_6_dry_run_generation_allowed: false;
  phase5_7_dry_run_execution_allowed: false;
  phase5_8_phase5_9_entry_allowed: false;
  gate_result: "pass";
}

export interface RuankaoAiLearningHumanReviewContractReferences {
  source_packet: "source-packets/ruankaodaren/baseline/source-packet.json";
  prompt_contract: "verification/generated/phase5_4_ai_learning_prompt_contract.json";
  dry_run_contract: "verification/generated/phase5_5_ai_learning_dry_run_contract.json";
  request_manifest: "verification/generated/phase5_6_ai_learning_dry_run_request_manifest.json";
  execution_contract: "verification/generated/phase5_7_ai_learning_dry_run_execution_contract.json";
  readiness_check: "verification/generated/phase5_8_ai_learning_dry_run_readiness_check.json";
}

export interface RuankaoAiLearningHumanReviewSelectedItem {
  title: "9.1 信息安全基础知识";
  render_as: "concept_card";
  selected_for_human_review_request: true;
  review_status: "human_review_pending";
  human_review_approved: false;
  eligible_for_request: true;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_generation_allowed: false;
  requires_manual_review: true;
  output_path_isolated: true;
  default_future_output_path: "verification/dry-run/ruankaodaren/baseline/9.1_信息安全基础知识/";
  source_packet_reference_required: true;
  prompt_contract_reference_required: true;
  dry_run_contract_reference_required: true;
  request_manifest_reference_required: true;
  execution_contract_reference_required: true;
  readiness_check_reference_required: true;
  contract_references: RuankaoAiLearningHumanReviewContractReferences;
}

export interface RuankaoAiLearningHumanReviewExcludedItem {
  title: "1.3 指令系统CISC和RISC" | "13.3 软件架构风格";
  render_as: RuankaoAiLearningHumanReviewRenderAs;
  selected_for_human_review_request: false;
  review_status: "not_requested";
  excluded_from_phase5_9: true;
  human_review_approved: false;
  eligible_for_request: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_generation_allowed: false;
  taxonomy_suspect?: true;
  is_multi_card_sequence?: true;
  required_warnings?: string[];
  exclusion_reason: string[];
}

export interface RuankaoAiLearningHumanReviewReviewerDecision {
  decision: "pending";
  allowed_values: RuankaoAiLearningHumanReviewDecision[];
  decided_by: null;
  decided_at: null;
  notes: null;
}

export interface RuankaoAiLearningPhase510EntryPolicy {
  phase5_10_entry_allowed: false;
  required_before_entry: RuankaoAiLearningHumanReviewRequiredBeforePhase510[];
  prohibited_before_entry: RuankaoAiLearningHumanReviewProhibitedBeforePhase510[];
}

export interface RuankaoAiLearningHumanReviewArtifactCommitPolicy {
  commit_allowed: RuankaoAiLearningHumanReviewCommitAllowedArtifact[];
  commit_forbidden: RuankaoAiLearningHumanReviewCommitForbiddenArtifact[];
}

export interface RuankaoAiLearningHumanReviewRequestPackage {
  package_version: "phase5.9";
  source_name: "ruankaodaren";
  created_at: string;
  package_scope: RuankaoAiLearningHumanReviewPackageScope;
  generation_allowed: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_ai_learning_generation_allowed: false;
  review_request_allowed: true;
  human_review_required: true;
  human_review_approved: false;
  auto_approval: false;
  source_layer_modification_allowed: false;
  official_markdown_modification_allowed: false;
  source_content_write_allowed: false;
  phase5_10_entry_allowed: false;
  source_packet_prior_contract_gate: RuankaoAiLearningHumanReviewPriorContractGate;
  selected_item_count: 1;
  excluded_item_count: 2;
  selected_item: RuankaoAiLearningHumanReviewSelectedItem;
  excluded_items: RuankaoAiLearningHumanReviewExcludedItem[];
  human_review_checklist: RuankaoAiLearningHumanReviewChecklistItem[];
  reviewer_decision: RuankaoAiLearningHumanReviewReviewerDecision;
  phase5_10_entry_policy: RuankaoAiLearningPhase510EntryPolicy;
  artifact_commit_policy: RuankaoAiLearningHumanReviewArtifactCommitPolicy;
}
