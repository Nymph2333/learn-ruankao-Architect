/**
 * Phase 5.7 TypeScript domain types for the ruankaodaren AI Learning dry-run
 * execution contract. These types define future execution inputs, output
 * format, status transitions, isolation, and review gates only. They do not
 * generate AI learning content or dry-run content.
 */

export type RuankaoAiLearningDryRunExecutionMode = "contract_only";

export type RuankaoAiLearningDryRunExecutionStatus =
  | "not_executable"
  | "execution_request_required"
  | "execution_review_pending"
  | "execution_ready"
  | "execution_blocked"
  | "dry_run_executed"
  | "dry_run_review_pending"
  | "dry_run_changes_requested"
  | "dry_run_rejected"
  | "dry_run_approved";

export type RuankaoAiLearningDryRunExecutionRenderAs =
  | "asset_card"
  | "short_card"
  | "concept_card"
  | "manual_review_card";

export type RuankaoAiLearningDryRunExecutionPrerequisite =
  | "human_review_request"
  | "human_review_approval"
  | "isolated_output_path"
  | "source_packet_reference"
  | "prompt_contract_reference"
  | "dry_run_contract_reference"
  | "request_manifest_reference"
  | "manual_asset_review"
  | "human_image_content_verification"
  | "taxonomy_restriction_review"
  | "parent_node_review";

export type RuankaoAiLearningDryRunExecutionCommitAllowedArtifact =
  | "schema"
  | "types"
  | "builder"
  | "validator"
  | "verification_doc"
  | "generated_execution_contract_json"
  | "generated_execution_contract_md";

export type RuankaoAiLearningDryRunExecutionCommitForbiddenArtifact =
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

export interface RuankaoAiLearningDryRunExecutionControls {
  generation_allowed: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_generation_allowed: false;
  source_layer_write_allowed: false;
  official_markdown_write_allowed: false;
  auto_approval: false;
}

export interface RuankaoAiLearningDryRunExecutionInputBundleSchema {
  source_packet_reference: string;
  prompt_contract_reference: string;
  dry_run_contract_reference: string;
  dry_run_request_manifest_reference: string;
  item_identity: "title";
  item_render_as: "render_as";
  item_content_shape: "render_as_bound_content_shape";
  source_layer_refs: "source_availability";
  allowed_prompt_template_id: "prompt_template_id";
  output_isolation_target: "future_execution_output_path";
  review_request_reference: "human_review_request";
  execution_controls: RuankaoAiLearningDryRunExecutionControls;
}

export interface RuankaoAiLearningDryRunExecutionOutputFormat {
  output_kind: "dry_run_ai_learning_draft";
  ai_generated_label_required: true;
  dry_run_label_required: true;
  not_human_approved_label_required: true;
  source_packet_reference_required: true;
  prompt_contract_reference_required: true;
  dry_run_contract_reference_required: true;
  request_manifest_reference_required: true;
  source_layer_modification_forbidden: true;
  official_markdown_modification_forbidden: true;
}

export interface RuankaoAiLearningDryRunExecutionTransitionRule {
  from: RuankaoAiLearningDryRunExecutionStatus;
  to: RuankaoAiLearningDryRunExecutionStatus;
  requires: string[];
}

export interface RuankaoAiLearningDryRunExecutionStatusMachine {
  allowed_statuses: RuankaoAiLearningDryRunExecutionStatus[];
  default_status: "not_executable";
  transition_rules: RuankaoAiLearningDryRunExecutionTransitionRule[];
  phase5_7_execution_ready_allowed: false;
  phase5_7_dry_run_executed_allowed: false;
  phase5_8_entry_allowed: false;
}

export interface RuankaoAiLearningDryRunExecutionGate {
  source_packet_exists: true;
  complete_count: 3;
  phase5_4_generation_allowed: false;
  phase5_5_generation_allowed: false;
  phase5_6_generation_allowed: false;
  phase5_6_dry_run_generation_allowed: false;
  gate_result: "pass";
}

export interface RuankaoAiLearningDryRunExecutionOutputIsolationPolicy {
  default_future_output_path: "verification/dry-run/ruankaodaren/baseline/";
  allowed_output_paths: string[];
  forbidden_output_paths: string[];
  source_layer_write_allowed: false;
  official_markdown_write_allowed: false;
  source_content_write_allowed: false;
}

export interface RuankaoAiLearningDryRunExecutionArtifactCommitPolicy {
  commit_allowed: RuankaoAiLearningDryRunExecutionCommitAllowedArtifact[];
  commit_forbidden: RuankaoAiLearningDryRunExecutionCommitForbiddenArtifact[];
}

export interface RuankaoAiLearningDryRunExecutionContractItem {
  title: string;
  render_as: RuankaoAiLearningDryRunExecutionRenderAs;
  eligible_for_request: boolean;
  execution_status: "not_executable";
  execution_allowed: false;
  dry_run_generation_allowed: false;
  formal_generation_allowed: false;
  unrestricted_execution_allowed: false;
  taxonomy_suspect: boolean;
  is_multi_card_sequence: boolean;
  requires_manual_asset_review: boolean;
  requires_manual_review: boolean;
  no_ocr: boolean;
  no_image_table_reconstruction: boolean;
  cannot_claim_image_content_recognized: boolean;
  may_enter_future_execution_after_review: boolean;
  taxonomy_suspect_handling?: "restrict_execution";
  multi_card_sequence_handling?: "do_not_claim_complete";
  parent_node_handling?: "do_not_generate_as_leaf";
  required_warnings: string[];
  execution_blockers: string[];
  execution_prerequisites: RuankaoAiLearningDryRunExecutionPrerequisite[];
  future_execution_output_path: string;
}

export interface RuankaoAiLearningDryRunExecutionContract {
  contract_version: "phase5.7";
  source_name: "ruankaodaren";
  created_at: string;
  contract_scope: "dry_run_execution_contract_only";
  generation_allowed: false;
  dry_run_generation_allowed: false;
  dry_run_execution_allowed: false;
  formal_ai_learning_generation_allowed: false;
  execution_mode: RuankaoAiLearningDryRunExecutionMode;
  review_gate_required: true;
  auto_approval: false;
  source_layer_modification_allowed: false;
  official_markdown_modification_allowed: false;
  source_content_write_allowed: false;
  phase5_8_entry_allowed: false;
  item_count: 3;
  source_packet_prior_contract_gate: RuankaoAiLearningDryRunExecutionGate;
  input_bundle_schema: RuankaoAiLearningDryRunExecutionInputBundleSchema;
  future_output_format: RuankaoAiLearningDryRunExecutionOutputFormat;
  future_dry_run_sections: string[];
  execution_status_machine: RuankaoAiLearningDryRunExecutionStatusMachine;
  output_isolation_policy: RuankaoAiLearningDryRunExecutionOutputIsolationPolicy;
  artifact_commit_policy: RuankaoAiLearningDryRunExecutionArtifactCommitPolicy;
  items: RuankaoAiLearningDryRunExecutionContractItem[];
}
