/**
 * Phase 5.6 TypeScript domain types for the ruankaodaren AI Learning dry-run
 * request manifest. These types define request eligibility, review
 * prerequisites, output isolation, and artifact commit policy only. They do not
 * generate AI learning content or dry-run content.
 */

export type RuankaoAiLearningDryRunRequestStatus = "not_requested";

export type RuankaoAiLearningDryRunRequestRenderAs =
  | "asset_card"
  | "short_card"
  | "concept_card"
  | "manual_review_card";

export type RuankaoAiLearningReviewPrerequisite =
  | "source_packet_complete"
  | "prompt_contract_validated"
  | "dry_run_contract_validated"
  | "item_eligibility_checked"
  | "output_path_isolated"
  | "human_review_request_created"
  | "no_source_layer_modification"
  | "no_official_markdown_modification";

export type RuankaoAiLearningItemPrerequisite =
  | "human_review_request"
  | "isolated_output_path"
  | "source_packet_reference"
  | "prompt_contract_reference"
  | "dry_run_contract_reference"
  | "manual_asset_review"
  | "human_image_content_verification"
  | "taxonomy_restriction_review"
  | "parent_node_review";

export type RuankaoAiLearningBlockingCondition =
  | "source_packet_incomplete"
  | "taxonomy_suspect_without_restriction"
  | "asset_without_manual_review"
  | "output_path_points_to_source_layer"
  | "output_path_points_to_official_markdown"
  | "generation_allowed_true"
  | "auto_approval_true";

export type RuankaoAiLearningCommitAllowedArtifact =
  | "schema"
  | "types"
  | "builder"
  | "validator"
  | "verification_doc"
  | "generated_manifest_json"
  | "generated_manifest_md";

export type RuankaoAiLearningCommitForbiddenArtifact =
  | "ai_learning_content"
  | "dry_run_content"
  | "official_markdown_rewrite"
  | "source_layer_modifications"
  | "raw_snapshots"
  | "intermediate_generated_artifacts"
  | "asset_images"
  | ".auth"
  | "node_modules"
  | "pnpm-workspace.yaml";

export interface RuankaoAiLearningSourcePacketGate {
  source_packet_exists: true;
  complete_count: 3;
  overall_source_packet_status: "complete";
  gate_result: "pass";
}

export interface RuankaoAiLearningOutputIsolationPolicy {
  default_output_path: "verification/dry-run/ruankaodaren/baseline/";
  allowed_output_paths: string[];
  forbidden_output_paths: string[];
  source_layer_write_allowed: false;
  official_markdown_write_allowed: false;
  source_content_write_allowed: false;
}

export interface RuankaoAiLearningReviewPrerequisitePolicy {
  required_prerequisites: RuankaoAiLearningReviewPrerequisite[];
  blocking_conditions: RuankaoAiLearningBlockingCondition[];
  human_review_required: true;
  auto_approval: false;
}

export interface RuankaoAiLearningArtifactCommitPolicy {
  commit_allowed: RuankaoAiLearningCommitAllowedArtifact[];
  commit_forbidden: RuankaoAiLearningCommitForbiddenArtifact[];
}

export interface RuankaoAiLearningDryRunRequestManifestItem {
  title: string;
  render_as: RuankaoAiLearningDryRunRequestRenderAs;
  request_status: RuankaoAiLearningDryRunRequestStatus;
  eligible_for_request: boolean;
  dry_run_generation_allowed: false;
  formal_generation_allowed: false;
  unrestricted_request_allowed: false;
  taxonomy_suspect: boolean;
  is_multi_card_sequence: boolean;
  requires_manual_asset_review: boolean;
  requires_manual_review: boolean;
  no_ocr: boolean;
  no_image_table_reconstruction: boolean;
  cannot_claim_image_content_recognized: boolean;
  may_request_future_dry_run_after_review: boolean;
  taxonomy_suspect_handling?: "restrict_request";
  multi_card_sequence_handling?: "do_not_claim_complete";
  parent_node_handling?: "do_not_generate_as_leaf";
  required_warnings: string[];
  eligibility_blockers: string[];
  required_prerequisites: RuankaoAiLearningItemPrerequisite[];
  output_isolation_path: string;
}

export interface RuankaoAiLearningDryRunRequestManifest {
  manifest_version: "phase5.6";
  source_name: "ruankaodaren";
  created_at: string;
  manifest_scope: "dry_run_request_manifest_only";
  generation_allowed: false;
  dry_run_generation_allowed: false;
  formal_ai_learning_generation_allowed: false;
  review_gate_required: true;
  auto_approval: false;
  source_layer_modification_allowed: false;
  official_markdown_modification_allowed: false;
  source_content_write_allowed: false;
  phase5_7_entry_allowed: false;
  item_count: 3;
  source_packet_gate: RuankaoAiLearningSourcePacketGate;
  output_isolation_policy: RuankaoAiLearningOutputIsolationPolicy;
  review_prerequisite_policy: RuankaoAiLearningReviewPrerequisitePolicy;
  artifact_commit_policy: RuankaoAiLearningArtifactCommitPolicy;
  items: RuankaoAiLearningDryRunRequestManifestItem[];
}
