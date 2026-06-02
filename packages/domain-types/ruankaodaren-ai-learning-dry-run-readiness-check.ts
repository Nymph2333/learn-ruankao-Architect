/**
 * Phase 5.8 TypeScript domain types for the ruankaodaren AI Learning dry-run
 * execution readiness check. These types answer whether future dry-run
 * execution prerequisites are satisfied. They do not generate AI learning
 * content, dry-run content, input bundle instances, or formal dual-layer
 * documents.
 */

export type RuankaoAiLearningDryRunReadinessMode = "check_only";

export type RuankaoAiLearningDryRunReadinessStatus =
  | "not_ready"
  | "review_required";

export type RuankaoAiLearningDryRunReadinessResult =
  | "blocked"
  | "blocked_until_human_review";

export type RuankaoAiLearningDryRunReadinessRenderAs =
  | "asset_card"
  | "short_card"
  | "concept_card"
  | "manual_review_card";

export type RuankaoAiLearningDryRunReadinessPrerequisite =
  | "human_review_request"
  | "human_review_approval"
  | "isolated_output_path"
  | "source_packet_reference"
  | "prompt_contract_reference"
  | "dry_run_contract_reference"
  | "request_manifest_reference"
  | "execution_contract_reference"
  | "manual_asset_review"
  | "human_image_content_verification"
  | "taxonomy_restriction_review"
  | "parent_node_review";

export type RuankaoAiLearningDryRunReadinessRequiredBeforeEntry =
  | "explicit_user_approval"
  | "human_review_request_created"
  | "human_review_approved"
  | "selected_item_is_phase5_9_candidate"
  | "output_path_isolated"
  | "source_packet_reference_valid"
  | "prompt_contract_reference_valid"
  | "dry_run_contract_reference_valid"
  | "request_manifest_reference_valid"
  | "execution_contract_reference_valid";

export type RuankaoAiLearningDryRunReadinessProhibitedBeforeEntry =
  | "source_layer_modification"
  | "official_markdown_modification"
  | "generation_allowed_true"
  | "auto_approval_true"
  | "taxonomy_suspect_unrestricted_generation"
  | "asset_without_manual_review";

export type RuankaoAiLearningDryRunReadinessCommitAllowedArtifact =
  | "schema"
  | "types"
  | "builder"
  | "validator"
  | "verification_doc"
  | "generated_readiness_check_json"
  | "generated_readiness_check_md";

export type RuankaoAiLearningDryRunReadinessCommitForbiddenArtifact =
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

export interface RuankaoAiLearningDryRunReadinessPriorContractGate {
  source_packet_exists: true;
  complete_count: 3;
  phase5_4_generation_allowed: false;
  phase5_5_generation_allowed: false;
  phase5_6_generation_allowed: false;
  phase5_6_dry_run_generation_allowed: false;
  phase5_7_generation_allowed: false;
  phase5_7_dry_run_execution_allowed: false;
  gate_result: "pass";
}

export interface RuankaoAiLearningDryRunInputBundleConstructability {
  constructable_now: false;
  reason: "human_review_not_approved";
  required_references: [
    "source_packet",
    "prompt_contract",
    "dry_run_contract",
    "request_manifest",
    "execution_contract",
  ];
  isolated_output_target_valid: true;
  source_layer_write_allowed: false;
  official_markdown_write_allowed: false;
  future_constructable_after_review: true;
}

export interface RuankaoAiLearningDryRunOutputIsolationReadiness {
  default_future_output_path: "verification/dry-run/ruankaodaren/baseline/";
  allowed_output_paths: string[];
  forbidden_output_paths: string[];
  source_layer_write_allowed: false;
  official_markdown_write_allowed: false;
  source_content_write_allowed: false;
}

export interface RuankaoAiLearningPhase59EntryPolicy {
  phase5_9_entry_allowed: false;
  required_before_entry: RuankaoAiLearningDryRunReadinessRequiredBeforeEntry[];
  prohibited_before_entry: RuankaoAiLearningDryRunReadinessProhibitedBeforeEntry[];
}

export interface RuankaoAiLearningDryRunReadinessArtifactCommitPolicy {
  commit_allowed: RuankaoAiLearningDryRunReadinessCommitAllowedArtifact[];
  commit_forbidden: RuankaoAiLearningDryRunReadinessCommitForbiddenArtifact[];
}

export interface RuankaoAiLearningDryRunReadinessItem {
  title: string;
  render_as: RuankaoAiLearningDryRunReadinessRenderAs;
  current_status: RuankaoAiLearningDryRunReadinessStatus;
  eligible_for_request: boolean;
  phase5_9_candidate: false;
  current_execution_allowed: false;
  current_dry_run_generation_allowed: false;
  current_formal_generation_allowed: false;
  taxonomy_suspect: boolean;
  is_multi_card_sequence: boolean;
  requires_manual_asset_review: boolean;
  requires_manual_review: boolean;
  no_ocr: boolean;
  no_image_table_reconstruction: boolean;
  cannot_claim_image_content_recognized: boolean;
  may_become_phase5_9_candidate_after_review: boolean;
  taxonomy_suspect_handling?: "restrict_readiness";
  multi_card_sequence_handling?: "do_not_claim_complete";
  parent_node_handling?: "do_not_generate_as_leaf";
  required_warnings: string[];
  readiness_blockers: string[];
  readiness_prerequisites: RuankaoAiLearningDryRunReadinessPrerequisite[];
  readiness_result: RuankaoAiLearningDryRunReadinessResult;
  readiness_output_path: string;
}

export interface RuankaoAiLearningDryRunReadinessCheck {
  check_version: "phase5.8";
  source_name: "ruankaodaren";
  created_at: string;
  check_scope: "dry_run_execution_readiness_check_only";
  generation_allowed: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_ai_learning_generation_allowed: false;
  readiness_mode: RuankaoAiLearningDryRunReadinessMode;
  review_gate_required: true;
  auto_approval: false;
  source_layer_modification_allowed: false;
  official_markdown_modification_allowed: false;
  source_content_write_allowed: false;
  phase5_9_entry_allowed: false;
  item_count: 3;
  source_packet_prior_contract_gate: RuankaoAiLearningDryRunReadinessPriorContractGate;
  input_bundle_constructability: RuankaoAiLearningDryRunInputBundleConstructability;
  output_isolation_readiness: RuankaoAiLearningDryRunOutputIsolationReadiness;
  phase5_9_entry_policy: RuankaoAiLearningPhase59EntryPolicy;
  artifact_commit_policy: RuankaoAiLearningDryRunReadinessArtifactCommitPolicy;
  items: RuankaoAiLearningDryRunReadinessItem[];
}
